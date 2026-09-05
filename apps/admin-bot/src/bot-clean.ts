import { Bot } from 'grammy';
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
  const menuText = '🏗️ *ALE KIRCHA ADMIN*\n\nSelect option:';
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
  } catch (error) {
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
    const msg = '📊 *DASHBOARD*\n\n' +
      `👥 Users: ${s.users || 0}\n` +
      `🥩 Groups: ${s.groups || 0}\n` +
      `📦 Orders: ${s.orders || 0}\n` +
      `💳 Payments: ${s.payments || 0}\n` +
      `💰 Revenue: ${formatCurrency(s.revenue || 0)}\n` +
      `📅 ${new Date().toLocaleDateString()}`;
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (error) {
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
    let msg = '👥 *CUSTOMERS*\n\n';
    if (customers.length) {
      for (const c of customers.slice(0, 10)) {
        msg += `📛 ${c.fullName || 'N/A'}\n   📱 ${c.user?.phone || 'N/A'}\n\n`;
      }
    } else {
      msg += 'No customers found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (error) {
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
    let msg = '🥩 *GROUPS*\n\n';
    if (groups.length) {
      for (const g of groups.slice(0, 10)) {
        const avail = (g.maxQuota || 0) - (g.consumedQuota || 0);
        msg += `📌 ${g.name || 'N/A'}\n`;
        msg += `   📦 ${avail.toFixed(1)}/${g.maxQuota || 0}\n`;
        msg += `   💰 ${formatCurrency(g.fullPrice || 0)}\n\n`;
      }
    } else {
      msg += 'No groups found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (error) {
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
    let msg = '📦 *ORDERS*\n\n';
    if (orders.length) {
      for (const o of orders.slice(0, 10)) {
        msg += `📌 ${o.orderNumber || 'N/A'}\n`;
        msg += `   💰 ${formatCurrency(o.totalAmount || 0)}\n`;
        msg += `   👤 ${o.customerName || 'N/A'}\n\n`;
      }
    } else {
      msg += 'No orders found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (error) {
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
    let msg = '💳 *PAYMENTS*\n\n';
    if (payments.length) {
      for (const p of payments.slice(0, 10)) {
        msg += `📌 ${p.paymentId || p.id}\n`;
        msg += `   💰 ${formatCurrency(p.amount || 0)}\n`;
        msg += `   👤 ${p.customerName || 'N/A'}\n\n`;
      }
    } else {
      msg += 'No payments found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (error) {
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
    let msg = '🔄 *REFUNDS*\n\n';
    if (refunds.length) {
      for (const r of refunds.slice(0, 10)) {
        msg += `📌 ${r.refundId || r.id}\n`;
        msg += `   💰 ${formatCurrency(r.netRefund || 0)}\n`;
        msg += `   👤 ${r.customerName || 'N/A'}\n\n`;
      }
    } else {
      msg += 'No refunds found.';
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (error) {
    await ctx.reply('❌ Failed to load refunds.');
  }
});

// ============================================================
// LANGUAGE
// ============================================================

bot.callbackQuery('admin_language', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '🌐 *LANGUAGE*\n\n🇬🇧 English\n🇪🇹 አማርኛ',
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
// "COMING SOON" HANDLERS
// ============================================================

const comingSoon = [
  'admin_delivery', 'admin_reports', 'admin_fees', 'admin_settings',
  'admin_users', 'admin_audit', 'admin_support', 'admin_faq',
  'admin_terms', 'admin_about', 'admin_selfhelp', 'admin_banks',
  'admin_notifications'
];

comingSoon.forEach(callback => {
  bot.callbackQuery(callback, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(`⏳ *${callback.replace('_', ' ').toUpperCase()}*\n\nComing soon.`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '🔙 Menu', callback_data: 'admin_menu' }]],
      },
    });
  });
});

// ============================================================
// START BOT
// ============================================================

console.log('🤖 Admin Bot running');
console.log('👥 Admins:', ADMIN_IDS);
console.log(`🔗 Health: http://localhost:${PORT}/health`);

bot.start();

// Health check server
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
