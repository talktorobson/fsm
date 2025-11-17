import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ============================================================================
  // 1. SEED ROLES & PERMISSIONS
  // ============================================================================
  console.log('\n📋 Seeding roles and permissions...');

  // Create permissions
  const permissions = [
    // Users
    { resource: 'users', action: 'create', description: 'Create users' },
    { resource: 'users', action: 'read', description: 'View users' },
    { resource: 'users', action: 'update', description: 'Update users' },
    { resource: 'users', action: 'delete', description: 'Delete users' },
    { resource: 'users', action: 'manage_roles', description: 'Manage user roles' },

    // Providers
    { resource: 'providers', action: 'create', description: 'Create providers' },
    { resource: 'providers', action: 'read', description: 'View providers' },
    { resource: 'providers', action: 'update', description: 'Update providers' },
    { resource: 'providers', action: 'delete', description: 'Delete providers' },

    // Work Teams
    { resource: 'work_teams', action: 'create', description: 'Create work teams' },
    { resource: 'work_teams', action: 'read', description: 'View work teams' },
    { resource: 'work_teams', action: 'update', description: 'Update work teams' },
    { resource: 'work_teams', action: 'delete', description: 'Delete work teams' },

    // Technicians
    { resource: 'technicians', action: 'create', description: 'Create technicians' },
    { resource: 'technicians', action: 'read', description: 'View technicians' },
    { resource: 'technicians', action: 'update', description: 'Update technicians' },
    { resource: 'technicians', action: 'delete', description: 'Delete technicians' },

    // Config
    { resource: 'config', action: 'read', description: 'View configuration' },
    { resource: 'config', action: 'update', description: 'Update configuration' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: perm,
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System administrator with full access',
    },
  });

  const operatorRole = await prisma.role.upsert({
    where: { name: 'OPERATOR' },
    update: {},
    create: {
      name: 'OPERATOR',
      description: 'Operations staff managing service orders',
    },
  });

  const providerManagerRole = await prisma.role.upsert({
    where: { name: 'PROVIDER_MANAGER' },
    update: {},
    create: {
      name: 'PROVIDER_MANAGER',
      description: 'Provider company manager',
    },
  });

  const technicianRole = await prisma.role.upsert({
    where: { name: 'TECHNICIAN' },
    update: {},
    create: {
      name: 'TECHNICIAN',
      description: 'Field technician',
    },
  });

  console.log('✅ Created 4 roles');

  // Assign all permissions to ADMIN role
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Assigned all permissions to ADMIN role');

  // Assign permissions to OPERATOR role
  const operatorPermissions = allPermissions.filter(
    (p) => p.resource !== 'users' && p.resource !== 'config',
  );
  for (const permission of operatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: operatorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: operatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Assigned permissions to OPERATOR role');

  // ============================================================================
  // 2. SEED ADMIN USER
  // ============================================================================
  console.log('\n👤 Seeding admin user...');

  const adminPassword = await bcrypt.hash('Admin123!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@adeo.com' },
    update: {
      password: adminPassword, // Update password to ensure it's correct
      firstName: 'Admin',
      lastName: 'User',
    },
    create: {
      email: 'admin@adeo.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      countryCode: 'FR',
      businessUnit: 'LEROY_MERLIN',
      isActive: true,
      isVerified: true,
    },
  });

  // Assign ADMIN role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin user created/updated with password: Admin123!');

  // ============================================================================
  // 3. SEED TEST USERS
  // ============================================================================
  console.log('\n👥 Seeding test users...');

  const operatorPassword = await bcrypt.hash('Operator123!', 10);
  const operatorUser = await prisma.user.upsert({
    where: { email: 'operator@adeo.com' },
    update: {},
    create: {
      email: 'operator@adeo.com',
      password: operatorPassword,
      firstName: 'Test',
      lastName: 'Operator',
      countryCode: 'FR',
      businessUnit: 'LEROY_MERLIN',
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: operatorUser.id,
        roleId: operatorRole.id,
      },
    },
    update: {},
    create: {
      userId: operatorUser.id,
      roleId: operatorRole.id,
    },
  });

  console.log('✅ Test operator created');

  console.log('\n✨ Database seeding completed!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@adeo.com / Admin123!');
  console.log('   Operator: operator@adeo.com / Operator123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
