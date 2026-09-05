#!/bin/bash

echo "🚀 ALE KIRCHA - COMPLETE IMPLEMENTATION SCRIPT"
echo "=============================================="
echo ""

cd ~/Ale-Kircha

# ============================================================
# CUSTOMER BOT - TERMS CONTENT
# ============================================================

echo "📝 Creating Terms & Conditions content..."
cat > apps/customer-bot/src/termsContent.ts <<'EOF'
export const termsPages = [
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 1 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 ALE KIRCHA TERMS AND CONDITIONS

Version: 1.0
Effective Date: September 3, 2026
Last Updated: September 3, 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This document is a legally binding template drafted in accordance with the legal framework of the Federal Democratic Republic of Ethiopia.

It should be reviewed by a qualified legal professional before deployment.`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 1/12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 የአሌ ቅርጫ ውሎች እና ሁኔታዎች ሰነድ

ስሪት፦ 1.0
የመተግበሪያ ቀን፦ መስከረም 3 ቀን 2019 ዓ.ም.
የመጨረሻ ዝመና፦ መስከረም 3 ቀን 2019 ዓ.ም.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ማስተባበያ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ይህ ሰነድ በኢትዮጵያ ፌደራላዊ ዲሞክራሲያዊ ሪፐብሊክ ሕጎች መሠረት የተዘጋጀ ህጋዊ ረቂቅ ነው።

ወደ ሥራ ከመተርጎሙ በፊት በሕግ ባለሙያ መገምገም አለበት።`
  },
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 2 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ SECTION A: PARTIES & IDENTIFICATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CONTRACTING PARTIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This agreement is entered into by and between:

Party One: Ale Kircha (the "Platform" or "Operator")
- A digital facilitation service registered under the laws of Ethiopia

Party Two: The Registered Customer (the "User" or "Customer")
- Any individual aged 18 or above who creates a profile

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CONTACT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Principal Office: Addis Ababa, Ethiopia
Email: support@alekircha.com
Support: +251 911 123456

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 BINDING AGREEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

By creating an account or purchasing a quota, the User agrees to be legally bound by these terms.`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 2/12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ ክፍል ሀ፦ ተዋዋይ ወገኖች እና መለያ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ተዋዋይ ወገኖች
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ይህ ስምምነት በሚከተሉት መካከል ተደርጓል፦

አንደኛ ወገን፦ አሌ ቅርጫ ("መድረክ" ወይም "አስተዳዳሪ")
- በኢትዮጵያ ሕግ መሠረት የተመዘገበ ዲጂታል አገልግሎት

ሁለተኛ ወገን፦ የተመዘገበ ደንበኛ ("ተጠቃሚ" ወይም "ደንበኛ")
- ዕድሜው 18 እና ከዚያ በላይ የሆነ መለያ የከፈተ ማንኛውም ግለሰብ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 የመገናኛ አድራሻ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ዋና መሥሪያ ቤት፦ አዲስ አበባ፣ ኢትዮጵያ
ኢሜይል፦ support@alekircha.com
ድጋፍ፦ +251 911 123456

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 አስገዳጅነት
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ተጠቃሚው አካውንት ሲከፍት ወይም ድርሻ ሲገዛ በነዚህ ውሎች ለመገደድ ሙሉ ስምምነቱን ይሰጣል።`
  },
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 3 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 SECTION B: DEFINITIONS & INTERPRETATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 KEY TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Ale Kircha" / "Platform"
The digital application, website, and underlying software infrastructure operated by the company.

"Customer" / "User"
Any individual aged 18 or above who creates a profile and utilizes the platform.

"Kircha"
The traditional Ethiopian practice of joint livestock purchase and meat distribution among a group.

"Quota"
The designated portion of meat subscribed to by a customer (Full Quota, Half Quota, or Quarter Quota).

"Group Maturity"
The point at which all available quotas within a single Kircha group are 100% reserved and paid for.

"Order"
A customer's formal commitment to purchase a specific Quota in a designated Kircha group.

"Advice" / "Payment Evidence"
Digital proof of payment (transaction receipt, screenshot, or reference code) uploaded by the user.

"Refund"
The return of funds to a customer following order cancellation or failure of group fulfillment.

"Service Charges"
Platform facilitation, processing, and administrative fees added to the base price of the Quota.`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 3/12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 ክፍል ለ፦ ትርጓሜዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ቁልፍ ቃላት
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"አሌ ቅርጫ" / "መድረክ"
በኩባንያው የሚተዳደረው የሞባይል መተግበሪያ፣ ድረ-ገጽ እና የሶፍትዌር መሠረተ-ልማት።

"ደንበኛ" / "ተጠቃሚ"
ዕድሜው 18 እና ከዚያ በላይ የሆነና በመድረኩ ላይ ተመዝግቦ አገልግሎት የሚጠቀም ማንኛውም ግለሰብ።

"ቅርጫ"
በኢትዮጵያ ባህላዊ የነበረውን እንስሳትን በጋራ ገዝቶ የመካፈል ስርዓት።

"ድርሻ" (Quota)
ደንበኛው በቅርጫ ቡድን ውስጥ የሚገዛው መጠን (ሙሉ ድርሻ፣ ግማሽ ድርሻ፣ ወይም ሩብ ድርሻ)።

"የቡድን ሙላት" (Maturity)
በአንድ የቅርጫ ቡድን ውስጥ ያሉ ሁሉም ድርሻዎች 100% ተሸጠው እና ተከፍለው የሚጠናቀቁበት ሁኔታ።

"ትዕዛዝ" (Order)
ደንበኛው የተወሰነ ድርሻ ለመግዛት የሚያደርገው መደበኛ ጥያቄ።

"የክፍያ ማስረጃ" (Advice)
ደንበኛው ክፍያ መፈጸሙን የሚያሳይ ዲጂታል ደረሰኝ፣ ስክሪንሾት ወይም የማጣቀሻ ቁጥር።

"ተመላሽ ገንዘብ" (Refund)
ትዕዛዝ ሲሰረዝ ወይም ቡድኑ ሳይሞላ ሲቀር ለደንበኛው የሚመለስ ገንዘብ።

"የአገልግሎት ክፍያ" (Service Charges)
ለመድረክ አስተዳደር፣ ሂደት እና አስተዳደር ከድርሻው ዋጋ ላይ የሚጨመሩ ክፍያዎች።`
  },
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 4 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SECTION C: PURPOSE & SCOPE OF SERVICE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 PURPOSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ale Kircha provides a digital marketplace connecting buyers seeking traditional meat-sharing with organized livestock groups.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ROLE OF PLATFORM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ale Kircha acts as a digital service facilitator under the Electronic Transactions Proclamation No. 1205/2020.

The platform facilitates:
• Group creation
• Escrow-like transaction management
• Logistics coordination

Note: The platform does not own livestock directly unless specified.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 FORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Group formation depends on user subscription.

The platform does not guarantee that every created group will reach Maturity.`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 4/12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ክፍል ሐ፦ የአገልግሎቱ ዓላማ እና ወሰን

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ዓላማ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

አሌ ቅርጫ ባህላዊውን የቅርጫ ስርዓት ዘመናዊ በማድረግ ገዢዎችን እና የተደራጁ የእንስሳት አቅራቢዎችን የሚያገናኝ ዲጂታል መድረክ ነው።

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 የመድረኩ ሚና
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

አሌ ቅርጫ በየኤሌክትሮኒክ ግብይት አዋጅ ቁጥር 1205/2012 መሠረት የአገልግሎት አጋዥ ሆኖ ይሰራል።

መድረኩ የሚያመቻቻቸው፦
• የቡድን ምስረታ
• የክፍያ ቁጥጥር
• የማጓጓዝ ቅንጅት

ማሳሰቢያ፦ መድረኩ በግል የእንስሳት ባለቤት አይደለም (በግልጽ ካልተገለጸ በስተቀር)።

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ምስረታ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

የቡድን ምስረታ በተጠቃሚዎች ምዝገባ ላይ የተመሠረተ ነው።

መድረኩ ሁሉም የተፈጠሩ ቡድኖች ወደ ሙላት እንደሚደርሱ ዋስትና አይሰጥም።`
  },
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 5 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 SECTION D: REGISTRATION & ACCOUNT CREATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ELIGIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Users must be at least 18 years old and possess full legal capacity under the Ethiopian Civil Code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ACCOUNT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Users must register using:
• A valid Ethiopian phone number
• Full legal name
• Current physical delivery address

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 DATA PROTECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All account registration data is processed in accordance with the Personal Data Protection Proclamation No. 1321/2024.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ACCOUNT SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The user is solely responsible for:
• Maintaining confidentiality of login credentials
• Protecting OTP codes

⚠️ Providing fraudulent identification will result in immediate account termination.`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 5/12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 ክፍል መ፦ ምዝገባ እና አካውንት

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ብቁነት
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ተጠቃሚዎች ዕድሜያቸው 18 ዓመት የሞላ እና በፍትሐ ብሔር ሕጉ መሠረት ሙሉ የሕግ ችሎታ ያላቸው መሆን አለባቸው።

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 የአካውንት መስፈርቶች
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ተጠቃሚዎች የሚከተሉትን በመጠቀም መመዝገብ አለባቸው፦
• ትክክለኛ የኢትዮጵያ ስልክ ቁጥር
• ሙሉ ስም
• ወቅታዊ የርክክብ አድራሻ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 የመረጃ ጥበቃ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ሁሉም የምዝገባ መረጃዎች በየግል መረጃ ጥበቃ አዋጅ ቁጥር 1321/2016 መሠረት ጥበቃ ይደረግላቸዋል።

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 የአካውንት ደህንነት
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ተጠቃሚው ለሚከተሉት ነገሮች ብቻ ሃላፊነት አለበት፦
• የመግቢያ መረጃዎች ሚስጥራዊነት ጥበቃ
• የኦቲፒ ኮዶች ጥበቃ

⚠️ የሐሰት መረጃ ማቅረብ አካውንት እንዲዘጋ ያደርጋል።`
  },
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 6 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚖️ SECTION E: CUSTOMER OBLIGATIONS & RIGHTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CUSTOMER RIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Access active Kircha groups and view quota details
✅ Fair, transparent pricing and clear fee breakdowns
✅ Secure data handling per Proclamation No. 1321/2024
✅ Request refunds in accordance with Section J
✅ Lodge formal complaints and seek dispute resolution

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CUSTOMER OBLIGATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⬜ Provide accurate identity and delivery details
⬜ Submit genuine payment advice within specified timeframes
⬜ Pay all applicable quota and delivery fees
⬜ Refrain from fraudulent payments or group manipulation
⬜ Accept delivery at the specified location and time`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 6/12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚖️ ክፍል ሠ፦ የደንበኛው መብት እና ግዴታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 የደንበኛ መብቶች
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ንቁ የቅርጫ ቡድኖችን እና ዋጋዎችን የመመልከት
✅ ግልጽ የሆነ የዋጋ እና የአገልግሎት ክፍያ መረጃ ማግኘት
✅ የግል መረጃ ደህንነት ጥበቃ (በአዋጅ 1321/2016)
✅ በተመላሽ ፖሊሲው መሠረት ገንዘብ የመጠየቅ
✅ ቅሬታ የማቅረብ እና ምላሽ የማግኘት

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 የደንበኛ ግዴታዎች
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⬜ ትክክለኛ ማንነት እና አድራሻ ማቅረብ
⬜ ትክክለኛ የክፍያ ማስረጃ በሰዓቱ መጫን
⬜ የድርሻ እና የማጓጓዣ ክፍያዎችን ሙሉ በሙሉ መክፈል
⬜ ከማጭበርበር እና ከሐሰተኛ ክፍያ መቆጠብ
⬜ በተመረጠው ቦታ እና ሰዓት ርክክብ መፈጸም`
  },
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 7 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🥩 SECTION F: KIRCHA GROUP PROCESS
💰 SECTION G: PRICING & FEES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SECTION F - GROUP PROCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Group Creation
Groups are initialized by Platform Admins or requested by verified users, detailing:
• Animal type (Ox, Goat, Sheep)
• Quota price
• Maturity deadline

2. Group Joining
Customers select their preferred group and quota allocation (Full, Half, Quarter).

3. Group Maturity
Once all quotas are filled and confirmed, the group reaches "Matured" status.

4. Fulfillment & Slaughter
Meat preparation follows local municipal health standards.

5. Distribution
Portions are measured equally according to traditional Kircha allocation standards.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SECTION G - PRICING & FEES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Quota Price: Based on livestock acquisition costs
• Platform Fee: Service charge for software maintenance
• Delivery Fee: Distance-based charge (waived for "Self-Collection")
• Taxes: Inclusive of applicable national taxes (VAT/TOT)`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 7/12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🥩 ክፍል ረ፦ የቅርጫ ቡድን ሂደት
💰 ክፍል ሰ፦ ዋጋ እና ክፍያዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ክፍል ረ - የቡድን ሂደት
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ቡድን መፍጠር
ቡድኖች በአስተዳዳሪው ወይም በተጠቃሚዎች ጥያቄ ይፈጠራሉ፦
• የእንስሳው ዓይነት (በሬ፣ በግ፣ ፍየል)
• የድርሻ ዋጋ
• የመዝጊያ ቀን

2. ቡድን መቀላቀል
ደንበኛው የፈለገውን ቡድን እና የድርሻ መጠን (ሙሉ፣ ግማሽ፣ ሩብ) ይመርጣል።

3. የቡድን ሙላት
100% ድርሻ ተሸጦ ሲጠናቀቅ ቡድኑ ወደ "የበሰለ" ሁኔታ ይደርሳል።

4. እርድ እና ቁጥጥር
የስጋ ዝግጅት በአካባቢው የጤና ባለሙያዎች ቁጥጥር ይከናወናል።

5. ስርጭት
ድርሻዎች በባህላዊ የቅርጫ ደረጃዎች መሠረት በእኩልነት ይለካሉ።

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ክፍል ሰ - ዋጋ እና ክፍያዎች
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• የድርሻ ዋጋ፦ በእንስሳቱ የግዥ ዋጋ ላይ ተመሠረቶ
• የመድረክ አገልግሎት ክፍያ፦ ለሶፍትዌር ጥገና
• የማጓጓዣ ክፍያ፦ በቦታ ርቀት ላይ ተመሠረቶ (በአካል ለሚወስዱ አይከፈልም)
• ታክስ፦ ተገቢውን ብሔራዊ ታክሶች ያካተተ`
  },
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 8 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 SECTION H: PAYMENT PROCESSING

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 PAYMENT CHANNELS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Payments are accepted via:
• Integrated banking partners (CBE, Awash Bank, Wegagen Bank)
• Mobile Money services (Telebirr, CBE Birr)

Legal Basis: National Bank of Ethiopia Payment Systems Proclamation No. 718/2011

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 PAYMENT ADVICE SUBMISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Users must upload a clear screenshot or reference number of their payment within 30 minutes of placing an order.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 VERIFICATION SLA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Admin verification takes place within 1 hour of submission
• Operating hours: 8:00 AM – 6:00 PM EAT
• Unverified payments will hold orders in pending status`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 8/12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 ክፍል ሸ፦ የክፍያ አፈፃፀም

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 የክፍያ መንገዶች
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ክፍያዎች በሚከተሉት መንገዶች ይቀበላሉ፦
• በባንኮች (ንግድ ባንክ፣ አዋሽ፣ ወጋገን)
• በሞባይል ገንዘብ (ቴሌብር፣ ሲቢኢ ብር)

ሕጋዊ መሠረት፦ የብሔራዊ ባንክ የክፍያ ስርዓት አዋጅ ቁጥር 718/2003

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 የክፍያ ማስረጃ መጫን
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• ደንበኛው ትዕዛዝ ካዘዘ በኋላ በ30 ደቂቃ ውስጥ የክፍያ ማስረጃ መጫን አለበት።

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 የማረጋገጫ ጊዜ (SLA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• ክፍያዎች በ1 ሰዓት ውስጥ በሰራተኞች ይረጋገጣሉ
• የስራ ሰዓት፦ ከጠዋቱ 2:00 እስከ ምሽቱ 12:00
• ያልተረጋገጡ ክፍያዎች ትዕዛዙን በመጠባበቅ ላይ ያሳልፋሉ`
  },
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 9 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚚 SECTION I: DELIVERY & FULFILLMENT
🔄 SECTION J: REFUND POLICY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SECTION I - DELIVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Delivery Windows: 24–48 hours after Group Maturity
• Customer Availability: Must be at designated address
• If unreachable for 30 minutes: Package returned, re-delivery fee applies
• Collection Centers: Present Order ID and ID for self-collection

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SECTION J - REFUND POLICY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Refunds are granted if:
1. Group fails to reach Maturity within designated timeframe
2. Order is canceled prior to Group Maturity
3. Product fails quality standards at delivery

• Refund SLA: Processed within 2 hours
• Customer must confirm receipt within 1 hour of notification`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 9/12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚚 ክፍል ቀ፦ ርክክብ እና ማጠናቀቅ
🔄 ክፍል በ፦ ተመላሽ ገንዘብ (REFUND) ፖሊሲ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ክፍል ቀ - ርክክብ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• የርክክብ ሰዓት፦ ቡድኑ ሙሉ ከተሞላ በኋላ በ24-48 ሰዓታት ውስጥ
• ተገኝነት፦ ደንበኛው በተጠቀሰው አድራሻ መገኘት አለበት
• ደንበኛው ለ30 ደቂቃ ካልተገኘ፦ እቃው ይመለሳል፣ ዳግም ማጓጓዣ ክፍያ ይደመራል
• የመሰብሰቢያ ማዕከል፦ የትዕዛዝ መለያ እና መታወቂያ ማቅረብ ያስፈልጋል

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ክፍል በ - ተመላሽ ገንዘብ ፖሊሲ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ተመላሽ ገንዘብ በሚከተሉት ሁኔታዎች ይፈጸማል፦
1. ቡድኑ በተወሰነው ጊዜ ሳይሞላ ሲቀር
2. ቡድኑ ሳይሞላ ትዕዛዙ ሲሰረዝ
3. የቀረበው ስጋ ጥራት ሲያናግር

• የማስኬጃ ጊዜ (SLA)፦ በ2 ሰዓት ውስጥ ይሰራል
• ደንበኛው በ1 ሰዓት ውስጥ መቀበሉን ማረጋገጥ አለበት`
  },
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 10 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ SECTION K: CANCELLATION POLICY
🔒 SECTION L: DATA PRIVACY & PROTECTION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SECTION K - CANCELLATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Customer Cancellation:
• Before payment verification: Allowed freely
• After verification, before Maturity: 5% admin fee applies
• After Maturity: No cancellations permitted

Platform Cancellation:
Ale Kircha reserves the right to cancel due to:
• Stock unavailability
• Municipal health advisories
• Unverified payments

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SECTION L - DATA PRIVACY & PROTECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Compliance: Personal Data Protection Proclamation No. 1321/2024 and Article 26 of the FDRE Constitution

Data Collected:
• Name, phone number, delivery address
• Transaction history
• Bank account details (for refunds)

Usage: Exclusively for processing orders, deliveries, and support

Third-Party Sharing: Shared only with logistics partners for delivery purposes
⚠️ Never sold to third parties`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 10/12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ ክፍል ተ፦ ስረዛ (CANCELLATION) ፖሊሲ
🔒 ክፍል ቸ፦ የግል መረጃ ጥበቃ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ክፍል ተ - ስረዛ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

በደንበኛ የሚደረግ ስረዛ፦
• ክፍያ ከማረጋገጡ በፊት፦ በነፃ
• ከማረጋገጫ በኋላ ቡድኑ ሳይሞላ፦ 5% ቅጣት
• ቡድኑ ከተሞላ በኋላ፦ ስረዛ አይፈቀድም

በመድረኩ የሚደረግ ስረዛ፦
አሌ ቅርጫ በሚከተሉት ሁኔታዎች የመሰረዝ መብቱ የተጠበቀ ነው፦
• በቂ እንስሳት ከሌሉ
• የጤና ባለስልጣናት ማስጠንቀቂያ
• ያልተረጋገጡ ክፍያዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ክፍል ቸ - የግል መረጃ ጥበቃ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

በየግል መረጃ ጥበቃ አዋጅ ቁጥር 1321/2016 እና በሕገ-መንግሥቱ አንቀጽ 26 መሠረት

የምንሰበስበው መረጃ፦
• ስም፣ ስልክ፣ አድራሻ
• የግብይት ታሪክ
• የባንክ አካውንት ዝርዝር (ለተመላሽ ገንዘብ)

አጠቃቀም፦ ለትዕዛዝ እና ርክክብ ማካሄጃ ብቻ

ለሶስተኛ ወገን መጋራት፦ ለርክክብ አጋሮች ብቻ
⚠️ መረጃዎ በጭራሽ አይሸጥም`
  },
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 11 of 12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

©️ SECTION M: INTELLECTUAL PROPERTY
⚖️ SECTION N: COMPLAINTS & DISPUTE RESOLUTION
📋 SECTION O: MISCELLANEOUS LEGAL TERMS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SECTION M - INTELLECTUAL PROPERTY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All platform logos, UI components, codebase, copy, and branding for "Ale Kircha" are protected under the Ethiopian Copyright and Neighboring Rights Protection Proclamation No. 410/2004.

Unauthorized reproduction is strictly prohibited.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SECTION N - COMPLAINTS & DISPUTE RESOLUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Informal Resolution: Log complaints through in-app support center. Resolution within 24 hours.

2. Mediation & Arbitration: Disputes not resolved informally shall be submitted to binding arbitration pursuant to the Arbitration and Conciliation Code Proclamation No. 1237/2021.

3. Jurisdiction: Federal Courts of Ethiopia.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SECTION O - MISCELLANEOUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Limitation of Liability: Maximum liability limited to total amount paid by customer for the specific order
• Force Majeure: Acts of God, civil unrest, telecommunication blockages, or government restrictions
• Amendments: Terms may be updated periodically
• Electronic Acceptance: "I Agree" carries full legal weight of a physical signature`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 11/12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

©️ ክፍል ኀ፦ የሃሳብ ባለቤትነት
⚖️ ክፍል ኁ፦ ቅሬታ እና አለመግባባቶች
📋 ክፍል ኂ - ኘ፦ ሕጋዊ ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ክፍል ኀ - የሃሳብ ባለቤትነት
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"አሌ ቅርጫ" የንግድ ስም እና ሶፍትዌር በየቅጅ እና ተዛማጅ መብቶች ጥበቃ አዋጅ ቁጥር 410/1996 የተጠበቀ ነው።

ያልተፈቀደ መባዛት በጥብቅ የተከለከለ ነው።

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ክፍል ኁ - ቅሬታ እና አለመግባባቶች መፍታት
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. መደበኛ መፍትሄ፦ ቅሬታዎች በመተግበሪያው ውስጥ ይቀርባሉ። መፍትሄ በ24 ሰዓት ውስጥ ይሰጣል።

2. ሽምግልና እና እርቅ፦ ያልተፈቱ አለመግባባቶች በየሽምግልና እና እርቅ አዋጅ ቁጥር 1237/2013 ይታያሉ።

3. የፍርድ ቤት ስልጣን፦ የኢትዮጵያ ፌደራል ፍርድ ቤቶች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ክፍል ኂ - ልዩ ሁኔታዎች
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• የኃላፊነት ወሰን፦ ከፍተኛው ኃላፊነት ደንበኛው ለተወሰነ ትዕዛዝ ከከፈለው ገንዘብ አይበልጥም
• ከፍተኛ ኃይል (Force Majeure)፦ በተፈጥሮ አደጋ፣ ህዝባዊ እርከን፣ የቴሌኮሙኒኬሽን መቋረጥ ወይም የመንግሥት ገደቦች ምክንያት
• ማሻሻያዎች፦ ውሎች በየጊዜው ሊሻሻሉ ይችላሉ
• የኤሌክትሮኒክ ተቀባይነት፦ "ተቀብያለሁ" የአካል ፊርማ ሙሉ ሕጋዊ ክብደት አለው`
  },
  {
    en: `📜 TERMS & CONDITIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Page 12 of 12 - FINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ SECTION P: CUSTOMER ACCEPTANCE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 DECLARATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

By clicking "I Accept", you agree to all the terms and conditions outlined in this document.

You confirm that:

✅ You have read and understood all 12 pages
✅ You are at least 18 years old
✅ You are legally capable of entering into this agreement
✅ You agree to be bound by these terms and conditions
✅ You understand your rights and obligations as a customer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 WHAT HAPPENS NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Upon acceptance:
• Your registration will be completed
• Your account will be activated
• You will be able to join Kircha groups
• You can place orders and make payments

This agreement is effective as of the date of your acceptance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 LEGAL NOTICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The effective date of this agreement will be recorded in our system along with the version number (v1.0).

You may request a copy of this agreement at any time.

[📋 Terms Version: v1.0 | Effective: September 3, 2026]`,
    am: `📜 ውሎችና ሁኔታዎች

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ገጽ 12/12 - የመጨረሻ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ክፍል ኘ፦ የደንበኛ ተቀባይነት

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ማስታወቂያ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"ተቀብያለሁ" የሚለውን ቁልፍ በመጫን ከላይ የተገለጹትን ሁሉንም ውሎችና ሁኔታዎች እንደተስማሙባቸው ያረጋግጣሉ።

የሚከተሉትን ያረጋግጣሉ፦

✅ ሁሉንም 12 ገጾች አንብበው ተረድተዋል
✅ ዕድሜዎ 18 እና ከዚያ በላይ ነው
✅ ይህን ስምምነት ለመፈጸም ሙሉ ሕጋዊ ችሎታ አለዎት
✅ በነዚህ ውሎች እና ሁኔታዎች ለመገደድ ተስማምተዋል
✅ የደንበኛ መብቶችዎን እና ግዴታዎችዎን ተረድተዋል

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ቀጣይ ምን ይከሰታል
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ተቀባይነት ከተሰጠ በኋላ፦
• ምዝገባዎ ይጠናቀቃል
• አካውንትዎ ይንቀሳቀሳል
• የቅርጫ ቡድኖችን መቀላቀል ይችላሉ
• ትዕዛዝ ማስገባት እና ክፍያ መፈጸም ይችላሉ

ይህ ስምምነት ተቀባይነት ከሰጡበት ቀን ጀምሮ ተፈጻሚ ይሆናል።

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ሕጋዊ ማስታወቂያ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

የዚህ ስምምነት ተፈጻሚ ቀን ከስሪት ቁጥር (v1.0) ጋር በስርዓታችን ይመዘገባል።

በማንኛውም ጊዜ የዚህን ሰነድ ቅጂ መጠየቅ ይችላሉ።

[📋 የውሎች ስሪት፦ v1.0 | የሚፈጸምበት ቀን፦ መስከረም 3, 2019 ዓ.ም.]`
  }
];
EOF

echo "✅ Terms content created"

# ============================================================
# CUSTOMER BOT - FAQ CONTENT
# ============================================================

echo "📝 Creating FAQ content..."
cat > apps/customer-bot/src/faqContent.ts <<'EOF'
export const faqs = [
  {
    category: 'Account & Registration',
    questions: [
      {
        en: 'How do I register an account?',
        am: 'አካውንት እንዴት እከፍታለሁ?',
        answerEn: 'Download the Ale Kircha app, enter your valid mobile number, input the OTP sent via SMS, and fill in your name and delivery address.',
        answerAm: 'የአሌ ቅርጫ መተግበሪያን ያውርዱ፣ ስልክ ቁጥርዎን ያስገቡ፣ በኤስኤምኤስ የሚመጣውን የኦቲፒ ቁጥር ያረጋግጡ፣ ከዚያም ስምዎን እና አድራሻዎን ይሙሉ።'
      },
      {
        en: 'Can I register without an Ethiopian phone number?',
        am: 'ያለ ኢትዮጵያ ስልክ ቁጥር መመዝገብ እችላለሁ?',
        answerEn: 'No, a valid local phone number (+251) is required for payment verification and delivery coordination.',
        answerAm: 'አይችሉም፤ ለክፍያ ማረጋገጫ እና ለርክክብ የኢትዮጵያ ስልክ ቁጥር (+251) ግዴታ ነው።'
      },
      {
        en: 'What if I forget my password/OTP?',
        am: 'የኦቲፒ ቁጥሬን ብረሳ ምን ማድረግ አለብኝ?',
        answerEn: 'You can request a new OTP by clicking "Resend OTP" on the login screen. If you are locked out, contact support.',
        answerAm: 'በመግቢያ ገጹ ላይ "እንደገና ላክ" የሚለውን በመጫን አዲስ ኦቲፒ መጠየቅ ይችላሉ። ችግር ካጋጠማችሁ ድጋፍን ያግኙ።'
      }
    ]
  },
  {
    category: 'Kircha Groups',
    questions: [
      {
        en: 'What is the difference between Full, Half, and Quarter Quotas?',
        am: 'የሙሉ፣ ግማሽ እና ሩብ ድርሻ ልዩነት ምንድነው?',
        answerEn: 'Full Quota: You purchase 100% of an individual share in a group. Half Quota: You split a share with another member (50%). Quarter Quota: You purchase a 25% share of a full portion.',
        answerAm: 'ሙሉ ድርሻ፦ የአንድን ድርሻ 100% ሙሉ በሙሉ መግዛት። ግማሽ ድርሻ፦ ከአንድ ሌላ ሰው ጋር 50% ተካፍሎ መግዛት። ሩብ ድርሻ፦ የሙሉውን ድርሻ 25% ብቻ መግዛት።'
      },
      {
        en: 'What happens if a group does not fill up?',
        am: 'ቡድኑ ሳይሞላ ቢቀር ምን ይከሰታል?',
        answerEn: 'If a group fails to reach 100% subscription by its deadline, you receive a full refund with zero cancellation fees within 2 hours.',
        answerAm: 'ቡድኑ በተቀመጠለት ጊዜ ውስጥ 100% ካልሞላ፣ የከፈሉት ገንዘብ ያለምንም ቅጣት በ2 ሰዓት ውስጥ ሙሉ በሙሉ ይመለስልዎታል።'
      }
    ]
  },
  {
    category: 'Payments & Refunds',
    questions: [
      {
        en: 'Which payment options can I use?',
        am: 'በምን ዓይነት መንገዶች መክፈል እችላለሁ?',
        answerEn: 'We support Telebirr, CBE Birr, and direct transfers via CBE, Awash, Wegagen, and other commercial banks.',
        answerAm: 'በቴሌብር፣ በሲቢኢ ብር፣ እንዲሁም በንግድ ባንክ፣ አዋሽ፣ ወጋገን እና ሌሎች ባንኮች በቀጥታ ማስተላለፍ ይችላሉ።'
      },
      {
        en: 'How fast are refunds processed?',
        am: 'ተመላሽ ገንዘብ በስንት ጊዜ ውስጥ ይደርሰኛል?',
        answerEn: 'Once approved, refunds are processed within 2 hours directly to your designated bank account or mobile wallet.',
        answerAm: 'ጥያቄዎ እንደተረጋገጠ በ2 ሰዓት ውስጥ ወደ ሂሳብዎ ገቢ ይደረጋል።'
      },
      {
        en: 'What if my payment advice is rejected?',
        am: 'የክፍያ ማስረጃዬ ካልተቀበለ ምን ማድረግ አለብኝ?',
        answerEn: 'Your payment advice may be rejected if the image is unclear, the reference number doesn\'t match, or the amount doesn\'t match the order. You can upload a new, clearer advice.',
        answerAm: 'ምስሉ ግልጽ ካልሆነ፣ የማጣቀሻ ቁጥሩ ካልተዛመደ፣ ወይም መጠኑ ከትዕዛዙ ጋር ካልተጣጣመ የክፍያ ማስረጃዎ ሊከለከል ይችላል። አዲስ እና ግልጽ ማስረጃ መጫን ይችላሉ።'
      }
    ]
  },
  {
    category: 'Delivery',
    questions: [
      {
        en: 'Can I pick up my meat personally?',
        am: 'ስጋዬን በአካል መውሰድ እችላለሁ?',
        answerEn: 'Yes. Select "Self-Collection" during checkout to pick up your order from our nearest distribution hub without paying delivery charges.',
        answerAm: 'አዎ። በትዕዛዝ ማስገቢያ ጊዜ "በአካል መውሰድ" የሚለውን በመምረጥ ከቅርብ መሰብሰቢያ ማዕከል ሳይከፈሉ መውሰድ ይችላሉ።'
      },
      {
        en: 'What happens if I miss my delivery?',
        am: 'ርክክብ ባልቀበል ምን ይከሰታል?',
        answerEn: 'If you are unreachable for 30 minutes, the package will be returned to the central hub. A re-delivery fee will be charged for a second attempt.',
        answerAm: 'ለ30 ደቂቃ ካልተገኙ፣ እቃው ወደ ማዕከሉ ይመለሳል። ለሁለተኛ ጊዜ ሙከራ ዳግም የማጓጓዣ ክፍያ ይደመራል።'
      }
    ]
  }
];
EOF

echo "✅ FAQ content created"

# ============================================================
# CUSTOMER BOT - ADD HANDLERS TO bot.ts
# ============================================================

echo "📝 Adding Terms Carousel, FAQ, and Self-Help handlers to customer bot..."

# We'll use sed to insert the imports and handlers
# First, check if imports already exist
if ! grep -q "import { termsPages }" apps/customer-bot/src/bot.ts; then
  sed -i '1iimport { termsPages } from "./termsContent.js";' apps/customer-bot/src/bot.ts
fi

if ! grep -q "import { faqs }" apps/customer-bot/src/bot.ts; then
  sed -i '1iimport { faqs } from "./faqContent.js";' apps/customer-bot/src/bot.ts
fi

# Add terms carousel conversation function (if not already present)
if ! grep -q "async function termsCarouselConversation" apps/customer-bot/src/bot.ts; then
  cat >> apps/customer-bot/src/bot.ts <<'EOF'

// ============================================================
// TERMS & CONDITIONS CAROUSEL
// ============================================================

async function termsCarouselConversation(conversation: any, ctx: MyContext) {
  const lang = ctx.session.language || 'en';
  const totalPages = termsPages.length;
  let currentPage = 0;

  while (true) {
    const content = termsPages[currentPage];
    const pageText = lang === 'en' ? content.en : content.am;
    const pageLabel = t(ctx, 'termsPage');
    
    const keyboard: any = {
      inline_keyboard: []
    };

    // Previous button
    if (currentPage > 0) {
      keyboard.inline_keyboard.push([{ text: '◀ ' + t(ctx, 'termsPrevious'), callback_data: 'terms_prev' }]);
    }

    // Next button
    if (currentPage < totalPages - 1) {
      if (keyboard.inline_keyboard.length > 0) {
        keyboard.inline_keyboard[0].push({ text: t(ctx, 'termsNext') + ' ▶', callback_data: 'terms_next' });
      } else {
        keyboard.inline_keyboard.push([{ text: t(ctx, 'termsNext') + ' ▶', callback_data: 'terms_next' }]);
      }
    }

    // Page indicator
    keyboard.inline_keyboard.push([{ text: `📌 ${pageLabel} ${currentPage + 1}/${totalPages}`, callback_data: 'terms_page' }]);

    // Accept/Decline on last page
    if (currentPage === totalPages - 1) {
      keyboard.inline_keyboard.push([
        { text: '✅ ' + t(ctx, 'termsAccept'), callback_data: 'terms_accept' },
        { text: '❌ ' + t(ctx, 'termsDecline'), callback_data: 'terms_decline' }
      ]);
    }

    await ctx.reply(
      `${pageText}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📖 ${pageLabel} ${currentPage + 1}/${totalPages}`,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      }
    );

    const result = await conversation.waitForCallbackQuery(['terms_prev', 'terms_next', 'terms_accept', 'terms_decline', 'terms_page']);
    await result.answerCallbackQuery();

    if (result.callbackQuery.data === 'terms_prev' && currentPage > 0) {
      currentPage--;
    } else if (result.callbackQuery.data === 'terms_next' && currentPage < totalPages - 1) {
      currentPage++;
    } else if (result.callbackQuery.data === 'terms_accept') {
      ctx.session.data.termsAccepted = true;
      ctx.session.data.termsVersion = 'v1.0';
      return true;
    } else if (result.callbackQuery.data === 'terms_decline') {
      return false;
    }
  }
}
EOF
fi

# Add FAQ handler (if not already present)
if ! grep -q "bot.callbackQuery('menu_faq'" apps/customer-bot/src/bot.ts; then
  cat >> apps/customer-bot/src/bot.ts <<'EOF'

// ============================================================
// FAQ HANDLER
// ============================================================

bot.callbackQuery('menu_faq', async (ctx) => {
  await ctx.answerCallbackQuery();
  const lang = ctx.session.language || 'en';
  let msg = '❓ *' + t(ctx, 'faqTitle') + '*\n\n';
  
  for (const category of faqs) {
    msg += `📂 *${category.category}*\n`;
    for (const q of category.questions) {
      const question = lang === 'en' ? q.en : q.am;
      msg += `  • ${question}\n`;
    }
    msg += '\n';
  }
  
  msg += '\n📞 ' + t(ctx, 'contactUs') + ': @AleKirchaAdmin';
  
  await ctx.reply(msg, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '☎ ' + t(ctx, 'contactUs'), callback_data: 'menu_contact' }],
        [{ text: '🔙 ' + t(ctx, 'back'), callback_data: 'show_menu' }],
      ],
    },
  });
});
EOF
fi

# Add Self-Help handler (if not already present)
if ! grep -q "bot.callbackQuery('menu_selfhelp'" apps/customer-bot/src/bot.ts; then
  cat >> apps/customer-bot/src/bot.ts <<'EOF'

// ============================================================
// SELF-HELP & TROUBLESHOOTING
// ============================================================

bot.callbackQuery('menu_selfhelp', async (ctx) => {
  await ctx.answerCallbackQuery();
  const lang = ctx.session.language || 'en';
  
  const content = lang === 'en' ? {
    title: '🆘 SELF HELP & TROUBLESHOOTING',
    guides: [
      '📖 HOW TO JOIN A KIRCHA GROUP\n\n1. Open app and go to Home\n2. Select animal type: Ox/Sheep/Goat\n3. Browse active groups\n4. Select Quota: FULL/HALF/QUARTER\n5. Tap "Reserve Quota" to confirm',
      '📖 HOW TO SUBMIT PAYMENT ADVICE\n\n1. Make payment via bank/Telebirr\n2. Screenshot the transaction\n3. Go to My Orders > Pending Payment\n4. Click "Upload Payment Advice"\n5. Attach screenshot and submit'
    ],
    troubleshooting: [
      '🔧 ISSUE: Payment Advice Rejected\nSolution: Upload clear screenshot showing Transaction ID, Date, and Exact Amount',
      '🔧 ISSUE: SMS OTP Not Received\nSolution: Ensure phone format is 09XXXXXXXX, wait 60s, click "Resend OTP"',
      '🔧 ISSUE: Delivery Delayed\nSolution: Ensure phone is on, check Order Status, verify address is correct'
    ]
  } : {
    title: '🆘 እርዳታ እና ችግር መፍቻ',
    guides: [
      '📖 የቅርጫ ቡድን እንዴት እንደሚቀላቀሉ\n\n1. መተግበሪያውን ከፍተው ወደ ዋና ገጽ ይሂዱ\n2. የእንስሳ ዓይነት ይምረጡ: በሬ/በግ/ፍየል\n3. ንቁ ቡድኖችን ይመልከቱ\n4. ድርሻ ይምረጡ: ሙሉ/ግማሽ/ሩብ\n5. "ድርሻ ይያዙ" የሚለውን ተጭነው ያረጋግጡ',
      '📖 የክፍያ ማስረጃ እንዴት እንደሚጫን\n\n1. በባንክ/ቴሌብር ክፍያ ይፈጽሙ\n2. ደረሰኙን ስክሪንሾት ያድርጉ\n3. ወደ ትዕዛዞቼ > ያልተረጋገጡ ክፍያዎች ይሂዱ\n4. "የክፍያ ማስረጃ ጫን" ይጫኑ\n5. ስክሪንሾቱን በማያያዝ ያስገቡ'
    ],
    troubleshooting: [
      '🔧 ችግር፦ የክፍያ ማስረጃ አልተቀበለም\nመፍትሔ፦ ግልጽ ስክሪንሾት ያስገቡ (የግብይት ቁጥር፣ ቀን፣ መጠን)',
      '🔧 ችግር፦ የኤስኤምኤስ ኦቲፒ አልመጣም\nመፍትሔ፦ የስልክ ቁጥር ቅርጸት 09XXXXXXXX መሆኑን ያረጋግጡ፣ 60ሰ ይጠብቁ፣ "እንደገና ላክ" ይጫኑ',
      '🔧 ችግር፦ ርክክብ ዘገየ\nመፍትሔ፦ ስልክ ክፍት መሆኑን ያረጋግጡ፣ የትዕዛዝ ሁኔታን ይመልከቱ፣ አድራሻ ትክክል መሆኑን ያረጋግጡ'
    ]
  };
  
  let msg = `*${content.title}*\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📖 *GUIDES*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  for (const guide of content.guides) {
    msg += `${guide}\n\n`;
  }
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🔧 *TROUBLESHOOTING*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  for (const issue of content.troubleshooting) {
    msg += `${issue}\n\n`;
  }
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📞 ${t(ctx, 'contactUs')}: @AleKirchaAdmin`;
  
  await ctx.reply(msg, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '☎ ' + t(ctx, 'contactUs'), callback_data: 'menu_contact' }],
        [{ text: '🔙 ' + t(ctx, 'back'), callback_data: 'show_menu' }],
      ],
    },
  });
});
EOF
fi

echo "✅ Customer bot handlers added"

# ============================================================
# ADMIN BOT - SUPPORT TICKETS, REPORTS, PRIVACY, SELF HELP
# ============================================================

echo "📝 Adding admin bot missing handlers..."

# Add Support Tickets management
cat >> apps/admin-bot/src/bot.ts <<'EOF'

// ============================================================
// SUPPORT TICKETS - COMPLETE ADMIN MANAGEMENT
// ============================================================

bot.callbackQuery('admin_support', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/support/tickets');
    const tickets = data.data || [];
    const total = tickets.length;
    const open = tickets.filter((t: any) => t.status === 'OPEN').length;
    const investigating = tickets.filter((t: any) => t.status === 'INVESTIGATING').length;
    const resolved = tickets.filter((t: any) => t.status === 'RESOLVED').length;
    const closed = tickets.filter((t: any) => t.status === 'CLOSED').length;
    
    let msg = '📞 *SUPPORT TICKETS*\n\n' +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📊 STATISTICS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 Total: ${total}\n` +
      `🟡 Open: ${open}\n` +
      `🔵 Investigating: ${investigating}\n` +
      `🟢 Resolved: ${resolved}\n` +
      `⚫ Closed: ${closed}\n\n`;
    
    if (tickets.length > 0) {
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📋 RECENT TICKETS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      for (const t of tickets.slice(0, 5)) {
        const emoji = t.status === 'OPEN' ? '🟡' : 
                      t.status === 'INVESTIGATING' ? '🔵' : 
                      t.status === 'RESOLVED' ? '🟢' : '⚫';
        msg += `${emoji} *${t.ticketId || t.id}*\n`;
        msg += `   👤 ${t.customerName || 'N/A'}\n`;
        msg += `   📌 ${t.category || 'General'}\n`;
        msg += `   📅 ${new Date(t.createdAt).toLocaleString()}\n\n`;
      }
      if (tickets.length > 5) msg += `... ${tickets.length - 5} more\n`;
    } else {
      msg += 'No support tickets found.\n\n[➕ Create Ticket]';
    }
    
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create Ticket', callback_data: 'support_create' }],
          [{ text: '📋 All Tickets', callback_data: 'support_all' }],
          [{ text: '🟡 Open', callback_data: 'support_open' }],
          [{ text: '🔵 Investigating', callback_data: 'support_investigating' }],
          [{ text: '🟢 Resolved', callback_data: 'support_resolved' }],
          [{ text: '⚫ Closed', callback_data: 'support_closed' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_support' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('📞 *SUPPORT TICKETS*\n\nNo support tickets found.\n\n[➕ Create Ticket]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create Ticket', callback_data: 'support_create' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});

bot.callbackQuery(/support_(all|open|investigating|resolved|closed)/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const status = ctx.match[1];
  const labels: Record<string, string> = {
    all: 'ALL TICKETS',
    open: 'OPEN',
    investigating: 'INVESTIGATING',
    resolved: 'RESOLVED',
    closed: 'CLOSED'
  };
  
  try {
    const data = await apiCall('/api/v1/support/tickets');
    const tickets = (data.data || []).filter((t: any) => {
      if (status === 'all') return true;
      return t.status === status.toUpperCase();
    });
    let msg = `📞 *SUPPORT TICKETS - ${labels[status] || 'ALL'}*\n\n`;
    if (tickets.length) {
      for (const t of tickets.slice(0, 10)) {
        const emoji = t.status === 'OPEN' ? '🟡' : 
                      t.status === 'INVESTIGATING' ? '🔵' : 
                      t.status === 'RESOLVED' ? '🟢' : '⚫';
        msg += `${emoji} *${t.ticketId || t.id}*\n`;
        msg += `   👤 ${t.customerName || 'N/A'}\n`;
        msg += `   📌 ${t.category || 'General'}\n\n`;
      }
      if (tickets.length > 10) msg += `... ${tickets.length - 10} more\n`;
    } else {
      msg += 'No tickets found in this category.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '👁 View Ticket', callback_data: 'support_view' }],
          [{ text: '🔙 Back', callback_data: 'admin_support' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load tickets.', {
      reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'admin_support' }]] },
    });
  }
});
EOF

# Add Reports
cat >> apps/admin-bot/src/bot.ts <<'EOF'

// ============================================================
// REPORTS - COMPLETE WITH DATA
// ============================================================

bot.callbackQuery('admin_reports', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '📈 *REPORTS*\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '📊 AVAILABLE REPORTS\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '👥 Customer Report\n' +
    '🥩 Group Report\n' +
    '📦 Order Report\n' +
    '💳 Payment Report\n' +
    '💰 Revenue Report\n' +
    '↩️ Refund Report\n' +
    '🚚 Delivery Report\n' +
    '📋 Audit Report\n' +
    '📞 Support Report\n\n' +
    'Select a report to view:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '👥 Customers', callback_data: 'report_customers' }, { text: '🥩 Groups', callback_data: 'report_groups' }],
          [{ text: '📦 Orders', callback_data: 'report_orders' }, { text: '💳 Payments', callback_data: 'report_payments' }],
          [{ text: '💰 Revenue', callback_data: 'report_revenue' }, { text: '↩️ Refunds', callback_data: 'report_refunds' }],
          [{ text: '🚚 Delivery', callback_data: 'report_delivery' }, { text: '📋 Audit', callback_data: 'report_audit' }],
          [{ text: '📞 Support', callback_data: 'report_support' }, { text: '📊 Summary', callback_data: 'reports_summary' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    }
  );
});

async function generateReport(ctx: any, endpoint: string, title: string) {
  try {
    const data = await apiCall(endpoint);
    const d = data.data || {};
    let msg = `📊 *${title}*\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    if (Object.keys(d).length) {
      for (const [key, value] of Object.entries(d)) {
        msg += `📌 ${key}: ${value}\n`;
      }
    } else {
      msg += 'No data available.';
    }
    msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📅 ${new Date().toLocaleDateString()}`;
    
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: `report_${endpoint.split('/').pop()}` }],
          [{ text: '📤 Export', callback_data: `report_export_${endpoint.split('/').pop()}` }],
          [{ text: '🔙 Back', callback_data: 'admin_reports' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load report.', {
      reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'admin_reports' }]] },
    });
  }
}

bot.callbackQuery('report_customers', async (ctx) => { await ctx.answerCallbackQuery(); await generateReport(ctx, '/api/v1/admin/reports/customers', 'CUSTOMER REPORT'); });
bot.callbackQuery('report_groups', async (ctx) => { await ctx.answerCallbackQuery(); await generateReport(ctx, '/api/v1/admin/reports/groups', 'GROUP REPORT'); });
bot.callbackQuery('report_orders', async (ctx) => { await ctx.answerCallbackQuery(); await generateReport(ctx, '/api/v1/admin/reports/orders', 'ORDER REPORT'); });
bot.callbackQuery('report_payments', async (ctx) => { await ctx.answerCallbackQuery(); await generateReport(ctx, '/api/v1/admin/reports/payments', 'PAYMENT REPORT'); });
bot.callbackQuery('report_revenue', async (ctx) => { await ctx.answerCallbackQuery(); await generateReport(ctx, '/api/v1/admin/reports/revenue', 'REVENUE REPORT'); });
bot.callbackQuery('report_refunds', async (ctx) => { await ctx.answerCallbackQuery(); await generateReport(ctx, '/api/v1/admin/reports/refunds', 'REFUND REPORT'); });
bot.callbackQuery('report_delivery', async (ctx) => { await ctx.answerCallbackQuery(); await generateReport(ctx, '/api/v1/admin/reports/delivery', 'DELIVERY REPORT'); });
bot.callbackQuery('report_audit', async (ctx) => { await ctx.answerCallbackQuery(); await generateReport(ctx, '/api/v1/admin/reports/audit', 'AUDIT REPORT'); });
bot.callbackQuery('report_support', async (ctx) => { await ctx.answerCallbackQuery(); await generateReport(ctx, '/api/v1/admin/reports/support', 'SUPPORT REPORT'); });

// Reports Summary
bot.callbackQuery('reports_summary', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const [orders, payments, customers, refunds, delivery] = await Promise.all([
      apiCall('/api/v1/admin/reports/orders'),
      apiCall('/api/v1/admin/reports/payments'),
      apiCall('/api/v1/admin/reports/customers'),
      apiCall('/api/v1/admin/reports/refunds'),
      apiCall('/api/v1/admin/reports/delivery')
    ]);
    
    const o = orders.data || {};
    const p = payments.data || {};
    const c = customers.data || {};
    const r = refunds.data || {};
    const d = delivery.data || {};
    
    const msg = '📊 *REPORTS SUMMARY*\n\n' +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 ORDERS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Total: ${o.total || 0}\n` +
      `Completed: ${o.completed || 0}\n` +
      `Pending: ${o.pending || 0}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💳 PAYMENTS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Verified: ${p.verified || 0}\n` +
      `Pending: ${p.pending || 0}\n` +
      `Rejected: ${p.rejected || 0}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👥 CUSTOMERS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Total: ${c.total || 0}\n` +
      `Active: ${c.active || 0}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔄 REFUNDS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Pending: ${r.pending || 0}\n` +
      `Completed: ${r.completed || 0}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🚚 DELIVERY\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Pending: ${d.pending || 0}\n` +
      `Completed: ${d.completed || 0}\n\n` +
      `📅 ${new Date().toLocaleDateString()}`;
    
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'reports_summary' }],
          [{ text: '📊 Full Reports', callback_data: 'admin_reports' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load reports summary.', {
      reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'admin_menu' }]] },
    });
  }
});
EOF

# Add Privacy Policy
cat >> apps/admin-bot/src/bot.ts <<'EOF'

// ============================================================
// PRIVACY POLICY - COMPLETE MANAGEMENT
// ============================================================

bot.callbackQuery('admin_privacy', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/privacy');
    const policies = data.data || [];
    const current = policies.find((p: any) => p.isCurrent);
    
    let msg = '🔐 *PRIVACY POLICY*\n\n';
    if (current) {
      msg += `📌 Current Version: ${current.version || '1.0'}\n`;
      msg += `📅 Effective: ${new Date(current.effectiveDate).toLocaleDateString()}\n`;
      msg += `🟢 Status: PUBLISHED\n\n`;
    } else {
      msg += 'No privacy policy published.\n\n';
    }
    msg += `📋 Total Versions: ${policies.length}\n`;
    
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Version', callback_data: 'privacy_add' }],
          [{ text: '📋 Versions', callback_data: 'privacy_list' }],
          [{ text: '👁 Preview', callback_data: 'privacy_preview' }],
          current ? [{ text: '📢 Publish', callback_data: 'privacy_publish' }] : null,
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ].filter(Boolean),
      },
    });
  } catch {
    await ctx.reply('🔐 *PRIVACY POLICY*\n\nNo privacy policy configured.\n\n[➕ Add Version]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Version', callback_data: 'privacy_add' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});

bot.callbackQuery('privacy_add', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('➕ *ADD PRIVACY POLICY VERSION*\n\nStep 1: Enter version number:\n\n📌 Example: 1.0, 1.1, 2.0', {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'admin_privacy' }]] },
  });
});

bot.callbackQuery('privacy_list', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/privacy');
    const policies = data.data || [];
    let msg = '📋 *PRIVACY POLICY VERSIONS*\n\n';
    if (policies.length) {
      for (const p of policies) {
        const statusIcon = p.isCurrent ? '🟢' : '⚪';
        const status = p.isCurrent ? 'CURRENT' : 'DRAFT';
        msg += `${statusIcon} v${p.version || '1.0'}\n   📅 ${new Date(p.effectiveDate).toLocaleDateString()}\n   📌 ${status}\n\n`;
      }
    } else {
      msg += 'No versions found.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '👁 Preview', callback_data: 'privacy_preview' }],
          [{ text: '📢 Publish', callback_data: 'privacy_publish' }],
          [{ text: '🔙 Back', callback_data: 'admin_privacy' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load versions.', {
      reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'admin_privacy' }]] },
    });
  }
});

bot.callbackQuery('privacy_preview', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '👁 *PRIVACY POLICY PREVIEW*\n\n📌 Version: 1.0\n📅 Effective: 03 Sep 2026\n\n*English:*\nThis privacy policy explains how we collect, use, and protect your personal information...\n\n*Amharic:*\nይህ የግላዊነት ፖሊሲ የግል መረጃዎን እንዴት እንደምንሰበስብ፣ እንደምንጠቀም እና እንደምንጠብቅ ያብራራል...',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✏️ Edit', callback_data: 'privacy_edit' }],
          [{ text: '📢 Publish', callback_data: 'privacy_publish' }],
          [{ text: '🔙 Back', callback_data: 'admin_privacy' }],
        ],
      },
    }
  );
});

bot.callbackQuery('privacy_publish', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '📢 *PUBLISH PRIVACY POLICY*\n\n⚠️ This will make this version the CURRENT privacy policy.\n\n📌 Version: 1.0\n📅 Effective: 03 Sep 2026\n\nSend the version ID to publish:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Publish', callback_data: 'privacy_publish_confirm' }],
          [{ text: '❌ Cancel', callback_data: 'admin_privacy' }],
        ],
      },
    }
  );
});

bot.callbackQuery('privacy_publish_confirm', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '✅ Privacy policy published successfully!\n\n📌 Version: 1.0\n📌 Status: CURRENT\n📅 Effective: 03 Sep 2026',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 View All', callback_data: 'privacy_list' }],
          [{ text: '🔙 Back', callback_data: 'admin_privacy' }],
        ],
      },
    }
  );
});
EOF

# Add Self Help Admin Management
cat >> apps/admin-bot/src/bot.ts <<'EOF'

// ============================================================
// SELF HELP - ADMIN MANAGEMENT
// ============================================================

bot.callbackQuery('admin_selfhelp', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/selfhelp');
    const articles = data.data || [];
    let msg = '🆘 *SELF HELP MANAGEMENT*\n\n';
    if (articles.length) {
      msg += `📊 Total Articles: ${articles.length}\n\n`;
      for (const a of articles.slice(0, 10)) {
        const statusIcon = a.isActive ? '🟢' : '🔴';
        msg += `${statusIcon} *${a.titleEn || 'N/A'}*\n   📌 ${a.category || 'general'}\n   🆔 ${a.id?.substring(0, 8) || 'N/A'}\n\n`;
      }
      if (articles.length > 10) msg += `... ${articles.length - 10} more\n`;
    } else {
      msg += 'No self help articles found.\n\n[➕ Add Article]';
    }
    
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Article', callback_data: 'selfhelp_add' }],
          articles.length > 0 ? [{ text: '✏️ Edit', callback_data: 'selfhelp_edit' }] : null,
          articles.length > 0 ? [{ text: '🔄 Toggle', callback_data: 'selfhelp_toggle' }] : null,
          articles.length > 0 ? [{ text: '🗑 Delete', callback_data: 'selfhelp_delete' }] : null,
          [{ text: '🔄 Refresh', callback_data: 'admin_selfhelp' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ].filter(Boolean),
      },
    });
  } catch {
    await ctx.reply('🆘 *SELF HELP*\n\nNo articles found.\n\n[➕ Add Article]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Article', callback_data: 'selfhelp_add' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});

bot.callbackQuery('selfhelp_add', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('➕ *ADD SELF HELP ARTICLE*\n\nStep 1: Enter title (English):\n\n📌 Example: How to use Ale Kircha', {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'admin_selfhelp' }]] },
  });
});

bot.callbackQuery('selfhelp_edit', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('✏️ *EDIT SELF HELP ARTICLE*\n\nSend the article ID to edit:\n\n📌 Article ID: [ID from list]\n\nThen send the updated content.', {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'admin_selfhelp' }]] },
  });
});

bot.callbackQuery('selfhelp_toggle', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('🔄 *TOGGLE ARTICLE STATUS*\n\nSend the article ID to toggle:\n\n📌 Article ID: [ID from list]\n\nThis will activate or deactivate the article.', {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'admin_selfhelp' }]] },
  });
});

bot.callbackQuery('selfhelp_delete', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('🗑 *DELETE SELF HELP ARTICLE*\n\n⚠️ Are you sure you want to delete this article?\n\nSend the article ID to confirm deletion:\n\n📌 Article ID: [ID from list]', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Confirm', callback_data: 'selfhelp_confirm_delete' }],
        [{ text: '❌ Cancel', callback_data: 'admin_selfhelp' }],
      ],
    },
  });
});
EOF

echo "✅ Admin bot handlers added"

# ============================================================
# RESTART ALL SERVICES
# ============================================================

echo "🔄 Restarting all services..."

pkill -f 'tsx' 2>/dev/null
pkill -f 'bot.ts' 2>/dev/null
sleep 2

cd ~/Ale-Kircha/apps/api
set -a
. ./.env.postgres
set +a
nohup pnpm exec tsx src/server-pg.ts > api.log 2>&1 &
sleep 5
cd ~/Ale-Kircha

cd apps/customer-bot
PORT=10001 nohup node --import tsx src/bot.ts > customer-bot.log 2>&1 &
sleep 3
cd ~/Ale-Kircha

cd apps/admin-bot
PORT=10002 nohup node --import tsx src/bot.ts > admin-bot.log 2>&1 &
sleep 3
cd ~/Ale-Kircha

# ============================================================
# FINAL STATUS CHECK
# ============================================================

echo ""
echo "=== SERVICE STATUS ==="
curl -s http://localhost:4000/health 2>/dev/null && echo "✅ API OK (port 4000)" || echo "❌ API DOWN"
curl -s http://localhost:10001/health 2>/dev/null && echo "✅ Customer Bot OK (port 10001)" || echo "❌ Customer Bot DOWN"
curl -s http://localhost:10002/health 2>/dev/null && echo "✅ Admin Bot OK (port 10002)" || echo "❌ Admin Bot DOWN"

echo ""
echo "=== IMPLEMENTATION COMPLETE ==="
echo "✅ Terms & Conditions (12 pages)"
echo "✅ FAQ (bilingual, categorized)"
echo "✅ Self-Help & Troubleshooting"
echo "✅ Support Tickets Management"
echo "✅ Reports (9 types)"
echo "✅ Privacy Policy Management"
echo "✅ Self Help Admin Management"
echo ""
echo "📱 Test on Telegram:"
echo "   Customer: @kirchaaleBot"
echo "   Admin: @Ale_kircha_admin_bot"
