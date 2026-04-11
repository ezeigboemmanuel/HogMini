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

// Get Flags for Dashboard
router.get("/:projectId/flags", async (req, res) => {
  const { projectId } = req.params;
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
      }
    },
    orderBy: { updatedAt: "desc" },
  });
  res.json({ flags });
});

// Create Flag
router.post("/:projectId/flags", async (req, res) => {
  const { projectId } = req.params;
  const { key, description, isActive, rules } = req.body;

  if (!key) return res.status(400).json({ error: "Missing flag key" });

  const userId = getUserId(req);

  try {
    const flag = await prisma.featureFlag.create({
      data: {
        key,
        description,
        isActive: isActive ?? false,
        rules: rules ?? [],
        projectId,
        creatorId: userId,
      },
    });
    res.status(201).json(flag);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Flag already exists in this project" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not create flag" });
  }
});

// Update/Toggle Flag
router.patch("/:projectId/flags/:flagId", async (req, res) => {
  const { flagId } = req.params;
  const { key, isActive, rules, description } = req.body;

  try {
    const flag = await prisma.featureFlag.update({
      where: { id: flagId },
      data: {
        ...(key !== undefined && { key }),
        ...(isActive !== undefined && { isActive }),
        ...(rules !== undefined && { rules }),
        ...(description !== undefined && { description }),
      },
    });
    res.json(flag);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A flag with this key already exists in this project" });
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

// Get Project Details (for the dashboard to show API Key)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { organization: true },
  });

  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

export default router;
