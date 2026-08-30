import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create admin user
  await prisma.user.upsert({
    where: { telegramId: '123456789' },
    update: {},
    create: {
      telegramId: '123456789',
      firstName: 'Admin',
      lastName: 'Siga',
      role: 'SUPER_ADMIN',
      customer: {
        create: {
          fullName: 'Super Admin',
          preferredLanguage: 'en',
          status: 'ACTIVE'
        }
      }
    }
  });

  // 2. Create Kircha types
  const types = [
    { code: 'OX', nameEn: 'Ox', nameAm: 'በሬ', descriptionEn: 'Premium ox meat', descriptionAm: 'ከፍተኛ ጥራት ያለው የበሬ ስጋ', icon: '🐂' },
    { code: 'SHEEP', nameEn: 'Sheep', nameAm: 'በግ', descriptionEn: 'Fresh sheep meat', descriptionAm: 'ትኩስ የበግ ስጋ', icon: '🐑' },
    { code: 'GOAT', nameEn: 'Goat', nameAm: 'ፍየል', descriptionEn: 'Healthy goat meat', descriptionAm: 'ጤናማ የፍየል ስጋ', icon: '🐐' }
  ];

  for (const t of types) {
    await prisma.kirchaType.upsert({
      where: { code: t.code },
      update: {},
      create: t
    });
  }

  // 3. Create payment methods
  const methods = [
    { name: 'Telebirr', accountName: 'Ale Kircha', accountNumber: '0912345678' },
    { name: 'CBE', accountName: 'Ale Kircha', accountNumber: '1000123456789' },
    { name: 'Awash Bank', accountName: 'Ale Kircha', accountNumber: '1234567890' },
    { name: 'Dashen Bank', accountName: 'Ale Kircha', accountNumber: '9876543210' },
    { name: 'Cash on Delivery', accountName: 'Ale Kircha', accountNumber: 'CASH' }
  ];

  for (const m of methods) {
    await prisma.paymentMethod.upsert({
      where: { name: m.name },
      update: {},
      create: m
    });
  }

  // 4. Create Fee Configurations
  const feeConfigs = [
    { key: 'discount_early_bird', type: 'DISCOUNT', nameEn: 'Early Bird Discount', nameAm: 'ቅድመ ወጪ ቅናሽ', valueType: 'PERCENTAGE', value: 10, priority: 1, applyTo: 'ALL' },
    { key: 'service_charge', type: 'SERVICE_CHARGE', nameEn: 'Service Fee', nameAm: 'የአገልግሎት ክፍያ', valueType: 'FIXED', value: 50, priority: 2, applyTo: 'ALL' },
    { key: 'tax_vat', type: 'TAX', nameEn: 'VAT', nameAm: 'ተጨማሪ እሴት ታክስ', valueType: 'PERCENTAGE', value: 15, priority: 3, applyTo: 'ALL' }
  ];

  for (const cfg of feeConfigs) {
    await prisma.feeConfiguration.upsert({
      where: { key: cfg.key },
      update: cfg,
      create: cfg
    });
  }

  // 5. Create Delivery Zones (using findFirst to avoid unique issues)
  const zones = [
    { nameEn: 'Bole', nameAm: 'ቦሌ', fee: 100, minOrder: 0, priority: 1 },
    { nameEn: 'Piassa', nameAm: 'ፒያሳ', fee: 150, minOrder: 0, priority: 2 },
    { nameEn: 'Akaki', nameAm: 'አቃቂ', fee: 200, minOrder: 300, priority: 3 },
    { nameEn: 'Kality', nameAm: 'ቃሊቲ', fee: 250, minOrder: 500, priority: 4 }
  ];

  for (const z of zones) {
    const existing = await prisma.deliveryZone.findFirst({
      where: { nameEn: z.nameEn }
    });
    if (existing) {
      await prisma.deliveryZone.update({
        where: { id: existing.id },
        data: z
      });
    } else {
      await prisma.deliveryZone.create({ data: z });
    }
  }

  // 6. Create FAQs (using findFirst to avoid unique issues)
  const faqs = [
    { order: 1, questionEn: 'What is Digital Kircha?', questionAm: 'ዲጂታል ቅርጫ ምንድን ነው?', answerEn: 'Digital Kircha is a reliable and modern alternative meat-sharing option.', answerAm: 'ዲጂታል ቅርጫ አስተማማኝ እና ዘመናዊ የቅርጫ አማራጭ ነው።' },
    { order: 2, questionEn: 'How can I join Digital Kircha?', questionAm: 'ዲጂታል ቅርጫን እንዴት መቀላቀል እችላለሁ?', answerEn: 'You can join by using the application, selecting a meat share, and completing payment.', answerAm: 'መተግበሪያን በመጠቀም የቅርጫ አይነት መርጠው ክፍያ በመፈፀም መቀላቀል ይችላሉ።' },
    { order: 3, questionEn: 'When will the meat-sharing take place?', questionAm: 'ቅርጫ መቼ ይኖራል?', answerEn: 'Every Saturday and during major religious and national holidays.', answerAm: 'በየሳምንቱ ቅዳሜ እና በታላላቅ በዓላት ወቅት ይኖራል።' },
    { order: 4, questionEn: 'Where is the lot drawing conducted?', questionAm: 'ዕጣው የት ነው የሚከናወነው?', answerEn: 'At the Addis Ababa Abattoirs Enterprise and licensed institutions.', answerAm: 'በአዲስ አበባ ቄራዎች እና ህጋዊ ተቋማት ውስጥ ነው።' },
    { order: 5, questionEn: 'What types of meat-sharing options are available?', questionAm: 'ምን ዓይነት የቅርጫ አማራጮች አሉ?', answerEn: 'Options from 1/4 share to full allocations for cattle, sheep, and goats.', answerAm: 'ከሩብ (1/4) መደብ ጀምሮ ሙሉ መደብ ድረስ የበሬ፣ የበግ እና የፍየል አማራጮች አሉ።' }
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({
      where: { order: faq.order }
    });
    if (existing) {
      await prisma.fAQ.update({
        where: { id: existing.id },
        data: faq
      });
    } else {
      await prisma.fAQ.create({
        data: { id: `faq_${String(faq.order).padStart(3, '0')}`, ...faq, active: true }
      });
    }
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
