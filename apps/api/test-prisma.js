import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected!');

    // Test query
    const types = await prisma.kirchaType.findMany();
    console.log(`✅ Found ${types.length} Kircha types`);

    const methods = await prisma.paymentMethod.findMany();
    console.log(`✅ Found ${methods.length} payment methods`);

    await prisma.$disconnect();
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
