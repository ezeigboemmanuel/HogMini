import { PoolClient } from "pg";

export class OrganizationRepository {
  static async create(client: PoolClient, name: string, ownerId: string) {
    const result = await client.query(
      `WITH created_org AS (
         INSERT INTO organizations (name, owner_id)
         VALUES ($1, $2)
         RETURNING id, name, owner_id, created_at
       )
       INSERT INTO organization_members (organization_id, user_id, role)
      SELECT id, $2, 'owner'::member_role
       FROM created_org
       RETURNING (SELECT id FROM created_org) AS id,
                 (SELECT name FROM created_org) AS name,
                 (SELECT owner_id FROM created_org) AS owner_id,
                 (SELECT created_at FROM created_org) AS created_at`,
      [name, ownerId],
    );
    return result.rows[0];
  }

  static async findById(client: PoolClient, id: string) {
    const result = await client.query(
      `SELECT id, name, owner_id, created_at 
       FROM organizations 
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  static async addMember(
    client: PoolClient,
    orgId: string,
    userId: string,
    role: string,
  ) {
    const result = await client.query(
      `INSERT INTO organization_members (organization_id, user_id, role) 
       VALUES ($1, $2, $3) 
       RETURNING organization_id, user_id, role, joined_at`,
      [orgId, userId, role],
    );
    return result.rows[0];
  }

  static async findByMemberId(client: PoolClient, userId: string) {
    const result = await client.query(
      `SELECT o.id, o.name, o.owner_id, o.created_at, om.role
       FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1`,
      [userId],
    );
    return result.rows; // Returns an array of organizations
  }
}
