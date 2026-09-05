// ============================================================
// TERMS & CONDITIONS - Full Content
// ============================================================

export interface TermsSection {
  id: string;
  titleEn: string;
  titleAm: string;
  contentEn: string;
  contentAm: string;
}

export const TERMS_SECTIONS: TermsSection[] = [
  // SECTION A
  {
    id: 'A',
    titleEn: 'Parties & Identification',
    titleAm: 'ተዋዋይ ወገኖች እና መለያ',
    contentEn: 'This agreement is entered into by and between Ale Kircha (the "Platform" or "Operator") and the Registered Customer (the "User" or "Customer").\n\nAle Kircha\'s principal office is located at Addis Ababa, Ethiopia.\nContact: support@alekircha.com / Toll-Free: 8***.\n\nBy creating an account or purchasing a quota, the User agrees to be legally bound by these terms pursuant to the Civil Code of Ethiopia (Proclamation No. 165/1960) and the Commercial Code of Ethiopia (Proclamation No. 1243/2021).',
    contentAm: 'ይህ ስምምነት በአሌ ቅርጫ (መድረክ) እና በተመዝጋቢው ደንበኛ መካከል የተደረገ ሕጋዊ ስምምነት ነው።\n\nየአሌ ቅርጫ ዋና መሥሪያ ቤት አዲስ አበባ፣ ኢትዮጵያ ይገኛል።\nኢሜይል፦ support@alekircha.com / ነፃ የጥሪ ማዕከል፦ 8***።\n\nተጠቃሚው አካውንት ሲከፍት ወይም ድርሻ ሲገዛ በ1952 ዓ.ም. የኢትዮጵያ ፍትሐ ብሔር ሕግ እና በ2013 ዓ.ም. የንግድ ሕግ መሠረት በነዚህ ውሎች ለመገደድ ሙሉ ስምምነቱን ይሰጣል።'
  },
  // SECTION B
  {
    id: 'B',
    titleEn: 'Definitions & Interpretation',
    titleAm: 'ትርጓሜዎች',
    contentEn: '"Ale Kircha" / "Platform": The digital application, website, and underlying software infrastructure operated by the company.\n\n"Customer" / "User": Any individual aged 18 or above who creates a profile and utilizes the platform.\n\n"Kircha": The traditional Ethiopian practice of joint livestock purchase and meat distribution among a group.\n\n"Quota": The designated portion of meat subscribed to by a customer (Full Quota, Half Quota, or Quarter Quota).\n\n"Group Maturity": The point at which all available quotas within a single Kircha group are 100% reserved and paid for.\n\n"Order": A customer\'s formal commitment to purchase a specific Quota.\n\n"Advice": Digital proof of payment (transaction receipt, screenshot, or reference code).\n\n"Refund": The return of funds following order cancellation or failure of group fulfillment.',
    contentAm: '"አሌ ቅርጫ" / "መድረክ"፦ በአገልግሎት ሰጪው የሚተዳደረው የሞባይል መተግበሪያ፣ ድረ-ገጽ እና የሶፍትዌር መሠረተ-ልማት።\n\n"ደንበኛ" / "ተጠቃሚ"፦ ዕድሜው 18 እና ከዚያ በላይ የሆነና በመድረኩ ላይ ተመዝግቦ አገልግሎት የሚጠቀም ማንኛውም ግለሰብ።\n\n"ቅርጫ"፦ በኢትዮጵያ ባህላዊ የነበረውን እንስሳትን በጋራ ገዝቶ የመካፈል ስርዓት።\n\n"ድርሻ"፦ ደንበኛው በቅርጫ ቡድን ውስጥ የሚገዛው መጠን (ሙሉ፣ ግማሽ፣ ወይም ሩብ)።\n\n"የቡድን ሙላት"፦ በአንድ የቅርጫ ቡድን ውስጥ ያሉ ሁሉም ድርሻዎች ተሸጠው እና ተከፍለው ሲጠናቀቁ የሚደርስ ደረጃ።\n\n"ትዕዛዝ"፦ ደንበኛው የተወሰነ ድርሻ ለመግዛት የሚያደርገው औपचारिक ጥያቄ።\n\n"የክፍያ ማስረጃ"፦ ደንበኛው ክፍያ መፈጸሙን የሚያሳይ ዲጂታል ደረሰኝ፣ ስክሪንሾት ወይም የማጣቀሻ ቁጥር።\n\n"ተመላሽ ገንዘብ"፦ ትዕዛዝ ሲሰረዝ ወይም ቡድኑ ሳይሞላ ሲቀር ለደንበኛው የሚመለስ ገንዘብ።'
  },
  // Add all sections A through N
  {
    id: 'C',
    titleEn: 'Purpose & Scope of Service',
    titleAm: 'የአገልግሎቱ ዓላማ እና ወሰን',
    contentEn: 'Ale Kircha provides a digital marketplace connecting buyers seeking traditional meat-sharing with organized livestock groups.\n\nAle Kircha acts as a digital service facilitator under the Electronic Transactions Proclamation No. 1205/2020. The platform facilitates group creation, escrow-like transaction management, and logistics, but does not own livestock directly unless specified.\n\nGroup formation depends on user subscription. The platform does not guarantee that every created group will reach Maturity.',
    contentAm: 'አሌ ቅርጫ ባህላዊውን የቅርጫ ስርዓት ዘመናዊ በማድረግ ገዢዎችን እና የተደራጁ የእንስሳት አቅራቢዎችን የሚያገናኝ ዲጂታል መድረክ ነው።\n\nመድረኩ በየኤሌክትሮኒክ ግብይት አዋጅ ቁጥር 1205/2012 መሠረት የአገልግሎት አጋዥ ሆኖ ይሰራል፤ የቡድን ምስረታን፣ የክፍያ ቁጥጥርን እና ማጓጓዝን ያመቻቻል።\n\nየቡድን ምስረታ በደንበኞች ምዝገባ ላይ የተመሠረተ ነው። መድረኩ ሁሉም የተፈጠሩ ቡድኖች ወደ ሙላት እንደሚደርሱ ዋስትና አይሰጥም።'
  },
  {
    id: 'D',
    titleEn: 'Registration & Account Creation',
    titleAm: 'ምዝገባ እና አካውንት',
    contentEn: 'Users must be at least 18 years old and possess full legal capacity under the Ethiopian Civil Code.\n\nUsers must register using a valid Ethiopian phone number, full legal name, and current physical delivery address.\n\nAll account registration data is processed in accordance with the Personal Data Protection Proclamation No. 1321/2024.\n\nThe user is solely responsible for maintaining the confidentiality of their login credentials and OTP codes. Providing fraudulent identification will result in immediate account termination.',
    contentAm: 'ተጠቃሚዎች በፍትሐ ብሔር ሕጉ መሠረት ዕድሜያቸው 18 ዓመት የሞላ እና በሕግ ፊት የመዋዋል ችሎታ ያላቸው መሆን አለባቸው።\n\nትክክለኛ የኢትዮጵያ ስልክ ቁጥር፣ ሙሉ ስም እና የርክክብ አድራሻ ማቅረብ ግዴታ ነው።\n\nየምዝገባ መረጃዎች በየግል መረጃ ጥበቃ አዋጅ ቁጥር 1321/2016 መሠረት ጥበቃ ይደረግላቸዋል።\n\nተጠቃሚው የመግቢያ መለያ እና የኦቲፒ ኮዶችን ሚስጥራዊነት የመጠበቅ ኃላፊነት አለበት። የሐሰት መረጃ ማቅረብ አካውንት እንዲዘጋ ያደርጋል።'
  },
  {
    id: 'E',
    titleEn: 'Customer Obligations & Rights',
    titleAm: 'የደንበኛው መብት እና ግዴታዎች',
    contentEn: 'Rights:\n- Access active Kircha groups and view quota details\n- Fair, transparent pricing and clear fee breakdowns\n- Secure data handling per Proclamation No. 1321/2024\n- Request refunds in accordance with Refund Policy\n- Lodge formal complaints and seek dispute resolution\n\nObligations:\n- Provide accurate identity and delivery details\n- Submit genuine payment advice within specified timeframes\n- Pay all applicable quota and delivery fees\n- Refrain from fraudulent payments or group manipulation\n- Accept delivery at the specified location and time',
    contentAm: 'መብቶች፦\n- ንቁ የቅርጫ ቡድኖችን እና ዋጋዎችን የመመልከት\n- ግልጽ የሆነ የዋጋ እና የአገልግሎት ክፍያ መረጃ ማግኘት\n- የግል መረጃ ደህንነት ጥበቃ (በአዋጅ 1321/2016)\n- በተመላሽ ፖሊሲው መሠረት ገንዘብ የመጠየቅ\n- ቅሬታ የማቅረብ እና ምላሽ የማግኘት\n\nግዴታዎች፦\n- ትክክለኛ ማንነት እና አድራሻ ማቅረብ\n- ትክክለኛ የክፍያ ማስረጃ በሰዓቱ መጫን\n- የድርሻ እና የማጓጓዣ ክፍያዎችን ሙሉ በሙሉ መክፈል\n- ከማጭበርበር እና ከሐሰተኛ ክፍያ መቆጠብ\n- በተመረጠው ቦታ እና ሰዓት ርክክብ መፈጸም'
  },
  {
    id: 'F',
    titleEn: 'Kircha Group Process',
    titleAm: 'የቅርጫ ቡድን ሂደት',
    contentEn: 'Group Creation: Groups are initialized by Platform Admins or requested by verified users, detailing animal type (Ox, Goat, Sheep), quota price, and maturity deadline.\n\nGroup Joining: Customers select their preferred group and quota allocation (Full, Half, Quarter).\n\nGroup Maturity: Once all quotas are filled and confirmed, the group reaches "Matured" status and moves to fulfillment.\n\nFulfillment & Slaughter: Meat preparation and veterinary inspection follow local municipal health standards.\n\nDistribution: Portions are measured equally according to traditional Kircha allocation standards.',
    contentAm: 'ቡድን መፍጠር፦ ቡድኖች በአስተዳዳሪው ወይም በተጠቃሚዎች ጥያቄ ይፈጠራሉ (የእንስሳው ዓይነት፣ የድርሻ ዋጋ እና የመዝጊያ ቀን ይገለጻል)።\n\nቡድን መቀላቀል፦ ደንበኛው የፈለገውን ቡድን እና የድርሻ መጠን (ሙሉ፣ ግማሽ፣ ሩብ) ይመርጣል።\n\nየቡድን ሙላት፦ 100% ድርሻ ተሸጦ ሲጠናቀቅ ቡድኑ ወደ እርድ እና ዝግጅት ይሸጋገራል።\n\nእርድ እና ቁጥጥር፦ የስጋ ዝግጅት በጤና ባለሙያዎች ቁጥጥር እና ጥራት መሠረት ይከናወናል።'
  },
  {
    id: 'G',
    titleEn: 'Pricing & Fees',
    titleAm: 'ዋጋ እና ክፍያዎች',
    contentEn: 'Quota Price: Set based on livestock acquisition costs.\n\nPlatform Fee: A service charge added at checkout to cover software maintenance and transaction administration.\n\nDelivery Fee: Distance-based charge for home delivery, waived if the customer selects "Self-Collection".\n\nTaxes: All pricing is inclusive of applicable national taxes (VAT/TOT) in compliance with Ethiopian Tax Laws.',
    contentAm: 'የድርሻ ዋጋ፦ በእንስሳቱ የግዥ ዋጋ ላይ ተመሠረቶ የሚወሰን።\n\nየመድረክ አገልግሎት ክፍያ፦ ለሶፍትዌር ጥገና እና አገልግሎት የሚጨመር መደበኛ ክፍያ።\n\nየማጓጓዣ ክፍያ፦ በቦታ ርቀት ላይ ተመሠረቶ የሚሰላ (ደንበኛው በአካል ከወሰደ አይከፈልም)።\n\nታክስ፦ ሁሉም ዋጋዎች በኢትዮጵያ የታክስ ሕግ መሠረት የሚገባቸውን ታክሶች ያካተቱ ናቸው።'
  }
];

// Add more sections as needed (H through N)

export const TERMS_VERSION = '1.0';
export const TERMS_DATE = 'September 3, 2026';

export function getTermsSection(id: string): TermsSection | undefined {
  return TERMS_SECTIONS.find(s => s.id === id);
}

export function getSectionIds(): string[] {
  return TERMS_SECTIONS.map(s => s.id);
}

export function getTotalSections(): number {
  return TERMS_SECTIONS.length;
}
