import { Bot, session, Context, SessionFlavor } from 'grammy';
import { conversations, ConversationFlavor, createConversation } from '@grammyjs/conversations';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// ============================================================
// TYPES
// ============================================================

interface SessionData {
  language: 'en' | 'am';
  step: string;
  isRegistered: boolean;
  customerId: string | null;
  phoneNumber: string | null;
  currentTermsSection: number;
  data: {
    firstName?: string;
    lastName?: string;
    address?: string;
    additionalContact?: string;
    phone?: string;
    termsAccepted?: boolean;
  };
}

type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;

// ============================================================
// CONFIG
// ============================================================

const API_URL = process.env.API_URL || 'http://localhost:4000';
const BOT_TOKEN = process.env.CUSTOMER_BOT_TOKEN;
const PORT = parseInt(process.env.PORT || '10001');

if (!BOT_TOKEN) {
  console.error('❌ CUSTOMER_BOT_TOKEN is required!');
  process.exit(1);
}

const bot = new Bot<MyContext>(BOT_TOKEN);

// ============================================================
// TERMS & CONDITIONS DATA
// ============================================================

const TERMS_SECTIONS = [
  {
    id: 'A',
    titleEn: 'Parties & Identification',
    titleAm: 'ተዋዋይ ወገኖች እና መለያ',
    contentEn: `This agreement is entered into by and between Ale Kircha (the Platform or Operator) and the Registered Customer (the User or Customer).

Ale Kircha's principal office is located at Addis Ababa, Ethiopia.
Contact: support@alekircha.com / Toll-Free: 8***.

By creating an account or purchasing a quota, the User agrees to be legally bound by these terms pursuant to the Civil Code of Ethiopia (Proclamation No. 165/1960) and the Commercial Code of Ethiopia (Proclamation No. 1243/2021).`,
    contentAm: `ይህ ስምምነት በአሌ ቅርጫ (መድረክ) እና በተመዝጋቢው ደንበኛ መካከል የተደረገ ሕጋዊ ስምምነት ነው።

የአሌ ቅርጫ ዋና መሥሪያ ቤት አዲስ አበባ፣ ኢትዮጵያ ይገኛል።
ኢሜይል፦ support@alekircha.com / ነፃ የጥሪ ማዕከል፦ 8***።

ተጠቃሚው አካውንት ሲከፍት ወይም ድርሻ ሲገዛ በ1952 ዓ.ም. የኢትዮጵያ ፍትሐ ብሔር ሕግ እና በ2013 ዓ.ም. የንግድ ሕግ መሠረት በነዚህ ውሎች ለመገደድ ሙሉ ስምምነቱን ይሰጣል።`
  },
  {
    id: 'B',
    titleEn: 'Definitions & Interpretation',
    titleAm: 'ትርጓሜዎች',
    contentEn: `Ale Kircha / Platform: The digital application, website, and underlying software infrastructure operated by the company.

Customer / User: Any individual aged 18 or above who creates a profile and utilizes the platform.

Kircha: The traditional Ethiopian practice of joint livestock purchase and meat distribution among a group.

Quota: The designated portion of meat subscribed to by a customer (Full Quota, Half Quota, or Quarter Quota).

Group Maturity: The point at which all available quotas within a single Kircha group are 100% reserved and paid for.

Order: A customer's formal commitment to purchase a specific Quota.

Advice: Digital proof of payment (transaction receipt, screenshot, or reference code).

Refund: The return of funds following order cancellation or failure of group fulfillment.`,
    contentAm: `አሌ ቅርጫ / መድረክ፦ በአገልግሎት ሰጪው የሚተዳደረው የሞባይል መተግበሪያ፣ ድረ-ገጽ እና የሶፍትዌር መሠረተ-ልማት።

ደንበኛ / ተጠቃሚ፦ ዕድሜው 18 እና ከዚያ በላይ የሆነና በመድረኩ ላይ ተመዝግቦ አገልግሎት የሚጠቀም ማንኛውም ግለሰብ።

ቅርጫ፦ በኢትዮጵያ ባህላዊ የነበረውን እንስሳትን በጋራ ገዝቶ የመካፈል ስርዓት።

ድርሻ፦ ደንበኛው በቅርጫ ቡድን ውስጥ የሚገዛው መጠን (ሙሉ፣ ግማሽ፣ ወይም ሩብ)።

የቡድን ሙላት፦ በአንድ የቅርጫ ቡድን ውስጥ ያሉ ሁሉም ድርሻዎች ተሸጠው እና ተከፍለው ሲጠናቀቁ የሚደርስ ደረጃ።

ትዕዛዝ፦ ደንበኛው የተወሰነ ድርሻ ለመግዛት የሚያደርገው औपचारिक ጥያቄ።

የክፍያ ማስረጃ፦ ደንበኛው ክፍያ መፈጸሙን የሚያሳይ ዲጂታል ደረሰኝ፣ ስክሪንሾት ወይም የማጣቀሻ ቁጥር።

ተመላሽ ገንዘብ፦ ትዕዛዝ ሲሰረዝ ወይም ቡድኑ ሳይሞላ ሲቀር ለደንበኛው የሚመለስ ገንዘብ።`
  },
  {
    id: 'C',
    titleEn: 'Purpose & Scope of Service',
    titleAm: 'የአገልግሎቱ ዓላማ እና ወሰን',
    contentEn: `Ale Kircha provides a digital marketplace connecting buyers seeking traditional meat-sharing with organized livestock groups.

Ale Kircha acts as a digital service facilitator under the Electronic Transactions Proclamation No. 1205/2020. The platform facilitates group creation, escrow-like transaction management, and logistics, but does not own livestock directly unless specified.

Group formation depends on user subscription. The platform does not guarantee that every created group will reach Maturity.`,
    contentAm: `አሌ ቅርጫ ባህላዊውን የቅርጫ ስርዓት ዘመናዊ በማድረግ ገዢዎችን እና የተደራጁ የእንስሳት አቅራቢዎችን የሚያገናኝ ዲጂታል መድረክ ነው።

መድረኩ በየኤሌክትሮኒክ ግብይት አዋጅ ቁጥር 1205/2012 መሠረት የአገልግሎት አጋዥ ሆኖ ይሰራል፤ የቡድን ምስረታን፣ የክፍያ ቁጥጥርን እና ማጓጓዝን ያመቻቻል።

የቡድን ምስረታ በደንበኞች ምዝገባ ላይ የተመሠረተ ነው። መድረኩ ሁሉም የተፈጠሩ ቡድኖች ወደ ሙላት እንደሚደርሱ ዋስትና አይሰጥም።`
  },
  {
    id: 'D',
    titleEn: 'Registration & Account Creation',
    titleAm: 'ምዝገባ እና አካውንት',
    contentEn: `Users must be at least 18 years old and possess full legal capacity under the Ethiopian Civil Code.

Users must register using a valid Ethiopian phone number, full legal name, and current physical delivery address.

All account registration data is processed in accordance with the Personal Data Protection Proclamation No. 1321/2024.

The user is solely responsible for maintaining the confidentiality of their login credentials and OTP codes. Providing fraudulent identification will result in immediate account termination.`,
    contentAm: `ተጠቃሚዎች በፍትሐ ብሔር ሕጉ መሠረት ዕድሜያቸው 18 ዓመት የሞላ እና በሕግ ፊት የመዋዋል ችሎታ ያላቸው መሆን አለባቸው።

ትክክለኛ የኢትዮጵያ ስልክ ቁጥር፣ ሙሉ ስም እና የርክክብ አድራሻ ማቅረብ ግዴታ ነው።

የምዝገባ መረጃዎች በየግል መረጃ ጥበቃ አዋጅ ቁጥር 1321/2016 መሠረት ጥበቃ ይደረግላቸዋል።

ተጠቃሚው የመግቢያ መለያ እና የኦቲፒ ኮዶችን ሚስጥራዊነት የመጠበቅ ኃላፊነት አለበት። የሐሰት መረጃ ማቅረብ አካውንት እንዲዘጋ ያደርጋል።`
  },
  {
    id: 'E',
    titleEn: 'Customer Obligations & Rights',
    titleAm: 'የደንበኛው መብት እና ግዴታዎች',
    contentEn: `RIGHTS:
1. Access active Kircha groups and view quota details
2. Fair, transparent pricing and clear fee breakdowns
3. Secure data handling per Proclamation No. 1321/2024
4. Request refunds in accordance with Refund Policy
5. Lodge formal complaints and seek dispute resolution

OBLIGATIONS:
1. Provide accurate identity and delivery details
2. Submit genuine payment advice within specified timeframes
3. Pay all applicable quota and delivery fees
4. Refrain from fraudulent payments or group manipulation
5. Accept delivery at the specified location and time`,
    contentAm: `መብቶች፦
1. ንቁ የቅርጫ ቡድኖችን እና ዋጋዎችን የመመልከት
2. ግልጽ የሆነ የዋጋ እና የአገልግሎት ክፍያ መረጃ ማግኘት
3. የግል መረጃ ደህንነት ጥበቃ (በአዋጅ 1321/2016)
4. በተመላሽ ፖሊሲው መሠረት ገንዘብ የመጠየቅ
5. ቅሬታ የማቅረብ እና ምላሽ የማግኘት

ግዴታዎች፦
1. ትክክለኛ ማንነት እና አድራሻ ማቅረብ
2. ትክክለኛ የክፍያ ማስረጃ በሰዓቱ መጫን
3. የድርሻ እና የማጓጓዣ ክፍያዎችን ሙሉ በሙሉ መክፈል
4. ከማጭበርበር እና ከሐሰተኛ ክፍያ መቆጠብ
5. በተመረጠው ቦታ እና ሰዓት ርክክብ መፈጸም`
  },
  {
    id: 'F',
    titleEn: 'Pricing & Fees',
    titleAm: 'ዋጋ እና ክፍያዎች',
    contentEn: `Quota Price: Set based on livestock acquisition costs.

Platform Fee: A service charge added at checkout to cover software maintenance and transaction administration.

Delivery Fee: Distance-based charge for home delivery, waived if the customer selects "Self-Collection".

Taxes: All pricing is inclusive of applicable national taxes (VAT/TOT) in compliance with Ethiopian Tax Laws.`,
    contentAm: `የድርሻ ዋጋ፦ በእንስሳቱ የግዥ ዋጋ ላይ ተመሠረቶ የሚወሰን።

የመድረክ አገልግሎት ክፍያ፦ ለሶፍትዌር ጥገና እና አገልግሎት የሚጨመር መደበኛ ክፍያ።

የማጓጓዣ ክፍያ፦ በቦታ ርቀት ላይ ተመሠረቶ የሚሰላ (ደንበኛው በአካል ከወሰደ አይከፈልም)።

ታክስ፦ ሁሉም ዋጋዎች በኢትዮጵያ የታክስ ሕግ መሠረት የሚገባቸውን ታክሶች ያካተቱ ናቸው።`
  }
];

// ============================================================
// MIDDLEWARE
// ============================================================

bot.use(session({
  initial: (): SessionData => ({
    language: 'en',
    step: 'start',
    isRegistered: false,
    customerId: null,
    phoneNumber: null,
    currentTermsSection: 0,
    data: {},
  }),
}));

bot.use(conversations());

// ============================================================
// HELPERS
// ============================================================

function t(ctx: MyContext, key: string): string {
  const lang = ctx.session.language || 'en';
  const translations: Record<string, Record<string, string>> = {
    en: {
      welcome: '🥩 Welcome to Ale Kircha!',
      chooseLanguage: 'Please select your language:',
      languageSet: '✅ Language set!',
      phoneRequest: '📱 Please share your phone number:',
      phoneReceived: '✅ Phone number received!',
      firstName: '👤 What is your first name?',
      lastName: '👤 What is your last name?',
      address: '📍 Please enter your delivery address:',
      additionalContact: '📞 Additional contact (optional):',
      terms: '📄 Please read the Terms & Conditions carefully:',
      accept: '✅ I Accept',
      decline: '❌ Decline',
      registrationComplete: '🎉 Registration Complete!',
      mainMenu: '📋 Main Menu',
      existingCustomer: '👋 Welcome back!',
      networkError: '❌ Network error. Please try again.',
      error: '❌ Something went wrong. Please try again.',
    },
    am: {
      welcome: '🥩 እንኳን ወደ አለ ቅርጫ በደህና መጡ!',
      chooseLanguage: 'እባክዎ ቋንቋዎን ይምረጡ:',
      languageSet: '✅ ቋንቋ ተቀየረ!',
      phoneRequest: '📱 እባክዎ ስልክ ቁጥርዎን ያጋሩ:',
      phoneReceived: '✅ ስልክ ቁጥር ተቀብለናል!',
      firstName: '👤 የመጀመሪያ ስምዎ ማን ነው?',
      lastName: '👤 የአባት ስምዎ ማን ነው?',
      address: '📍 እባክዎ የማድረሻ አድራሻዎን ያስገቡ:',
      additionalContact: '📞 ተጨማሪ የመገኛ መረጃ (አማራጭ):',
      terms: '📄 እባክዎ ውሎችና ሁኔታዎቹን በጥንቃቄ ያንብቡ:',
      accept: '✅ ተቀብያለሁ',
      decline: '❌ አልቀበልም',
      registrationComplete: '🎉 ምዝገባ ተጠናቀቀ!',
      mainMenu: '📋 ዋና ምናሌ',
      existingCustomer: '👋 እንኳን በደህና ተመለሱ!',
      networkError: '❌ የአውታረ መረብ ችግር። እባክዎ እንደገና ይሞክሩ።',
      error: '❌ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።',
    },
  };
  return (translations[lang] as any)[key] || key;
}

async function apiCall(endpoint: string, options: any = {}, ctx?: MyContext) {
  const headers: any = { 'Content-Type': 'application/json', ...options.headers };
  if (ctx?.from?.id) {
    headers['x-telegram-id'] = ctx.from.id.toString();
  }
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  return response.json();
}

async function checkUserRegistration(ctx: MyContext): Promise<boolean> {
  if (ctx.session.isRegistered && ctx.session.customerId) return true;
  try {
    const data = await apiCall('/api/v1/customers/me', {}, ctx);
    if (data.success && data.data) {
      ctx.session.isRegistered = true;
      ctx.session.customerId = data.data.id;
      ctx.session.phoneNumber = data.data.phone || null;
      return true;
    }
  } catch (error) {}
  return false;
}

// ============================================================
// REGISTRATION CONVERSATION - WITH TERMS BROWSING (NO MARKDOWN)
// ============================================================

async function registrationConversation(conversation: any, ctx: MyContext) {
  const lang = ctx.session.language || 'en';
  
  // First Name
  await ctx.reply(lang === 'en' ? '👤 What is your first name?' : '👤 የመጀመሪያ ስምዎ ማን ነው?');
  const firstNameResult = await conversation.waitFor(':text');
  if (!firstNameResult.message?.text) {
    await ctx.reply(lang === 'en' ? '❌ Please enter your first name.' : '❌ እባክዎ የመጀመሪያ ስምዎን ያስገቡ።');
    return;
  }
  ctx.session.data.firstName = firstNameResult.message.text;

  // Last Name
  await ctx.reply(lang === 'en' ? '👤 What is your last name?' : '👤 የአባት ስምዎ ማን ነው?');
  const lastNameResult = await conversation.waitFor(':text');
  if (!lastNameResult.message?.text) {
    await ctx.reply(lang === 'en' ? '❌ Please enter your last name.' : '❌ እባክዎ የአባት ስምዎን ያስገቡ።');
    return;
  }
  ctx.session.data.lastName = lastNameResult.message.text;

  // Address
  await ctx.reply(lang === 'en' ? '📍 Please enter your delivery address:' : '📍 እባክዎ የማድረሻ አድራሻዎን ያስገቡ:');
  const addressResult = await conversation.waitFor(':text');
  if (!addressResult.message?.text) {
    await ctx.reply(lang === 'en' ? '❌ Please enter your address.' : '❌ እባክዎ አድራሻዎን ያስገቡ።');
    return;
  }
  ctx.session.data.address = addressResult.message.text;

  // Additional Contact - WITH SKIP WORKING PROPERLY
  await ctx.reply(lang === 'en' ? '📞 Additional contact (optional):' : '📞 ተጨማሪ የመገኛ መረጃ (አማራጭ):', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📱 ' + (lang === 'en' ? 'Add Contact' : 'ጨምር'), callback_data: 'add_contact' }],
        [{ text: '⏭️ ' + (lang === 'en' ? 'Skip' : 'ዝለል'), callback_data: 'skip_contact' }],
      ],
    },
  });

  const contactChoice = await conversation.waitForCallbackQuery(['add_contact', 'skip_contact']);
  await contactChoice.answerCallbackQuery();

  if (contactChoice.callbackQuery.data === 'add_contact') {
    await ctx.reply(lang === 'en' ? '📞 Enter contact name and phone:' : '📞 የመገኛ ሰው ስም እና ስልክ ያስገቡ:');
    const contactResult = await conversation.waitFor(':text');
    if (contactResult.message?.text) {
      ctx.session.data.additionalContact = contactResult.message.text;
    }
  }

  // ============================================================
  // TERMS & CONDITIONS WITH FULL BROWSING (NO MARKDOWN)
  // ============================================================
  
  let termsAccepted = false;
  let currentSection = 0;
  const totalSections = TERMS_SECTIONS.length;
  
  while (!termsAccepted) {
    const section = TERMS_SECTIONS[currentSection];
    const title = lang === 'en' ? section.titleEn : section.titleAm;
    const content = lang === 'en' ? section.contentEn : section.contentAm;
    
    // Build navigation buttons
    const navButtons = [];
    if (currentSection > 0) {
      navButtons.push({ text: '◀️ ' + (lang === 'en' ? 'Previous' : 'ቀዳሚ'), callback_data: `terms_prev_${currentSection}` });
    }
    if (currentSection < totalSections - 1) {
      navButtons.push({ text: (lang === 'en' ? 'Next' : 'ቀጣይ') + ' ▶️', callback_data: `terms_next_${currentSection}` });
    }
    
    const keyboard = [];
    if (navButtons.length > 0) {
      keyboard.push(navButtons);
    }
    
    keyboard.push([
      { text: '📋 ' + (lang === 'en' ? 'View All Sections' : 'ሁሉንም ክፍሎች ይመልከቱ'), callback_data: 'terms_list' },
    ]);
    
    keyboard.push([
      { text: '✅ ' + (lang === 'en' ? 'Accept Terms' : 'ውሎችን ተቀበል'), callback_data: 'accept_terms' },
      { text: '❌ ' + (lang === 'en' ? 'Decline' : 'አልቀበልም'), callback_data: 'decline_terms' },
    ]);
    
    const progress = (lang === 'en' ? 'Section' : 'ክፍል') + ` ${currentSection + 1}/${totalSections}`;
    
    // Send WITHOUT Markdown parsing to avoid errors
    await ctx.reply(
      `📜 ${title}\n\n${content}\n\n— ${progress} —\n\n` +
      (lang === 'en' ? 'Please read carefully before accepting.' : 'እባክዎ ከመቀበልዎ በፊት በጥንቃቄ ያንብቡ።'),
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );
    
    const termsResult = await conversation.waitForCallbackQuery([
      'accept_terms', 'decline_terms', 'terms_list',
      ...Array.from({length: totalSections}, (_, i) => `terms_prev_${i}`),
      ...Array.from({length: totalSections}, (_, i) => `terms_next_${i}`),
      ...Array.from({length: totalSections}, (_, i) => `terms_goto_${i}`),
    ]);
    
    await termsResult.answerCallbackQuery();
    const data = termsResult.callbackQuery.data;
    
    if (data === 'decline_terms') {
      await ctx.reply(lang === 'en' ? '❌ Registration cancelled.' : '❌ ምዝገባ ተሰርዟል።');
      return;
    }
    
    if (data === 'accept_terms') {
      termsAccepted = true;
      ctx.session.data.termsAccepted = true;
      break;
    }
    
    if (data === 'terms_list') {
      // Show all sections list
      let listMsg = lang === 'en' ? '📋 Terms & Conditions - Sections\n\n' : '📋 የውሎች እና ሁኔታዎች ክፍሎች\n\n';
      TERMS_SECTIONS.forEach((s, idx) => {
        const titleText = lang === 'en' ? s.titleEn : s.titleAm;
        listMsg += `${idx + 1}. ${titleText}\n`;
      });
      listMsg += `\n` + (lang === 'en' ? 'Select a section to read:' : 'ለማንበብ ክፍል ይምረጡ:');
      
      const listKeyboard = TERMS_SECTIONS.map((_, idx) => {
        const label = lang === 'en' ? `📄 ${TERMS_SECTIONS[idx].titleEn}` : `📄 ${TERMS_SECTIONS[idx].titleAm}`;
        return [{ text: label, callback_data: `terms_goto_${idx}` }];
      });
      
      listKeyboard.push([
        { text: '🔙 ' + (lang === 'en' ? 'Back' : 'ተመለስ'), callback_data: `terms_goto_${currentSection}` },
      ]);
      
      await ctx.reply(listMsg, {
        reply_markup: {
          inline_keyboard: listKeyboard,
        },
      });
      
      const gotoResult = await conversation.waitForCallbackQuery(
        Array.from({length: totalSections}, (_, i) => `terms_goto_${i}`)
      );
      await gotoResult.answerCallbackQuery();
      const gotoData = gotoResult.callbackQuery.data;
      const gotoIndex = parseInt(gotoData.replace('terms_goto_', ''));
      if (!isNaN(gotoIndex) && gotoIndex >= 0 && gotoIndex < totalSections) {
        currentSection = gotoIndex;
      }
      continue;
    }
    
    // Handle prev/next navigation
    if (data.startsWith('terms_prev_')) {
      const idx = parseInt(data.replace('terms_prev_', ''));
      if (!isNaN(idx) && idx > 0) {
        currentSection = idx - 1;
      }
      continue;
    }
    
    if (data.startsWith('terms_next_')) {
      const idx = parseInt(data.replace('terms_next_', ''));
      if (!isNaN(idx) && idx < totalSections - 1) {
        currentSection = idx + 1;
      }
      continue;
    }
    
    if (data.startsWith('terms_goto_')) {
      const idx = parseInt(data.replace('terms_goto_', ''));
      if (!isNaN(idx) && idx >= 0 && idx < totalSections) {
        currentSection = idx;
      }
      continue;
    }
  }

  // ============================================================
  // SUBMIT REGISTRATION
  // ============================================================

  await ctx.reply('⏳ Creating your account...');

  try {
    const data = await apiCall(
      '/api/v1/customers/register',
      {
        method: 'POST',
        body: JSON.stringify({
          telegramId: ctx.from?.id?.toString(),
          username: ctx.from?.username || '',
          firstName: ctx.session.data.firstName,
          lastName: ctx.session.data.lastName || '',
          phone: ctx.session.data.phone || '',
          fullName: `${ctx.session.data.firstName} ${ctx.session.data.lastName || ''}`.trim(),
          deliveryAddress: ctx.session.data.address || '',
          additionalContact: ctx.session.data.additionalContact || '',
          language: ctx.session.language || 'en',
          termsAccepted: true,
        }),
      },
      ctx
    );

    if (data.success) {
      ctx.session.isRegistered = true;
      ctx.session.customerId = data.data.customer?.id || data.data.user?.id;
      
      await ctx.reply(
        lang === 'en' ? '🎉 Registration Complete!' : '🎉 ምዝገባ ተጠናቀቀ!',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🏠 ' + (lang === 'en' ? 'Go to Dashboard' : 'ወደ ዳሽቦርድ ይሂዱ'), callback_data: 'show_menu' }],
            ],
          },
        }
      );
    } else {
      await ctx.reply(lang === 'en' ? '❌ Registration failed. Please try again.' : '❌ ምዝገባ አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
    }
  } catch (error) {
    await ctx.reply(lang === 'en' ? '❌ Network error. Please try again.' : '❌ የአውታረ መረብ ችግር። እባክዎ እንደገና ይሞክሩ።');
  }
}

// ============================================================
// REGISTER CONVERSATION
// ============================================================

bot.use(createConversation(registrationConversation, 'registration'));

// ============================================================
// MAIN COMMANDS
// ============================================================

bot.command('start', async (ctx) => {
  const isRegistered = await checkUserRegistration(ctx);
  
  if (isRegistered && ctx.session.customerId) {
    await ctx.reply(
      `👋 ${t(ctx, 'existingCustomer')}\n\n${t(ctx, 'mainMenu')}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 ' + t(ctx, 'mainMenu'), callback_data: 'show_menu' }],
          ],
        },
      }
    );
    return;
  }

  await ctx.reply(
    `${t(ctx, 'welcome')}\n\n${t(ctx, 'chooseLanguage')}`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🇬🇧 English', callback_data: 'lang_en' }],
          [{ text: '🇪🇹 አማርኛ', callback_data: 'lang_am' }],
        ],
      },
    }
  );
});

// ============================================================
// LANGUAGE SELECTION
// ============================================================

bot.callbackQuery(/lang_(en|am)/, async (ctx) => {
  const lang = ctx.match[1] as 'en' | 'am';
  await ctx.answerCallbackQuery();
  ctx.session.language = lang;

  await ctx.reply(
    `${t(ctx, 'languageSet')}\n\n${t(ctx, 'phoneRequest')}`,
    {
      reply_markup: {
        keyboard: [[{ text: '📱 ' + (lang === 'en' ? 'Share Phone Number' : 'ስልክ ቁጥር ያጋሩ'), request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
});

// ============================================================
// PHONE NUMBER HANDLER
// ============================================================

bot.on('message:contact', async (ctx) => {
  const contact = ctx.message.contact;
  if (!contact) return;

  if (contact.user_id !== ctx.from?.id) {
    await ctx.reply('⚠️ Please share your own phone number.');
    return;
  }

  ctx.session.data.phone = contact.phone_number;
  ctx.session.phoneNumber = contact.phone_number;

  const lang = ctx.session.language || 'en';
  
  await ctx.reply(
    lang === 'en' 
      ? '✅ Phone number received!\n\nNow, please enter your first name:' 
      : '✅ ስልክ ቁጥር ተቀብለናል!\n\nእባክዎ የመጀመሪያ ስምዎን ያስገቡ:',
    {
      reply_markup: { remove_keyboard: true },
    }
  );

  await ctx.conversation.enter('registration');
});

// ============================================================
// MENU HANDLERS
// ============================================================

bot.callbackQuery('show_menu', async (ctx) => {
  await ctx.answerCallbackQuery();
  const lang = ctx.session.language || 'en';
  await ctx.reply(
    `📋 ${t(ctx, 'mainMenu')}\n\nSelect an option:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🥩 ' + (lang === 'en' ? 'Available Kircha' : 'ያሉ የቅርጫ ቡድኖች'), callback_data: 'menu_groups' }],
          [{ text: '📦 ' + (lang === 'en' ? 'My Orders' : 'ትዕዛዞቼ'), callback_data: 'menu_orders' }],
          [{ text: '👤 ' + (lang === 'en' ? 'My Profile' : 'መገለጫዬ'), callback_data: 'menu_profile' }],
        ],
      },
    }
  );
});

// Placeholder menu handlers
bot.callbackQuery('menu_groups', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('🥩 Available Kircha\n\nNo groups available.');
});

bot.callbackQuery('menu_orders', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('📦 My Orders\n\nNo orders found.');
});

bot.callbackQuery('menu_profile', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('👤 Profile\n\nFeature coming soon.');
});

// ============================================================
// ERROR HANDLER
// ============================================================

bot.catch((error) => {
  console.error('❌ Bot error:', error);
});

// ============================================================
// START BOT
// ============================================================

console.log('🤖 Customer Bot is running...');
console.log(`📊 API URL: ${API_URL}`);

bot.start({
  allowed_updates: ['message', 'callback_query'],
});

// ============================================================
// HEALTH CHECK SERVER
// ============================================================

http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'customer-bot',
      port: PORT,
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});

console.log(`🔗 Health check: http://localhost:${PORT}/health`);
