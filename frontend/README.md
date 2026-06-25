# Wordly — Frontend

React + TypeScript фронтенд приложения для изучения иностранных языков с помощью звуковых мнемоник.

## Стек

- **React 19** + **TypeScript** (strict, без `any`)
- **Vite 8** — сборка и dev-сервер
- **Redux Toolkit** + **react-redux** — глобальный стейт
- **React Router 7** — навигация
- **SCSS Modules** + **Tailwind 3** — стили
- **lucide-react** + кастомный icomoon-шрифт — иконки
- **Vitest** + **Testing Library** + **MSW** — тесты
- Пакетный менеджер: **npm** (yarn/pnpm/bun — нельзя)

## Структура

```
src/
  api/             — слой работы с бэкендом (всё через apiRequest из client.ts)
  app/routes/      — конфигурация роутера + route guards
  assets/          — иконки, изображения
  components/
    atoms/         — кнопки, инпуты, иконки и прочая атомарка
    molecules/     — карточки, табы, модалки, NavLinks
    organisms/     — Header, AuthModal, DailyGoal, страницы (Pages/)
  features/admin/  — админ-панель (отдельный layout, таблицы, формы)
  shared/hooks/    — переиспользуемые хуки (useDailyProgress, useWords)
  store/           — Redux store + слайсы
  styles/          — глобальные SCSS-переменные/миксины
  test/            — харнесс для тестов (setup, MSW server, test-utils)
  utils/           — чистые утилиты (oauth и т.п.)
```

## Команды

```bash
# Установка зависимостей
npm install

# Dev-сервер (http://localhost:5173)
npm run dev

# Прод-сборка (tsc + vite)
npm run build

# Превью прод-сборки
npm run preview

# Линт
npm run lint
npm run lint:fix

# Форматирование (prettier)
npm run format

# Тесты
npm test                # одноразовый прогон
npm run test:watch      # watch-режим для разработки
npm run test:coverage   # с отчётом покрытия (HTML → ./coverage/index.html)
```

## Тесты

### Стек

- **Vitest** — раннер (расширяет `vite.config.ts`, ESM-native).
- **@testing-library/react** + **jest-dom** + **user-event** — компонентные тесты.
- **MSW** — моки HTTP-запросов на уровне сети (не мокаем `apiRequest` напрямую).
- **jsdom** — DOM-окружение.
- **@vitest/coverage-v8** — coverage через V8.

### Покрытие

Глобальный порог **80% по lines/statements/functions/branches** зашит в `vitest.config.ts`. `npm run test:coverage` фейлится при регрессии — это же проверяется в CI на каждом PR.

Из метрики исключены: `*.module.scss`, `*.d.ts`, `index.ts` (бочки-реэкспорты), `main.tsx`, `assets/`, `styles/`, `test/`, `mock-data.ts`.

### Конвенции

- Один `*.test.{ts,tsx}` на один source — лежит **рядом** с тестируемым файлом.
- `.tsx` — только если в тесте есть JSX (oxc-парсер строгий). Чистая логика → `.ts`.
- MSW: дефолтные хендлеры в `src/test/handlers.ts` (happy path); для проверки тела запроса или специфичного ответа — `server.use(...)` внутри теста.
- Snake_case payloads → проверяем паттерном `let receivedBody: unknown = null` + `expect(receivedBody).toEqual({ ... })`.
- Для компонентов с Redux/Router — `renderWithProviders(ui, { preloadedState, route })` из `src/test/test-utils.tsx`.
- Для хуков — `renderHook` из `@testing-library/react`; если хук читает Redux — обернуть в `<Provider>` через `makeStore`.

### Где смотреть отчёт

После `npm run test:coverage` открывай `./coverage/index.html` — кликабельный отчёт с подсветкой непокрытых строк. На CI этот же отчёт доступен как артефакт `frontend-coverage` к каждому PR.

## Адаптив (брейкпоинты)

Единый набор брейкпоинтов лежит в [src/styles/_breakpoints.scss](src/styles/_breakpoints.scss) и автоматически подключается через `@use '../../styles/index' as *;` — то, что уже есть в каждом `*.module.scss`. Никаких дополнительных импортов делать не надо.

| Tier | Cutoff | Что попадает |
|---|---|---|
| `mobile-sm` | ≤ 480px | Телефоны portrait |
| `mobile` | ≤ 767px | Телефоны (включая landscape) |
| `tablet` | ≤ 1023px | Планшеты + всё ниже |
| `desktop` | ≥ 1024px | По умолчанию, миксин не нужен |

**Desktop-first** (стиль базы — десктоп, переопределяем для меньших экранов):

```scss
.card {
  padding: 24px;
  @include tablet  { padding: 16px; }  // ≤ 1023px
  @include mobile  { padding: 12px; }  // ≤ 767px
}
```

**Mobile-first** (стиль базы — мобилка, добавляем для больших экранов):

```scss
.grid {
  grid-template-columns: 1fr;
  @include from-tablet  { grid-template-columns: 1fr 1fr; }      // ≥ 768px
  @include from-desktop { grid-template-columns: 1fr 1fr 1fr; }  // ≥ 1024px
}
```

**Точный диапазон** (только в этом tier):

```scss
.hero {
  @include tablet-only { font-size: 24px; }  // 768-1023px
}
```

**Правило:** не пиши `@media (max-width: ...)` напрямую — используй миксин. Если нужного брейкпоинта нет — добавь в `_breakpoints.scss` (это единственный источник правды), не плоди магические числа по файлам.

## Архитектурные правила

- **Глобальный стейт — только через Redux.** `useState` допустим только для локальных UI-состояний (открыт/закрыт, hover, draft input).
- **Навигация — только React Router.** Никаких `window.location`, кроме одного места — OAuth-редирект на `accounts.google.com` (cross-origin, неизбежно).
- **Компоненты — функциональные.** Без классовых.
- **Типизация строгая.** `any` запрещён, для внешних данных описываем интерфейсы в `api/`.
- **Сеть — только через `src/api/`.** Никаких fetch/axios прямо из компонентов.

## Качество кода

После каждого изменения — `npm run lint`. Перед коммитом — `npm run lint:fix && npm run format && npm test`. Линтер настроен на `--max-warnings 0`, поэтому предупреждения = ошибки.

## CI

`/.github/workflows/frontend-ci.yml` запускается на каждом PR, который трогает `frontend/**`:

1. `npm ci`
2. `npm run lint`
3. `npm run test:coverage` (фейлит при coverage < 80%)
4. Загрузка `frontend-coverage` как артефакта (хранится 14 дней)
5. `npm run build`

## Env-переменные

Создавать `.env.local` (не коммитим). Ключевые ключи:

| Переменная | Назначение |
|---|---|
| `VITE_BASE_API_URL` | URL бэкенда. По умолчанию `http://localhost:4010/api/v1` (mock-сервер) |
| `VITE_AI_DEMO` | `true` — принудительно показать "Demo Mode" в AI-чате; иначе определяется из API URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client_id (для реального входа через Google) |
| `VITE_OAUTH_REDIRECT_URI` | Должен совпадать с URI, зарегистрированным в Google Cloud |
