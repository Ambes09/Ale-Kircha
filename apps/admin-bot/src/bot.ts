import { Bot, session, Context, InlineKeyboard } from 'grammy';
import { conversations } from '@grammyjs/conversations';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:4000';
const BOT_TOKEN = process.env.ADMIN_BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim());

if (!BOT_TOKEN) {
  console.error(' ADMIN_BOT_TOKEN is required!');
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

// ==================== SESSION ====================

bot.use(session({
  initial: () => ({
    language: 'en',
    step: 'dashboard',
    currentPage: 1,
    data: {},
  }),
}));

bot.use(conversations());

// ==================== HELPERS ====================

async function apiCall(endpoint: string, options: any = {}, ctx?: Context) {
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (ctx?.from?.id) {
    headers['x-telegram-id'] = ctx.from.id.toString();
  }
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  return response.json();
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
  const map: any = {
    'OPEN': '🟢', 'DRAFT': '📝', 'FULL': '🔴', 'CLOSED': '🔒',
    'COMPLETED': '✅', 'CANCELLED': '', 'EXPIRED': '⏰',
    'PAID': '✅', 'UNPAID': '', 'PENDING': '⏳', 'REJECTED': '',
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

bot.command('menu', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.reply('⛔ Unauthorized.');
    return;
  }
  await showDashboard(ctx);
});

// ==================== DASHBOARD ====================

async function showDashboard(ctx: Context) {
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

// ==================== STATS ====================

bot.callbackQuery('admin_stats', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showStats(ctx);
});

async function showStats(ctx: Context) {
  try {
    const data = await apiCall('/api/v1/admin/stats', {}, ctx);
    const stats = data.success ? data.data : { pendingPayments: 0, pendingOrders: 0, activeGroups: 0, totalCustomers: 0, todayRevenue: 0 };

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
    await ctx.reply(' Error fetching stats.');
  }
}

// ==================== GROUPS ====================

bot.callbackQuery('admin_groups', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  ctx.session.currentPage = 1;
  await showGroups(ctx, 1);
});

async function showGroups(ctx: Context, page: number = 1) {
  try {
    const data = await apiCall('/api/v1/kircha/groups', {}, ctx);
    let message = '🛒 *KIRCHA GROUPS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    if (data.success && data.data.length > 0) {
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
    await ctx.reply(' Error fetching groups.');
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

// ==================== ORDERS ====================

bot.callbackQuery('admin_orders', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  ctx.session.currentPage = 1;
  await showOrders(ctx, 1);
});

async function showOrders(ctx: Context, page: number = 1) {
  try {
    const data = await apiCall('/api/v1/orders', {}, ctx);
    let message = '📦 *ORDERS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    if (data.success && data.data && data.data.length > 0) {
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
    await ctx.reply(' Error fetching orders.');
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

// ==================== USERS ====================

bot.callbackQuery('admin_users', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  ctx.session.currentPage = 1;
  await showUsers(ctx, 1);
});

async function showUsers(ctx: Context, page: number = 1) {
  try {
    const data = await apiCall('/api/v1/customers', {}, ctx);
    let message = '👥 *USERS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    if (data.success && data.data && data.data.length > 0) {
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
    await ctx.reply(' Error fetching users.');
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

// ==================== PAYMENTS ====================

bot.callbackQuery('admin_payments', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showPayments(ctx);
});

async function showPayments(ctx: Context) {
  try {
    const data = await apiCall('/api/v1/payment/methods', {}, ctx);
    let message = '💳 *PAYMENT METHODS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    if (data.success && data.data.length > 0) {
      for (const method of data.data) {
        message += `🏦 *${method.name}*\n`;
        message += `📋 ${method.accountName}\n`;
        message += `🔢 ${method.accountNumber}\n`;
        message += `📌 ${method.active ? '✅ Active' : ' Inactive'}\n`;
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
    await ctx.reply(' Error fetching payment methods.');
  }
}

// ==================== REPORTS ====================

bot.callbackQuery('admin_reports', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showReports(ctx);
});

async function showReports(ctx: Context) {
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
      
      message += '\n📈 *Recent Trend:*\n';
      for (const day of data.data.groupedData.slice(-7)) {
        message += `   ${day.date}: ${formatCurrency(day.revenue)} (${day.orders} orders)\n`;
      }
      
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Refresh', callback_data: 'admin_report_sales' }],
            [{ text: '🔙 Back', callback_data: 'admin_reports' }],
          ],
        },
      });
    }
  } catch (error) {
    await ctx.reply(' Error fetching sales report.');
  }
});

// ==================== SETTINGS ====================

bot.callbackQuery('admin_settings', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  await showSettings(ctx);
});

async function showSettings(ctx: Context) {
  const text = `
⚙️ *SYSTEM SETTINGS*
━━━━━━━━━━━━━━━━━━━━━━

📌 *General Settings*
• Platform: Ale Kircha
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

// ==================== BOT INFO ====================

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
    '📡 *API URL:* http://localhost:4000\n' +
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

// ==================== START ====================

await bot.init();

bot.start({
  allowed_updates: ['message', 'callback_query'],
});

console.log('🤖 Admin Bot is running...');
console.log(`📊 API URL: ${API_URL}`);
console.log(`👥 Admin IDs: ${ADMIN_IDS.join(', ')}`);
console.log(`🔑 Bot: @${bot.botInfo?.username || 'unknown'}`);

// ==================== ADD MISSING ADMIN COMMANDS ====================

bot.command('stats', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.reply('⛔ Unauthorized.');
    return;
  }
  await showStats(ctx);
});

bot.command('groups', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.reply('⛔ Unauthorized.');
    return;
  }
  await showGroups(ctx);
});

bot.command('orders', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.reply('⛔ Unauthorized.');
    return;
  }
  await showOrders(ctx);
});

bot.command('users', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.reply('⛔ Unauthorized.');
    return;
  }
  await showUsers(ctx);
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
    {
      parse_mode: 'Markdown'
    }
  );
});

// ==================== VERIFY PAYMENT ====================

bot.callbackQuery(/admin_verify_payment_(.+)/, async (ctx) => {
  const paymentId = ctx.match[1];
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    `💳 *Payment Verification*\n\n` +
    `Payment ID: ${paymentId}\n\n` +
    `Click below to confirm or reject:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Confirm', callback_data: `admin_confirm_payment_${paymentId}` }],
          [{ text: ' Reject', callback_data: `admin_reject_payment_${paymentId}` }],
          [{ text: '🔙 Back', callback_data: 'admin_payments' }],
        ],
      },
    }
  );
});

bot.callbackQuery(/admin_confirm_payment_(.+)/, async (ctx) => {
  const paymentId = ctx.match[1];
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  try {
    await apiCall(`/api/v1/payment/${paymentId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status: 'PAID' })
    }, ctx);
    await ctx.reply('✅ Payment confirmed successfully!');
  } catch (error) {
    await ctx.reply(' Error confirming payment.');
  }
});

bot.callbackQuery(/admin_reject_payment_(.+)/, async (ctx) => {
  const paymentId = ctx.match[1];
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    ' *Reject Payment*\n\n' +
    'Send the rejection reason:',
    { parse_mode: 'Markdown' }
  );
  ctx.session.step = 'reject_payment';
  ctx.session.data.paymentId = paymentId;
});

// ==================== DELIVERY ====================

bot.callbackQuery('admin_delivery', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '🚚 *Delivery Management*\n\n' +
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

// ==================== BULK MESSAGE ====================

bot.callbackQuery('admin_bulk_message_flow', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '📨 *Send Bulk Message*\n\n' +
    'Format:\n' +
    '`target: all` (or `group:GROUP_ID`)\n' +
    '`title: Announcement`\n' +
    '`message: Your message`\n\n' +
    'Example:\n' +
    '```\n' +
    'target: all\n' +
    'title: 🎉 New Kircha Available\n' +
    'message: Check out our new Ox Kircha!\n' +
    '```',
    {
      parse_mode: 'Markdown'
    }
  );
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
    'Send the Telegram ID to ban:\n' +
    '`678862323`\n\n' +
    'Optional reason:\n' +
    '`678862323|Spamming`',
    { parse_mode: 'Markdown' }
  );
});

bot.callbackQuery('admin_unban_user', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '🔓 *Unban User*\n\n' +
    'Send the Telegram ID to unban:\n' +
    '`678862323`',
    { parse_mode: 'Markdown' }
  );
});

bot.callbackQuery('admin_banned_list', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  try {
    const data = await apiCall('/api/v1/admin/banned', {}, ctx);
    let message = '🚫 *Banned Users*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    if (data.success && data.data.length > 0) {
      for (const ban of data.data) {
        message += `👤 User: ${ban.telegramId}\n`;
        message += `📝 Reason: ${ban.reason || 'No reason'}\n`;
        message += `📅 Banned: ${formatDate(ban.bannedAt)}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      }
    } else {
      message += 'No banned users.';
    }
    
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back', callback_data: 'admin_settings' }],
        ],
      },
    });
  } catch (error) {
    await ctx.reply(' Error fetching banned users.');
  }
});

// ==================== ADD DISCOUNT ====================

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
    '`valueType: PERCENTAGE` (or FIXED)\n' +
    '`value: 10`\n' +
    '`applyTo: ALL`\n' +
    '`priority: 1`\n\n' +
    'Example:\n' +
    '```\n' +
    'nameEn: Early Bird\n' +
    'valueType: PERCENTAGE\n' +
    'value: 15\n' +
    'applyTo: ALL\n' +
    'priority: 1\n' +
    '```',
    {
      parse_mode: 'Markdown'
    }
  );
});

// ==================== ADD SERVICE CHARGE ====================

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
    '`type: FIXED` (or PERCENTAGE, PER_UNIT)\n' +
    '`value: 50`\n' +
    '`applyTo: ALL`\n' +
    '`priority: 2`',
    {
      parse_mode: 'Markdown'
    }
  );
});

// ==================== ADD TAX ====================

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
    {
      parse_mode: 'Markdown'
    }
  );
});

// ==================== DELIVERY ZONES ====================

bot.callbackQuery('admin_delivery_zones', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  try {
    const data = await apiCall('/api/v1/admin/delivery-zones', {}, ctx);
    let message = '🚚 *Delivery Zones*\n━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    if (data.success && data.data.length > 0) {
      for (const zone of data.data) {
        message += `📍 *${zone.nameEn}*\n`;
        message += `💰 ${zone.fee} ETB\n`;
        message += `📦 Min Order: ${zone.minOrder} ETB\n`;
        message += `📌 ${zone.isActive ? '✅ Active' : ' Inactive'}\n\n`;
      }
    } else {
      message += 'No delivery zones configured.';
    }
    
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Zone', callback_data: 'admin_add_zone' }],
          [{ text: '🔙 Back', callback_data: 'admin_back' }],
        ],
      },
    });
  } catch (error) {
    await ctx.reply(' Error fetching delivery zones.');
  }
});

// ==================== ADD ZONE ====================

bot.callbackQuery('admin_add_zone', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '🚚 *Add Delivery Zone*\n\n' +
    'Format:\n' +
    '`nameEn: Bole`\n' +
    '`fee: 100`\n' +
    '`minOrder: 500`\n' +
    '`priority: 1`',
    {
      parse_mode: 'Markdown'
    }
  );
});

// ==================== CREATE GROUP FLOW ====================

bot.callbackQuery('admin_create_group_flow', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.answerCallbackQuery('⛔ Unauthorized');
    return;
  }
  await ctx.answerCallbackQuery();
  
  await ctx.reply(
    '🛒 *Create Kircha Group Flow*\n\n' +
    'Step 1: Send the group details:\n\n' +
    '`nameEn: Saturday Ox Kircha`\n' +
    '`nameAm: ቅዳሜ የበሬ ቅርጫ`\n' +
    '`kirchaTypeCode: OX`\n' +
    '`totalCapacity: 8`\n' +
    '`unitPrice: 35000`\n' +
    '`halfPrice: 18000`\n' +
    '`quarterPrice: 9000`\n' +
    '`deliveryFee: 500`\n' +
    '`deliveryDate: 2026-08-29T14:00:00Z`\n\n' +
    'Send the above as a single message.',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back', callback_data: 'admin_groups' }],
        ],
      },
    }
  );
});
