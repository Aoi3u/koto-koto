import 'dotenv/config';

const email = process.argv.find((arg) => arg.startsWith('--email='))?.slice('--email='.length);
const revoke = process.argv.includes('--revoke');

async function importPrismaClient() {
  const { prisma } = await import('../src/lib/prisma');
  return prisma;
}

async function main() {
  if (!email) {
    console.error('Usage: tsx scripts/set-admin.ts --email=... [--revoke]');
    process.exit(1);
  }

  const prisma = await importPrismaClient();

  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: !revoke },
    select: { id: true, email: true, isAdmin: true },
  });

  console.log(`${user.email} isAdmin=${user.isAdmin}`);
}

main()
  .catch((error) => {
    console.error('Failed to update admin status:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const prisma = await importPrismaClient();
    await prisma.$disconnect();
  });
