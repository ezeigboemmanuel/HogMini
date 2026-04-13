import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import crypto from "crypto";
import fs from "fs";
import { execSync } from "child_process";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const BACKUP_FILE = "migration_data_backup.json";

async function run() {
  console.log("🛠️ Starting Professional Migration Tool...");

  try {
    // STEP 1: Backup existing data via Raw SQL
    console.log("💾 Backing up existing project data...");
    const projects = await prisma.$queryRaw`SELECT id, name, "apiKey" FROM "Project"` as any[];
    const flags = await prisma.$queryRaw`SELECT id, key, "isActive", rules, "projectId" FROM "FeatureFlag"` as any[];
    
    fs.writeFileSync(BACKUP_FILE, JSON.stringify({ projects, flags }, null, 2));
    console.log(`✅ Backup created: ${projects.length} projects, ${flags.length} flags.`);

    // STEP 2: Reconcile DB Schema
    console.log("⚙️ Reconciling database schema with new environment models...");
    try {
      // We use --accept-data-loss because we JUST backed it up to a JSON file.
      execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
      console.log("✅ Schema synchronized successfully.");
    } catch (e) {
      console.error("❌ Schema sync failed. Ensure no other processes are locking the DB.");
      return;
    }

    // STEP 3: Restore data into new models
    console.log("🏗️ Restoring data into new Environments and Flag States...");
    const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, "utf-8"));

    for (const project of backup.projects) {
      console.log(`  - Migrating: ${project.name}`);

      // Create 3 environments
      const devEnv = await prisma.environment.create({
        data: {
          name: "Development",
          apiKey: project.apiKey || `hog_dev_${crypto.randomBytes(32).toString("hex")}`,
          projectId: project.id
        }
      });

      await prisma.environment.create({
        data: {
          name: "Staging",
          apiKey: `hog_staging_${crypto.randomBytes(32).toString("hex")}`,
          projectId: project.id
        }
      });

      await prisma.environment.create({
        data: {
          name: "Production",
          apiKey: `hog_prod_${crypto.randomBytes(32).toString("hex")}`,
          projectId: project.id
        }
      });

      // Map flags for this project to the 'Development' environment
      const projectFlags = backup.flags.filter((f: any) => f.projectId === project.id);
      for (const flag of projectFlags) {
        await prisma.featureFlagEnvironmentState.create({
          data: {
            flagId: flag.id,
            environmentId: devEnv.id,
            isActive: flag.isActive,
            rules: flag.rules || []
          }
        });
        
        // Staging and Prod get default 'Off' states automatically via schema or separate calls
        // We ensure they exist for a complete mapping
        const staging = await prisma.environment.findFirst({ where: { projectId: project.id, name: "Staging" } });
        const prod = await prisma.environment.findFirst({ where: { projectId: project.id, name: "Production" } });

        if (staging) {
          await prisma.featureFlagEnvironmentState.create({
            data: { flagId: flag.id, environmentId: staging.id, isActive: false, rules: [] }
          });
        }
        if (prod) {
          await prisma.featureFlagEnvironmentState.create({
            data: { flagId: flag.id, environmentId: prod.id, isActive: false, rules: [] }
          });
        }
      }
    }

    console.log("✨ Migration complete! Your project is now environment-aware.");
    // fs.unlinkSync(BACKUP_FILE); // Keep it for safety for now
  } catch (error) {
    console.error("❌ Critical Migration Failure:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
