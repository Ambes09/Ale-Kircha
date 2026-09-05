import os

content = '''import { Bot } from 'grammy';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const BOT_TOKEN = process.env.ADMIN_BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim());
const PORT = parseInt(process.env.PORT || '10002');

if (!BOT_TOKEN) {
  console.error('❌ ADMIN_BOT_TOKEN is required!');
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

// ============================================================
// ADMIN AUTH
// ============================================================

bot.use(async (ctx, next) => {
  const userId = ctx.from?.id?.toString();
  if (!userId) {
    await ctx.reply('🔐 Access denied.');
    return;
  }
  if (!ADMIN_IDS.includes(userId)) {
    await ctx.reply('🔐 Access denied. You are not authorized.');
    return;
  }
  await next();
});

// ============================================================
// HELPERS
// ============================================================

async function apiCall(endpoint: string) {
  const API_URL = process.env.API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${API_URL}${endpoint}`);
    return await res.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()} ETB`;
}

// ============================================================
// MAIN MENU
// ============================================================

async function showMainMenu(ctx: any) {
  const menuText = '🏗️ *ALE KIRCHA ADMIN*\\n\\nSelect option:';
  const menuKeyboard = {
    inline_keyboard: [
      [{ text: '📊 Dashboard', callback_data: 'admin_dashboard' }, { text: '👥 Users', callback_data: 'admin_customers' }],
      [{ text: '🥩 Groups', callback_data: 'admin_groups' }, { text: '📦 Orders', callback_data: 'admin_orders' }],
      [{ text: '💳 Payments', callback_data: 'admin_payments' }, { text: '🔄 Refunds', callback_data: 'admin_refunds' }],
      [{ text: '🚚 Delivery', callback_data: 'admin_delivery' }, { text: '📈 Reports', callback_data: 'admin_reports' }],
      [{ text: '💵 Fees', callback_data: 'admin_fees' }, { text: '⚙️ Settings', callback_data: 'admin_settings' }],
      [{ text: '👤 Admins', callback_data: 'admin_users' }, { text: '📋 Audit', callback_data: 'admin_audit' }],
      [{ text: '📞 Support', callback_data: 'admin_support' }, { text: '❓ FAQ', callback_data: 'admin_faq' }],
      [{ text: '📜 Terms', callback_data: 'admin_terms' }, { text: 'ℹ️ About', callback_data: 'admin_about' }],
      [{ text: '🔔 Notifications', callback_data: 'admin_notifications' }, { text: '🏦 Banks', callback_data: 'admin_banks' }],
      [{ text: '🌐 Language', callback_data: 'admin_language' }],
    ],
  };

  try {
    await ctx.reply(menuText, { parse_mode: 'Markdown', reply_markup: menuKeyboard });
  } catch {
    await ctx.reply('❌ Failed to load menu.');
  }
}

bot.command('start', async (ctx) => { await showMainMenu(ctx); });
bot.command('menu', async (ctx) => { await showMainMenu(ctx); });

// ============================================================
// BACK TO MENU
// ============================================================

bot.callbackQuery('admin_menu', async (ctx) => {
  await ctx.answerCallbackQuery();
  await showMainMenu(ctx);
});

// ============================================================
// DASHBOARD
// ============================================================

bot.callbackQuery('admin_dashboard', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/stats');
    const s = data.data || {};
    const msg = '📊 *DASHBOARD*\\n\\n' +
      `👥 Users: ${s.users || 0}\\n` +
      `🥩 Groups: ${s.groups || 0}\\n` +
      `📦 Orders: ${s.orders || 0}\\n` +
      `💳 Payments: ${s.payments || 0}\\n` +
      `💰 Revenue: ${formatCurrency(s.revenue || 0)}\\n` +
      `📅 ${new Date().toLocaleDateString()}`;
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load dashboard.');
  }
});

// ============================================================
// CUSTOMERS
// ============================================================

bot.callbackQuery('admin_customers', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/customers');
    const customers = data.data || [];
    let msg = '👥 *CUSTOMERS*\\n\\n';
    if (customers.length) {
      for (const c of customers.slice(0, 10)) {
        msg += `📛 ${c.fullName || 'N/A'}\\n   📱 ${c.user?.phone || 'N/A'}\\n\\n`;
      }
    } else {
      msg += 'No customers found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load customers.');
  }
});

// ============================================================
// GROUPS
// ============================================================

bot.callbackQuery('admin_groups', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/kircha/groups');
    const groups = data.data || [];
    let msg = '🥩 *GROUPS*\\n\\n';
    if (groups.length) {
      for (const g of groups.slice(0, 10)) {
        const avail = (g.maxQuota || 0) - (g.consumedQuota || 0);
        msg += `📌 ${g.name || 'N/A'}\\n   📦 ${avail.toFixed(1)}/${g.maxQuota || 0}\\n   💰 ${formatCurrency(g.fullPrice || 0)}\\n\\n`;
      }
    } else {
      msg += 'No groups found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load groups.');
  }
});

// ============================================================
// ORDERS
// ============================================================

bot.callbackQuery('admin_orders', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/orders');
    const orders = data.data || [];
    let msg = '📦 *ORDERS*\\n\\n';
    if (orders.length) {
      for (const o of orders.slice(0, 10)) {
        msg += `📌 ${o.orderNumber || 'N/A'}\\n   💰 ${formatCurrency(o.totalAmount || 0)}\\n   👤 ${o.customerName || 'N/A'}\\n\\n`;
      }
    } else {
      msg += 'No orders found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load orders.');
  }
});

// ============================================================
// PAYMENTS
// ============================================================

bot.callbackQuery('admin_payments', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/payments');
    const payments = data.data || [];
    let msg = '💳 *PAYMENTS*\\n\\n';
    if (payments.length) {
      for (const p of payments.slice(0, 10)) {
        msg += `📌 ${p.paymentId || p.id}\\n   💰 ${formatCurrency(p.amount || 0)}\\n   👤 ${p.customerName || 'N/A'}\\n\\n`;
      }
    } else {
      msg += 'No payments found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load payments.');
  }
});

// ============================================================
// REFUNDS
// ============================================================

bot.callbackQuery('admin_refunds', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/refunds');
    const refunds = data.data || [];
    let msg = '🔄 *REFUNDS*\\n\\n';
    if (refunds.length) {
      for (const r of refunds.slice(0, 10)) {
        msg += `📌 ${r.refundId || r.id}\\n   💰 ${formatCurrency(r.netRefund || 0)}\\n   👤 ${r.customerName || 'N/A'}\\n\\n`;
      }
    } else {
      msg += 'No refunds found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load refunds.');
  }
});

// ============================================================
// LANGUAGE
// ============================================================

bot.callbackQuery('admin_language', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '🌐 *LANGUAGE*\\n\\n🇬🇧 English\\n🇪🇹 አማርኛ',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🇬🇧 English', callback_data: 'lang_en' }],
          [{ text: '🇪🇹 አማርኛ', callback_data: 'lang_am' }],
        ],
      },
    }
  );
});

bot.callbackQuery('lang_en', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('✅ Language set to English.');
});

bot.callbackQuery('lang_am', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('✅ ቋንቋ ወደ አማርኛ ተቀየረ።');
});

// ============================================================
// DELIVERY
// ============================================================

bot.callbackQuery('admin_delivery', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/deliveries');
    const deliveries = data.data || [];
    let msg = '🚚 *DELIVERY MANAGEMENT*\\n\\n';
    if (deliveries.length) {
      for (const d of deliveries.slice(0, 10)) {
        const emoji = d.status === 'PENDING' ? '🟡' : d.status === 'OUT_FOR_DELIVERY' ? '🚚' : d.status === 'DELIVERED' ? '✅' : '📌';
        msg += `${emoji} *${d.orderNumber || d.id}*\\n   👤 ${d.customername || d.customerName || 'N/A'}\\n\\n`;
      }
    } else {
      msg += 'No deliveries found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load deliveries.');
  }
});

// ============================================================
// REPORTS
// ============================================================

bot.callbackQuery('admin_reports', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '📈 *REPORTS*\\n\\nSelect a report:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Sales', callback_data: 'report_sales' }, { text: '📦 Orders', callback_data: 'report_orders' }],
          [{ text: '💳 Payments', callback_data: 'report_payments' }, { text: '🚚 Delivery', callback_data: 'report_delivery' }],
          [{ text: '👥 Customers', callback_data: 'report_customers' }, { text: '🥩 Groups', callback_data: 'report_groups' }],
          [{ text: '🔙 Menu', callback_data: 'admin_menu' }],
        ],
      },
    }
  );
});

async function generateReport(ctx: any, endpoint: string, title: string) {
  try {
    const data = await apiCall(endpoint);
    const d = data.data || {};
    let msg = `📊 *${title}*\\n\\n`;
    if (Object.keys(d).length) {
      for (const [key, value] of Object.entries(d)) {
        msg += `📌 ${key}: ${value}\\n`;
      }
    } else {
      msg += 'No data available.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load report.');
  }
}

bot.callbackQuery('report_sales', async (ctx) => {
  await ctx.answerCallbackQuery();
  await generateReport(ctx, '/api/v1/admin/reports/sales', 'SALES REPORT');
});

bot.callbackQuery('report_orders', async (ctx) => {
  await ctx.answerCallbackQuery();
  await generateReport(ctx, '/api/v1/admin/reports/orders', 'ORDER REPORT');
});

bot.callbackQuery('report_payments', async (ctx) => {
  await ctx.answerCallbackQuery();
  await generateReport(ctx, '/api/v1/admin/reports/payments', 'PAYMENT REPORT');
});

bot.callbackQuery('report_delivery', async (ctx) => {
  await ctx.answerCallbackQuery();
  await generateReport(ctx, '/api/v1/admin/reports/delivery', 'DELIVERY REPORT');
});

bot.callbackQuery('report_customers', async (ctx) => {
  await ctx.answerCallbackQuery();
  await generateReport(ctx, '/api/v1/admin/reports/customers', 'CUSTOMER REPORT');
});

bot.callbackQuery('report_groups', async (ctx) => {
  await ctx.answerCallbackQuery();
  await generateReport(ctx, '/api/v1/admin/reports/groups', 'GROUP REPORT');
});

// ============================================================
// FEES
// ============================================================

bot.callbackQuery('admin_fees', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/fees');
    const fees = data.data || [];
    let msg = '💵 *FEES & CHARGES*\\n\\n';
    if (fees.length) {
      for (const f of fees.slice(0, 10)) {
        msg += `📌 ${f.name || 'N/A'}\\n   ${f.type || 'fixed'}: ${f.value || 0}\\n   ${f.isActive ? '🟢 Active' : '🔴 Inactive'}\\n\\n`;
      }
    } else {
      msg += 'No fees configured.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load fees.');
  }
});

// ============================================================
// SETTINGS
// ============================================================

bot.callbackQuery('admin_settings', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/settings');
    const settings = data.data || {};
    let msg = '⚙️ *SETTINGS*\\n\\n';
    const items = [
      ['max_groups_per_user', 'Max Groups per User'],
      ['max_members_per_group', 'Max Members per Group'],
      ['group_expiry_days', 'Group Expiry (days)'],
      ['refund_confirmation_hours', 'Refund Confirmation (hours)'],
      ['refund_processing_hours', 'Refund Processing (hours)']
    ];
    let hasSettings = false;
    for (const [key, label] of items) {
      if (settings[key]) {
        msg += `📌 ${label}: ${settings[key]}\\n`;
        hasSettings = true;
      }
    }
    if (!hasSettings) msg += 'No settings configured.';
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load settings.');
  }
});

// ============================================================
// USERS
// ============================================================

bot.callbackQuery('admin_users', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/users');
    const users = data.data || [];
    let msg = '👤 *ADMIN USERS*\\n\\n';
    if (users.length) {
      for (const u of users.slice(0, 10)) {
        msg += `📌 ${u.username || u.telegramId || 'N/A'}\\n   🔹 ${u.role || 'ADMIN'}\\n   ${u.isActive ? '🟢 Active' : '🔴 Inactive'}\\n\\n`;
      }
    } else {
      msg += 'No admin users found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load admin users.');
  }
});

// ============================================================
// AUDIT
// ============================================================

bot.callbackQuery('admin_audit', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/audit');
    const logs = data.data || [];
    let msg = '📋 *AUDIT LOG*\\n\\n';
    if (logs.length) {
      for (const log of logs.slice(0, 10)) {
        msg += `📌 ${log.action || 'Unknown'}\\n   👤 ${log.username || 'System'}\\n   📅 ${new Date(log.createdAt).toLocaleString()}\\n\\n`;
      }
    } else {
      msg += 'No audit logs found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load audit logs.');
  }
});

// ============================================================
// SUPPORT
// ============================================================

bot.callbackQuery('admin_support', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/support/tickets');
    const tickets = data.data || [];
    let msg = '📞 *SUPPORT TICKETS*\\n\\n';
    if (tickets.length) {
      for (const t of tickets.slice(0, 10)) {
        const emoji = t.status === 'OPEN' ? '🟡' : t.status === 'RESOLVED' ? '✅' : '⚪';
        msg += `${emoji} *${t.ticketId || t.id}*\\n   👤 ${t.customerName || 'N/A'}\\n   📌 ${t.category || 'General'}\\n\\n`;
      }
    } else {
      msg += 'No support tickets found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load support tickets.');
  }
});

// ============================================================
// FAQ
// ============================================================

bot.callbackQuery('admin_faq', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/faq');
    const faqs = data.data || [];
    let msg = '❓ *FAQ MANAGEMENT*\\n\\n';
    if (faqs.length) {
      for (const f of faqs.slice(0, 10)) {
        msg += `📌 ${f.questionEn || 'N/A'}\\n   ${f.isActive ? '🟢 Active' : '🔴 Inactive'}\\n\\n`;
      }
    } else {
      msg += 'No FAQs found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load FAQs.');
  }
});

// ============================================================
// TERMS
// ============================================================

bot.callbackQuery('admin_terms', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/terms');
    const terms = data.data || [];
    let msg = '📜 *TERMS MANAGEMENT*\\n\\n';
    if (terms.length) {
      for (const t of terms.slice(0, 10)) {
        msg += `📌 v${t.version || '1.0'}\\n   📅 ${new Date(t.effectiveFrom || t.effectiveDate).toLocaleDateString()}\\n   ${t.isActive ? '🟢 Active' : '⚪ Inactive'}\\n\\n`;
      }
    } else {
      msg += 'No terms found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load terms.');
  }
});

// ============================================================
// ABOUT
// ============================================================

bot.callbackQuery('admin_about', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/about');
    const about = data.data || {};
    let msg = 'ℹ️ *ABOUT US*\\n\\n';
    msg += `📌 ${about.title || 'Ale Kircha'}\\n\\n${about.content || 'Ale Kircha - Digital meat sharing platform'}\\n\\n`;
    if (about.phone) msg += `📱 Phone: ${about.phone}\\n`;
    if (about.email) msg += `📧 Email: ${about.email}\\n`;
    if (about.address) msg += `📍 Address: ${about.address}\\n`;
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load About.');
  }
});

// ============================================================
// NOTIFICATIONS
// ============================================================

bot.callbackQuery('admin_notifications', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/notifications/recent');
    const notifications = data.data || [];
    let msg = '🔔 *NOTIFICATIONS*\\n\\n';
    if (notifications.length) {
      for (const n of notifications.slice(0, 10)) {
        const emoji = n.type === 'CUSTOMER_REGISTERED' ? '🆕' : n.type === 'PAYMENT_SUBMITTED' ? '💳' : '📌';
        msg += `${emoji} *${n.title}*\\n${n.body?.substring(0, 100)}...\\n📅 ${new Date(n.createdAt).toLocaleString()}\\n\\n`;
      }
    } else {
      msg += 'No new notifications.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load notifications.');
  }
});

// ============================================================
// BANKS
// ============================================================

bot.callbackQuery('admin_banks', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/banks');
    const banks = data.data || [];
    let msg = '🏦 *BANK ACCOUNTS*\\n\\n';
    if (banks.length) {
      for (const b of banks) {
        msg += `📌 *${b.bankNameEn}* (${b.bankNameAm})\\n   📱 ${b.accountName}\\n   🔢 ${b.accountNumber}\\n   ${b.isActive ? '🟢 Active' : '🔴 Inactive'}${b.isDefault ? ' ⭐ Default' : ''}\\n\\n`;
      }
    } else {
      msg += 'No bank accounts configured.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('❌ Failed to load bank accounts.');
  }
});

// ============================================================
// START BOT
// ============================================================

console.log('🤖 Admin Bot running');
console.log('👥 Admins:', ADMIN_IDS);
console.log(`🔗 Health: http://localhost:${PORT}/health`);

bot.start();

http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'admin-bot', port: PORT }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});
'''

with open('src/bot.ts', 'w') as f:
    f.write(content)

print("✅ bot.ts has been regenerated with a clean working version.")
