ALTER TABLE user_word_state
    ADD COLUMN session_date    DATE,
    ADD COLUMN session_correct BOOLEAN;