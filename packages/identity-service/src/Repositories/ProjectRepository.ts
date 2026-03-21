import { PoolClient } from "pg";

export class ProjectRepository {
  static async create(client: PoolClient, name: string, orgId: string) {
    const result = await client.query(
      `INSERT INTO projects (name, organization_id) 
       VALUES ($1, $2) 
       RETURNING id, name, organization_id, created_at`,
      [name, orgId],
    );
    return result.rows[0];
  }

  static async findById(client: PoolClient, id: string) {
    const result = await client.query(
      `SELECT id, name, organization_id, created_at 
       FROM projects 
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  static async findByOrgId(client: PoolClient, orgId: string) {
    const result = await client.query(
      `SELECT id, name, organization_id, created_at 
       FROM projects 
       WHERE organization_id = $1`,
      [orgId],
    );
    return result.rows;
  }
}
