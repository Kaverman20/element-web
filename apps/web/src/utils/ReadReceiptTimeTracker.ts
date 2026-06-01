/*
 * Per-message read-receipt time tracking — Telegram-style.
 *
 * Matrix protocol stores only ONE receipt per user per room (the latest
 * "read up to" event ID + its timestamp). It does NOT remember when each
 * individual message was read. To show per-message read times like Telegram,
 * we listen for receipt events as they arrive and back-fill the timestamps
 * for the messages between the previous receipt position and the new one.
 *
 * Notes / limitations:
 *   • Only messages received WHILE the client is open are tracked. We can't
 *     reconstruct read times from past sessions.
 *   • Persisted to localStorage so the data survives reloads.
 *   • Only own messages are tracked (others' read state is not interesting).
 */

import { type MatrixClient, type Room, type MatrixEvent, RoomEvent } from "matrix-js-sdk/src/matrix";

const STORAGE_KEY = "linear_read_receipt_times_v1";

interface ReadTimeStore {
    // roomId -> userId -> { eventId: ts }
    [roomId: string]: { [userId: string]: { [eventId: string]: number } };
}

let store: ReadTimeStore = {};
let started = false;

function load(): void {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) store = JSON.parse(raw);
    } catch {
        store = {};
    }
}

function save(): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
        // Quota exceeded or storage disabled — silent fallback.
    }
}

/**
 * Latest known read-time for a specific event, across all users in the room.
 * Returns undefined if no record exists.
 */
export function getReadTime(roomId: string, eventId: string): number | undefined {
    const room = store[roomId];
    if (!room) return undefined;
    let latest: number | undefined;
    for (const userTimes of Object.values(room)) {
        const ts = userTimes[eventId];
        if (ts && (!latest || ts > latest)) latest = ts;
    }
    return latest;
}

function onReceipt(event: MatrixEvent, room: Room, myUserId: string): void {
    const content = event.getContent();
    let dirty = false;

    for (const [receiptEventId, receipts] of Object.entries(content)) {
        for (const [receiptType, users] of Object.entries(receipts as Record<string, unknown>)) {
            if (receiptType !== "m.read") continue;
            for (const [userId, receiptData] of Object.entries(users as Record<string, { ts?: number }>)) {
                if (userId === myUserId) continue;
                const ts = receiptData?.ts;
                if (!ts) continue;

                if (!store[room.roomId]) store[room.roomId] = {};
                if (!store[room.roomId][userId]) store[room.roomId][userId] = {};
                const userTimes = store[room.roomId][userId];

                // Walk timeline backwards from the receipt event. For each of
                // MY messages, record this receipt's ts as the read time,
                // unless already recorded by an earlier receipt.
                const events = room.getLiveTimeline().getEvents();
                let reached = false;
                for (let i = events.length - 1; i >= 0; i--) {
                    const ev = events[i];
                    const id = ev.getId();
                    if (!id) continue;
                    if (id === receiptEventId) reached = true;
                    if (!reached) continue;
                    if (ev.getSender() !== myUserId) continue;
                    if (userTimes[id]) break; // already recorded — stop walking
                    userTimes[id] = ts;
                    dirty = true;
                }
            }
        }
    }

    if (dirty) save();
}

/** Wire the tracker to a MatrixClient. Idempotent. */
export function startReadReceiptTimeTracking(client: MatrixClient): void {
    if (started) return;
    started = true;
    load();
    const myUserId = client.getUserId();
    if (!myUserId) return;
    client.on(RoomEvent.Receipt, (event, room) => {
        if (!room) return;
        onReceipt(event, room, myUserId);
    });
}
