import express from "express";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const router = express.Router();

// Helper: generate a URL-friendly slug from a name
const makeSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

router.post("/", async (req, res) => {
  try {
    const { name, description, slug } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Organization name is required" });
    }

    const baseSlug = (slug && String(slug).trim()) || makeSlug(name);
    let finalSlug = baseSlug;

    // Try to pick a unique slug up front by checking and appending a crypto suffix.
    // We'll also handle DB unique-constraint races when creating the record.
    let tries = 0;
    const MAX_PRECHECKS = 6;
    while (tries < MAX_PRECHECKS) {
      const existing = await prisma.organization.findUnique({ where: { slug: finalSlug } });
      if (!existing) break;
      finalSlug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`; // 6 hex chars
      tries++;
    }

    // Try to read authenticated user from cookie token
    let createdBy: string | null = null;
    try {
      const token = req.cookies?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        createdBy = decoded?.userId || null;
      }
    } catch (e) {
      // ignore - organization can be created without auth (fallback)
    }

    // Attempt creation and retry on unique-constraint (P2002) for slug collisions.
    let org: any = null;
    let createAttempts = 0;
    const MAX_CREATE_ATTEMPTS = 6;
    while (createAttempts < MAX_CREATE_ATTEMPTS) {
      try {
        org = await prisma.organization.create({
          data: {
            name,
            slug: finalSlug,
            description: description || null,
            createdBy,
          },
        });
        break;
      } catch (err: any) {
        // Prisma unique constraint on slug -> regenerate and retry
        if (err?.code === "P2002" && err?.meta?.target && String(err.meta.target).includes("slug")) {
          finalSlug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;
          createAttempts++;
          continue;
        }
        throw err;
      }
    }
    if (!org) {
      return res.status(500).json({ error: "Could not create organization" });
    }

    // If we have an authenticated user, add them as OWNER membership
    if (createdBy) {
      await prisma.organizationMembership.create({
        data: {
          userId: createdBy,
          organizationId: org.id,
          role: "OWNER",
        },
      });
    }

    res.status(201).json(org);
  } catch (err) {
    console.error("Create organization error:", err);
    res.status(500).json({ error: "Could not create organization" });
  }
});

// List organizations for the current user (via cookie JWT)
router.get("/", async (req, res) => {
  try {
    let userId: string | null = null;
    try {
      const token = req.cookies?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded?.userId || null;
      }
    } catch (e) {
      // ignore - unauthenticated
    }

    if (!userId) {
      // No authenticated user - return empty list
      return res.json([]);
    }

    const memberships = await prisma.organizationMembership.findMany({
      where: { userId },
      include: { organization: { select: { id: true, name: true, slug: true } } },
    });

    const orgs = memberships.map((m) => m.organization).filter(Boolean);
    res.json(orgs);
  } catch (err) {
    console.error("List organizations error:", err);
    res.status(500).json({ error: "Failed to list organizations" });
  }
});

// Get organization details by slug
router.get("/:slug", async (req, res) => {
  let { slug } = req.params;
  try {
    slug = decodeURIComponent(slug || "").trim();
  } catch (e) {
    slug = (slug || "").trim();
  }
  // strip accidental trailing dots or slashes
  slug = slug.replace(/[\.\/]+$/g, "");

  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org) {
    console.warn("Organization lookup failed for slug:", slug);
    return res.status(404).json({ error: "Organization not found" });
  }
  res.json(org);
});

// List projects for an organization identified by slug
router.get("/:slug/projects", async (req, res) => {
  let { slug } = req.params;
  try {
    slug = decodeURIComponent(slug || "").trim();
  } catch (e) {
    slug = (slug || "").trim();
  }
  slug = slug.replace(/[\.\/]+$/g, "");

  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org) {
    console.warn("Organization projects lookup failed for slug:", slug);
    return res.status(404).json({ error: "Organization not found" });
  }
  const projects = await prisma.project.findMany({ where: { organizationId: org.id } });
  res.json(projects);
});

// Create a new project within an organization identified by slug
router.post('/:slug/projects', async (req, res) => {
  try {
    let { slug } = req.params;
    try {
      slug = decodeURIComponent(slug || '').trim();
    } catch (e) {
      slug = (slug || '').trim();
    }
    slug = slug.replace(/[\.\/]+$/g, '');

    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) {
      console.warn('Create project failed — organization not found for slug:', slug);
      return res.status(404).json({ error: 'Organization not found' });
    }

    const randomBytes = crypto.randomBytes(32).toString('hex');
    const newApiKey = `hog_live_${randomBytes}`;

    const project = await prisma.project.create({
      data: {
        name,
        apiKey: newApiKey,
        organizationId: org.id,
      },
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Could not create project' });
  }
});

export default router;
