import { Telegraf, Markup } from 'telegraf';

// ============================================================
// CUSTOMER BOT - ALE KIRCHA (አሌ ቅርጫ)
// ============================================================

const token = process.env.CUSTOMER_BOT_TOKEN;
if (!token || token === 'YOUR_CUSTOMER_BOT_TOKEN_HERE') {
  console.log('⚠️ CUSTOMER_BOT_TOKEN not configured. Customer Bot will not start.');
  process.exit(0);
}

const bot = new Telegraf(token);

// ============================================================
// HANDLE OLD QUERIES GRACEFULLY
// ============================================================

bot.catch((err, ctx) => {
  if (err.message && err.message.includes('query is too old')) {
    // Ignore old query errors silently
    return;
  }
  console.error('Bot error:', err);
});

// ============================================================
// START COMMAND - WELCOME SCREEN
// ============================================================

bot.start(async (ctx) => {
  await ctx.replyWithMarkdown(
    `🥩 *አሌ ቅርጫ | ALE KIRCHA*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *አሌ ቅርጫ ምንድን ነው?*
   *WHAT IS ALE KIRCHA?*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

አሌ ቅርጫ ደንበኞች በተደራጀ የባህላዊ የኢትዮጵያ የስጋ መጋሪያ ቡድኖች ውስጥ እንዲሳተፉ የሚያስችል ዲጂታል መድረክ ነው።

Ale Kircha is a digital platform where you can order Kircha, pay and have it delivered to your doorstep.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 *ባህሪያት | FEATURES*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ የቅርጫ ቡድኖችን ይቀላቀሉ | Join Kircha Groups
✅ ትዕዛዝ ያስገቡ | Place Orders
✅ ክፍያ ይፈጽሙ | Make Payments
✅ ትዕዛዞችዎን ይከታተሉ | Track Orders
✅ ተመላሽ ገንዘብ ይጠይቁ | Request Refunds
✅ 24/7 ድጋፍ | 24/7 Support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 *ቋንቋዎን ይምረጡ | SELECT LANGUAGE*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ለመቀጠል ተመራጭ ቋንቋዎን ይምረጡ።

Please select your preferred language to continue.`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🇬🇧 English', 'lang_en')],
      [Markup.button.callback('🇪🇹 አማርኛ', 'lang_am')],
    ])
  );
});

// ============================================================
// LANGUAGE SELECTION
// ============================================================

bot.action('lang_en', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    ctx.session = ctx.session || {};
    ctx.session.language = 'en';
    
    await ctx.reply(
      '✅ Preferred language "English" has been selected.\n\nClick the proceed button below to continue registration.',
      Markup.inlineKeyboard([
        [Markup.button.callback('📝 Proceed to Register', 'register_start')],
      ])
    );
  } catch (err) {
    if (err.message && err.message.includes('query is too old')) {
      return;
    }
    throw err;
  }
});

bot.action('lang_am', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    ctx.session = ctx.session || {};
    ctx.session.language = 'am';
    
    await ctx.reply(
      '✅ ተመራጭ ቋንቋ "አማርኛ" ተመርጧል።\n\nምዝገባዎን ለመቀጠል ከታች ያለውን ቁልፍ ይጫኑ።',
      Markup.inlineKeyboard([
        [Markup.button.callback('📝 ቀጥል', 'register_start')],
      ])
    );
  } catch (err) {
    if (err.message && err.message.includes('query is too old')) {
      return;
    }
    throw err;
  }
});

// ============================================================
// REGISTER START - SHARE PHONE NUMBER
// ============================================================

bot.action('register_start', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    await ctx.reply(
      '📱 Please share your phone number to continue.\n\nYour phone number is used for:\n• Account verification\n• Order notifications\n• Delivery coordination\n\n🔒 Your number is secure and will not be shared.',
      Markup.keyboard([
        [Markup.button.contactRequest('📱 Share Phone Number')],
      ]).resize().oneTime()
    );
  } catch (err) {
    if (err.message && err.message.includes('query is too old')) {
      return;
    }
    throw err;
  }
});

// ============================================================
// CONTACT RECEIVED - CHECK EXISTING USER
// ============================================================

bot.on('contact', async (ctx) => {
  const contact = ctx.message.contact;
  const telegramId = ctx.from?.id;
  const firstName = ctx.from?.first_name || 'User';
  
  if (!contact || !telegramId) {
    await ctx.reply('❌ Something went wrong. Please try again.');
    return;
  }

  // Check if user exists via API
  try {
    const response = await fetch('http://localhost:4000/api/v1/customers/me', {
      headers: { 'x-telegram-id': String(telegramId) }
    });
    const data = await response.json();
    
    if (data.success && data.data) {
      // Existing user - Welcome Back
      await ctx.replyWithMarkdown(
        `✅ *WELCOME BACK ${firstName}!*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
We found your account. You can now access your dashboard.

👤 *Account:* ${data.data.customerCode || 'N/A'}
📅 *Registered:* ${data.data.createdAt ? new Date(data.data.createdAt).toLocaleDateString() : 'N/A'}
🔵 *Status:* ${data.data.status || 'ACTIVE'}

📊 *Quick Summary:*
📦 Orders: ${data.data.orderCount || 0}
✅ Completed: ${data.data.completedOrders || 0}
↩️ Refunds: ${data.data.refundCount || 0}`,
        Markup.inlineKeyboard([
          [Markup.button.callback('🏠 Continue to Dashboard', 'menu_main')],
        ])
      );
      
      // Remove keyboard
      await ctx.reply('📱', Markup.removeKeyboard());
      return;
    }
  } catch (error) {
    // User doesn't exist, continue registration
  }

  // New user - show registration form
  await ctx.reply(
    `📝 *Complete Your Registration*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please provide the following details:

1. Full Name: *
2. Phone Number: * (${contact.phone_number})
3. Address: (Optional)

ℹ️ This information helps us serve you better.

Type your full name to continue:`,
    Markup.removeKeyboard()
  );
  
  // Store phone number for later
  ctx.session = ctx.session || {};
  ctx.session.phone = contact.phone_number;
});

// ============================================================
// HANDLE TEXT INPUT - REGISTRATION
// ============================================================

bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  // Skip commands
  if (text.startsWith('/')) return;
  
  // Check if we're in registration flow
  if (ctx.session && ctx.session.phone && !ctx.session.fullName) {
    // This is the full name
    ctx.session.fullName = text;
    
    // Show Terms & Conditions
    await ctx.reply(
      '📜 *TERMS & CONDITIONS*\n\nPlease review and accept our terms to continue.\n\n[Terms content will be displayed here with pagination]',
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Accept Terms', 'terms_accept')],
        [Markup.button.callback('❌ Decline', 'terms_decline')],
      ])
    );
  }
});

// ============================================================
// TERMS ACCEPTANCE
// ============================================================

bot.action('terms_accept', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    // Save user to database
    const telegramId = ctx.from?.id;
    const firstName = ctx.from?.first_name || 'User';
    const phone = ctx.session?.phone || '';
    const fullName = ctx.session?.fullName || firstName;
    
    try {
      const response = await fetch('http://localhost:4000/api/v1/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: String(telegramId),
          username: ctx.from?.username || '',
          firstName: firstName,
          fullName: fullName,
          phone: phone,
          language: ctx.session?.language || 'en',
          termsAccepted: true
        })
      });
      const data = await response.json();
      
      if (data.success) {
        await ctx.replyWithMarkdown(
          `🎉 *REGISTRATION COMPLETE!*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your account has been successfully created.

👤 *Your Details:*
Customer ID: ${data.data.customer?.customerCode || 'N/A'}
Name: ${fullName}
Phone: ${phone}
Language: ${ctx.session?.language === 'am' ? 'አማርኛ' : 'English'}

📋 *What's Next?*
• Browse available Kircha groups
• Join a group and place an order
• Track your orders and payments

🚀 Get Started!`,
          Markup.inlineKeyboard([
            [Markup.button.callback('🏠 Go to Dashboard', 'menu_main')],
          ])
        );
      }
    } catch (error) {
      await ctx.reply('❌ Registration failed. Please try again.');
    }
  } catch (err) {
    if (err.message && err.message.includes('query is too old')) {
      return;
    }
    throw err;
  }
});

bot.action('terms_decline', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.reply('❌ You declined the terms. Registration cannot be completed.\n\nYou can restart with /start when you\'re ready.');
  } catch (err) {
    if (err.message && err.message.includes('query is too old')) {
      return;
    }
    throw err;
  }
});

// ============================================================
// MAIN MENU
// ============================================================

bot.action('menu_main', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.reply(
      '🏠 *MAIN MENU*\n\n[🥩 Available Kircha]\n[👥 My Groups]\n[🛒 My Orders]\n[💳 Payments]\n[↩ Refunds]\n[📜 Terms & Conditions]\n[❓ FAQ]\n[🆘 Help]\n[☎ Contact Us]\n[👤 My Profile]',
      Markup.inlineKeyboard([
        [Markup.button.callback('🥩 Available Kircha', 'menu_groups')],
        [Markup.button.callback('👥 My Groups', 'menu_my_groups')],
        [Markup.button.callback('🛒 My Orders', 'menu_orders')],
        [Markup.button.callback('💳 Payments', 'menu_payments')],
        [Markup.button.callback('↩ Refunds', 'menu_refunds')],
        [Markup.button.callback('📜 Terms & Conditions', 'menu_terms')],
        [Markup.button.callback('❓ FAQ', 'menu_faq')],
        [Markup.button.callback('🆘 Help', 'menu_help')],
        [Markup.button.callback('☎ Contact Us', 'menu_contact')],
        [Markup.button.callback('👤 My Profile', 'menu_profile')],
      ])
    );
  } catch (err) {
    if (err.message && err.message.includes('query is too old')) {
      return;
    }
    throw err;
  }
});

// ============================================================
// MENU ACTIONS (Placeholders)
// ============================================================

const menuActions = ['menu_groups', 'menu_my_groups', 'menu_orders', 'menu_payments', 'menu_refunds', 'menu_terms', 'menu_faq', 'menu_help', 'menu_contact', 'menu_profile'];

menuActions.forEach(action => {
  bot.action(action, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await ctx.reply(`📋 ${action.replace('menu_', '').toUpperCase()}\n\nThis feature is coming soon!`, Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Back to Menu', 'menu_main')],
      ]));
    } catch (err) {
      if (err.message && err.message.includes('query is too old')) {
        return;
      }
      throw err;
    }
  });
});

// ============================================================
// HELP COMMAND
// ============================================================

bot.command('help', async (ctx) => {
  await ctx.reply(
    '🆘 *HELP CENTER*\n\nCommands:\n/start - Start the bot\n/menu - Show main menu\n/help - Show this help\n/language - Change language\n\nFor support, use the Contact Us menu option.'
  );
});

// ============================================================
// LANGUAGE COMMAND
// ============================================================

bot.command('language', async (ctx) => {
  await ctx.reply(
    '🌐 *SELECT LANGUAGE*\n\n[🇬🇧 English] [🇪🇹 አማርኛ]',
    Markup.inlineKeyboard([
      [Markup.button.callback('🇬🇧 English', 'lang_en')],
      [Markup.button.callback('🇪🇹 አማርኛ', 'lang_am')],
    ])
  );
});

// ============================================================
// START BOT
// ============================================================

console.log('🤖 Customer Bot starting...');

bot.launch()
  .then(() => {
    console.log('✅ Customer Bot started successfully!');
    console.log(`   Bot username: @${bot.botInfo?.username || 'kirchaaleBot'}`);
  })
  .catch((err) => {
    console.error('❌ Failed to start Customer Bot:', err.message);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export { bot };
