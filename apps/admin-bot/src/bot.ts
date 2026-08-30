import { Bot, session, Context } from 'grammy';
import { conversations, type ConversationFlavor } from '@grammyjs/conversations';
import { type SessionFlavor } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:4000';
const BOT_TOKEN = process.env.ADMIN_BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim());

if (!BOT_TOKEN) {
  console.error('❌ ADMIN_BOT_TOKEN is required!');
  process.exit(1);
}

interface SessionData {
  language: string;
  step: string;
  currentPage: number;
  data: Record<string, any>;
}

type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;

const bot = new Bot<MyContext>(BOT_TOKEN);

bot.use(session({
  initial: (): SessionData => ({
    language: 'en',
    step: 'dashboard',
    currentPage: 1,
    data: {},
  }),
}));

bot.use(conversations());

// ==================== HELPERS ====================

async function apiCall(endpoint: string, options: any = {}, ctx?: MyContext) {
  const headers: any = { 'Content-Type': 'application/json', ...options.headers };
  if (ctx?.from?.id) headers['x-telegram-id'] = ctx.from.id.toString();
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  return response.json();
}

async function isAdmin(ctx: MyContext): Promise<boolean> {
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

// ==================== COMMANDS ====================

bot.command('start', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.reply('⛔ Unauthorized. You are not an admin.');
    return;
  }
  await showDashboard(ctx);
});

// ==================== DASHBOARD ====================

async function showDashboard(ctx: MyContext) {
  // Fetch real stats for dashboard
  let stats = { pendingPayments: 0, pendingOrders: 0, activeGroups: 0, totalCustomers: 0, todayRevenue: 0 };
  try {
    const data = await apiCall('/api/v1/admin/stats', {}, ctx);
    if (data.success) stats = data.data;
  } catch (error) {}

  await ctx.reply(
    `🏗️ *ALE KIRCHA ADMIN*\n━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📊 *Quick Stats*\n` +
    `💳 Pending: ${stats.pendingPayments}\n` +
    `📦 Orders: ${stats.pendingOrders}\n` +
    `🛒 Groups: ${stats.activeGroups}\n` +
    `👥 Users: ${stats.totalCustomers}\n` +
    `💰 Revenue: ${formatCurrency(stats.todayRevenue)}\n\n` +
    `Select an option:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Stats', callback_data: 'admin_stats' }],
          [{ text: '🛒 Groups', callback_data: 'admin_groups' }],
          [{ text: '📦 Orders', callback_data: 'admin_orders' }],
          [{ text: '💳 Payments', callback_data: 'admin_payments' }],
          [{ text: '👥 Users', callback_data: 'admin_users' }],
          [{ text: '🚚 Delivery', callback_data: 'admin_delivery' }],
          [{ text: '📈 Reports', callback_data: 'admin_reports' }],
          [{ text: '⚙️ Settings', callback_data: 'admin_settings' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_refresh' }],
        ],
      },
    }
  );
}

// ==================== STATS ====================

bot.callbackQuery('admin_stats', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  try {
    const data = await apiCall('/api/v1/admin/stats', {}, ctx);
    const stats = data.success ? data.data : { pendingPayments: 0, pendingOrders: 0, activeGroups: 0, totalCustomers: 0, todayRevenue: 0 };
    
    await ctx.reply(
      `📊 *SYSTEM STATISTICS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `💳 *Pending Payments:* ${stats.pendingPayments}\n` +
      `📦 *Pending Orders:* ${stats.pendingOrders}\n` +
      `🛒 *Active Groups:* ${stats.activeGroups}\n` +
      `👥 *Total Customers:* ${stats.totalCustomers}\n` +
      `💰 *Today\'s Revenue:* ${formatCurrency(stats.todayRevenue)}\n\n` +
      `📌 *Quick Actions:*\n` +
      `• /groups - Manage groups\n` +
      `• /orders - View orders\n` +
      `• /users - Manage users`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    await ctx.reply('❌ Error fetching stats.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Retry', callback_data: 'admin_stats' }],
          [{ text: '🔙 Back', callback_data: 'admin_back' }],
        ],
      },
    });
  }
});

// ==================== GROUPS ====================

bot.callbackQuery('admin_groups', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  try {
    const data = await apiCall('/api/v1/kircha/groups', {}, ctx);
    
    let message = '🛒 *KIRCHA GROUPS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
    if (data.success && data.data && data.data.length > 0) {
      for (const group of data.data) {
        const available = group.totalCapacity - group.reservedQuantity - group.soldQuantity;
        message += `*${group.nameEn}*\n`;
        message += `📦 ${available}/${group.totalCapacity}\n`;
        message += `💰 ${formatCurrency(group.unitPrice)}\n`;
        message += `📌 ${getStatusEmoji(group.status)} ${group.status}\n`;
        if (group.deliveryDate) message += `📅 ${formatDate(group.deliveryDate)}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      }
    } else {
      message += 'No Kircha groups available.\n\nClick "Create Group" to add one.';
    }
    
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create Group', callback_data: 'admin_create_group' }],
          [{ text: '🔙 Back', callback_data: 'admin_back' }],
        ],
      },
    });
  } catch (error) {
    await ctx.reply('❌ Error fetching groups.');
  }
});

// ==================== CREATE GROUP ====================

bot.callbackQuery('admin_create_group', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '🛒 *Create Kircha Group*\n\n' +
    'Send group details in this format:\n\n' +
    '`nameEn: Saturday Ox Kircha`\n' +
    '`nameAm: ቅዳሜ የበሬ ቅርጫ`\n' +
    '`kirchaTypeCode: OX`\n' +
    '`totalCapacity: 8`\n' +
    '`unitPrice: 35000`\n' +
    '`halfPrice: 18000`\n' +
    '`quarterPrice: 9000`\n' +
    '`deliveryFee: 500`\n' +
    '`deliveryDate: 2026-08-29T14:00:00Z`',
    { parse_mode: 'Markdown' }
  );
  ctx.session.step = 'create_group';
});

// ==================== ORDERS ====================

bot.callbackQuery('admin_orders', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  try {
    const data = await apiCall('/api/v1/orders', {}, ctx);
    
    let message = '📦 *ORDERS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
    if (data.success && data.data && data.data.length > 0) {
      for (const order of data.data.slice(0, 10)) {
        message += `🆔 *${order.orderNumber || 'N/A'}*\n`;
        message += `👤 ${order.customer?.fullName || 'Unknown'}\n`;
        message += `💰 ${formatCurrency(order.totalAmount || 0)}\n`;
        message += `📌 ${getStatusEmoji(order.status)} ${order.status || 'DRAFT'}\n`;
        message += `📅 ${formatDate(order.createdAt)}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      }
      if (data.data.length > 10) message += `\n📌 Showing 10 of ${data.data.length} orders.`;
    } else {
      message += 'No orders found.';
    }
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    await ctx.reply('❌ Error fetching orders.');
  }
});

// ==================== PAYMENTS ====================

bot.callbackQuery('admin_payments', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  try {
    const data = await apiCall('/api/v1/payment/methods', {}, ctx);
    
    let message = '💳 *PAYMENT METHODS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
    if (data.success && data.data && data.data.length > 0) {
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
    await ctx.reply('❌ Error fetching payment methods.');
  }
});

// ==================== ADD PAYMENT METHOD ====================

bot.callbackQuery('admin_add_payment', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '💳 *Add Payment Method*\n\n' +
    'Send details in this format:\n\n' +
    '`name: Telebirr`\n' +
    '`accountName: Ale Kircha`\n' +
    '`accountNumber: 0912345678`\n' +
    '`active: true`',
    { parse_mode: 'Markdown' }
  );
  ctx.session.step = 'add_payment';
});

// ==================== USERS ====================

bot.callbackQuery('admin_users', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  try {
    const data = await apiCall('/api/v1/customers', {}, ctx);
    
    let message = '👥 *USERS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
    if (data.success && data.data && data.data.length > 0) {
      for (const user of data.data.slice(0, 10)) {
        message += `👤 *${user.fullName || 'Unknown'}*\n`;
        message += `📱 ${user.user?.phone || 'No phone'}\n`;
        message += `📌 ${getStatusEmoji(user.status)} ${user.status || 'ACTIVE'}\n`;
        message += `📅 ${formatDate(user.registrationDate)}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      }
      if (data.data.length > 10) message += `\n📌 Showing 10 of ${data.data.length} users.`;
    } else {
      message += 'No users registered yet.';
    }
    
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚫 Ban User', callback_data: 'admin_ban_user' }],
          [{ text: '🔙 Back', callback_data: 'admin_back' }],
        ],
      },
    });
  } catch (error) {
    await ctx.reply('❌ Error fetching users.');
  }
});

// ==================== BAN USER ====================

bot.callbackQuery('admin_ban_user', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '🚫 *Ban User*\n\n' +
    'Send the Telegram ID to ban:\n\n' +
    '`678862323`\n\n' +
    'Optional reason:\n' +
    '`678862323|Spamming`',
    { parse_mode: 'Markdown' }
  );
  ctx.session.step = 'ban_user';
});

// ==================== DELIVERY ====================

bot.callbackQuery('admin_delivery', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '🚚 *DELIVERY MANAGEMENT*\n━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'Select an option:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📦 Pending Deliveries', callback_data: 'admin_delivery_pending' }],
          [{ text: '🚚 In Transit', callback_data: 'admin_delivery_transit' }],
          [{ text: '✅ Completed', callback_data: 'admin_delivery_completed' }],
          [{ text: '🔙 Back', callback_data: 'admin_back' }],
        ],
      },
    }
  );
});

bot.callbackQuery('admin_delivery_pending', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply('📦 *Pending Deliveries*\n\nFeature coming soon...');
});

bot.callbackQuery('admin_delivery_transit', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply('🚚 *In Transit*\n\nFeature coming soon...');
});

bot.callbackQuery('admin_delivery_completed', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply('✅ *Completed Deliveries*\n\nFeature coming soon...');
});

// ==================== REPORTS ====================

bot.callbackQuery('admin_reports', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '📈 *REPORTS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'Select a report:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💰 Sales Report', callback_data: 'admin_report_sales' }],
          [{ text: '📦 Order Report', callback_data: 'admin_report_orders' }],
          [{ text: '💳 Payment Report', callback_data: 'admin_report_payments' }],
          [{ text: '👥 Customer Report', callback_data: 'admin_report_customers' }],
          [{ text: '🛒 Group Report', callback_data: 'admin_report_groups' }],
          [{ text: '🔙 Back', callback_data: 'admin_back' }],
        ],
      },
    }
  );
});

bot.callbackQuery('admin_report_sales', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  try {
    const data = await apiCall('/api/v1/admin/reports/sales?groupBy=daily', {}, ctx);
    if (data.success) {
      let message = '💰 *Sales Report*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
      message += `📊 *Total Revenue:* ${formatCurrency(data.data.summary.totalRevenue)}\n`;
      message += `📦 *Total Orders:* ${data.data.summary.totalOrders}\n`;
      message += `📈 *Avg Order Value:* ${formatCurrency(data.data.summary.averageOrderValue)}\n\n`;
      
      message += '📊 *Revenue by Type:*\n';
      for (const type of data.data.revenueByType.slice(0, 5)) {
        message += `   ${type.name}: ${formatCurrency(type.revenue)} (${type.orders} orders)\n`;
      }
      await ctx.reply(message, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply('❌ No sales data available.');
    }
  } catch (error) {
    await ctx.reply('❌ Error fetching sales report.');
  }
});

bot.callbackQuery('admin_report_orders', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply('📦 *Order Report*\n\nFeature coming soon...');
});

bot.callbackQuery('admin_report_payments', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply('💳 *Payment Report*\n\nFeature coming soon...');
});

bot.callbackQuery('admin_report_customers', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply('👥 *Customer Report*\n\nFeature coming soon...');
});

bot.callbackQuery('admin_report_groups', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply('🛒 *Group Report*\n\nFeature coming soon...');
});

// ==================== SETTINGS ====================

bot.callbackQuery('admin_settings', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '⚙️ *SETTINGS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'Select a setting to configure:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🏢 Company Details', callback_data: 'admin_company_details' }],
          [{ text: '💰 Fee Management', callback_data: 'admin_fee_management' }],
          [{ text: '📱 Bot Info', callback_data: 'admin_bot_info' }],
          [{ text: '🔙 Back', callback_data: 'admin_back' }],
        ],
      },
    }
  );
});

bot.callbackQuery('admin_company_details', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '🏢 *Company Details*\n\n' +
    'Feature coming soon...',
    { parse_mode: 'Markdown' }
  );
});

bot.callbackQuery('admin_fee_management', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '💰 *Fee Management*\n━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'Configure fees and charges:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Add Discount', callback_data: 'admin_add_discount' }],
          [{ text: '💳 Service Charge', callback_data: 'admin_add_service' }],
          [{ text: '📋 Tax Config', callback_data: 'admin_add_tax' }],
          [{ text: '🚚 Delivery Charges', callback_data: 'admin_delivery_charges' }],
          [{ text: '🔙 Back', callback_data: 'admin_back' }],
        ],
      },
    }
  );
});

bot.callbackQuery('admin_add_discount', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '🔄 *Add Discount*\n\n' +
    'Format:\n' +
    '`nameEn: Weekend Discount`\n' +
    '`valueType: PERCENTAGE`\n' +
    '`value: 10`\n' +
    '`applyTo: ALL`\n' +
    '`priority: 1`',
    { parse_mode: 'Markdown' }
  );
});

bot.callbackQuery('admin_add_service', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '💳 *Add Service Charge*\n\n' +
    'Format:\n' +
    '`nameEn: Service Fee`\n' +
    '`type: FIXED`\n' +
    '`value: 50`\n' +
    '`priority: 2`',
    { parse_mode: 'Markdown' }
  );
});

bot.callbackQuery('admin_add_tax', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '📋 *Add Tax*\n\n' +
    'Format:\n' +
    '`nameEn: VAT`\n' +
    '`value: 15`\n' +
    '`priority: 3`',
    { parse_mode: 'Markdown' }
  );
});

bot.callbackQuery('admin_delivery_charges', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '🚚 *Delivery Charges*\n\n' +
    'Feature coming soon...',
    { parse_mode: 'Markdown' }
  );
});

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
    '📡 *API URL:* https://ale-kircha-kb3m.onrender.com\n' +
    '👥 *Admin IDs:* ' + ADMIN_IDS.join(', ') + '\n\n' +
    '📊 *Status:* All systems operational',
    { parse_mode: 'Markdown' }
  );
});

// ==================== BACK & REFRESH ====================

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

// ==================== START ====================

await bot.init();

bot.start({
  allowed_updates: ['message', 'callback_query'],
});

console.log('🤖 Admin Bot is running...');
console.log(`📊 API URL: ${API_URL}`);
console.log(`👥 Admin IDs: ${ADMIN_IDS.join(', ')}`);
