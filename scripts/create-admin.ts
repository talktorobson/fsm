import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.argv[2];

  if (!adminEmail) {
    console.error('Usage: ts-node create-admin.ts <email>');
    process.exit(1);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    console.error(`User not found: ${adminEmail}`);
    process.exit(1);
  }

  // Check if user already has ADMIN role
  if (user.roles.some((ur) => ur.role.name === 'ADMIN')) {
    console.log(`User already has ADMIN role: ${adminEmail}`);
    process.exit(0);
  }

  // Get or create ADMIN role
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator role with full permissions',
    },
  });

  // Assign ADMIN role to user
  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: adminRole.id,
    },
  });

  console.log(`✅ ADMIN role assigned to: ${adminEmail}`);
  console.log(`User ID: ${user.id}`);
  console.log(`Please login again to get a new token with ADMIN permissions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
