import { PoolClient } from "pg";

export class ApiKeyRepository {
  static async create(
    client: PoolClient,
    name: string,
    projectId: string,
    keyHash: string,
    keyPrefix: string,
  ) {
    const result = await client.query(
      `INSERT INTO api_keys (name, project_id, key_hash, key_prefix) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, project_id, key_prefix, created_at`,
      [name, projectId, keyHash, keyPrefix],
    );
    return result.rows[0];
  }

  static async findByKeyHash(client: PoolClient, keyHash: string) {
    const result = await client.query(
      `SELECT id, name, project_id, revoked_at 
       FROM api_keys 
       WHERE key_hash = $1 AND revoked_at IS NULL`,
      [keyHash],
    );
    return result.rows[0] || null;
  }

  static async listByProject(client: PoolClient, projectId: string) {
    const result = await client.query(
      `SELECT id, name, key_prefix, created_at, revoked_at 
       FROM api_keys 
       WHERE project_id = $1`,
      [projectId],
    );
    return result.rows;
  }

  static async revoke(client: PoolClient, id: string) {
    const result = await client.query(
      `UPDATE api_keys 
       SET revoked_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, name, revoked_at`,
      [id],
    );
    return result.rows[0];
  }
}
