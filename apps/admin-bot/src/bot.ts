import { Bot, session, Context, InlineKeyboard, SessionFlavor } from 'grammy';
import { conversations, ConversationFlavor } from '@grammyjs/conversations';
import dotenv from 'dotenv';
import http from 'http';
import https from 'https';

dotenv.config();

// ============================================================
// TYPES
// ============================================================

interface SessionData {
  language: string;
  step: string;
  currentPage: number;
  data: Record<string, any>;
}

type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;

// ============================================================
// CONFIG
// ============================================================

const API_URL = process.env.API_URL || 'http://localhost:4000';
const BOT_TOKEN = process.env.ADMIN_BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim());

console.log(`🔗 API_URL: ${API_URL}`);
console.log(`👥 Admin IDs: ${ADMIN_IDS.join(', ')}`);

if (!BOT_TOKEN) {
  console.error('❌ ADMIN_BOT_TOKEN is required!');
  process.exit(1);
}

const bot = new Bot<MyContext>(BOT_TOKEN);

// ============================================================
// MIDDLEWARE
// ============================================================

bot.use(session({
  initial: (): SessionData => ({
    language: 'en',
    step: 'dashboard',
    currentPage: 1,
    data: {},
  }),
}));

bot.use(conversations());

// ============================================================
// HELPERS - WITH SSL FIX
// ============================================================

// Create an HTTPS agent that ignores SSL certificate errors
// This is needed because Render's internal networking may have SSL issues
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

async function apiCall(endpoint: string, options: any = {}, ctx?: Context) {
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (ctx?.from?.id) {
    headers['x-telegram-id'] = ctx.from.id.toString();
  }

  const url = `${API_URL}${endpoint}`;
  console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      // @ts-ignore - Add agent to bypass SSL issues
      agent: url.startsWith('https') ? httpsAgent : undefined,
    });
    clearTimeout(timeoutId);

    // Log response for debugging
    const text = await response.text();
    console.log(`✅ API Response: ${response.status} - ${text.substring(0, 100)}`);

    try {
      return JSON.parse(text);
    } catch {
      return { success: false, error: { message: 'Invalid JSON response' } };
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('❌ API Timeout:', url);
      return { success: false, error: { message: 'Request timed out' } };
    }
    console.error(`❌ API Error:`, error.message);
    return { success: false, error: { message: error.message } };
  }
}

async function isAdmin(ctx: Context): Promise<boolean> {
  const userId = ctx.from?.id.toString();
  if (!userId) return false;
  if (ADMIN_IDS.includes(userId)) return true;
  try {
    const data = await apiCall('/api/v1/admin/check', {
      method: 'POST',
      body: JSON.stringify({ telegramId: userId }),
    }, ctx);
    return data.success && data.data?.isAdmin;
  } catch { return false; }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()} ETB`;
}

function getStatusEmoji(status: string): string {
  const map: Record<string, string> = {
    'OPEN': '🟢', 'DRAFT': '📝', 'FULL': '🔴', 'CLOSED': '🔒',
    'COMPLETED': '✅', 'CANCELLED': '❌', 'EXPIRED': '⏰',
    'PAID': '✅', 'UNPAID': '⚠️', 'PENDING': '⏳', 'REJECTED': '❌',
    'ACTIVE': '🟢', 'INACTIVE': '⚪', 'BLOCKED': '🚫',
    'PAYMENT_REVIEW': '👀', 'PAYMENT_CONFIRMED': '✅',
    'PROCESSING': '🔄', 'READY_FOR_DELIVERY': '📦',
    'OUT_FOR_DELIVERY': '🚚', 'DELIVERED': '🏠',
  };
  return map[status] || '📌';
}

// ============================================================
// COMMANDS
// ============================================================

bot.command('start', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.reply('⛔ Unauthorized. You are not an admin.');
    return;
  }
  await showDashboard(ctx);
});

bot.command('menu', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.reply('⛔ Unauthorized.');
    return;
  }
  await showDashboard(ctx);
});

// ============================================================
// DASHBOARD
// ============================================================

async function showDashboard(ctx: MyContext) {
  const keyboard = new InlineKeyboard()
    .text('📊 Stats', 'admin_stats')
    .text('🛒 Groups', 'admin_groups')
    .row()
    .text('📦 Orders', 'admin_orders')
    .text('💳 Payments', 'admin_payments')
    .row()
    .text('👥 Users', 'admin_users')
    .text('📈 Reports', 'admin_reports')
    .row()
    .text('💰 Fees', 'admin_fees')
    .text('⚙️ Settings', 'admin_settings')
    .row()
    .text('🔄 Refresh', 'admin_refresh');

  await ctx.reply(
    '🏗️ *ALE KIRCHA ADMIN*\n━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'Welcome to the Admin Dashboard!\n' +
    'Select an option below to manage the system.',
    {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    }
  );
}

// ============================================================
// STATS
// ============================================================

bot.callbackQuery('admin_stats', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showStats(ctx);
});

async function showStats(ctx: MyContext) {
  try {
    console.log('📊 Fetching stats...');
    const data = await apiCall('/api/v1/admin/stats', {}, ctx);

    if (!data.success) {
      console.error('❌ Stats API returned error:', data.error);
      await ctx.reply('❌ Error fetching stats. Please check API connection.');
      return;
    }

    const stats = data.data || {
      pendingPayments: 0,
      pendingOrders: 0,
      activeGroups: 0,
      totalCustomers: 0,
      todayRevenue: 0
    };

    const text = `
📊 *SYSTEM STATISTICS*
━━━━━━━━━━━━━━━━━━━━━━

💳 *Pending Payments:* ${stats.pendingPayments}
📦 *Pending Orders:* ${stats.pendingOrders}
🛒 *Active Groups:* ${stats.activeGroups}
👥 *Total Customers:* ${stats.totalCustomers}
💰 *Today\'s Revenue:* ${formatCurrency(stats.todayRevenue)}

━━━━━━━━━━━━━━━━━━━━━━
📌 *Quick Actions:*
• /groups - Manage groups
• /orders - View orders
• /users - Manage users
`;

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Dashboard', callback_data: 'admin_back' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_stats' }],
        ],
      },
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    await ctx.reply('❌ Error fetching stats. Please check API connection.');
  }
}

// ============================================================
// GROUPS
// ============================================================

bot.callbackQuery('admin_groups', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  ctx.session.currentPage = 1;
  await showGroups(ctx, 1);
});

async function showGroups(ctx: MyContext, page: number = 1) {
  try {
    console.log('🛒 Fetching groups...');
    const data = await apiCall('/api/v1/kircha/groups', {}, ctx);

    if (!data.success) {
      console.error('❌ Groups API returned error:', data.error);
      await ctx.reply('❌ Error fetching groups.');
      return;
    }

    let message = '🛒 *KIRCHA GROUPS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';

    if (data.data && data.data.length > 0) {
      const groups = data.data.slice((page - 1) * 5, page * 5);
      for (const group of groups) {
        const available = group.totalCapacity - group.reservedQuantity - group.soldQuantity;
        message += `*${group.nameEn}*\n`;
        message += `📦 Available: ${available}/${group.totalCapacity}\n`;
        message += `💰 ${formatCurrency(group.unitPrice)}\n`;
        message += `📌 ${getStatusEmoji(group.status)} ${group.status}\n`;
        message += `📅 ${group.deliveryDate ? formatDate(group.deliveryDate) : 'TBD'}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      }

      const totalPages = Math.ceil(data.data.length / 5);
      const keyboard = new InlineKeyboard();
      if (page > 1) keyboard.text('◀️ Prev', `groups_page_${page - 1}`);
      keyboard.text(`📄 ${page}/${totalPages}`, 'groups_page_info');
      if (page < totalPages) keyboard.text('Next ▶️', `groups_page_${page + 1}`);
      keyboard.row();
      keyboard.text('➕ Create Group', 'admin_create_group');
      keyboard.text('🔙 Back', 'admin_back');

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    } else {
      await ctx.reply('No Kircha groups available.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '➕ Create Group', callback_data: 'admin_create_group' }],
            [{ text: '🔙 Back', callback_data: 'admin_back' }],
          ],
        },
      });
    }
  } catch (error) {
    console.error('❌ Groups error:', error);
    await ctx.reply('❌ Error fetching groups.');
  }
}

bot.callbackQuery(/groups_page_(\d+)/, async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showGroups(ctx, parseInt(ctx.match[1]));
});

// ============================================================
// ORDERS
// ============================================================

bot.callbackQuery('admin_orders', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  ctx.session.currentPage = 1;
  await showOrders(ctx, 1);
});

async function showOrders(ctx: MyContext, page: number = 1) {
  try {
    console.log('📦 Fetching orders...');
    const data = await apiCall('/api/v1/orders', {}, ctx);

    if (!data.success) {
      console.error('❌ Orders API returned error:', data.error);
      await ctx.reply('❌ Error fetching orders.');
      return;
    }

    let message = '📦 *ORDERS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';

    if (data.data && data.data.length > 0) {
      const orders = data.data.slice((page - 1) * 5, page * 5);
      for (const order of orders) {
        message += `🆔 *${order.orderNumber || 'N/A'}*\n`;
        message += `👤 ${order.customer?.fullName || 'Unknown'}\n`;
        message += `💰 ${formatCurrency(order.totalAmount || 0)}\n`;
        message += `📌 ${getStatusEmoji(order.status)} ${order.status || 'DRAFT'}\n`;
        message += `📅 ${formatDate(order.createdAt)}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      }

      const totalPages = Math.ceil(data.data.length / 5);
      const keyboard = new InlineKeyboard();
      if (page > 1) keyboard.text('◀️ Prev', `orders_page_${page - 1}`);
      keyboard.text(`📄 ${page}/${totalPages}`, 'orders_page_info');
      if (page < totalPages) keyboard.text('Next ▶️', `orders_page_${page + 1}`);
      keyboard.row();
      keyboard.text('🔙 Back', 'admin_back');

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    } else {
      await ctx.reply('No orders found.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back', callback_data: 'admin_back' }],
          ],
        },
      });
    }
  } catch (error) {
    console.error('❌ Orders error:', error);
    await ctx.reply('❌ Error fetching orders.');
  }
}

bot.callbackQuery(/orders_page_(\d+)/, async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showOrders(ctx, parseInt(ctx.match[1]));
});

// ============================================================
// USERS
// ============================================================

bot.callbackQuery('admin_users', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  ctx.session.currentPage = 1;
  await showUsers(ctx, 1);
});

async function showUsers(ctx: MyContext, page: number = 1) {
  try {
    console.log('👥 Fetching users...');
    const data = await apiCall('/api/v1/customers', {}, ctx);

    if (!data.success) {
      console.error('❌ Users API returned error:', data.error);
      await ctx.reply('❌ Error fetching users.');
      return;
    }

    let message = '👥 *USERS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';

    if (data.data && data.data.length > 0) {
      const users = data.data.slice((page - 1) * 5, page * 5);
      for (const user of users) {
        message += `👤 *${user.fullName || 'Unknown'}*\n`;
        message += `📱 ${user.user?.phone || 'No phone'}\n`;
        message += `📌 ${getStatusEmoji(user.status)} ${user.status || 'ACTIVE'}\n`;
        message += `📅 ${formatDate(user.registrationDate)}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      }

      const totalPages = Math.ceil(data.data.length / 5);
      const keyboard = new InlineKeyboard();
      if (page > 1) keyboard.text('◀️ Prev', `users_page_${page - 1}`);
      keyboard.text(`📄 ${page}/${totalPages}`, 'users_page_info');
      if (page < totalPages) keyboard.text('Next ▶️', `users_page_${page + 1}`);
      keyboard.row();
      keyboard.text('🔙 Back', 'admin_back');

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    } else {
      await ctx.reply('No users registered yet.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back', callback_data: 'admin_back' }],
          ],
        },
      });
    }
  } catch (error) {
    console.error('❌ Users error:', error);
    await ctx.reply('❌ Error fetching users.');
  }
}

bot.callbackQuery(/users_page_(\d+)/, async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showUsers(ctx, parseInt(ctx.match[1]));
});

// ============================================================
// PAYMENTS
// ============================================================

bot.callbackQuery('admin_payments', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showPayments(ctx);
});

async function showPayments(ctx: MyContext) {
  try {
    console.log('💳 Fetching payment methods...');
    const data = await apiCall('/api/v1/payment/methods', {}, ctx);

    if (!data.success) {
      console.error('❌ Payment methods API returned error:', data.error);
      await ctx.reply('❌ Error fetching payment methods.');
      return;
    }

    let message = '💳 *PAYMENT METHODS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';

    if (data.data && data.data.length > 0) {
      for (const method of data.data) {
        message += `🏦 *${method.name}*\n`;
        message += `📋 ${method.accountName}\n`;
        message += `🔢 ${method.accountNumber}\n`;
        message += `📌 ${method.active ? '✅ Active' : '❌ Inactive'}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      }
    } else {
      message += 'No payment methods configured.';
    }

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Payment Method', callback_data: 'admin_add_payment' }],
          [{ text: '🔙 Back', callback_data: 'admin_back' }],
        ],
      },
    });
  } catch (error) {
    console.error('❌ Payment methods error:', error);
    await ctx.reply('❌ Error fetching payment methods.');
  }
}

// ============================================================
// REPORTS
// ============================================================

bot.callbackQuery('admin_reports', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showReports(ctx);
});

async function showReports(ctx: MyContext) {
  await ctx.reply(
    '📊 *REPORTS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'Select a report to view:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💰 Sales Report', callback_data: 'admin_report_sales' }],
          [{ text: '📦 Order Report', callback_data: 'admin_report_orders' }],
          [{ text: '💳 Payment Report', callback_data: 'admin_report_payments' }],
          [{ text: '🚚 Delivery Report', callback_data: 'admin_report_delivery' }],
          [{ text: '👥 Customer Report', callback_data: 'admin_report_customers' }],
          [{ text: '🛒 Group Report', callback_data: 'admin_report_groups' }],
          [{ text: '🔙 Back', callback_data: 'admin_back' }],
        ],
      },
    }
  );
}

// ============================================================
// SETTINGS
// ============================================================

bot.callbackQuery('admin_settings', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showSettings(ctx);
});

async function showSettings(ctx: MyContext) {
  const text = `
⚙️ *SYSTEM SETTINGS*
━━━━━━━━━━━━━━━━━━━━━━

📌 *General Settings*
• Platform: Siga Kircha
• Currency: ETB
• Language: English/Amharic

🔐 *Security*
• Admin IDs: ${ADMIN_IDS.join(', ')}
• Session: Active

💳 *Payment Settings*
• Methods: Telebirr, CBE, Awash Bank
• Verification: Manual

📱 *Bot Settings*
• Customer Bot: @kirchaaleBot
• Admin Bot: @Ale_kircha_admin_bot
`;

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🏢 Company Details', callback_data: 'admin_company_details' }],
        [{ text: '🏦 Bank Accounts', callback_data: 'admin_bank_accounts' }],
        [{ text: '📱 Bot Info', callback_data: 'admin_bot_info' }],
        [{ text: '🔙 Back', callback_data: 'admin_back' }],
      ],
    },
  });
}

// ============================================================
// BACK & REFRESH
// ============================================================

bot.callbackQuery('admin_back', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showDashboard(ctx);
});

bot.callbackQuery('admin_refresh', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery('🔄 Refreshing...');
  await showDashboard(ctx);
});

// ============================================================
// BOT INFO
// ============================================================

bot.callbackQuery('admin_bot_info', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '📱 *Bot Information*\n\n' +
    '🤖 *Customer Bot:* @kirchaaleBot\n' +
    '🔐 *Admin Bot:* @Ale_kircha_admin_bot\n\n' +
    '📡 *API URL:* ' + API_URL + '\n' +
    '👥 *Admin IDs:* ' + ADMIN_IDS.join(', ') + '\n\n' +
    '📊 *Status:* All systems operational',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Settings', callback_data: 'admin_settings' }],
        ],
      },
    }
  );
});

// ============================================================
// START BOT
// ============================================================

await bot.init();

bot.start({
  allowed_updates: ['message', 'callback_query'],
});

console.log('🤖 Admin Bot is running...');
console.log(`📊 API URL: ${API_URL}`);
console.log(`👥 Admin IDs: ${ADMIN_IDS.join(', ')}`);

// ============================================================
// HTTP SERVER FOR RENDER HEALTH CHECK
// ============================================================

const PORT = parseInt(process.env.PORT || '10000');

http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'admin-bot',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Health check server running on port ${PORT}`);
});

console.log(`🔗 Health check: http://localhost:${PORT}/health`);
