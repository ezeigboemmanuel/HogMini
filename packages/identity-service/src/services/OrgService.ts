import { z } from "zod";
import { ConflictError, NotFoundError } from "@hogmini/shared";
import { pool } from "../config/database";
import { OrganizationRepository } from "../Repositories/OrganizationRepository";

const orgNameSchema = z
  .string()
  .trim()
  .min(2, "Organization name must be at least 2 characters")
  .max(255, "Organization name must be 255 characters or less");

const uuidSchema = z.string().uuid("Invalid id format");

const orgRoleSchema = z.enum(["owner", "admin", "editor", "viewer"]);

export class OrgService {
  static async createOrganization(name: string, ownerId: string) {
    const validatedName = orgNameSchema.parse(name);
    const validatedOwnerId = uuidSchema.parse(ownerId);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const organization = await OrganizationRepository.create(
        client,
        validatedName,
        validatedOwnerId,
      );

      await client.query("COMMIT");
      return organization;
    } catch (error) {
      await client.query("ROLLBACK");

      // Duplicate org membership (org_id + user_id PK) or other unique collisions.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new ConflictError(
          "Organization already exists or duplicate member",
        );
      }

      throw error;
    } finally {
      client.release();
    }
  }

  static async getOrganizationById(orgId: string) {
    const validatedOrgId = uuidSchema.parse(orgId);
    const client = await pool.connect();

    try {
      const organization = await OrganizationRepository.findById(
        client,
        validatedOrgId,
      );

      if (!organization) {
        throw new NotFoundError("Organization not found");
      }

      return organization;
    } finally {
      client.release();
    }
  }

  static async listOrganizationsForUser(userId: string) {
    const validatedUserId = uuidSchema.parse(userId);
    const client = await pool.connect();

    try {
      return await OrganizationRepository.findByMemberId(
        client,
        validatedUserId,
      );
    } finally {
      client.release();
    }
  }

  static async addMember(
    orgId: string,
    userId: string,
    role: "owner" | "admin" | "editor" | "viewer",
  ) {
    const validatedOrgId = uuidSchema.parse(orgId);
    const validatedUserId = uuidSchema.parse(userId);
    const validatedRole = orgRoleSchema.parse(role);

    const client = await pool.connect();
    try {
      const organization = await OrganizationRepository.findById(
        client,
        validatedOrgId,
      );

      if (!organization) {
        throw new NotFoundError("Organization not found");
      }

      return await OrganizationRepository.addMember(
        client,
        validatedOrgId,
        validatedUserId,
        validatedRole,
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new ConflictError(
          "User is already a member of this organization",
        );
      }

      throw error;
    } finally {
      client.release();
    }
  }
}
