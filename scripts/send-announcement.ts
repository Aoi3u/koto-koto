import 'dotenv/config';

const title = process.argv.find((arg) => arg.startsWith('--title='))?.slice('--title='.length);
const body = process.argv.find((arg) => arg.startsWith('--body='))?.slice('--body='.length);

async function importPrismaClient() {
  const { prisma } = await import('../src/lib/prisma');
  return prisma;
}

async function main() {
  if (!title || !body) {
    console.error('Usage: tsx scripts/send-announcement.ts --title="..." --body="..."');
    process.exit(1);
  }

  const prisma = await importPrismaClient();

  const announcement = await prisma.announcement.create({
    data: { title, body },
  });

  console.log(`Created announcement ${announcement.id}: "${announcement.title}"`);
}

main()
  .catch((error) => {
    console.error('Failed to create announcement:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const prisma = await importPrismaClient();
    await prisma.$disconnect();
  });
