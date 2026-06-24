-- Historical longest streak for the stats screen. Unlike users.streak this never resets: it only
-- ratchets up when the current streak grows past it (StreakService.applyActivity). Backfill from the
-- current streak so active users don't lose the record they've already accumulated.
ALTER TABLE users ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0;
UPDATE users SET longest_streak = streak WHERE streak > longest_streak;