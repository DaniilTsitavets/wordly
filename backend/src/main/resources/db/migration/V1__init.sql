CREATE TABLE IF NOT EXISTS users (
    id                    BIGSERIAL PRIMARY KEY,
    name                  VARCHAR(255),
    surname               VARCHAR(255),
    email                 VARCHAR(255) UNIQUE,
    password_hash         VARCHAR(255),
    is_guest              BOOLEAN      NOT NULL DEFAULT FALSE,
    interface_language    VARCHAR(10)           DEFAULT 'ru',
    daily_goal_min        INTEGER               DEFAULT 10,
    notifications_enabled BOOLEAN               DEFAULT TRUE,
    color_theme           VARCHAR(20)           DEFAULT 'system',
    streak                INTEGER      NOT NULL DEFAULT 0,
    gems                  INTEGER      NOT NULL DEFAULT 0,
    last_active_date      DATE,
    created_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL DEFAULT '',
    image_url   VARCHAR(255) NOT NULL DEFAULT '',
    sort_order  INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subtopics (
    id                 BIGSERIAL PRIMARY KEY,
    topic_id           BIGINT       NOT NULL REFERENCES topics (id),
    name               VARCHAR(255) NOT NULL,
    description        TEXT         NOT NULL DEFAULT '',
    image_url          VARCHAR(255) NOT NULL DEFAULT '',
    sort_order         INTEGER      NOT NULL DEFAULT 0,
    words_count        INTEGER      NOT NULL DEFAULT 0,
    disabled_mechanics JSONB        NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS words (
    id                              BIGSERIAL PRIMARY KEY,
    subtopic_id                     BIGINT       NOT NULL REFERENCES subtopics (id),
    word_en                         VARCHAR(255) NOT NULL,
    transcription_en                VARCHAR(255) NOT NULL DEFAULT '',
    translation_ru                  VARCHAR(255) NOT NULL,
    image_url                       VARCHAR(255) NOT NULL DEFAULT '',
    usage_example_en                TEXT         NOT NULL DEFAULT '',
    usage_example_en_translation_ru TEXT         NOT NULL DEFAULT '',
    mnemonic_image_url              VARCHAR(255),
    mnemo_text                      TEXT
);

CREATE TABLE IF NOT EXISTS user_word_state (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT      NOT NULL REFERENCES users (id),
    word_id         BIGINT      NOT NULL REFERENCES words (id),
    status          VARCHAR(50) NOT NULL DEFAULT 'new',
    recall_interval INTEGER     NOT NULL DEFAULT 1,
    next_recall     DATE,
    UNIQUE (user_id, word_id)
);

CREATE TABLE IF NOT EXISTS user_subtopic_level_mechanic_progress (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT      NOT NULL REFERENCES users (id),
    subtopic_id  BIGINT      NOT NULL REFERENCES subtopics (id),
    mechanic_type VARCHAR(50) NOT NULL,
    status       VARCHAR(50) NOT NULL DEFAULT 'unblocked',
    started_at   TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE (user_id, subtopic_id, mechanic_type)
);

-- Indexes for user_word_state
CREATE INDEX ON user_word_state (user_id);
CREATE INDEX ON user_word_state (next_recall);

-- Indexes for user_subtopic_level_mechanic_progress
CREATE INDEX ON user_subtopic_level_mechanic_progress (user_id);
CREATE INDEX ON user_subtopic_level_mechanic_progress (subtopic_id);

-- Indexes for subtopics
CREATE INDEX ON subtopics (topic_id);

-- Indexes for words
CREATE INDEX ON words (subtopic_id);