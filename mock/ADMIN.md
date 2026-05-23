# Admin API — Mock

Все admin-эндпоинты находятся под префиксом `/api/v1/admin/` и требуют роль `ADMIN`.
В моке мок-юзер уже имеет `role: ADMIN`, авторизация не проверяется — любой Bearer-токен принимается.

Данные живут в памяти. После перезапуска сервера возвращаются к исходным значениям.

---

## Темы (`/admin/topics`)

### Получить все темы

```
GET /admin/topics
→ [
    {
      "id": 1,
      "name": "Food & Kitchen",
      "description": "Everyday food and kitchen vocabulary",
      "image_url": "https://...",
      "sort_order": 1,
      "subtopics_count": 2
    }
  ]
```

### Создать тему

```
POST /admin/topics
{
  "name": "Travel",               // обязательное
  "description": "...",           // опционально
  "image_url": "https://...",     // опционально
  "sort_order": 2                 // опционально
}
→ 201 { "id": 2, "name": "Travel", ..., "subtopics_count": 0 }
```

### Обновить тему

```
PUT /admin/topics/:topicId
{
  "name": "Travel & Transport",
  "description": "...",
  "image_url": "https://...",
  "sort_order": 2
}
→ 200 { обновлённая тема }
```

### Удалить тему

```
DELETE /admin/topics/:topicId
→ 204

→ 400 если у темы ещё есть подтемы
→ 404 если тема не найдена
```

---

## Подтемы (`/admin/subtopics`)

### Получить подтемы темы

```
GET /admin/subtopics?topic_id=1
→ [
    {
      "id": 1,
      "topic_id": 1,
      "name": "Кухонная утварь",
      "description": "...",
      "image_url": "https://...",
      "sort_order": 1,
      "words_count": 9,
      "disabled_mechanics": []
    },
    {
      "id": 2,
      "topic_id": 1,
      "name": "Продукты питания",
      ...,
      "disabled_mechanics": ["mnemonic_cards"]
    }
  ]
```

### Создать подтему

```
POST /admin/subtopics
{
  "topic_id": 1,                          // обязательное
  "name": "Напитки",                      // обязательное
  "description": "...",                   // опционально
  "image_url": "https://...",             // опционально
  "sort_order": 3,                        // опционально
  "disabled_mechanics": ["mnemonic_cards"] // опционально, по умолчанию []
}
→ 201 { "id": 3, ..., "words_count": 0 }
```

### Обновить подтему

```
PUT /admin/subtopics/:subtopicId
{
  "topic_id": 1,
  "name": "Напитки и соки",
  "disabled_mechanics": []
}
→ 200 { обновлённая подтема }
```

### Удалить подтему

```
DELETE /admin/subtopics/:subtopicId
→ 204

→ 400 если у подтемы ещё есть слова
→ 404 если подтема не найдена
```

---

## Слова (`/admin/words`)

### Получить слова подтемы

```
GET /admin/words?subtopic_id=1
→ [
    {
      "id": 1,
      "subtopic_id": 1,
      "word_en": "plate",
      "transcription_en": "pleɪt",
      "translation_ru": "тарелка",
      "image_url": "https://...",
      "usage_example_en": "Put the plate on the table.",
      "usage_example_en_translation_ru": "Поставь тарелку на стол.",
      "mnemonic_image_url": "https://...",
      "mnemo_text": "ПЛЕТЁТ — тарелка плетёт узоры"
    },
    ...
  ]
```

`mnemonic_image_url` и `mnemo_text` — `null` если мнемоники нет.

### Создать слово

```
POST /admin/words
{
  "subtopic_id": 1,               // обязательное
  "word_en": "mug",               // обязательное
  "translation_ru": "кружка",     // обязательное
  "transcription_en": "mʌɡ",      // опционально
  "image_url": "https://...",     // опционально
  "usage_example_en": "...",      // опционально
  "usage_example_en_translation_ru": "...", // опционально
  "mnemonic_image_url": null,     // опционально
  "mnemo_text": null              // опционально
}
→ 201 { "id": 19, ... }
```

### Обновить слово

```
PUT /admin/words/:wordId
{ те же поля что и при создании }
→ 200 { обновлённое слово }
```

### Удалить слово

```
DELETE /admin/words/:wordId
→ 204
→ 404 если слово не найдено
```

### Массовое создание слов

Создаёт несколько слов за один запрос. Удобно для первичного наполнения подтемы.

```
POST /admin/words/bulk
{
  "subtopic_id": 2,
  "words": [
    {
      "word_en": "tomato",
      "translation_ru": "помидор",
      "transcription_en": "təˈmeɪ.toʊ",
      "image_url": "https://...",
      "usage_example_en": "Add tomato to the salad.",
      "usage_example_en_translation_ru": "Добавь помидор в салат.",
      "mnemonic_image_url": null,
      "mnemo_text": null
    },
    {
      "word_en": "onion",
      "translation_ru": "лук",
      "transcription_en": "ˈʌn.jən"
    }
  ]
}
→ 201 {
    "subtopic_id": 2,
    "created": 2,
    "words": [ { "id": 19, ... }, { "id": 20, ... } ]
  }
```

Обязательные поля для каждого элемента: `word_en`, `translation_ru`. Остальные — опционально.

---

## Пользователи (`/admin/users`)

Только чтение. Поддерживает пагинацию.

```
GET /admin/users?page=1&limit=50
→ {
    "total": 2,
    "page": 1,
    "limit": 50,
    "users": [
      {
        "id": 1,
        "name": "Alex",
        "surname": "Smith",
        "email": "mock@test.com",
        "is_guest": false,
        "role": "ADMIN",
        "streak": 5,
        "gems": 150,
        "last_active_date": "2026-04-09",
        "created_at": "2026-01-01T00:00:00Z"
      },
      {
        "id": 2,
        "name": null,
        "surname": null,
        "email": null,
        "is_guest": true,
        "role": "USER",
        "streak": 0,
        "gems": 0,
        "last_active_date": null,
        "created_at": "2026-04-09T08:00:00Z"
      }
    ]
  }
```

Параметры: `page` (default: 1), `limit` (default: 50, max: 200).

---

## Дейли-игры (`/admin/daily-games`)

### Получить все игры

```
GET /admin/daily-games
→ [
    {
      "id": 1,
      "idiom": "Break a leg",
      "option_1": "Сломать ногу",
      "option_2": "Пожелать удачи",
      "option_3": "Убежать",
      "option_4": "Упасть",
      "correct_option": 2,
      "scheduled_date": null
    }
  ]
```

`scheduled_date` — дата, на которую игра была назначена. `null` — ещё не использовалась.

### Создать игру

```
POST /admin/daily-games
{
  "idiom": "Spill the beans",         // обязательное
  "option_1": "Приготовить еду",      // обязательное
  "option_2": "Рассекретить",         // обязательное
  "option_3": "Уронить урожай",       // обязательное
  "option_4": "Переехать",            // обязательное
  "correct_option": 2                 // обязательное, от 1 до 4
}
→ 201 { "id": 4, ..., "scheduled_date": null }
```

### Обновить игру

```
PUT /admin/daily-games/:id
{ те же поля что и при создании }
→ 200 { обновлённая игра }
```

`scheduled_date` не изменяется через этот эндпоинт.

### Удалить игру

```
DELETE /admin/daily-games/:id
→ 204
→ 404 если игра не найдена
```

---

## Коды ошибок

| Статус | Код | Когда |
|--------|-----|-------|
| 400 | `BAD_REQUEST` | Отсутствует обязательное поле или нарушено бизнес-правило (удаление непустой темы/подтемы) |
| 404 | `NOT_FOUND` | Ресурс не найден |