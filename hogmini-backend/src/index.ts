import express from "express";
import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js';
import orgRoutes from './routes/organizations.route.js';
import projectsRoutes from './routes/projects.route.js';
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
app.use('/api/projects', projectsRoutes);



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


// Toggle/Update Flag
// Moved to projects.route.ts

// Get Single Flag Details
app.get("/api/flags/details/:id", async (req, res) => {
  const { id } = req.params;
  const flag = await prisma.featureFlag.findUnique({
    where: { id },
  });

  if (!flag) return res.status(404).json({ error: "Not found" });
  res.json(flag);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
