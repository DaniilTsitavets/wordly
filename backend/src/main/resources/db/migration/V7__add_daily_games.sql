CREATE TABLE daily_games (
    id              BIGSERIAL PRIMARY KEY,
    idiom           VARCHAR(500) NOT NULL,
    option_1        VARCHAR(500) NOT NULL,
    option_2        VARCHAR(500) NOT NULL,
    option_3        VARCHAR(500) NOT NULL,
    option_4        VARCHAR(500) NOT NULL,
    correct_option  SMALLINT    NOT NULL CHECK (correct_option BETWEEN 1 AND 4),
    scheduled_date  DATE        NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX daily_games_scheduled_date_uidx
    ON daily_games (scheduled_date)
    WHERE scheduled_date IS NOT NULL;