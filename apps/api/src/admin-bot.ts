import { Telegraf, Markup } from 'telegraf';

// ============================================================
// ADMIN BOT
// ============================================================

const token = process.env.ADMIN_BOT_TOKEN;
if (!token || token === 'YOUR_ADMIN_BOT_TOKEN_HERE') {
  console.log('⚠️ ADMIN_BOT_TOKEN not configured. Admin Bot will not start.');
  process.exit(0);
}

const bot = new Telegraf(token);

// ============================================================
// START COMMAND
// ============================================================

bot.start(async (ctx) => {
  const adminId = ctx.from?.id;
  
  // Check if this user is an admin
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim());
  
  if (!adminId || !adminIds.includes(String(adminId))) {
    await ctx.reply('⛔ Unauthorized. You are not an admin.');
    return;
  }
  
  await ctx.reply(
    '🏠 ADMIN MAIN MENU\n\n[📊 Dashboard]\n[👥 Customers]\n[🥩 Groups]\n[📦 Orders]\n[💳 Payments]\n[🔄 Refunds]\n[🚚 Delivery]\n[💵 Fees]\n[🏦 Banks]\n[🔔 Notifications]\n[❓ FAQ]\n[📜 Terms]\n[ℹ️ About]\n[⚙️ Settings]\n[👤 Admin Users]\n[📋 Audit Log]\n[📈 Reports]\n[📞 Support]',
    Markup.inlineKeyboard([
      [Markup.button.callback('📊 Dashboard', 'admin_dashboard')],
      [Markup.button.callback('👥 Customers', 'admin_customers')],
      [Markup.button.callback('🥩 Groups', 'admin_groups')],
      [Markup.button.callback('📦 Orders', 'admin_orders')],
      [Markup.button.callback('💳 Payments', 'admin_payments')],
      [Markup.button.callback('🔄 Refunds', 'admin_refunds')],
      [Markup.button.callback('🚚 Delivery', 'admin_delivery')],
      [Markup.button.callback('💵 Fees', 'admin_fees')],
      [Markup.button.callback('🏦 Banks', 'admin_banks')],
      [Markup.button.callback('🔔 Notifications', 'admin_notifications')],
      [Markup.button.callback('❓ FAQ', 'admin_faq')],
      [Markup.button.callback('📜 Terms', 'admin_terms')],
      [Markup.button.callback('ℹ️ About', 'admin_about')],
      [Markup.button.callback('⚙️ Settings', 'admin_settings')],
      [Markup.button.callback('📈 Reports', 'admin_reports')],
    ])
  );
});

// ============================================================
// ADMIN DASHBOARD
// ============================================================

bot.action('admin_dashboard', async (ctx) => {
  await ctx.answerCbQuery();
  
  await ctx.reply(
    '📊 DASHBOARD\n\n👥 Users: 0\n🥩 Groups: 0\n📦 Orders: 0\n💳 Payments: 0\n💰 Revenue: 0 ETB\n🔄 Refunds: 0\n\n📅 ' + new Date().toLocaleDateString(),
    Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Refresh', 'admin_dashboard')],
      [Markup.button.callback('🔙 Back', 'admin_back')],
      [Markup.button.callback('🏠 Main Menu', 'admin_main')],
    ])
  );
});

// ============================================================
// ADMIN CUSTOMERS
// ============================================================

bot.action('admin_customers', async (ctx) => {
  await ctx.answerCbQuery();
  
  await ctx.reply(
    '👥 CUSTOMERS\n\nNo customers found.',
    Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Refresh', 'admin_customers')],
      [Markup.button.callback('🔎 Search', 'admin_customers_search')],
      [Markup.button.callback('🔙 Back', 'admin_back')],
      [Markup.button.callback('🏠 Main Menu', 'admin_main')],
    ])
  );
});

// ============================================================
// ADMIN GROUPS
// ============================================================

bot.action('admin_groups', async (ctx) => {
  await ctx.answerCbQuery();
  
  await ctx.reply(
    '🥩 GROUPS\n\nNo groups found.',
    Markup.inlineKeyboard([
      [Markup.button.callback('➕ Create Group', 'admin_group_create')],
      [Markup.button.callback('🔄 Refresh', 'admin_groups')],
      [Markup.button.callback('📋 Pending Requests', 'admin_groups_pending')],
      [Markup.button.callback('🔙 Back', 'admin_back')],
      [Markup.button.callback('🏠 Main Menu', 'admin_main')],
    ])
  );
});

// ============================================================
// ADMIN FEES
// ============================================================

bot.action('admin_fees', async (ctx) => {
  await ctx.answerCbQuery();
  
  await ctx.reply(
    '💵 FEES & CHARGES\n\nNo fees configured.',
    Markup.inlineKeyboard([
      [Markup.button.callback('➕ Add Fee', 'admin_fee_add')],
      [Markup.button.callback('🔙 Back', 'admin_back')],
      [Markup.button.callback('🏠 Main Menu', 'admin_main')],
    ])
  );
});

// ============================================================
// ADMIN BANKS
// ============================================================

bot.action('admin_banks', async (ctx) => {
  await ctx.answerCbQuery();
  
  await ctx.reply(
    '🏦 BANK ACCOUNTS\n\nNo bank accounts configured.',
    Markup.inlineKeyboard([
      [Markup.button.callback('➕ Add Bank Account', 'admin_bank_add')],
      [Markup.button.callback('🔙 Back', 'admin_back')],
      [Markup.button.callback('🏠 Main Menu', 'admin_main')],
    ])
  );
});

// ============================================================
// ADMIN NOTIFICATIONS
// ============================================================

bot.action('admin_notifications', async (ctx) => {
  await ctx.answerCbQuery();
  
  await ctx.reply(
    '🔔 NOTIFICATIONS\n\nNo new notifications.',
    Markup.inlineKeyboard([
      [Markup.button.callback('📢 Send Notification', 'admin_notification_send')],
      [Markup.button.callback('📋 History', 'admin_notification_history')],
      [Markup.button.callback('🔄 Refresh', 'admin_notifications')],
      [Markup.button.callback('🔙 Back', 'admin_back')],
      [Markup.button.callback('🏠 Main Menu', 'admin_main')],
    ])
  );
});

// ============================================================
// ADMIN FAQ
// ============================================================

bot.action('admin_faq', async (ctx) => {
  await ctx.answerCbQuery();
  
  await ctx.reply(
    '❓ FAQ MANAGEMENT\n\nNo FAQs found.',
    Markup.inlineKeyboard([
      [Markup.button.callback('➕ Add FAQ', 'admin_faq_add')],
      [Markup.button.callback('🔙 Back', 'admin_back')],
      [Markup.button.callback('🏠 Main Menu', 'admin_main')],
    ])
  );
});

// ============================================================
// ADMIN TERMS
// ============================================================

bot.action('admin_terms', async (ctx) => {
  await ctx.answerCbQuery();
  
  await ctx.reply(
    '📜 TERMS MANAGEMENT\n\nNo terms found.',
    Markup.inlineKeyboard([
      [Markup.button.callback('➕ Add Terms Version', 'admin_terms_add')],
      [Markup.button.callback('🔙 Back', 'admin_back')],
      [Markup.button.callback('🏠 Main Menu', 'admin_main')],
    ])
  );
});

// ============================================================
// ADMIN ABOUT
// ============================================================

bot.action('admin_about', async (ctx) => {
  await ctx.answerCbQuery();
  
  await ctx.reply(
    'ℹ️ ABOUT US\n\n📌 Ale Kircha\nAle Kircha - Digital meat sharing platform\n\n[✏️ Edit About]',
    Markup.inlineKeyboard([
      [Markup.button.callback('✏️ Edit About', 'admin_about_edit')],
      [Markup.button.callback('🔙 Back', 'admin_back')],
      [Markup.button.callback('🏠 Main Menu', 'admin_main')],
    ])
  );
});

// ============================================================
// ADMIN SETTINGS
// ============================================================

bot.action('admin_settings', async (ctx) => {
  await ctx.answerCbQuery();
  
  await ctx.reply(
    '⚙️ SETTINGS\n\nSelect a category to configure:\n\n[🏢 General]\n[🌐 Language]\n[💰 Currency]\n[🧾 Order Settings]\n[💳 Payment Settings]\n[🚚 Delivery Settings]\n[🔔 Notification Settings]\n[⏱️ System Timing]\n[📞 Contact/Support]',
    Markup.inlineKeyboard([
      [Markup.button.callback('🏢 General', 'admin_settings_general')],
      [Markup.button.callback('💳 Payment', 'admin_settings_payment')],
      [Markup.button.callback('🔔 Notifications', 'admin_settings_notifications')],
      [Markup.button.callback('🔙 Back', 'admin_back')],
      [Markup.button.callback('🏠 Main Menu', 'admin_main')],
    ])
  );
});

// ============================================================
// ADMIN REPORTS
// ============================================================

bot.action('admin_reports', async (ctx) => {
  await ctx.answerCbQuery();
  
  await ctx.reply(
    '📈 REPORTS\n\nSelect a report:\n\n[👥 Customer Report]\n[🥩 Group Report]\n[📦 Order Report]\n[💳 Payment Report]\n[💰 Revenue Report]\n[↩ Refund Report]\n[🚚 Delivery Report]\n[📋 Audit Report]\n[📞 Support Report]',
    Markup.inlineKeyboard([
      [Markup.button.callback('👥 Customers', 'admin_report_customers')],
      [Markup.button.callback('📦 Orders', 'admin_report_orders')],
      [Markup.button.callback('💰 Revenue', 'admin_report_revenue')],
      [Markup.button.callback('🔙 Back', 'admin_back')],
      [Markup.button.callback('🏠 Main Menu', 'admin_main')],
    ])
  );
});

// ============================================================
// BACK AND MAIN MENU
// ============================================================

bot.action('admin_back', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('🔙 Going back...');
});

bot.action('admin_main', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
  await bot.start(ctx);
});

// ============================================================
// HELP COMMAND
// ============================================================

bot.command('help', async (ctx) => {
  await ctx.reply(
    '🆘 ADMIN HELP\n\nCommands:\n/start - Show admin menu\n/help - Show this help\n/stats - Show quick stats\n\nFor support, contact the system administrator.'
  );
});

// ============================================================
// STATS COMMAND
// ============================================================

bot.command('stats', async (ctx) => {
  await ctx.reply(
    '📊 QUICK STATS\n\n👥 Users: 0\n🥩 Groups: 0\n📦 Orders: 0\n💳 Payments: 0\n💰 Revenue: 0 ETB'
  );
});

// ============================================================
// START BOT
// ============================================================

console.log('🤖 Admin Bot starting...');

bot.launch()
  .then(() => {
    console.log('✅ Admin Bot started successfully!');
    console.log(`   Bot username: @${bot.botInfo?.username || 'unknown'}`);
  })
  .catch((err) => {
    console.error('❌ Failed to start Admin Bot:', err.message);
    process.exit(1);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export { bot };
