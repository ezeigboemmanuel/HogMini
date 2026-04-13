import express from "express";
import { prisma } from "../../lib/prisma.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Helper to get user ID from cookie
const getUserId = (req: any) => {
  try {
    const token = req.cookies?.token;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
};

// Get Flags for Dashboard (Environment-Aware)
router.get("/:projectId/flags", async (req, res) => {
  const { projectId } = req.params;
  const { environmentId } = req.query;

  if (!environmentId) {
    return res.status(400).json({ error: "Missing environmentId" });
  }

  console.time(`fetch-flags-${projectId}`);
  const flags = await prisma.featureFlag.findMany({
    where: { projectId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
        }
      },
      states: {
        where: { environmentId: environmentId as string }
      }
    },
    orderBy: { updatedAt: "desc" },
  });
  console.timeEnd(`fetch-flags-${projectId}`);

  // Transform to include the state of the requested environment at the top level
  const transformedFlags = flags.map(f => ({
    ...f,
    isActive: f.states[0]?.isActive ?? false,
    rules: f.states[0]?.rules ?? [],
    states: undefined // Remove nesting to keep payload clean
  }));

  res.json({ flags: transformedFlags });
});

// Create Flag (Environment-Aware)
router.post("/:projectId/flags", async (req, res) => {
  const { projectId } = req.params;
  const { key, description, isActive, rules, environmentId } = req.body;

  if (!key) return res.status(400).json({ error: "Missing flag key" });

  const userId = getUserId(req);

  try {
    // 1. Get all environments for the project
    const environments = await prisma.environment.findMany({
      where: { projectId }
    });

    // 2. Create the main flag
    const flag = await prisma.featureFlag.create({
      data: {
        key,
        description,
        projectId,
        creatorId: userId,
      },
    });

    // 3. Create states for ALL environments
    for (const env of environments) {
      await prisma.featureFlagEnvironmentState.create({
        data: {
          flagId: flag.id,
          environmentId: env.id,
          // Apply request data to the target environment, or use defaults
          isActive: env.id === environmentId ? (isActive ?? false) : false,
          rules: env.id === environmentId ? (rules ?? []) : [],
        }
      });
    }

    res.status(201).json(flag);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Flag already exists in this project" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not create flag" });
  }
});

// Update/Toggle Flag (Environment-Aware)
router.patch("/:projectId/flags/:flagId", async (req, res) => {
  const { flagId } = req.params;
  const { key, isActive, rules, description, environmentId } = req.body;

  try {
    // 1. Update global flag properties if provided
    if (key !== undefined || description !== undefined) {
      await prisma.featureFlag.update({
        where: { id: flagId },
        data: {
          ...(key !== undefined && { key }),
          ...(description !== undefined && { description }),
        },
      });
    }

    // 2. Update environment-specific state if provided
    if (environmentId && (isActive !== undefined || rules !== undefined)) {
      await prisma.featureFlagEnvironmentState.update({
        where: {
          flagId_environmentId: {
            flagId: flagId,
            environmentId: environmentId as string
          }
        },
        data: {
          ...(isActive !== undefined && { isActive }),
          ...(rules !== undefined && { rules }),
        }
      });
    }

    // Return the updated flag with the specific environment state
    const updatedFlag = await prisma.featureFlag.findUnique({
      where: { id: flagId },
      include: {
        states: {
          where: { environmentId: environmentId as string }
        }
      }
    });

    res.json({
      ...updatedFlag,
      isActive: updatedFlag?.states[0]?.isActive ?? false,
      rules: updatedFlag?.states[0]?.rules ?? [],
      states: undefined
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A flag with this key already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete Flag
router.delete("/:projectId/flags/:flagId", async (req, res) => {
  const { flagId } = req.params;
  try {
    await prisma.featureFlag.delete({
      where: { id: flagId },
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// Get Project Details (Including Environments)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { 
      organization: true,
      environments: {
        orderBy: { createdAt: "asc" }
      }
    },
  });

  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

export default router;
