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

  // 5. Create Delivery Zones
  const zones = [
    { nameEn: 'Bole', nameAm: 'ቦሌ', fee: 100, minOrder: 0, priority: 1 },
    { nameEn: 'Piassa', nameAm: 'ፒያሳ', fee: 150, minOrder: 0, priority: 2 },
    { nameEn: 'Akaki', nameAm: 'አቃቂ', fee: 200, minOrder: 300, priority: 3 },
    { nameEn: 'Kality', nameAm: 'ቃሊቲ', fee: 250, minOrder: 500, priority: 4 }
  ];

  for (const z of zones) {
    await prisma.deliveryZone.create({
      data: z
    }).catch(() => {});
  }

  // 6. Create Terms & Conditions
  const termsContent = `SIGA KIRCHA — TERMS AND CONDITIONS

Effective Date: ${new Date().toLocaleDateString()}
Last Updated: ${new Date().toLocaleDateString()}
Terms Version: v1.0

Operator (Legal Entity Name): Ale Kircha
Brand: Siga Kircha / ስጋ ቅርጫ
Business Registration No.: REG-2024-001
Tax Identification Number (TIN): 1234567890
Business Address: Addis Ababa, Ethiopia
Customer Support Telephone: +251 911 234 567
Customer Support Email: support@alekircha.com
Telegram Support: @kirchaaleBot

1. Acceptance of Terms
1.1. These Terms and Conditions ("Terms") govern your access to and use of the Siga Kircha platform.
1.2. By registering, you confirm that you have read, understood, and agreed to be legally bound by these Terms.
1.3. Electronic acceptance constitutes a valid, legally binding agreement under Ethiopian law.`;

  const termsAmharic = `የስጋ ቅርጫ — የአጠቃቀም ውሎችና ሁኔታዎች

የሚጀምርበት ቀን: ${new Date().toLocaleDateString()}
የመጨረሻ የተሻሻለበት ቀን: ${new Date().toLocaleDateString()}
የውል ስሪት: v1.0

የሚያስተዳድረው ድርጅት: Ale Kircha
የንግድ ምልክት: ስጋ ቅርጫ
የንግድ ምዝገባ ቁጥር: REG-2024-001
የግብር ከፋይ መለያ ቁጥር: 1234567890
የንግድ አድራሻ: አዲስ አበባ, ኢትዮጵያ
የደንበኞች ድጋፍ ስልክ: +251 911 234 567
የደንበኞች ድጋፍ ኢሜይል: support@alekircha.com
የቴሌግራም ድጋፍ: @kirchaaleBot

1. የውሎቹን መቀበል
1.1. እነዚህ የአጠቃቀም ውሎች የስጋ ቅርጫን አገልግሎት አጠቃቀም ይቆጣጠራሉ።
1.2. ሲመዘገቡ እነዚህን ውሎች አንብበው ተረድተው በሕግ ለመገደድ ተስማምተዋል ማለት ነው።
1.3. የኤሌክትሮኒክ ስምምነት በኢትዮጵያ ሕግ መሠረት ሕጋዊ ውል ይፈጥራል።`;

  await prisma.termsVersion.upsert({
    where: { version: 'v1.0' },
    update: {},
    create: {
      version: 'v1.0',
      titleEn: 'Siga Kircha Terms & Conditions',
      titleAm: 'የስጋ ቅርጫ የአጠቃቀም ውሎችና ሁኔታዎች',
      contentEn: termsContent,
      contentAm: termsAmharic,
      effectiveFrom: new Date(),
      isActive: true
    }
  });

  // 7. Create Privacy Policy
  const privacyContent = `SIGA KIRCHA — PRIVACY NOTICE
Version: v1.0
Effective Date: ${new Date().toLocaleDateString()}

1. Data Controller: Siga Kircha
2. Data We Collect: Telegram ID, Phone, Name, Address, Order History, Payment Info
3. Data Usage: Orders, Payments, Delivery, Support, Compliance, Fraud Prevention
4. Data Protection: Protected under Ethiopian law.`;

  const privacyAmharic = `የስጋ ቅርጫ — የግላዊነት መመሪያ
ስሪት: v1.0
የሚጀምርበት ቀን: ${new Date().toLocaleDateString()}

1. የውሂብ ተቆጣጣሪ: ስጋ ቅርጫ
2. የምንሰበስበው: ቴሌግራም መለያ፣ ስልክ፣ ስም፣ አድራሻ፣ ትዕዛዝ፣ ክፍያ
3. አጠቃቀም: ትዕዛዝ፣ ክፍያ፣ ማድረስ፣ ድጋፍ
4. ጥበቃ: በኢትዮጵያ ህግ መሰረት ይጠበቃል።`;

  await prisma.privacyPolicyVersion.upsert({
    where: { version: 'v1.0' },
    update: {},
    create: {
      version: 'v1.0',
      contentEn: privacyContent,
      contentAm: privacyAmharic,
      effectiveFrom: new Date(),
      isActive: true
    }
  });

  // 8. Create FAQs
  const faqs = [
    { order: 1, questionEn: 'What is Digital Kircha?', questionAm: 'ዲጂታል ቅርጫ ምንድን ነው?', answerEn: 'Digital Kircha is a reliable and modern alternative meat-sharing option.', answerAm: 'ዲጂታል ቅርጫ አስተማማኝ እና ዘመናዊ የቅርጫ አማራጭ ነው።' },
    { order: 2, questionEn: 'How can I join Digital Kircha?', questionAm: 'ዲጂታል ቅርጫን እንዴት መቀላቀል እችላለሁ?', answerEn: 'Join by using the application, selecting a meat share, and completing payment.', answerAm: 'መተግበሪያን በመጠቀም የቅርጫ አይነት መርጠው ክፍያ በመፈፀም መቀላቀል ይችላሉ።' },
    { order: 3, questionEn: 'When will the meat-sharing take place?', questionAm: 'ቅርጫ መቼ ይኖራል?', answerEn: 'Every Saturday and during major religious and national holidays.', answerAm: 'በየሳምንቱ ቅዳሜ እና በታላላቅ በዓላት ወቅት ይኖራል።' },
    { order: 4, questionEn: 'Where is the lot drawing conducted?', questionAm: 'ዕጣው የት ነው የሚከናወነው?', answerEn: 'At Addis Ababa Abattoirs Enterprise and licensed institutions.', answerAm: 'በአዲስ አበባ ቄራዎች እና ህጋዊ ተቋማት ውስጥ ነው።' },
    { order: 5, questionEn: 'What types of meat-sharing options are available?', questionAm: 'ምን ዓይነት የቅርጫ አማራጮች አሉ?', answerEn: 'Options from 1/4 share to full allocations for cattle, sheep, and goats.', answerAm: 'ከሩብ (1/4) መደብ ጀምሮ ሙሉ መደብ ድረስ የበሬ፣ የበግ እና የፍየል አማራጮች አሉ።' }
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { id: `faq_${String(faq.order).padStart(3, '0')}` },
      update: faq,
      create: { id: `faq_${String(faq.order).padStart(3, '0')}`, ...faq, active: true }
    });
  }

  // 9. Create System Settings
  const settings = [
    { key: 'company_name', value: 'Ale Kircha / አለ ቅርጫ' },
    { key: 'company_brand', value: 'Siga Kircha / ስጋ ቅርጫ' },
    { key: 'company_reg_number', value: 'REG-2024-001' },
    { key: 'company_tin', value: '1234567890' },
    { key: 'company_address', value: 'Addis Ababa, Ethiopia' },
    { key: 'support_phone', value: '+251 911 234 567' },
    { key: 'support_email', value: 'support@alekircha.com' },
    { key: 'support_telegram', value: '@kirchaaleBot' },
    { key: 'contact_phone', value: '+251 911 234 567' },
    { key: 'contact_telegram', value: 'https://t.me/kirchaaleBot' },
    { key: 'contact_email', value: 'support@alekircha.com' },
    { key: 'contact_address', value: 'Addis Ababa, Ethiopia' },
    { key: 'bot_username', value: '@kirchaaleBot' },
    { key: 'admin_bot_username', value: '@Ale_kircha_admin_bot' },
    { key: 'terms_version', value: 'v1.0' },
    { key: 'privacy_version', value: 'v1.0' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: s,
      create: s
    });
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
