import "dotenv/config";
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting creator correction (Final)...");
  
  // Find all flags with project and organization
  const flags = await prisma.featureFlag.findMany({
    include: { 
        project: {
            include: { organization: true }
        }
    }
  });

  console.log(`Analyzing ${flags.length} flags.`);

  for (const flag of flags) {
    // Priority 1: Project Creator (userId)
    // Priority 2: Organization Creator (createdBy)
    const projectOwnerId = flag.project?.userId;
    const orgOwnerId = flag.project?.organization?.createdBy;
    
    const correctOwnerId = projectOwnerId || orgOwnerId;
    
    if (correctOwnerId) {
       await prisma.featureFlag.update({
         where: { id: flag.id },
         data: { creatorId: correctOwnerId }
       });
       console.log(`Aligned flag ${flag.key} with owner ${correctOwnerId}`);
    } else {
       await prisma.featureFlag.update({
         where: { id: flag.id },
         data: { creatorId: null }
       });
       console.log(`Reset flag ${flag.key} to NULL (no project/org owner found).`);
    }
  }

  console.log("Correction complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
