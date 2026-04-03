import express from "express";
import { prisma } from "../../lib/prisma.js";

const router = express.Router();

// Get Flags for Dashboard (Authenticated by ID in URL for now)
router.get("/:projectId/flags", async (req, res) => {
  const { projectId } = req.params;
  const flags = await prisma.featureFlag.findMany({
    where: { projectId },
    orderBy: { key: "asc" },
  });
  res.json({ flags });
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
