import express from "express";
import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js';
import orgRoutes from './routes/organizations.route.js';
import projectsRoutes from './routes/projects.route.js';
import { isAuthenticated } from "./middleware/auth.js";
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

  // 1. Find the environment by API Key
  const environment = await prisma.environment.findUnique({
    where: { apiKey: apiKey as string },
    include: { project: true },
  });

  if (!environment) {
    return res.status(401).json({ error: "Invalid API Key" });
  }

  // 2. Fetch all flags for the project including their state for THIS environment
  const flags = await prisma.featureFlag.findMany({
    where: { projectId: environment.projectId },
    include: {
      states: {
        where: { environmentId: environment.id },
      },
    },
  });

  // 3. Transform to match SDK expectation (isActive/rules at top level)
  const transformedFlags = flags.map((f) => {
    const state = f.states[0]; // Logic: Every flag has a state per env
    return {
      id: f.id,
      key: f.key,
      isActive: state?.isActive ?? false,
      rules: state?.rules ?? [],
    };
  });

  res.json({ flags: transformedFlags });
});


// Toggle/Update Flag
// Moved to projects.route.ts

// Get Single Flag Details
app.get("/api/flags/details/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const flag = await prisma.featureFlag.findUnique({
    where: { id: id as string },
  });

  if (!flag) return res.status(404).json({ error: "Not found" });
  res.json(flag);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
