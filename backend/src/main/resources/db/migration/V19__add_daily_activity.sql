-- Tracks per-day study time so the daily goal can be measured in minutes (BRD §9.1).
-- Seconds are accumulated losslessly; conversion to minutes happens only at read time.
CREATE TABLE IF NOT EXISTS daily_activity (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    activity_date DATE    NOT NULL,
    seconds_spent INTEGER NOT NULL DEFAULT 0,
    UNIQUE (user_id, activity_date)
);
-- No separate index on (user_id): the UNIQUE (user_id, activity_date) constraint already
-- creates a composite index with user_id as its leading column, which serves user lookups.
