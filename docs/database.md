# Database Schema

## ER Diagram

[View ER diagram](https://drawsql.app/teams/evgeniya-y/diagrams/team-project-wordly)

## Tables

PostgreSQL 17. The schema is managed exclusively by Flyway migrations (`backend/src/main/resources/db/migration/`), with `ddl-auto: validate`. Enum columns (mechanic type, progress status, role, word status, theme) are stored as `VARCHAR` via JPA converters.

## users

| Column                  | Type         | Description                                                     |
| ----------------------- | ------------ | --------------------------------------------------------------- |
| id                      | BIGSERIAL    | PK                                                              |
| name                    | VARCHAR(255) | Nullable                                                        |
| surname                 | VARCHAR(255) | Nullable                                                        |
| email                   | VARCHAR(255) | Unique, nullable (guests/OAuth without email)                   |
| password_hash           | VARCHAR(255) | Bcrypt hash, nullable (OAuth/guests)                            |
| is_guest                | BOOLEAN      | NOT NULL, default FALSE                                         |
| interface_language      | VARCHAR(10)  | default 'ru'                                                    |
| daily_goal_min          | INTEGER      | default 10. Daily goal in minutes (BRD §9.1)                    |
| daily_goal_words        | INTEGER      | default 10. Legacy, not used for progress (kept for stats)      |
| notifications_enabled   | BOOLEAN      | default TRUE                                                    |
| color_theme             | VARCHAR(20)  | ENUM (light/dark/system), default 'system'                      |
| streak                  | INTEGER      | NOT NULL, default 0. Current run of active days                 |
| longest_streak          | INTEGER      | NOT NULL, default 0. All-time streak record, only grows (V21)   |
| gems                    | INTEGER      | NOT NULL, default 0. In-game currency                           |
| last_active_date        | DATE         | Nullable. Last active day (for streak)                          |
| last_activity_at        | TIMESTAMP    | Nullable. Wall-clock baseline for the activity anti-cheat (V20) |
| daily_goal_awarded_date | DATE         | Nullable. Dedupes the +10 gems daily-goal bonus per day (V9)    |
| role                    | VARCHAR(20)  | ENUM (USER/ADMIN), NOT NULL, default 'USER' (V6)                |
| oauth_provider          | VARCHAR(20)  | Nullable. OAuth provider, e.g. google (V7)                      |
| oauth_id                | VARCHAR(255) | Nullable. User ID at the provider (V7)                          |
| onboarding_completed    | BOOLEAN      | NOT NULL, default FALSE (V16)                                   |
| created_at              | TIMESTAMP    | NOT NULL, default NOW()                                         |

**Indexes:** `role`; unique partial `(oauth_provider, oauth_id)` where `oauth_id IS NOT NULL`; unique `email`.

## topics

| Column      | Type         | Description          |
| ----------- | ------------ | -------------------- |
| id          | BIGSERIAL    | PK                   |
| name        | VARCHAR(255) | NOT NULL             |
| description | TEXT         | NOT NULL, default '' |
| image_url   | VARCHAR(255) | NOT NULL, default '' |
| sort_order  | INTEGER      | NOT NULL, default 0  |

## subtopics

| Column             | Type         | Description                                         |
| ------------------ | ------------ | --------------------------------------------------- |
| id                 | BIGSERIAL    | PK                                                  |
| topic_id           | BIGINT       | NOT NULL, FK → topics.id                            |
| name               | VARCHAR(255) | NOT NULL                                            |
| description        | TEXT         | NOT NULL, default ''                                |
| image_url          | VARCHAR(255) | NOT NULL, default ''                                |
| sort_order         | INTEGER      | NOT NULL, default 0                                 |
| words_count        | INTEGER      | NOT NULL, default 0. Kept in sync by a trigger (V5) |
| disabled_mechanics | JSONB        | NOT NULL, default '[]'. Mechanics disabled for it   |

**Indexes:** `topic_id`.
**Trigger:** `words_count_trigger` on `words` (INSERT/DELETE/UPDATE of subtopic_id) keeps `words_count` in sync via delta updates (V5).

## words

| Column                          | Type         | Description                         |
| ------------------------------- | ------------ | ----------------------------------- |
| id                              | BIGSERIAL    | PK                                  |
| subtopic_id                     | BIGINT       | NOT NULL, FK → subtopics.id         |
| word_en                         | VARCHAR(255) | NOT NULL. English word              |
| transcription_en                | VARCHAR(255) | NOT NULL, default ''                |
| translation_ru                  | VARCHAR(255) | NOT NULL. Russian translation       |
| image_url                       | VARCHAR(255) | NOT NULL, default ''                |
| usage_example_en                | TEXT         | NOT NULL, default ''. Usage example |
| usage_example_en_translation_ru | TEXT         | NOT NULL, default ''. Translation   |
| mnemonic_image_url              | VARCHAR(255) | Nullable. Mnemonic image            |
| mnemo_text                      | TEXT         | Nullable. Mnemonic text             |

**Indexes:** `subtopic_id`.

## user_word_state

A user's learning state for a word (spaced repetition).

| Column          | Type        | Description                                                   |
| --------------- | ----------- | ------------------------------------------------------------- |
| id              | BIGSERIAL   | PK                                                            |
| user_id         | BIGINT      | NOT NULL, FK → users.id                                       |
| word_id         | BIGINT      | NOT NULL, FK → words.id, ON DELETE CASCADE (V4)               |
| status          | VARCHAR(50) | ENUM (WordStatus), NOT NULL, default 'new'                    |
| recall_interval | INTEGER     | NOT NULL, default 1. Interval from {1,3,7,14,21,30} days      |
| next_recall     | DATE        | Nullable. Next recall date                                    |
| session_date    | DATE        | Nullable. Recall session date (V3)                            |
| session_correct | BOOLEAN     | Nullable. Whether the current session answer was correct (V3) |
| recall_time_ms  | INTEGER     | Nullable. Best recall time in ms, correct answers only (V22)  |

**Uniqueness:** `(user_id, word_id)`.
**Indexes:** `user_id`, `next_recall`.

## user_subtopic_level_mechanic_progress

A user's progress through mechanics (levels) within a subtopic.

| Column        | Type        | Description                                          |
| ------------- | ----------- | ---------------------------------------------------- |
| id            | BIGSERIAL   | PK                                                   |
| user_id       | BIGINT      | NOT NULL, FK → users.id                              |
| subtopic_id   | BIGINT      | NOT NULL, FK → subtopics.id, ON DELETE CASCADE (V4)  |
| mechanic_type | VARCHAR(50) | ENUM (MechanicType), NOT NULL                        |
| status        | VARCHAR(50) | ENUM (ProgressStatus), NOT NULL, default 'unblocked' |
| started_at    | TIMESTAMP   | Nullable                                             |
| completed_at  | TIMESTAMP   | Nullable                                             |

**Uniqueness:** `(user_id, subtopic_id, mechanic_type)`.
**Indexes:** `user_id`, `subtopic_id`.

## user_topic_bonus_award

Tracks the one-time +15 gems topic-completion bonus (V10).

| Column     | Type      | Description              |
| ---------- | --------- | ------------------------ |
| id         | BIGSERIAL | PK                       |
| user_id    | BIGINT    | NOT NULL, FK → users.id  |
| topic_id   | BIGINT    | NOT NULL, FK → topics.id |
| awarded_at | TIMESTAMP | NOT NULL                 |

**Uniqueness:** `(user_id, topic_id)` — guarantees exactly one bonus and serializes concurrent completions.
**Indexes:** `user_id`.

## daily_activity

Tracks per-day study time for the minutes-based daily goal (V19).

| Column        | Type      | Description                                                  |
| ------------- | --------- | ------------------------------------------------------------ |
| id            | BIGSERIAL | PK                                                           |
| user_id       | BIGINT    | NOT NULL, FK → users.id, ON DELETE CASCADE                   |
| activity_date | DATE      | NOT NULL                                                     |
| seconds_spent | INTEGER   | NOT NULL, default 0. Accumulated losslessly; minutes at read |

**Uniqueness:** `(user_id, activity_date)` — its composite index also serves lookups by user_id.

## daily_games

Daily "guess the idiom meaning" mini-game (V13, V14).

| Column         | Type         | Description                              |
| -------------- | ------------ | ---------------------------------------- |
| id             | BIGSERIAL    | PK                                       |
| idiom          | VARCHAR(500) | NOT NULL. The idiom                      |
| option_1       | VARCHAR(500) | NOT NULL. Answer option 1                |
| option_2       | VARCHAR(500) | NOT NULL. Answer option 2                |
| option_3       | VARCHAR(500) | NOT NULL. Answer option 3                |
| option_4       | VARCHAR(500) | NOT NULL. Answer option 4                |
| correct_option | INTEGER      | NOT NULL, 1–4 (CHECK; type fixed in V14) |
| scheduled_date | DATE         | Nullable. Display date                   |
| created_at     | TIMESTAMPTZ  | NOT NULL, default NOW()                  |

**Indexes:** unique partial `scheduled_date` where `scheduled_date IS NOT NULL` — one game per date.

## Relationships

- **topics 1 : N subtopics** (`subtopics.topic_id` → `topics.id`)
- **subtopics 1 : N words** (`words.subtopic_id` → `subtopics.id`, ON DELETE CASCADE for user progress)
- **users 1 : N user_word_state** and **words 1 : N user_word_state** — a user's learning state for a word; unique pair `(user_id, word_id)` (M:N between users and words with extra attributes)
- **users 1 : N user_subtopic_level_mechanic_progress** and **subtopics 1 : N user_subtopic_level_mechanic_progress** — progress through mechanics; unique triple `(user_id, subtopic_id, mechanic_type)`
- **users 1 : N user_topic_bonus_award** and **topics 1 : N user_topic_bonus_award** — awarded topic bonuses; unique pair `(user_id, topic_id)`
- **users 1 : N daily_activity** — study time per day; unique pair `(user_id, activity_date)`
- **daily_games** — standalone content table, no foreign keys
