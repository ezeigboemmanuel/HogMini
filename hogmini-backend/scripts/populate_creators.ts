import "dotenv/config";
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting creator population...");
  
  // Find all flags where creatorId is null
  const flags = await prisma.featureFlag.findMany({
    where: { creatorId: null },
    include: { project: true }
  });

  console.log(`Found ${flags.length} flags without a creator.`);

  for (const flag of flags) {
    if (flag.project && flag.project.userId) {
      await prisma.featureFlag.update({
        where: { id: flag.id },
        data: { creatorId: flag.project.userId }
      });
      console.log(`Updated flag ${flag.key} with owner ${flag.project.userId}`);
    } else {
      // If no project user found, maybe find any user in the organization
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
          await prisma.featureFlag.update({
            where: { id: flag.id },
            data: { creatorId: firstUser.id }
          });
          console.log(`Updated flag ${flag.key} with fallback user ${firstUser.id}`);
      }
    }
  }

  console.log("Population complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
