import { Bot, session, Context, InlineKeyboard } from 'grammy';
import { conversations } from '@grammyjs/conversations';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:4000';
const BOT_TOKEN = process.env.ADMIN_BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => id.trim());

if (!BOT_TOKEN) {
  console.error('❌ ADMIN_BOT_TOKEN is required!');
  process.exit(1);
}

// Define session type
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

bot.command('menu', async (ctx) => {
  if (!await isAdmin(ctx)) {
    await ctx.reply('⛔ Unauthorized.');
    return;
  }
  await showDashboard(ctx);
});

// ==================== DASHBOARD ====================

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
    .text('⚙️ Settings', 'admin_settings')
    .text('🔄 Refresh', 'admin_refresh');

  await ctx.reply(
    '🏗️ *ALE KIRCHA ADMIN*\n━━━━━━━━━━━━━━━━━━━━━━\n\nWelcome to the Admin Dashboard!',
    {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    }
  );
}

// ==================== CALLBACKS ====================

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
      `💳 Pending Payments: ${stats.pendingPayments}\n` +
      `📦 Pending Orders: ${stats.pendingOrders}\n` +
      `🛒 Active Groups: ${stats.activeGroups}\n` +
      `👥 Total Customers: ${stats.totalCustomers}\n` +
      `💰 Today\'s Revenue: ${formatCurrency(stats.todayRevenue)}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    await ctx.reply('❌ Error fetching stats.');
  }
});

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
