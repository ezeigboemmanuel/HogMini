import "dotenv/config";
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const flags = await prisma.featureFlag.findMany();
  console.log("Flags:", JSON.stringify(flags, null, 2));
  
  const projects = await prisma.project.findMany({
      include: { organization: true }
  });
  console.log("Projects:", JSON.stringify(projects, null, 2));
  
  const orgs = await prisma.organization.findMany();
  console.log("Orgs:", JSON.stringify(orgs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
