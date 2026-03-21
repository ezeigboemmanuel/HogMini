ALTER TABLE users
ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verify_email_token_hash VARCHAR(255),
ADD COLUMN verify_email_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN reset_password_token_hash VARCHAR(255),
ADD COLUMN reset_password_expires_at TIMESTAMP WITH TIME ZONE;