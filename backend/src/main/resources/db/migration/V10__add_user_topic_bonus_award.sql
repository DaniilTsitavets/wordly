-- Tracks the one-time +15 topic-completion gem bonus per (user, topic), so it is awarded exactly
-- once even if a topic is "re-completed" after its subtopic set changes (e.g. an admin adds a
-- subtopic). The UNIQUE constraint also serializes concurrent completes at the DB level.
CREATE TABLE IF NOT EXISTS user_topic_bonus_award (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users (id),
    topic_id   BIGINT    NOT NULL REFERENCES topics (id),
    awarded_at TIMESTAMP NOT NULL,
    UNIQUE (user_id, topic_id)
);

CREATE INDEX ON user_topic_bonus_award (user_id);