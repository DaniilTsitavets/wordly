-- Tracks the last date the daily-goal gem bonus (+10) was awarded, to dedupe per day.
ALTER TABLE users ADD COLUMN daily_goal_awarded_date DATE;