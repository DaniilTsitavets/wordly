-- Keep subtopics.words_count in sync with the actual number of words.
-- Replaces application-level recalculation to avoid lost-update races between
-- concurrent admin mutations.
--
-- Uses delta updates (`words_count +/- 1`) rather than `(SELECT COUNT(*) ...)`.
-- Under READ_COMMITTED, when an UPDATE is blocked by a concurrent UPDATE on the
-- same row, Postgres re-reads the target row and recomputes column-based SET
-- expressions against the new version. But subqueries in SET still use the
-- original snapshot, which causes lost-update drift under contention.

CREATE OR REPLACE FUNCTION words_count_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE subtopics SET words_count = words_count + 1 WHERE id = NEW.subtopic_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE subtopics SET words_count = words_count - 1 WHERE id = OLD.subtopic_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.subtopic_id IS DISTINCT FROM OLD.subtopic_id THEN
        UPDATE subtopics SET words_count = words_count - 1 WHERE id = OLD.subtopic_id;
        UPDATE subtopics SET words_count = words_count + 1 WHERE id = NEW.subtopic_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS words_count_trigger ON words;
CREATE TRIGGER words_count_trigger
    AFTER INSERT OR UPDATE OF subtopic_id OR DELETE ON words
    FOR EACH ROW
EXECUTE FUNCTION words_count_trigger_fn();

-- Reconcile any drift accumulated before the trigger existed.
UPDATE subtopics s
SET words_count = COALESCE(c.cnt, 0)
FROM (
    SELECT subtopic_id, COUNT(*) AS cnt
    FROM words
    GROUP BY subtopic_id
) c
WHERE c.subtopic_id = s.id;

UPDATE subtopics
SET words_count = 0
WHERE id NOT IN (SELECT DISTINCT subtopic_id FROM words);