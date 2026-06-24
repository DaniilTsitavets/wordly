-- Per-word best recall time (milliseconds) for the stats screen.
-- Source of truth for the user-level "best_recall_time": derived as MIN(recall_time_ms)
-- over the user's words (see UserWordStateRepository.findBestRecallTimeMs). Nullable —
-- NULL means the word has never been recalled (correctly) yet, so the user has no record.
ALTER TABLE user_word_state
    ADD COLUMN recall_time_ms INTEGER;
