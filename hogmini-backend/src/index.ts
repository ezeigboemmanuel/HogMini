import express from "express";
import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js';
import orgRoutes from './routes/organizations.route.js';
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', orgRoutes);



app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/sdk/rules", async (req, res) => {
  const apiKey = req.headers["authorization"];

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API Key" });
  }

  const project = await prisma.project.findUnique({
    where: { apiKey: apiKey as string },
  });

  if (!project) {
    return res.status(401).json({ error: "Invalid API Key" });
  }

  const flags = await prisma.featureFlag.findMany({
    where: { projectId: project.id },
  });

  res.json({ flags });
});


app.post("/flags", async (req, res) => {
  // 'rules' is optional. If missing, it defaults to undefined.
  const { key, description, isActive, rules, projectId } = req.body;

  if (!key || !projectId) {
    return res.status(400).json({ error: "Missing key or projectId" });
  }

  try {
    const flag = await prisma.featureFlag.create({
      data: {
        key,
        description,
        isActive: isActive ?? false,
        rules: rules ?? [],
        projectId,
      },
    });

    res.status(201).json(flag);
  } catch (err: any) {
    // specific error code for unique constraint violation (duplicate key)
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Flag already exists in this project" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not create flag" });
  }
});

// 1. Get Flags for Dashboard (Authenticated by ID in URL for now)
app.get("/projects/:projectId/flags", async (req, res) => {
  const { projectId } = req.params;
  const flags = await prisma.featureFlag.findMany({
    where: { projectId },
    orderBy: { key: "asc" },
  });
  res.json({ flags });
});

// Toggle/Update Flag
app.patch("/flags/:id", async (req, res) => {
  const { id } = req.params;
  const { isActive, rules } = req.body;

  try {
    const flag = await prisma.featureFlag.update({
      where: { id },
      data: {
        // Only update what is provided
        ...(isActive !== undefined && { isActive }),
        ...(rules !== undefined && { rules }),
      },
    });
    res.json(flag);
  } catch (e) {
    res.status(500).json({ error: "Update failed" });
  }
});

// Get Single Flag Details
app.get("/flags/details/:id", async (req, res) => {
  const { id } = req.params;
  const flag = await prisma.featureFlag.findUnique({
    where: { id },
  });

  if (!flag) return res.status(404).json({ error: "Not found" });
  res.json(flag);
});

// Get Project Details (for the dashboard to show API Key)
app.get("/projects/:id", async (req, res) => {
  const { id } = req.params;
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
