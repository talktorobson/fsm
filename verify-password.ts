
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@adeo.com';
  const password = 'Admin123!';

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`User ${email} not found`);
    return;
  }

  console.log(`User found: ${user.email}`);
  console.log(`Stored hash: ${user.password}`);

  const isValid = await bcrypt.compare(password, user.password);
  console.log(`Password valid: ${isValid}`);
  
  const newHash = await bcrypt.hash(password, 10);
  console.log(`New hash would be: ${newHash}`);
  const newHashValid = await bcrypt.compare(password, newHash);
  console.log(`New hash valid: ${newHashValid}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
