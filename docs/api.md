# Wordly API Documentation

Word Learning App API — a language-learning app with spaced repetition.

**Base URL:** `http://localhost:8080/api/v1`
**Version:** 1.1.0

> The source of truth for the contract is [`openapi.yaml`](../openapi.yaml). This file is its human-readable rendering and is maintained manually when the spec changes.

## Authentication

Most requests require a JWT token in the header:

```
Authorization: Bearer <access_token>
```

A token is issued by `POST /auth/register`, `POST /auth/login`, `POST /auth/guest`, `POST /auth/oauth/google`.
Public (no token): all `/auth/*` except `/auth/logout`.

## Roles

| Role | Access |
| --- | --- |
| `USER` | Regular user |
| `ADMIN` | Additionally — all `/admin/**` endpoints |

A guest (`is_guest: true`) has access only to Level 0 and Level 1 of the first topic.

## Error Codes

Errors are returned in a unified format:

```json
{
  "code": "NOT_FOUND",
  "message": "Resource not found"
}
```

| Code | When |
| --- | --- |
| 400 | Invalid payload or business-rule violation |
| 401 | Missing or invalid token |
| 403 | Authenticated but lacks rights (e.g. not ADMIN) |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already exists) |

---

# Auth

### POST /auth/register

Register a new user. No token required.

**Request:**
```json
{
  "name": "Alex",
  "surname": "Smith",
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response 201:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Alex",
    "surname": "Smith",
    "email": "user@example.com",
    "is_guest": false,
    "role": "USER",
    "interface_language": "ru",
    "daily_goal_min": 10,
    "notifications_enabled": true,
    "color_theme": "system",
    "onboarding_completed": false,
    "streak": 0,
    "longest_streak": 0,
    "gems": 0
  }
}
```

**Response 409:** email already exists.

### POST /auth/login

Sign in with email and password. No token required.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response 200:** `AuthResponse` (as in register).
**Response 401:** invalid credentials.

### POST /auth/guest

Creates a guest session. No token required. The guest sees only the first topic (Level 0 and Level 1).

**Response 201:** `AuthResponse` with `"is_guest": true`.

### POST /auth/logout

Sign out. Requires a token. The token is added to the blacklist.

**Response 204:** no body.

### POST /auth/oauth/google

Sign in with Google. Exchanges the authorization code (obtained by the frontend after the Google redirect) for a JWT. Creates a new user or links Google to an existing email. No token required.

**Request:**
```json
{
  "code": "4/0AY0e-g6...",
  "redirect_uri": "https://app.wordly.quest/oauth/callback"
}
```

**Response 200:** `AuthResponse`.
**Response 400:** missing/invalid `code` or `redirect_uri`.
**Response 401:** Google rejected the code.

---

# Users

### GET /users/me

Current user's profile.

**Response 200:**
```json
{
  "id": 1,
  "name": "Alex",
  "surname": "Smith",
  "email": "user@example.com",
  "is_guest": false,
  "role": "USER",
  "interface_language": "ru",
  "daily_goal_min": 10,
  "daily_goal_words": 10,
  "notifications_enabled": true,
  "color_theme": "system",
  "onboarding_completed": false,
  "streak": 7,
  "longest_streak": 21,
  "gems": 340,
  "learned_words": 42,
  "words_percentage": 21,
  "best_recall_time": 3400,
  "last_active_date": "2026-06-25",
  "created_at": "2026-01-10T08:30:00Z"
}
```

The fields `learned_words`, `words_percentage`, `best_recall_time` are returned only by `GET/PUT /users/me` (`null` in auth responses).

### PUT /users/me

Updates the profile and settings: name, surname, email, password, interface language, daily goal, notifications, color theme, onboarding flag. All fields are optional.

**Request:**
```json
{
  "name": "Alex",
  "surname": "Smith",
  "email": "user@example.com",
  "password": "newsecret123",
  "interface_language": "ru",
  "daily_goal_min": 10,
  "notifications_enabled": true,
  "color_theme": "dark",
  "onboarding_completed": true
}
```

`color_theme` ∈ `light | dark | system`.

**Response 200:** updated `UserProfile`.

### GET /users/me/daily-progress

Minutes studied today (across all mechanics, recall, and AI chat) vs the daily goal. Time is accumulated via `POST /users/me/activity`.

**Response 200:**
```json
{
  "minutes_today": 9,
  "daily_goal_min": 15
}
```

### POST /users/me/activity

Study-time heartbeat for the daily goal. Send every ≤120 s while a learning screen is active (not once at the end). The server credits no more than the real time elapsed since the last report, capped at 120 s per request.

**Request:**
```json
{
  "seconds": 120
}
```
`seconds`: 1–86400.

**Response 200:** updated `DailyProgress`.

### POST /users/me/daily-goal/claim

Awards the +10 gems bonus for reaching the daily goal — once per local day (idempotent).

**Response 200:**
```json
{
  "reached": true,
  "gems_awarded": 10
}
```
If the goal is not reached or the bonus was already claimed today — `gems_awarded: 0`.

---

# Topics

### GET /topics

All topics with the user's progress. For guests, only the first topic.

**Response 200:**
```json
{
  "topics": [
    {
      "id": 1,
      "name": "Food",
      "description": "...",
      "image_url": "...",
      "sort_order": 1,
      "subtopics_total": 6,
      "subtopics_completed": 2
    }
  ],
  "current_position": {
    "subtopic_id": 3,
    "mechanic_type": "filling_gaps"
  }
}
```

### GET /topics/{topicId}

A topic with the list of its subtopic IDs.

**Response 200:**
```json
{
  "id": 1,
  "name": "Food",
  "description": "...",
  "image_url": "...",
  "subtopic_ids": [1, 2, 3]
}
```

**Response 404:** topic not found.

---

# Subtopics

### POST /subtopics/batch

Subtopic data by a list of IDs (with their progress status).

**Request:**
```json
{ "ids": [1, 2, 3] }
```

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Fruits",
    "description": "...",
    "image_url": "...",
    "sort_order": 1,
    "words_count": 15,
    "disabled_mechanics": ["mnemonic_cards"],
    "status": "in_progress"
  }
]
```
`status` ∈ `locked | unblocked | in_progress | completed`.

### GET /subtopics/{subtopicId}

A subtopic with its levels and their statuses.

**Response 200:**
```json
{
  "id": 1,
  "name": "Fruits",
  "description": "...",
  "image_url": "...",
  "words_count": 15,
  "disabled_mechanics": ["mnemonic_cards"],
  "levels": [
    {
      "mechanic_type": "flashcards",
      "status": "completed",
      "started_at": "2026-06-20T10:00:00Z",
      "completed_at": "2026-06-20T10:12:00Z"
    }
  ]
}
```

**Response 404:** subtopic not found.

### GET /subtopics/{subtopicId}/words

All words in the subtopic (preview before learning starts).

**Response 200:**
```json
{
  "words": [
    {
      "id": 1,
      "word_en": "plate",
      "transcription_en": "pleɪt",
      "translation_ru": "тарелка",
      "image_url": "...",
      "has_mnemonic": true,
      "mnemonic_image_url": "...",
      "mnemonic_text": "ПЛЕТЁТ — тарелка плетёт узоры"
    }
  ]
}
```
`mnemonic_*` are present only when `has_mnemonic: true`.

---

# Learning (learning session)

The mechanic order is fixed: `mnemonic_cards → flashcards → matching → filling_gaps → word_builder` (`mnemonic_cards` is skipped if in `disabled_mechanics`).

### GET /subtopics/{subtopicId}/session

Words and mechanic type for the current level.

**Response 200:**
```json
{
  "subtopic_id": 1,
  "mechanic_type": "filling_gaps",
  "words": [
    {
      "id": 1,
      "word_en": "plate",
      "transcription_en": "pleɪt",
      "translation_ru": "тарелка",
      "image_url": "...",
      "usage_example_en": "Put the plate on the table.",
      "usage_example_en_translation_ru": "Поставь тарелку на стол.",
      "mnemonic": null
    }
  ]
}
```
`mnemonic` is populated only when `mechanic_type: mnemonic_cards`.

**Response 403:** level is locked.

### POST /subtopics/{subtopicId}/session/answer

Answer for a word in the current session (for `matching`, `filling_gaps`, `word_builder`). Updates `user_word_state`.

**Request:**
```json
{
  "word_id": 1,
  "mechanic_type": "word_builder",
  "user_answer": "plate"
}
```

**Response 200:**
```json
{
  "word_id": 1,
  "is_correct": true,
  "correct_answer": "plate"
}
```

### POST /subtopics/{subtopicId}/session/complete

Complete the current level: marks it completed, awards gems, unlocks the next level. For `flashcards`/`mnemonic_cards` it is called on the "Complete" button.

**Request:**
```json
{ "mechanic_type": "word_builder" }
```

**Response 200:**
```json
{
  "mechanic_type": "word_builder",
  "gems_earned": 10,
  "next_mechanic": null,
  "subtopic_completed": true
}
```
`next_mechanic: null` if the subtopic is fully completed.

---

# Recall

### GET /recall

Words scheduled for recall today (`next_recall <= today`).

**Response 200:**
```json
{
  "total": 12,
  "words": [
    {
      "id": 1,
      "word_en": "plate",
      "translation_ru": "тарелка",
      "transcription_en": "pleɪt",
      "recall_interval": 7
    }
  ]
}
```

### POST /recall/answer

Answer for a word in recall. Updates `user_word_state`:
- success → `recall_interval` advances to the next step (1→3→7→14→21→30), `next_recall = today + interval`;
- failure → `recall_interval` resets to 1, `next_recall = tomorrow`.

**Request:**
```json
{
  "word_id": 1,
  "user_answer": "plate",
  "recall_time_ms": 3400
}
```
`recall_time_ms` is optional (ms); implausible values are ignored.

**Response 200:**
```json
{
  "word_id": 1,
  "is_correct": true,
  "correct_answer": "plate"
}
```

### POST /recall/complete

Recall session summary.

**Response 200:**
```json
{
  "total_words": 12,
  "correct": 10,
  "failed": 2,
  "gems_earned": 5
}
```

---

# Vocabulary

### GET /vocabulary

The user's vocabulary — all words that have a `user_word_state`.

**Query parameters:**
| Parameter | Type | Description |
| --- | --- | --- |
| status | string | Filter: `new` \| `learning` \| `recalling` \| `long_term_memory` |
| page | int | Page number (default: 1) |
| limit | int | Items per page (default: 50) |

**Response 200:**
```json
{
  "total": 120,
  "page": 1,
  "words": [
    {
      "id": 1,
      "word_en": "plate",
      "transcription_en": "pleɪt",
      "translation_ru": "тарелка",
      "image_url": "...",
      "status": "recalling",
      "next_recall": "2026-07-02"
    }
  ]
}
```

---

# AI Chat

### POST /ai/chat

Message to the AI tutor. Stateless: the client keeps the history and sends it with every request. The AI replies, checks spelling of target words, and evaluates their usage in context.

**Request:**
```json
{
  "subtopicId": 1,
  "history": [
    { "role": "assistant", "content": "Let's practice words from 'Kitchen Utensils'! What do you need to set the table?" },
    { "role": "user", "content": "I need a plate and a frok" }
  ],
  "message": "Also a cup and a spoon"
}
```
`role` ∈ `user | assistant`.

**Response 200:**
```json
{
  "reply": "Nice! Small spelling note — it's 'fork', not 'frok'. Great use of 'plate' and 'cup' though! What would you put on the plate?"
}
```

**Response 400 / 401.**

---

# Game (Daily Game)

### GET /daily-game

Today's daily game.

**Response 200:**
```json
{
  "id": 1,
  "idiom": "Break a leg",
  "options": ["...", "...", "...", "..."]
}
```

**Response 404:** no game for today.

### POST /daily-game/answer

Answer for the daily game.

**Request:**
```json
{
  "daily_game_id": 1,
  "selected_option": 2
}
```
`selected_option`: 1–4.

**Response 200:**
```json
{
  "is_correct": true,
  "correct_option": 2
}
```

---

# Admin

All endpoints require the `ADMIN` role (otherwise 403).

## Topics

### GET /admin/topics

List of topics with subtopic counts.

**Response 200:**
```json
[
  { "id": 1, "name": "Food", "description": "...", "image_url": "...", "sort_order": 1, "subtopics_count": 3 }
]
```

### POST /admin/topics

Create a topic.

**Request:**
```json
{
  "name": "Food",
  "description": "...",
  "image_url": "...",
  "sort_order": 1
}
```
Required: `name` (≤255).

**Response 201:** `AdminTopic`.

### PUT /admin/topics/{topicId}

Update a topic. Body — as in create. **Response 200:** `AdminTopic`.

### DELETE /admin/topics/{topicId}

Delete a topic. **400** if the topic still has subtopics. **Response 204.**

## Subtopics

### GET /admin/subtopics?topic_id={id}

List of subtopics for a topic (`topic_id` is required).

**Response 200:**
```json
[
  {
    "id": 1,
    "topic_id": 1,
    "name": "Fruits",
    "description": "...",
    "image_url": "...",
    "sort_order": 1,
    "words_count": 15,
    "disabled_mechanics": ["mnemonic_cards"]
  }
]
```

### POST /admin/subtopics

Create a subtopic.

**Request:**
```json
{
  "topic_id": 1,
  "name": "Fruits",
  "description": "...",
  "image_url": "...",
  "sort_order": 1,
  "disabled_mechanics": ["mnemonic_cards"]
}
```
Required: `topic_id`, `name`. **Response 201:** `AdminSubtopic`.

### PUT /admin/subtopics/{subtopicId}

Update a subtopic (can change `topic_id` — reparenting). **Response 200.**

### DELETE /admin/subtopics/{subtopicId}

Delete a subtopic. **400** if it still has words. **Response 204.**

## Words

### GET /admin/words?subtopic_id={id}

List of words for a subtopic (`subtopic_id` is required).

**Response 200:**
```json
[
  {
    "id": 1,
    "subtopic_id": 1,
    "word_en": "plate",
    "transcription_en": "pleɪt",
    "translation_ru": "тарелка",
    "image_url": "...",
    "usage_example_en": "Put the plate on the table.",
    "usage_example_en_translation_ru": "Поставь тарелку на стол.",
    "mnemonic_image_url": null,
    "mnemo_text": null
  }
]
```

### POST /admin/words

Create a word. Auto-recalculates `subtopic.words_count`.

**Request:**
```json
{
  "subtopic_id": 1,
  "word_en": "plate",
  "transcription_en": "pleɪt",
  "translation_ru": "тарелка",
  "image_url": "...",
  "usage_example_en": "Put the plate on the table.",
  "usage_example_en_translation_ru": "Поставь тарелку на стол.",
  "mnemonic_image_url": null,
  "mnemo_text": null
}
```
Required: `subtopic_id`, `word_en`, `translation_ru`. **Response 201:** `AdminWord`.

### PUT /admin/words/{wordId}

Update a word. Body — as in create. **Response 200.**

### DELETE /admin/words/{wordId}

Delete a word. **Response 204.**

### POST /admin/words/bulk

Bulk-insert words under one subtopic in a single transaction (fast seeding).

**Request:**
```json
{
  "subtopic_id": 1,
  "words": [
    { "word_en": "plate", "translation_ru": "тарелка" },
    { "word_en": "fork", "translation_ru": "вилка" }
  ]
}
```
Required: `subtopic_id`, `words` (≥1; each with `word_en`, `translation_ru`).

**Response 201:**
```json
{
  "subtopic_id": 1,
  "created": 12,
  "words": []
}
```
`words` — the array of created words in `AdminWord` format (as in `GET /admin/words`).

## Users

### GET /admin/users

Paginated list of users (sorted by `createdAt DESC`).

**Query parameters:**
| Parameter | Type | Description |
| --- | --- | --- |
| page | int | default: 1, min: 1 |
| limit | int | default: 50, min: 1, max: 200 |

**Response 200:**
```json
{
  "total": 137,
  "page": 1,
  "limit": 50,
  "users": [
    {
      "id": 1,
      "name": "Alex",
      "surname": "Smith",
      "email": "user@example.com",
      "is_guest": false,
      "role": "USER",
      "streak": 7,
      "gems": 340,
      "last_active_date": "2026-06-25",
      "created_at": "2026-01-10T08:30:00Z"
    }
  ]
}
```

## Daily Games

### GET /admin/daily-games

List of all daily games. **Response 200:** `AdminDailyGame[]`.

### POST /admin/daily-games

Create a daily game.

**Request:**
```json
{
  "idiom": "Break a leg",
  "option_1": "...",
  "option_2": "...",
  "option_3": "...",
  "option_4": "...",
  "correct_option": 2
}
```
`correct_option`: 1–4. **Response 201:** `AdminDailyGame`.

### PUT /admin/daily-games/{id}

Update a daily game. Body — as in create. **Response 200.**

### DELETE /admin/daily-games/{id}

Delete a daily game. **Response 204.**
