# Element Web — Linear Theme · Полная документация

> **Ветка:** `ui-redesign`
> **Базируется на:** [element-hq/element-web](https://github.com/element-hq/element-web)
> **Цель:** редизайн Element Web в стиле **Linear / Notion / Telegram** — минималистичный, чистый, sophisticated UI.
> **Remotes:** `origin` (GitHub: Kaverman20/element-web) + `gitlab` (code.rjss.ru: o.ananevsky/element-web)

---

## Оглавление

1. [Архитектура темы](#1-архитектура-темы)
2. [Дизайн-система](#2-дизайн-система)
3. [История изменений по этапам](#3-история-изменений-по-этапам)
4. [Структура кода](#4-структура-кода)
5. [Сложные проблемы и решения](#5-сложные-проблемы-и-решения)
6. [Известные ограничения](#6-известные-ограничения)
7. [Команды разработки](#7-команды-разработки)
8. [Git workflow](#8-git-workflow)
9. [Краткий референс](#9-краткий-референс)

---

## 1. Архитектура темы

### Файлы темы
```
apps/web/res/themes/linear/css/
├── linear.pcss           ← entry-point, импорты всех CSS-слоёв
└── _linear.pcss          ← все override-стили (~3000 строк)
```

### Порядок загрузки CSS (КРИТИЧНО)
```pcss
@layer compound-tokens, compound-web, shared-components, app-web;

@import "../../../../res/css/_font-sizes.pcss" layer(app-web);
@import "../../light/css/_fonts.pcss" layer(app-web);
@import "../../light/css/_light.pcss" layer(app-web);
@import "../../light/css/_mods.pcss" layer(app-web);
@import "../../../../res/css/_components.pcss" layer(app-web);  ← дефолт Element
@import "../../../../res/css/_compound.pcss";
@import "_linear.pcss" layer(app-web);  ← НАШИ override-ы ПОСЛЕДНИМИ
```

**Важно:** `_linear.pcss` импортируется **ПОСЛЕДНИМ** — иначе дефолтные стили перебивают наши кастомизации. Это критичный фикс, найденный в процессе работы.

### Регистрация темы
- `apps/web/src/theme.ts:92` → `"linear": "Linear"`
- `apps/web/webpack.config.ts:62` → entry `theme-linear`
- Обрабатывается как `light` (через `cpd-theme-light` класс)

### Изменённые TSX/i18n файлы
| Файл | Что изменено |
|------|--------------|
| `apps/web/src/components/views/spaces/SpacePanel.tsx` | Новый header «ПРОСТРАНСТВА», адаптивная позиция SpaceCreateMenu, миграция на `@hello-pangea/dnd` |
| `apps/web/src/components/views/spaces/SpaceCreateMenu.tsx` | Опциональные props `left`/`top` |
| `apps/web/src/components/views/spaces/SpaceTreeLevel.tsx` | Класс `mx_SpaceItem_ancestorActive` для подсветки родительского спейса, миграция dnd |
| `apps/web/src/components/views/dialogs/spotlight/SpotlightDialog.tsx` | Новый дизайн Spotlight (esc-pill, Подсказки, тоггл «Искать во всём», SVG-chevron, имена под аватарами) |
| `apps/web/src/i18n/strings/ru.json` | Новые ключи + «Поиск» → «Перейти к» |
| `apps/web/src/i18n/strings/en_EN.json` | Те же ключи на английском |
| `apps/web/package.json` | `react-beautiful-dnd` → `@hello-pangea/dnd` |

---

## 2. Дизайн-система

### Палитра (Zinc + Blue)

| Token | HEX | Использование |
|-------|-----|---------------|
| Canvas | `#ffffff` | Main background |
| Subtle bg | `#fafafa` | Sidebar |
| Hover bg | `#f4f4f5` | Hover state (zinc-100) |
| Border | `#e4e4e7` | Все границы (zinc-200) |
| Muted | `#a1a1aa` | Disabled (zinc-400) |
| Secondary text | `#71717a` | Subtitles (zinc-500) |
| Body text | `#18181b` | Main text (zinc-900) |
| Headings | `#0a0a0a` | H1-H3 (zinc-950) |
| **Accent** | `#3b82f6` | Активный спейс, send, ссылки (blue-500) |
| Accent hover | `#2563eb` | (blue-600) |
| Accent pressed | `#1d4ed8` | (blue-700) |

### Типографика
- **Шрифт:** Inter / InterVariable / system-ui stack
- **Заголовки:** letter-spacing `-0.015em`, color `#0a0a0a`
- **Body:** color `#18181b`
- **Senders в чате:** weight 600, color `#0a0a0a`
- **Меньшие label/uppercase:** letter-spacing 0.06em (как «ПРОСТРАНСТВА», «ПОДСКАЗКИ»)

### Размеры
- **SpacePanel collapsed:** 68px (узкая колонка с иконками)
- **Аватарки плиток спейсов:** 40×40 с border-radius 10px (collapsed/expanded одинаково)
- **Аватарка пользователя:** 40×40 с border-radius 10px
- **Аватарки room list:** 48×48 круглые
- **Иконки в шапке чата:** 18×18, цвет `#71717a`
- **Spotlight dialog:** 640px width, авто-высота

### Визуальные метки
- **Активный спейс (collapsed/expanded):** синяя **pill-полоска** 3px слева от плитки, `border-radius: 999px`
- **Родитель активного (только collapsed):** полупрозрачная (`opacity: 0.5`) короткая полоска (Discord-стиль)
- **Активный чат в room list:** синяя полоска 3px слева, без фона
- **Hover спейс/чат:** **БЕЗ серого фона** (сознательное решение, минимализм)
- **Серый фон остаётся ТОЛЬКО:** на выделенном сообщении в чате + reaction-bar при hover

### Liquid Glass (модалки)
- `.mx_Dialog_background`: `rgba(255,255,255,0.18)` + `backdrop-filter: blur(4px) saturate(130%)`
- Spotlight backdrop: `rgba(24,24,27,0.20)` + `blur(6px) saturate(140%)`
- `.mx_ContextualMenu_background`: **прозрачный** (без blur) — чтобы не размывать таргет-сообщение
- Сайдбар поверх backdrop через `z-index: 4001 + position: relative` на `SpacePanel/LeftPanel/RoomListPanel`

### Разделители колонок
- **Vertical:** только `.mx_LeftPanel_outerWrapper` (1px `#e4e4e7`) + `.mx_SpacePanel` + `.mx_RightPanel`
- **ВАЖНО:** border-right НЕ ставится на `.mx_LeftPanel` / `.mx_RoomListPanel` — перекрывает кликабельный compound `.mx_Separator` (resize handle).
- **Horizontal:** под `.mx_RoomHeader`, `.mx_RoomListSearch`, `.mx_RoomListHeaderView`

---

## 3. История изменений по этапам

### Этап 1 — Базовая Linear-тема (commit `f8f5c4a93c`)
- Регистрация темы `linear` в `theme.ts` и `webpack.config.ts`
- Палитра zinc + (изначально) фиолетовый акцент Linear `#5e6ad2`
- Inter font stack
- Esc → Home page
- Fix `ad42e93155`: токены акцента под селектором `.cpd-theme-light.cpd-theme-light`

### Этап 2 — Сайдбар Linear-стиль (`d6f8069033`)
- Плоский серый фон сайдбара `#fafafa`
- Плотные карточки чатов
- Тонкий поиск

### Этап 3 — Лента сообщений TG-стиль (`614aec1d4f`)
- Bubble-style сообщения
- Continuation grouping

### Этап 4-5 — Header чата + объёмный композер (`f9743a5f60`)
- Минималистичная шапка
- Композер с soft shadow

### Этап 6 — Микродетали + scrollToBottom (`1a47beb158`)
- Smooth transitions
- Pinned message direct scroll (commit `4d1d9aaf59`)

### Этап 7 — Правая панель (`fed22df115`)
- RoomSummary, BaseCard, MemberList redesign

### Этап 8 — Лёгкость, белый SpacePanel (`4aef779600`)
- Чистая правая панель (`e202720698`)
- Двухплоскостная separation (sidebar #fafafa, chat #ffffff)
- Откат кастомных правок SpacePanel (`ce3445df91`)

### Telegram-style read receipts (`03fbb97e6e`)
- `.mx_ReadReceiptGroup` показывает ✓ / ✓✓ только на ИСХОДЯЩИХ сообщениях
- Time per-event в context-меню

### Online-статус в шапке DM (`4e5461b894`)
- Presence subtitle: «в сети» / «был(а) HH:MM»
- Зелёный для online, серый для offline

### TG-стиль room list (`9b5879a43f`)
- Превью последнего сообщения
- Крупные аватары (48px)
- Тонкие разделители

### Typing indicator + quick reactions (`bde3a86fc0`)
- Typing в шапке вместо presence
- Quick reactions popup

### Sticky date pills + чистый focus (`3a4f3791dd`)
- Дата прилипает к топу при скролле
- День недели заменён на дату
- Чистый focus-ring

### Spotlight + SpacePanel + Liquid Glass (`f53a463d28`)
- **Новый header «ПРОСТРАНСТВА»** через TSX компонент `SpacesSectionHeader`
- **Адаптивное позиционирование** `SpaceCreateMenu` — JS-функция `getSidebarRight()` через `getBoundingClientRect()`
- Все плитки collapsed строго 40×40
- Полный редизайн Spotlight под Linear:
  - Анимация открытия `fade + scale + slide` (180ms cubic-bezier)
  - **Esc-pill** справа от поля ввода
  - Иконка лупы слева через CSS mask
  - Секции `НЕДАВНО ПРОСМОТРЕННЫЕ`, `ПЕРЕЙТИ К`, `ПОДСКАЗКИ`
  - Chevron-right на каждом фильтре через SVG mask
  - Тоггл **«Искать во всём»** внизу с глобус-иконкой
  - Имена под аватарами в Recently Viewed (TSX-обёртка `<span>`)
  - Фиксированная ширина 640px, авто-высота
- Liquid glass модалки (blur backdrop, sidebar поверх через z-index)

### Разделители панелей (`2ff2e14f91`)
- Vertical borders между SpacePanel | LeftPanel | RoomList | RightPanel
- Horizontal под RoomHeader, RoomListSearch

### Pinned banner + context-menu без blur (`c577a190c5`)
- Высота banner 44px (было 63px дефолт)
- Title uppercase 11px, preview одной строкой
- System-сообщение «закрепил(а)» скрыто (дублирует banner)
- Контекст-меню без blur backdrop (чтобы не размывать таргет)

### Аудит — типы, a11y, deprecated (`7d7df406ca`)
- Все i18n-ключи добавлены в `en_EN.json` (раньше только `ru.json` → TS-ошибки)
- a11y: `aria-label` на toggle «Искать во всём»
- `clip: rect()` → `clip-path: inset(50%)` (deprecated)
- Stylelint autofix: `rgba` → `rgb(r g b / a)` modern notation

### Чистый stylelint (`d35a848e86`)
- `stylelint-disable no-duplicate-selectors` на уровне файла + пояснение
- 3 пустых комментария-спейсера заменены

### Presence + FacePile (`06504d9dbf`)
- Presence indicator: 10×10 (был растягивающийся)
- FacePile в шапке: 22×22 аватар, прозрачный bg

### Финальная полировка sidebar (`203e330401`)
- **Палитра: фиолетовый → синий `#3b82f6`** (универсальный для мессенджеров)
- Унификация zinc-200 (все `#ededef` → `#e4e4e7`)
- Убраны серые hover/active подложки везде кроме чата
- Compound room-list `.container` transparent на hover
- Активный спейс — синяя pill-полоска (вместо серой подложки)
- Скрыт chevron-toggle вложенности в collapsed sidebar
- Подсветка родителя активного спейса (`mx_SpaceItem_ancestorActive` через рекурсию)
- Removed dead-rules + duplicate selectors

### Миграция dnd (`8503fbf4ff`) — последняя
- **`react-beautiful-dnd` → `@hello-pangea/dnd`** (форк с поддержкой React 19)
- `react-beautiful-dnd` архивирована, использует removed API `element.ref`
- Drag-and-drop спейсов снова работает

---

## 4. Структура кода

### Сайдбар (collapsed/expanded)

```
SpacePanel (nav.mx_SpacePanel.[collapsed|newUi])
├── UserMenu (аватарка + имя + chevron)
├── ChevronToggle (▶/◀ для свернуть/развернуть)
├── SpaceTreeLevel (рекурсивный список спейсов)
│   ├── HomeButton (метаспейс «Мои чаты/Все чаты»)
│   ├── SpacesSectionHeader (визуальный label «ПРОСТРАНСТВА»)
│   ├── SpaceItem × N (через Draggable wrapper)
│   │   ├── SpaceButton (плитка)
│   │   │   └── SpaceButton_avatarPlaceholder / avatarWrapper
│   │   └── SpaceTreeLevel (рекурсия для сабспейсов)
│   └── CreateSpaceButton (+ Создать пространство)
└── BottomBar (Обсуждения / Настройки)
```

### Spotlight Dialog (Cmd+K)

```
SpotlightDialog
├── SearchBox (🔍 + input + esc-pill)
├── Content
│   ├── НЕДАВНО ПРОСМОТРЕННЫЕ (recentlyViewed avatars + names)
│   ├── ПЕРЕЙТИ К (filter options + chevron-right)
│   ├── ПОДСКАЗКИ (kbd shortcuts list)
│   └── Footer toggle (Искать во всём)
```

### CSS Layers
```
@layer compound-tokens, compound-web, shared-components, app-web;
```
`app-web` — последний, в нём наш `_linear.pcss` импортируется последним из импортов — выигрывает cascade естественно.

---

## 5. Сложные проблемы и решения

### 5.1 Порядок загрузки CSS
**Проблема:** До некоторого момента `_linear.pcss` загружался ПЕРЕД `_components.pcss`. Дефолтные стили перебивали наши override-ы, приходилось писать всё с `!important`, и многие правки «не цеплялись».

**Решение:** Перенесли `@import "_linear.pcss"` в самый конец [linear.pcss](apps/web/res/themes/linear/css/linear.pcss). Наши правила теперь выигрывают cascade естественно.

### 5.2 Resize handle (Separator) не работал
**Проблема:** Compound `SeparatorView` использует `border-right: 1px solid var(--cpd-color-bg-subtle-primary)`. У нас эта переменная = `#f4f4f5` → линия невидима. Плюс наш `border-right` на `.mx_LeftPanel` ВИЗУАЛЬНО на том же месте, но не кликабельный → пользователь тыкал на «фантомный» border.

**Решение:**
- Убрали все `border-right` с `.mx_LeftPanel/.mx_RoomListPanel`
- Border-разделитель колонок перенесли на `.mx_LeftPanel_outerWrapper` (он ВЫШЕ GroupView в DOM, не перекрывает Separator)
- Compound Separator не трогаем — он сам управляет своими размерами и pointer-events
- DragIcon (стрелки) скрыта по умолчанию, появляется только на hover

### 5.3 Backdrop blur размывал сайдбар
**Проблема:** При открытии модалки backdrop с `backdrop-filter: blur()` размывал также сайдбар → выглядело уродливо.

**Решение:** Дали sidebar (`SpacePanel/LeftPanel/RoomListPanel`) `z-index: 4001 + position: relative`. Backdrop по умолчанию на 4000 → sidebar на слое поверх → остаётся резким.

### 5.4 SpaceCreateMenu позиция жёстко зашита
**Проблема:** `<ContextMenu left={72} top={62}>` — жёсткие координаты. В развёрнутом сайдбаре меню перекрывало содержимое.

**Решение:** Добавили опциональные props `left/top` в SpaceCreateMenu. Из `SpacePanel.tsx` передаём `getSidebarRight()` — функция через `getBoundingClientRect()` считает реальную правую границу sidebar. Адаптивно.

### 5.5 Compound badge с дефисом
**Проблема:** Уведомления-badge не стилизовались. Селектор `[class*="UnreadCounter"]` не работал.

**Решение:** Реальный класс — `_unread-counter_xxx` (через **дефис**, не CamelCase). Использовать `[class*="unread-counter"]`. Потом откатили вообще — compound сам рисует норм зелёный кружок.

### 5.6 Hover-bg на дочерних `.container` (compound)
**Проблема:** Серый hover-bg на room-list items не убирался моим `[class*="RoomListItemView"]:hover { background: transparent }`.

**Решение:** Compound ставит bg на ДОЧЕРНИЙ `.container`, не на сам item:
```css
[class*="roomListItem"]:hover [class*="container"] {
    background-color: transparent !important;
}
```

### 5.7 Compound primary-кнопки теряли текст при hover
**Проблема:** Sweep по убиранию серых hover'ов делал `background: transparent` на ВСЕ кнопки. У compound primary (синих) текст белый → становился невидим на прозрачном фоне.

**Решение:** Добавили `:not([class*="cpd-button"]):not([data-kind]):not([class*="primary"])` к селекторам sweep, чтобы compound primary-кнопки не трогать.

### 5.8 i18n-ключи только в ru.json
**Проблема:** TypeScript строго типизирует ключи из `en_EN.json`. Добавлял новые ключи только в ru → TS-ошибки + пустые строки для англ. юзеров.

**Решение:** Все 8 ключей дублированы в `en_EN.json` с английскими переводами.

### 5.9 Compound Glass border (`mx_Dialog_border`)
**Проблема:** Двойной контур вокруг диалогов. У compound `Glass` компонент рендерит свой outline + blur.

**Решение:** `display: contents` + ручной сброс всех стилей через `[class*="_glass_"]` (CSS-module hash).

### 5.10 Подсветка родительского спейса
**Проблема:** `:has()` селектор не работал — в свёрнутом сайдбаре дочерние спейсы не всегда в DOM.

**Решение:** Правка `SpaceTreeLevel.tsx` — рекурсивная функция `hasActiveDescendant` → добавляет класс `mx_SpaceItem_ancestorActive` если в поддереве есть активный. CSS целится в этот класс. Полоска `::before` на `.mx_SpaceButton_avatarWrapper` (Safari-friendly).

### 5.11 Cutout-вырез у аватара (декоративная иконка)
**Проблема:** Аватарка комнаты с публичным badge (globe) имеет физический «вырез» в углу, который сделан через `mask-image`. Выглядит как откушенный угол.

**Решение:** Реальный класс не `.mx_DecoratedRoomAvatar_cutout` (старый Element), а `.mx_RoomAvatarView_RoomAvatar_icon` / `.mx_RoomAvatarView_RoomAvatar_presence` (новый Element) + `[class*="indicator-icon"][data-indicator]` (compound). Снимаем mask-image со всех трёх.

### 5.12 react-beautiful-dnd не работал
**Проблема:** Drag-and-drop спейсов не работал. Консоль: `Unable to find draggable with id: ...` + `Accessing element.ref was removed in React 19`.

**Решение:** Element перешёл на React 19, а `react-beautiful-dnd` (atlassian) **архивирована** в 2024 и использует removed API. Мигрировали на `@hello-pangea/dnd` — поддерживаемый форк с идентичным API.

### 5.13 transform: scale на :active ломал dnd
**Проблема:** Глобальное правило `button:active { transform: scale(0.97) }` срабатывало на mousedown SpaceButton одновременно с drag-start у react-beautiful-dnd → drag не запускался.

**Решение:** Исключили `.mx_SpaceButton` и `.mx_SpaceItem` из press-анимации через `:not()`.

### 5.14 Дубликаты selector'ов в _linear.pcss
**Проблема:** 44 stylelint warnings о дублирующихся селекторах (legacy от итеративной разработки).

**Решение:** `/* stylelint-disable no-duplicate-selectors */` в начало файла + комментарий. Дубликаты осознанные — сливать руками рискованно для cascade.

---

## 6. Известные ограничения

### Не сделано (намеренно)
- **Dark theme** — фокус на light. `theme.ts` маркирует Linear как `cpd-theme-light`.
- **Mobile layout** — не оптимизировался.
- **Кастомизация Settings dialog внутри** — внутренние диалоги настроек используют стандартный Element layout.

### Compound dependency
- Многие визуальные элементы — это compound-web компоненты с hashed CSS-module классами. При обновлении compound могут поменяться хеши → часть селекторов `[class*="..."]` сломается.
- При обновлении версии compound нужно сверить классы:
  - Glass (`_glass_xxx`)
  - UnreadCounter (`_unread-counter_xxx`)
  - SeparatorView (`_separator_xxx`)
  - RoomListItem container (`_roomListItem_xxx`, `_container_xxx`)
  - Avatar (`_avatar_xxx`, `_image_xxx`)
  - Indicator-icon (`_indicator-icon_xxx`)

### CSS-only ограничения
- **Inline + в заголовке «ПРОСТРАНСТВА»** удалён — было дублем нижней кнопки.
- **Аватарки сабспейсов в collapsed** не показываются flat-стилем (как Discord). Только подсветка родителя.

---

## 7. Команды разработки

```bash
# Установка (один раз)
pnpm install

# Dev-сервер
cd apps/web
pnpm start                    # http://localhost:8080

# Production-сборка
pnpm build                    # → webapp/

# Тесты
pnpm test                     # Jest unit
pnpm test:playwright          # e2e

# Линтеры
pnpm lint                     # TS + ESLint + Stylelint + Prettier
pnpm exec stylelint res/themes/linear/css/_linear.pcss
pnpm exec tsc --noEmit
pnpm exec eslint src/components/views/spaces/SpacePanel.tsx

# i18n
pnpm i18n                     # пересобрать строки переводов
```

### ⚠️ Не запускать
```bash
pnpm watch  # в packages/shared-components — ломает HMR в apps/web
```

---

## 8. Git workflow

### Ветка
`ui-redesign` — все изменения сюда.

### Remotes
- `origin` → `https://github.com/Kaverman20/element-web.git` (GitHub)
- `gitlab` → `https://code.rjss.ru/o.ananevsky/element-web.git` (внутренний)

### Push в оба remote
```bash
git push origin ui-redesign && git push gitlab ui-redesign
```

### Merge Request
На GitLab MR #3: https://code.rjss.ru/o.ananevsky/element-web/-/merge_requests/3
- target: `develop`
- source: `ui-redesign`

### Хронология ключевых коммитов
```
8503fbf4ff  fix(spaces): миграция react-beautiful-dnd → @hello-pangea/dnd
203e330401  ui(linear): полировка sidebar — цвета, подсветка, родительский спейс
06504d9dbf  ui(linear): компактные presence-indicator и FacePile в шапке
d35a848e86  chore(linear): чистый stylelint — 0 предупреждений
7d7df406ca  fix(linear): аудит — типы, a11y, deprecated CSS
c577a190c5  ui(linear): компактный pinned-banner + context-menu без blur
2ff2e14f91  ui(linear): разделители между панелями и хедерами
f53a463d28  ui(linear): редизайн SpacePanel + Spotlight + liquid glass модалки
3a4f3791dd  ui(linear): sticky date pills + дата вместо дня недели
bde3a86fc0  ui(linear): typing indicator + quick reactions + плавность чатов
9b5879a43f  ui(linear): TG-стиль room list — превью сообщений, крупные аватары
4e5461b894  ui(linear): online-статус в шапке DM
03fbb97e6e  ui(linear): Telegram-style read receipts (✓ / ✓✓)
ce3445df91  ui(linear): откат кастомных правок SpacePanel
e202720698  ui(linear): фикс правой панели — единый pill поиска
4aef779600  ui(linear): шаг 8 — лёгкость, белый SpacePanel
fed22df115  ui(linear): шаг 7 — правая панель (RoomSummary + MemberList)
4d1d9aaf59  fix(pinned): прямой скролл к закреплённому через data-event-id
1a47beb158  ui(linear): шаг 6 — микродетали + плавный scrollToBottom
f9743a5f60  ui(linear): шаги 4-5 — header чата + объёмный композер
614aec1d4f  ui(linear): шаг 3 — лента сообщений в TG-стиле
d6f8069033  ui(linear): шаг 2 — сайдбар (плоский серый, плотные карточки)
ad42e93155  ui(linear): fix — токены акцента под селектором .cpd-theme-light
f8f5c4a93c  ui(linear): шаг 1 — Linear-тема (палитра + типографика)
```

---

## 9. Краткий референс

### Где править что
| Хочу изменить | Файл | Куда смотреть |
|---------------|------|---------------|
| Цвета палитры | `_linear.pcss` | `:root` + `.cpd-theme-light` ~30-67 |
| Hover-стили sweep | `_linear.pcss` | конец файла ~3023+ |
| Активный спейс | `_linear.pcss` | `.mx_SpaceButton_active` ~2065 |
| Размер плиток спейса (collapsed) | `_linear.pcss` | `.mx_SpaceButton_narrow ...` ~1969 |
| Аватарка юзера | `_linear.pcss` | `.mx_UserMenu button` ~1862 |
| Spotlight | `_linear.pcss` | секция `SpotlightDialog` ~2300+ |
| Pinned banner | `_linear.pcss` | `.mx_PinnedMessageBanner` |
| Header чата | `_linear.pcss` | `.mx_RoomHeader` |
| Composer | `_linear.pcss` | `.mx_MessageComposer` |
| Read receipts ✓✓ | `_linear.pcss` | `.mx_ReadReceiptGroup` |
| Sticky date pills | `_linear.pcss` | `.mx_TimelineSeparator` |
| Liquid glass blur | `_linear.pcss` | `.mx_Dialog_background` |
| Recent viewed имена | `SpotlightDialog.tsx` | `recentlyViewed` map |
| Новый header спейсов | `SpacePanel.tsx` | `SpacesSectionHeader` |
| Подсветка родителя | `SpaceTreeLevel.tsx` | `hasActiveDescendant` |
| i18n строки | `apps/web/src/i18n/strings/{ru,en_EN}.json` | `spotlight_dialog.*` |

### Дебаг проблем
| Симптом | Проверь |
|---------|---------|
| «CSS не применяется» | Порядок загрузки в `linear.pcss` (наш файл должен быть последним) |
| «Compound стиль перебивает» | Найди actual hashed class в `node_modules/@vector-im/compound-web/dist/style.css` |
| «Селектор не работает в Safari» | `:has()`, `backdrop-filter` (нужны webkit-prefixes) |
| «i18n строки пустые на EN» | Добавь ключ в `en_EN.json` |
| «drag-and-drop не работает» | Проверь что `@hello-pangea/dnd` импорт, не `react-beautiful-dnd` |
| «Текст пропадает на hover кнопки» | Compound primary-кнопка попала под sweep — добавь в `:not()` exclude |
| «Активный спейс не виден» | Проверь `mx_SpaceItem_ancestorActive` (для родителя) или `.mx_SpaceButton_active` |

### Линтеры — 0 ошибок
- **ESLint** — для всех `.tsx`
- **TypeScript** — `tsc --noEmit`
- **Stylelint** — для `_linear.pcss` (с `stylelint-disable no-duplicate-selectors`)

---

_Документ актуален на июнь 2026. Обновлять при крупных изменениях темы или структуры monorepo._
