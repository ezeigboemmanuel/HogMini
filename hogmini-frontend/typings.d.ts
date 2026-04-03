// Global API types from backend Prisma schema

export {};

declare global {
  interface ApiOrganization {
    id: string;
    slug: string;
    name?: string | null;
  }

  interface ApiOrganizationMembership {
    organization: ApiOrganization;
  }

  interface ApiUser {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified: boolean;
    organizationMemberships?: ApiOrganizationMembership[];
  }

  interface ApiProject {
    id: string;
    name: string;
    apiKey?: string | null;
    createdAt?: string | null; // ISO date string
    userId?: string | null;
    organizationId?: string | null;
  }

  // Convenience alias used across frontend
  type User = ApiUser;
  type Project = ApiProject;
}
