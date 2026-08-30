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
  await ctx.reply(
    '🏗️ *ALE KIRCHA ADMIN*\n━━━━━━━━━━━━━━━━━━━━━━\n\nWelcome to the Admin Dashboard!',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Stats', callback_data: 'admin_stats' }],
          [{ text: '🛒 Groups', callback_data: 'admin_groups' }],
          [{ text: '📦 Orders', callback_data: 'admin_orders' }],
          [{ text: '💳 Payments', callback_data: 'admin_payments' }],
          [{ text: '👥 Users', callback_data: 'admin_users' }],
          [{ text: '📈 Reports', callback_data: 'admin_reports' }],
          [{ text: '⚙️ Settings', callback_data: 'admin_settings' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_refresh' }],
        ],
      },
    }
  );
}

// ==================== START ====================

await bot.init();

bot.start({
  allowed_updates: ['message', 'callback_query'],
});

console.log('🤖 Admin Bot is running...');
console.log(`📊 API URL: ${API_URL}`);
console.log(`👥 Admin IDs: ${ADMIN_IDS.join(', ')}`);
