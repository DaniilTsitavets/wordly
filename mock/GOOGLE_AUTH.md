# Google OAuth — Mock

Mock-реализация входа через Google для разработки фронтенда без реального OAuth-флоу и без обращений к Google API.

Мок принимает любой непустой `code` и `redirect_uri` — обмен токена с Google не происходит. Возвращает стандартный `FAKE_TOKEN` и мок-юзера с Google-email.

---

## Эндпоинт

```
POST /api/v1/auth/oauth/google
```

Публичный — авторизация не требуется.

### Тело запроса

```json
{
  "code": "4/0AY0e-g6...",
  "redirect_uri": "http://localhost:5173/oauth/callback"
}
```

| Поле | Тип | Обязательное | Описание |
|------|-----|:---:|---------|
| `code` | string | ✅ | Код авторизации от Google (любая непустая строка в моке) |
| `redirect_uri` | string | ✅ | URI, использованный при инициации OAuth-флоу |

### Ответ `200`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Alex",
    "surname": "Smith",
    "email": "mock@google.com",
    "is_guest": false,
    "role": "ADMIN",
    "interface_language": "ru",
    "daily_goal_min": 10,
    "notifications_enabled": true,
    "color_theme": "system",
    "onboarding_completed": true,
    "streak": 5,
    "gems": 150,
    "last_active_date": "2026-01-15",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

## Как работает флоу на фронте

Реальный OAuth-флоу, который фронт должен реализовать:

1. Пользователь нажимает «Sign in with Google»
2. Фронт редиректит на Google:
   ```
   https://accounts.google.com/o/oauth2/v2/auth
     ?client_id=<VITE_GOOGLE_CLIENT_ID>
     &redirect_uri=<origin>/oauth/callback
     &response_type=code
     &scope=openid email profile
     &state=google
   ```
3. Google редиректит обратно на `<origin>/oauth/callback?code=...&state=google`
4. Callback-страница читает `code` и `state` из URL-параметров
5. Фронт отправляет `POST /api/v1/auth/oauth/google` с `{ code, redirect_uri }`
6. Бэк возвращает `{ access_token, user }` — дальше как обычный логин

> **В моке** шаги 2–3 не нужны. Можно вызвать эндпоинт напрямую с любым кодом.

---

## Коды ошибок

| Статус | Код | Когда |
|--------|-----|-------|
| 400 | `BAD_REQUEST` | Отсутствует `code` или `redirect_uri` |
| 401 | `UNAUTHORIZED` | Google вернул ошибку при обмене кода (только реальный бэк) |

---

## Отличия от реального бэкенда

| | Мок | Реальный бэкенд |
|--|-----|-----------------|
| Проверка `code` | Любая непустая строка | Обменивается на токен через Google API |
| `redirect_uri` | Не проверяется совпадение | Должен совпадать с зарегистрированным в Google Console |
| Данные пользователя | Всегда `mock@google.com`, Alex Smith | Берутся из Google-профиля |
| Существующий аккаунт | Не проверяется | Если email совпадает — линкует аккаунт |
| Зависимости | Нет | Требует `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |