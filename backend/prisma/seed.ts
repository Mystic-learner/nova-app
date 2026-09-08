import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@nova.com' },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email: 'demo@nova.com',
      passwordHash: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
    },
  });

  console.log('Successfully seeded database user:', user.email);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });