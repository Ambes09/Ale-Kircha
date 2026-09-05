import { Bot, Context, SessionFlavor, session } from 'grammy';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// ============================================================
// CONFIG
// ============================================================

const BOT_TOKEN = process.env.ADMIN_BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim());
const API_URL = process.env.API_URL || 'http://localhost:4000';
const PORT = parseInt(process.env.PORT || '10002');

if (!BOT_TOKEN) {
  console.error('❌ ADMIN_BOT_TOKEN is required!');
  process.exit(1);
}

// ============================================================
// TYPES
// ============================================================

interface SessionData {
  language: 'en' | 'am';
  page: number;
  filter: string;
}

type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>(BOT_TOKEN);

// ============================================================
// MIDDLEWARE
// ============================================================

bot.use(session({
  initial: (): SessionData => ({
    language: 'en',
    page: 1,
    filter: 'all',
  }),
}));

// Admin auth middleware
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

async function apiCall(endpoint: string, options: any = {}) {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

function t(ctx: MyContext, key: string): string {
  const lang = ctx.session.language || 'en';
  const translations: Record<string, Record<string, string>> = {
    en: {
      dashboard: '📊 Dashboard',
      customers: '👥 Customers',
      groups: '🥩 Groups',
      orders: '📦 Orders',
      payments: '💳 Payments',
      refunds: '🔄 Refunds',
      delivery: '🚚 Delivery',
      reports: '📈 Reports',
      settings: '⚙️ Settings',
      language: '🌐 Language',
      back: '🔙 Back',
      menu: '🏠 Main Menu',
    },
    am: {
      dashboard: '📊 ዳሽቦርድ',
      customers: '👥 ደንበኞች',
      groups: '🥩 ቡድኖች',
      orders: '📦 ትዕዛዞች',
      payments: '💳 ክፍያዎች',
      refunds: '🔄 ተመላሽ',
      delivery: '🚚 ማድረስ',
      reports: '📈 ሪፖርቶች',
      settings: '⚙️ ቅንብሮች',
      language: '🌐 ቋንቋ',
      back: '🔙 ተመለስ',
      menu: '🏠 ዋና ምናሌ',
    },
  };
  return (translations[lang] as any)[key] || key;
}

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()} ETB`;
}

// ============================================================
// MAIN COMMAND
// ============================================================

bot.command('start', async (ctx) => {
  await ctx.reply(
    `🏗️ *ALE KIRCHA ADMIN*\n\n${t(ctx, 'menu')}`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(ctx, 'dashboard'), callback_data: 'admin_dashboard' }],
          [{ text: t(ctx, 'customers'), callback_data: 'admin_customers' }],
          [{ text: t(ctx, 'groups'), callback_data: 'admin_groups' }],
          [{ text: t(ctx, 'orders'), callback_data: 'admin_orders' }],
          [{ text: t(ctx, 'payments'), callback_data: 'admin_payments' }],
          [{ text: t(ctx, 'refunds'), callback_data: 'admin_refunds' }],
          [{ text: t(ctx, 'delivery'), callback_data: 'admin_delivery' }],
          [{ text: t(ctx, 'reports'), callback_data: 'admin_reports' }],
          [{ text: t(ctx, 'settings'), callback_data: 'admin_settings' }],
          [{ text: t(ctx, 'language'), callback_data: 'admin_language' }],
        ],
      },
    }
  );
});

// ============================================================
// DASHBOARD
// ============================================================

bot.callbackQuery('admin_dashboard', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/stats');
    const s = data.data || {};
    await ctx.reply(
      `📊 *${t(ctx, 'dashboard')}*\n\n` +
      `👥 ${t(ctx, 'customers')}: ${s.customers || 0}\n` +
      `🥩 ${t(ctx, 'groups')}: ${s.groups || 0}\n` +
      `📦 ${t(ctx, 'orders')}: ${s.orders || 0}\n` +
      `💳 ${t(ctx, 'payments')}: ${s.payments || 0}\n` +
      `📅 ${new Date().toLocaleDateString()}`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Refresh', callback_data: 'admin_dashboard' }],
            [{ text: t(ctx, 'menu'), callback_data: 'admin_menu' }],
          ],
        },
      }
    );
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
    const data = await apiCall('/api/v1/admin/customers');
    const customers = data.data || [];
    let msg = `👥 *${t(ctx, 'customers')}*\n\n`;
    if (customers.length) {
      for (const c of customers.slice(0, 10)) {
        msg += `📛 ${c.fullName || 'N/A'}\n   📱 ${c.user?.phoneNumber || 'N/A'}\n\n`;
      }
    } else {
      msg += 'No customers found.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔍 Search', callback_data: 'customers_search' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_customers' }],
          [{ text: t(ctx, 'menu'), callback_data: 'admin_menu' }],
        ],
      },
    });
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
    const data = await apiCall('/api/v1/admin/groups');
    const groups = data.data || [];
    let msg = `🥩 *${t(ctx, 'groups')}*\n\n`;
    if (groups.length) {
      for (const g of groups.slice(0, 10)) {
        const statusIcon = g.status === 'OPEN' ? '🟢' : 
                          g.status === 'FULL' ? '🔴' : 
                          g.status === 'CLOSED' ? '⚫' : '🟡';
        msg += `${statusIcon} *${g.name || 'N/A'}*\n   📦 ${g.totalQuota || 0}\n   💰 ${formatCurrency(g.unitPrice || 0)}\n\n`;
      }
    } else {
      msg += 'No groups found.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create', callback_data: 'groups_create' }],
          [{ text: '📋 Pending', callback_data: 'groups_pending' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_groups' }],
          [{ text: t(ctx, 'menu'), callback_data: 'admin_menu' }],
        ],
      },
    });
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
    const data = await apiCall('/api/v1/admin/orders');
    const orders = data.data || [];
    let msg = `📦 *${t(ctx, 'orders')}*\n\n`;
    if (orders.length) {
      for (const o of orders.slice(0, 10)) {
        msg += `📌 ${o.orderNumber || 'N/A'}\n   💰 ${formatCurrency(o.totalAmount || 0)}\n   📅 ${new Date(o.createdAt).toLocaleDateString()}\n\n`;
      }
    } else {
      msg += 'No orders found.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'admin_orders' }],
          [{ text: t(ctx, 'menu'), callback_data: 'admin_menu' }],
        ],
      },
    });
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
    const data = await apiCall('/api/v1/admin/payments');
    const payments = data.data || [];
    let msg = `💳 *${t(ctx, 'payments')}*\n\n`;
    if (payments.length) {
      for (const p of payments.slice(0, 10)) {
        msg += `📌 ${p.id || 'N/A'}\n   💰 ${formatCurrency(p.amount || 0)}\n   📅 ${new Date(p.createdAt).toLocaleDateString()}\n\n`;
      }
    } else {
      msg += 'No payments found.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Pending', callback_data: 'payments_review' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_payments' }],
          [{ text: t(ctx, 'menu'), callback_data: 'admin_menu' }],
        ],
      },
    });
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
    const data = await apiCall('/api/v1/admin/refunds');
    const refunds = data.data || [];
    let msg = `🔄 *${t(ctx, 'refunds')}*\n\n`;
    if (refunds.length) {
      for (const r of refunds.slice(0, 10)) {
        msg += `📌 ${r.id || 'N/A'}\n   💰 ${formatCurrency(r.refundAmount || 0)}\n   📅 ${new Date(r.createdAt).toLocaleDateString()}\n\n`;
      }
    } else {
      msg += 'No refunds found.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Pending', callback_data: 'refunds_review' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_refunds' }],
          [{ text: t(ctx, 'menu'), callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load refunds.');
  }
});

// ============================================================
// DELIVERY
// ============================================================

bot.callbackQuery('admin_delivery', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `🚚 *${t(ctx, 'delivery')}*\n\nFeature coming soon.`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(ctx, 'menu'), callback_data: 'admin_menu' }],
        ],
      },
    }
  );
});

// ============================================================
// REPORTS
// ============================================================

bot.callbackQuery('admin_reports', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `📈 *${t(ctx, 'reports')}*\n\nSelect a report:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💰 Sales', callback_data: 'report_sales' }],
          [{ text: '📦 Orders', callback_data: 'report_orders' }],
          [{ text: '💳 Payments', callback_data: 'report_payments' }],
          [{ text: '👥 Customers', callback_data: 'report_customers' }],
          [{ text: '📤 Export', callback_data: 'report_export' }],
          [{ text: t(ctx, 'menu'), callback_data: 'admin_menu' }],
        ],
      },
    }
  );
});

// ============================================================
// SETTINGS
// ============================================================

bot.callbackQuery('admin_settings', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `⚙️ *${t(ctx, 'settings')}*\n\nSelect a setting:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💵 Fees', callback_data: 'admin_fees' }],
          [{ text: '❓ FAQ', callback_data: 'admin_faq' }],
          [{ text: '📜 Terms', callback_data: 'admin_terms' }],
          [{ text: '📋 Audit', callback_data: 'admin_audit' }],
          [{ text: '🔔 Notifications', callback_data: 'admin_notifications' }],
          [{ text: '👤 Admin Users', callback_data: 'admin_users' }],
          [{ text: '🏦 Banks', callback_data: 'admin_banks' }],
          [{ text: t(ctx, 'menu'), callback_data: 'admin_menu' }],
        ],
      },
    }
  );
});

// ============================================================
// LANGUAGE
// ============================================================

bot.callbackQuery('admin_language', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `🌐 *${t(ctx, 'language')}*\n\nSelect language:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🇬🇧 English', callback_data: 'lang_en' }],
          [{ text: '🇪🇹 አማርኛ', callback_data: 'lang_am' }],
          [{ text: t(ctx, 'menu'), callback_data: 'admin_menu' }],
        ],
      },
    }
  );
});

bot.callbackQuery('lang_en', async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.language = 'en';
  await ctx.reply('✅ Language set to English.');
  await ctx.reply('🏠 Returning to menu...');
  // Use the same menu as start
  await bot.commands['start'](ctx);
});

bot.callbackQuery('lang_am', async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.language = 'am';
  await ctx.reply('✅ ቋንቋ ወደ አማርኛ ተቀየረ።');
  await ctx.reply('🏠 ወደ ምናሌ በመመለስ ላይ...');
  await bot.commands['start'](ctx);
});

// ============================================================
// BACK TO MENU
// ============================================================

bot.callbackQuery('admin_menu', async (ctx) => {
  await ctx.answerCallbackQuery();
  await bot.commands['start'](ctx);
});

// ============================================================
// QUICK ACTION HANDLERS
// ============================================================

const quickActions = [
  { id: 'payments_review', label: '📋 Pending Payments' },
  { id: 'refunds_review', label: '🔄 Pending Refunds' },
  { id: 'groups_pending', label: '📋 Pending Groups' },
  { id: 'admin_delivery', label: '🚚 Pending Deliveries' },
  { id: 'admin_support', label: '📞 Support Tickets' },
  { id: 'notification_send', label: '📢 Send Broadcast' },
];

quickActions.forEach(action => {
  bot.callbackQuery(action.id, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(`📋 *${action.label}*\n\nNo items found.`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: action.id }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
        ],
      },
    });
  });
});

// ============================================================
// SUB-HANDLERS (Placeholders)
// ============================================================

const subHandlers = [
  'customers_search', 'groups_create', 'groups_pending', 'group_approve',
  'payments_review', 'payment_confirm', 'refunds_review', 'refund_accept',
  'admin_fees', 'fee_add', 'admin_faq', 'faq_add',
  'admin_terms', 'terms_create', 'admin_about', 'about_edit',
  'admin_banks', 'bank_add', 'admin_support', 'admin_users', 'users_add',
  'admin_audit', 'admin_notifications', 'notification_send',
  'report_sales', 'report_orders', 'report_payments', 'report_customers',
  'report_export', 'system_health', 'broadcast_analytics', 'admin_activity_report'
];

subHandlers.forEach(handler => {
  bot.callbackQuery(handler, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(`📋 *${handler.replace('_', ' ').toUpperCase()}*\n\nFeature coming soon.`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
        ],
      },
    });
  });
});

// ============================================================
// START BOT
// ============================================================

console.log('🤖 Admin Bot running');
console.log('👥 Admins:', ADMIN_IDS);
console.log(`📊 API URL: ${API_URL}`);

bot.start();

// ============================================================
// HEALTH CHECK SERVER
// ============================================================

http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'admin-bot',
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

// ============================================================
// DEBUG: LOG ALL CALLBACKS
// ============================================================

// Add this middleware to log all callbacks
bot.use(async (ctx, next) => {
  if (ctx.callbackQuery) {
    console.log('📩 Callback received:', ctx.callbackQuery.data);
  }
  await next();
});

// Override the callback handlers with debug versions
const originalHandlers = {
  admin_customers: bot.callbackQuery('admin_customers'),
  admin_groups: bot.callbackQuery('admin_groups'),
  admin_orders: bot.callbackQuery('admin_orders'),
  admin_payments: bot.callbackQuery('admin_payments'),
  admin_refunds: bot.callbackQuery('admin_refunds'),
};

// ============================================================
// DEBUG: Log all admin bot callbacks
// ============================================================

bot.use(async (ctx, next) => {
  if (ctx.callbackQuery) {
    console.log('🔔 Admin callback:', ctx.callbackQuery.data);
    console.log('👤 From:', ctx.from?.id);
  }
  await next();
});
