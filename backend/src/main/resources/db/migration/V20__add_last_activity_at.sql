-- Server-side wall-clock baseline for the daily-goal anti-cheat: the activity endpoint credits at
-- most the real time elapsed since this timestamp, so client-reported seconds can never exceed
-- the time the server actually observed passing.
ALTER TABLE users ADD COLUMN last_activity_at TIMESTAMP;