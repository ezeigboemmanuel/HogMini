CREATE TYPE member_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE organization_members (
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'viewer',
    PRIMARY KEY (organization_id, user_id)
);