-- Cascade delete of user state when content is removed by admin.
-- Without this, admin word/subtopic deletion fails with FK violation
-- once any user has progress against the row.

ALTER TABLE user_word_state
    DROP CONSTRAINT user_word_state_word_id_fkey,
    ADD CONSTRAINT user_word_state_word_id_fkey
        FOREIGN KEY (word_id) REFERENCES words (id) ON DELETE CASCADE;

ALTER TABLE user_subtopic_level_mechanic_progress
    DROP CONSTRAINT user_subtopic_level_mechanic_progress_subtopic_id_fkey,
    ADD CONSTRAINT user_subtopic_level_mechanic_progress_subtopic_id_fkey
        FOREIGN KEY (subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE;