ALTER TABLE users
    ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(20),
    ADD COLUMN IF NOT EXISTS oauth_id       VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS users_oauth_provider_oauth_id_idx
    ON users (oauth_provider, oauth_id)
    WHERE oauth_id IS NOT NULL;
