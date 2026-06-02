# Element Web — UI Redesign Fork
### Project Overview / Обзор проекта

> Бранч: `ui-redesign` • Upstream: [element-hq/element-web](https://github.com/element-hq/element-web) • Тема: `linear` (Slack/Notion/Telegram-style)

---

## 🇷🇺 На русском

### 1. Что это
Форк официального **Element Web** — десктопного/веб-клиента для сети [Matrix](https://matrix.org). Цель форка — полная визуальная переработка интерфейса в стиле **Linear / Notion / Telegram**: лёгкая палитра, плотные карточки чатов, чистая типографика, мягкие тени и микроанимации. Бизнес-логика мессенджера (matrix-js-sdk, E2E-шифрование, спейсы, голосовые звонки) не трогается — меняется только presentation-слой.

### 2. Технологический стек
- **Язык:** TypeScript 5.x, React 18
- **Сборка:** Webpack 5 (через [Nx](https://nx.dev)), PostCSS (`.pcss`)
- **Пакетный менеджер:** pnpm (workspaces + catalog)
- **Тесты:** Jest (unit), Playwright (e2e)
- **UI-библиотека:** [@vector-im/compound-web](https://github.com/element-hq/compound-web) + дизайн-токены `compound-design-tokens`
- **Matrix-клиент:** `matrix-js-sdk` (E2E, sync, спейсы)
- **Линтеры:** ESLint, Stylelint, Prettier, Knip

### 3. Структура монорепо
```
element-web/
├── apps/
│   └── web/                    ← основное приложение (Element Web)
│       ├── src/                    React-компоненты, stores, hooks
│       ├── res/                    CSS, картинки, темы, i18n
│       │   └── themes/linear/      ★ кастомная тема редизайна
│       ├── test/                   Jest unit-тесты
│       ├── playwright/             e2e-тесты
│       └── webpack.config.ts
├── packages/
│   ├── shared-components/      общие React-компоненты (для web + desktop)
│   ├── module-api/             публичный API для модулей/плагинов
│   ├── playwright-common/      шаренные e2e-утилиты
│   └── vite-common/            общая Vite-конфигурация
├── docs/                       VitePress документация upstream
└── scripts/
```

### 4. Что сделано в форке (ветка `ui-redesign`)
Хронология ключевых коммитов (снизу вверх):
| Шаг | Что |
|-----|-----|
| 1 | Тема `linear` — палитра + типографика, Esc → HomePage |
| 2 | Сайдбар — плоский серый, плотные карточки чатов, тонкий поиск |
| 3 | Лента сообщений в TG-стиле |
| 4–5 | Header чата + объёмный композер |
| 6 | Микродетали + плавный `scrollToBottom` |
| 7 | Правая панель: `RoomSummary` + `BaseCard` + `MemberList` |
| 8 | Лёгкость, белый `SpacePanel`, чистая правая панель |
| — | Telegram-style read receipts (✓ / ✓✓ + время в меню) |
| — | Online-статус в шапке DM |
| — | TG-стиль room list (превью сообщений, крупные аватары) |
| — | Typing indicator в шапке + quick reactions |
| — | Sticky date pills + чистый focus, дата вместо дня недели |

Все изменения концентрируются в [apps/web/res/themes/linear/](apps/web/res/themes/linear/) (`_linear.pcss`, `linear.pcss`) и точечно в компонентах. Основной upstream-код не модифицируется без необходимости.

### 5. Запуск локально
```bash
pnpm install                 # один раз
cd apps/web
cp config.sample.json config.json   # при необходимости
pnpm start                   # dev-сервер на http://localhost:8080
```
⚠️ **Не запускать** `pnpm watch` в `packages/shared-components`, если вы не редактируете именно этот пакет — пересборки сломают HMR в web.

### 6. Полезные команды
| Команда | Что делает |
|---------|-----------|
| `pnpm start` (в `apps/web`) | dev-сервер с HMR |
| `pnpm build` | production-бандл в `webapp/` |
| `pnpm test` | Jest unit-тесты |
| `pnpm test:playwright` | e2e |
| `pnpm lint` | TypeScript + ESLint + Stylelint + Prettier |
| `pnpm i18n` | пересобрать строки переводов |

### 7. Лицензия
Двойная: **AGPL-3.0** (open-source) или коммерческая (New Vector Ltd.). Форк наследует те же условия.

---

## 🇬🇧 In English

### 1. What this is
A fork of **Element Web** — the official web/desktop client for the [Matrix](https://matrix.org) protocol. The fork's goal is a full visual redesign in **Linear / Notion / Telegram** style: lighter palette, denser room cards, cleaner typography, soft shadows and micro-animations. Messenger logic (matrix-js-sdk, E2E encryption, Spaces, voice calls) is left untouched — only the presentation layer changes.

### 2. Tech stack
- **Language:** TypeScript 5.x, React 18
- **Build:** Webpack 5 (via [Nx](https://nx.dev)), PostCSS (`.pcss`)
- **Package manager:** pnpm (workspaces + catalog)
- **Tests:** Jest (unit), Playwright (e2e)
- **UI kit:** [@vector-im/compound-web](https://github.com/element-hq/compound-web) + `compound-design-tokens`
- **Matrix client:** `matrix-js-sdk` (E2E, sync, Spaces)
- **Lint:** ESLint, Stylelint, Prettier, Knip

### 3. Monorepo layout
```
element-web/
├── apps/web/                    main Element Web app
│   ├── src/                     React components, stores, hooks
│   ├── res/                     CSS, images, themes, i18n
│   │   └── themes/linear/       ★ custom redesign theme
│   ├── test/                    Jest unit tests
│   └── playwright/              e2e tests
├── packages/
│   ├── shared-components/       shared React components (web + desktop)
│   ├── module-api/              public module/plugin API
│   ├── playwright-common/       shared e2e helpers
│   └── vite-common/             shared Vite config
└── docs/                        upstream VitePress docs
```

### 4. What's done in this fork (`ui-redesign`)
The `linear` theme rewrites room list, message timeline, composer, right panel and space panel in Telegram/Linear style. Most diffs live in [apps/web/res/themes/linear/](apps/web/res/themes/linear/); component-level changes are scoped and minimal.

Highlights:
- New `linear` theme (palette + typography)
- TG-style room list with message previews & large avatars
- Telegram-style read receipts (✓ / ✓✓)
- Online status in DM header, typing indicator
- Sticky date pills in timeline, quick reactions
- Redesigned right panel (`RoomSummary` + `MemberList`)
- Clean white `SpacePanel`

### 5. Run locally
```bash
pnpm install
cd apps/web
cp config.sample.json config.json
pnpm start                   # http://localhost:8080
```
⚠️ Do **not** run `pnpm watch` inside `packages/shared-components` unless you're editing that package — rebuilds break HMR in the web app.

### 6. Useful commands
| Command | Purpose |
|---------|---------|
| `pnpm start` (in `apps/web`) | dev server with HMR |
| `pnpm build` | production bundle in `webapp/` |
| `pnpm test` | Jest unit tests |
| `pnpm test:playwright` | e2e tests |
| `pnpm lint` | TS + ESLint + Stylelint + Prettier |
| `pnpm i18n` | rebuild translation strings |

### 7. License
Dual-licensed: **AGPL-3.0** or commercial (New Vector Ltd.). The fork inherits the same terms.

---

_Документ актуален на 2026-06-02. Обновляйте при крупных изменениях темы или структуры монорепо._
