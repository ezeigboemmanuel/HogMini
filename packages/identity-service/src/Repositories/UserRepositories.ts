import { PoolClient } from "pg";

export class UserRepository {
  // ==========================================
  // CORE CRUD OPERATIONS
  // ==========================================
  static async create(client: PoolClient, email: string, passwordHash: string) {
    const result = await client.query(
      `INSERT INTO users (email, password_hash) 
       VALUES ($1, $2) 
       RETURNING id, email, is_email_verified, created_at`,
      [email, passwordHash],
    );
    return result.rows[0];
  }

  static async findByEmail(client: PoolClient, email: string) {
    const result = await client.query(
      `SELECT id, email, password_hash, is_email_verified,created_at 
       FROM users 
       WHERE email = $1`,
      [email],
    );
    return result.rows[0] || null;
  }

  static async findById(client: PoolClient, id: string) {
    const result = await client.query(
      `SELECT id, is_email_verified, email, created_at 
       FROM users 
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  static async createOAuthUser(client: PoolClient, email: string) {
    const result = await client.query(
      `INSERT INTO users (email, password_hash, is_email_verified)
       VALUES ($1, NULL, TRUE)
       RETURNING id, email, is_email_verified, created_at`,
      [email],
    );
    return result.rows[0];
  }

  static async createUserIdentity(
    client: PoolClient,
    userId: string,
    provider: string,
    providerId: string,
  ) {
    const result = await client.query(
      `INSERT INTO user_identities (user_id, provider, provider_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider, provider_id) DO NOTHING
       RETURNING id, user_id, provider, provider_id, created_at`,
      [userId, provider, providerId],
    );

    return result.rows[0] || null;
  }

  static async findByProviderIdentity(
    client: PoolClient,
    provider: string,
    providerId: string,
  ) {
    const result = await client.query(
      `SELECT u.id, u.email, u.password_hash, u.is_email_verified, u.created_at
       FROM users u
       JOIN user_identities ui ON ui.user_id = u.id
       WHERE ui.provider = $1 AND ui.provider_id = $2`,
      [provider, providerId],
    );

    return result.rows[0] || null;
  }

  // ==========================================
  // PASSWORD RESET FLOW
  // ==========================================
  static async savePasswordResetToken(
    client: PoolClient,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    const result = await client.query(
      `UPDATE users 
       SET reset_password_token_hash = $1, 
           reset_password_expires_at = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING id, email`,
      [tokenHash, expiresAt, userId],
    );
    return result.rows[0];
  }

  static async findByPasswordResetToken(client: PoolClient, tokenHash: string) {
    const result = await client.query(
      `SELECT id, email, reset_password_expires_at 
       FROM users 
       WHERE reset_password_token_hash = $1`,
      [tokenHash],
    );
    return result.rows[0] || null;
  }

  static async updatePasswordAndClearToken(
    client: PoolClient,
    userId: string,
    newPasswordHash: string,
  ) {
    const result = await client.query(
      `UPDATE users 
       SET password_hash = $1, 
           reset_password_token_hash = NULL, 
           reset_password_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING id, email`,
      [newPasswordHash, userId],
    );
    return result.rows[0];
  }

  // ==========================================
  // EMAIL VERIFICATION FLOW
  // ==========================================
  static async saveEmailVerificationToken(
    client: PoolClient,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    const result = await client.query(
      `UPDATE users 
       SET verify_email_token_hash = $1, 
           verify_email_expires_at = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING id, email`,
      [tokenHash, expiresAt, userId],
    );
    return result.rows[0];
  }

  static async findByEmailVerificationToken(
    client: PoolClient,
    tokenHash: string,
  ) {
    const result = await client.query(
      `SELECT id, email, verify_email_expires_at 
       FROM users 
       WHERE verify_email_token_hash = $1`,
      [tokenHash],
    );
    return result.rows[0] || null;
  }

  static async markEmailAsVerified(client: PoolClient, userId: string) {
    const result = await client.query(
      `UPDATE users 
       SET is_email_verified = TRUE, 
           verify_email_token_hash = NULL, 
           verify_email_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING id, email, is_email_verified`,
      [userId],
    );
    return result.rows[0];
  }
}
