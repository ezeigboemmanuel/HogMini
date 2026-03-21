import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

// Only hunt for the .env file if we are NOT in production
if (process.env.NODE_ENV !== "production") {
  const envPath = path.resolve(__dirname, "../../../../.env");
  dotenv.config({ path: envPath });
}

const connectionString = process.env.IDENTITY_DATABASE_URL;

if (!connectionString) {
  throw new Error("IDENTITY_DATABASE_URL environment variable is not set");
}

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
