# Mock Server

Локальный mock для разработки фронтенда без реального бэкенда.
Возвращает реалистичные данные по контракту из `openapi.yaml`.

Данные хранятся в памяти и **мутабельны** — создание/редактирование/удаление через admin-эндпоинты сохраняется до перезапуска сервера. Подробнее: [ADMIN.md](./ADMIN.md).

Подробно о дейли-игре: [DAILY-GAME.md](./DAILY-GAME.md).

## Запуск

Нужен Docker. Из корня репо:

```bash
mise run mock
```

Или без mise:

```bash
docker compose --profile mock up --build -d mock
```

Сервер поднимется на **http://localhost:4010/api/v1**

Остановить:
```bash
mise run mock:down
```

---

## Подключение

Поменяй `baseURL` в своём проекте:

```
http://localhost:4010/api/v1
```

**Авторизация:** любой токен принимается, проверка не производится.
После логина/регистрации приходит фейковый JWT — его можно передавать в `Authorization: Bearer <token>` как обычно.

Мок-юзер имеет роль `ADMIN`, поэтому admin-эндпоинты доступны без дополнительной настройки.

---

## Тестовые данные

### Тема (1 шт.)
| id | Название |
|----|----------|
| 1  | Food & Kitchen |

### Подтемы
| id | Название | Особенность |
|----|----------|-------------|
| 1  | Кухонная утварь | Level 0 активен (есть мнемоники) |
| 2  | Продукты питания | Level 0 отключён, начинается с Level 1 |

### Дейли-игры (id 1–3)
| id | Идиома | Правильный вариант |
|----|--------|-------------------|
| 1  | Break a leg | 2 — «Пожелать удачи» |
| 2  | Hit the sack | 3 — «Лечь спать» |
| 3  | Bite the bullet | 2 — «Смириться и терпеть» |

### Слова подтемы 1 (id 1–9)
| id | Слово | Перевод | Мнемоника |
|----|-------|---------|-----------|
| 1  | plate | тарелка | ✅ |
| 2  | cup | чашка | ✅ |
| 3  | fork | вилка | ✅ |
| 4  | knife | нож | ✅ |
| 5  | spoon | ложка | ✅ |
| 6  | bowl | миска | ✅ |
| 7  | glass | стакан | ❌ |
| 8  | pot | кастрюля | ❌ |
| 9  | pan | сковорода | ❌ |

### Слова подтемы 2 (id 10–18)
| id | Слово | Перевод | Мнемоника |
|----|-------|---------|-----------|
| 10 | apple | яблоко | ❌ |
| 11 | bread | хлеб | ❌ |
| 12 | milk | молоко | ❌ |
| 13 | egg | яйцо | ❌ |
| 14 | cheese | сыр | ❌ |
| 15 | butter | масло | ❌ |
| 16 | salt | соль | ❌ |
| 17 | sugar | сахар | ❌ |
| 18 | rice | рис | ❌ |

---

## Эндпоинты

### AUTH

```
POST /auth/register
{
  "name": "Ivan",
  "email": "ivan@test.com",
  "password": "secret123"
}
→ 201 { "access_token": "...", "user": { ... } }
```

```
POST /auth/login
{
  "email": "ivan@test.com",
  "password": "secret123"
}
→ 200 { "access_token": "...", "user": { ... } }
```

```
POST /auth/guest
(без body)
→ 201 { "access_token": "...", "user": { "is_guest": true, ... } }
```

```
POST /auth/logout
Header: Authorization: Bearer <token>
→ 204
```

---

### USERS

```
GET /users/me
→ { id, name, surname, email, is_guest, role, gems, streak, daily_goal_min, ... }
```

```
PUT /users/me
{ "daily_goal_min": 15, "color_theme": "dark", ... }
→ обновлённый профиль
```

---

### TOPICS

```
GET /topics
→ {
    "topics": [ { id, name, description, image_url, sort_order, subtopics_total, subtopics_completed } ],
    "current_position": { "subtopic_id": 1, "mechanic_type": "mnemonic_cards" }
  }
```

```
GET /topics/1
→ { id, name, description, image_url, "subtopic_ids": [1, 2] }
```

---

### SUBTOPICS

```
POST /subtopics/batch
{ "ids": [1, 2] }
→ [ { id, name, description, image_url, sort_order, words_count, disabled_mechanics, status } ]
```

```
GET /subtopics/1
→ {
    id, name, description, image_url, words_count,
    "disabled_mechanics": [],
    "levels": [
      { "mechanic_type": "mnemonic_cards", "status": "in_progress", ... },
      { "mechanic_type": "flashcards",     "status": "locked", ... },
      ...
    ]
  }

GET /subtopics/2
→ то же, но disabled_mechanics: ["mnemonic_cards"], первый level = flashcards
```

```
GET /subtopics/1/words
GET /subtopics/2/words
→ { "words": [ { id, word_en, transcription_en, translation_ru, image_url, has_mnemonic, mnemo_description } ] }
```

---

### SESSION (учебная сессия)

```
GET /subtopics/:id/session
→ { "subtopic_id": 1, "mechanic_type": "word_builder", "words": [ { ...word, mnemonic: null } ] }
```

> При `mechanic_type: mnemonic_cards` поле `mnemonic` заполнено: `{ image_url, mnemo_text }`. Для остальных механик — `null`.

```
POST /subtopics/:id/session/answer
{ "word_id": 1, "user_answer": "plate" }
→ { "word_id": 1, "is_correct": true, "correct_answer": "plate" }
```

`is_correct = true` если ответ совпадает со словом (без учёта регистра и пробелов по краям).

```
POST /subtopics/:id/session/complete
{ "mechanic_type": "mnemonic_cards" }
→ {
    "mechanic_type": "mnemonic_cards",
    "gems_earned": 5,
    "next_mechanic": "flashcards",
    "subtopic_completed": false
  }
```

Порядок механик:
```
mnemonic_cards → flashcards → matching → filling_gaps → word_builder → (null, subtopic_completed: true)
```

---

### RECALL

```
GET /recall
→ { "total": 3, "words": [ { id, word_en, translation_ru, transcription_en, recall_interval } ] }
```

```
POST /recall/answer
{ "word_id": 1, "user_answer": "plate" }
→ { "word_id": 1, "is_correct": true, "correct_answer": "plate" }
```

```
POST /recall/complete
→ { "total_words": 3, "correct": 2, "failed": 1, "gems_earned": 5 }
```

---

### DAILY GAME

```
GET /daily-game
Header: Authorization: Bearer <token>
→ {
    "id": 1,
    "idiom": "Break a leg",
    "options": ["Сломать ногу", "Пожелать удачи", "Убежать", "Упасть"],
    "correct_option": 2
  }
```

При первом обращении за день мок выбирает случайную незанятую игру и закрепляет её на текущую дату. Подробнее: [DAILY-GAME.md](./DAILY-GAME.md).

---

### VOCABULARY

```
GET /vocabulary
→ { "total": 9, "page": 1, "words": [ { id, word_en, transcription_en, translation_ru, image_url, status, next_recall } ] }
```