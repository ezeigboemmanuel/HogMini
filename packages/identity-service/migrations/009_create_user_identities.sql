-- Make password_hash optional, because Google/GitHub users won't have one
ALTER TABLE users
ALTER COLUMN password_hash
DROP NOT NULL;

-- Create the linked accounts table
CREATE TABLE
    user_identities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        -- The name of the provider (e.g., 'google', 'github')
        provider VARCHAR(50) NOT NULL,
        -- The unique ID that Google or GitHub gives this user in their system
        provider_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            -- Security constraints
            UNIQUE (provider, provider_id), -- Two users can't share the exact same Google account
            UNIQUE (user_id, provider) -- One user can't link three different Google accounts to the same profile
    );