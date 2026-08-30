import { Bot, session, Context, InlineKeyboard } from 'grammy';
import { conversations, type ConversationFlavor } from '@grammyjs/conversations';
import { type SessionFlavor } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:4000';
const BOT_TOKEN = process.env.CUSTOMER_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ CUSTOMER_BOT_TOKEN is required!');
  process.exit(1);
}

// Define session type
interface SessionData {
  language: string;
  step: string;
  isRegistered: boolean;
  customerId: string | null;
  data: Record<string, any>;
}

// Create bot with session type
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;

const bot = new Bot<MyContext>(BOT_TOKEN);

// Session middleware
bot.use(session({
  initial: (): SessionData => ({
    language: 'en',
    step: 'start',
    isRegistered: false,
    customerId: null,
    data: {},
  }),
}));

// Conversations middleware
bot.use(conversations());

// ==================== HELPERS ====================

async function apiCall(endpoint: string, options: any = {}, ctx?: MyContext) {
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

async function checkUserRegistration(ctx: MyContext): Promise<boolean> {
  if (ctx.session.isRegistered && ctx.session.customerId) return true;
  try {
    const data = await apiCall('/api/v1/customers/me', {}, ctx);
    if (data.success && data.data) {
      ctx.session.isRegistered = true;
      ctx.session.customerId = data.data.id;
      ctx.session.language = data.data.preferredLanguage || 'en';
      return true;
    }
  } catch (error) {}
  return false;
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
  const isRegistered = await checkUserRegistration(ctx);
  const firstName = ctx.from?.first_name || 'Customer';
  
  if (isRegistered) {
    await ctx.reply(`👋 Welcome back to Ale Kircha, ${firstName}!`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Main Menu', callback_data: 'show_menu' }],
        ],
      },
    });
    return;
  }
  
  await ctx.reply(`👋 Welcome to Ale Kircha, ${firstName}!\n\nPlease select your language:`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🇬🇧 English', callback_data: 'lang_en' }],
        [{ text: '🇪🇹 አማርኛ', callback_data: 'lang_am' }],
      ],
    },
  });
});

// ==================== LANGUAGE ====================

bot.callbackQuery(/lang_(en|am)/, async (ctx) => {
  const lang = ctx.match[1];
  await ctx.answerCallbackQuery();
  ctx.session.language = lang;
  
  await ctx.reply(
    lang === 'en' 
      ? '✅ Language set!\n\n📱 Share your phone number:' 
      : '✅ ቋንቋ ተቀየረ!\n\n📱 ስልክ ቁጥርዎን ያጋሩ:',
    {
      reply_markup: {
        keyboard: [[{ text: '📱 Share My Phone Number', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
});

// ==================== CONTACT ====================

bot.on('message:contact', async (ctx) => {
  const contact = ctx.message.contact;
  if (!contact) return;
  const user = ctx.from;
  if (!user) return;
  
  try {
    const data = await apiCall('/api/v1/customers/register', {
      method: 'POST',
      body: JSON.stringify({
        telegramId: user.id.toString(),
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: contact.phone_number,
        fullName: `${user.first_name} ${user.last_name || ''}`.trim(),
        preferredLanguage: ctx.session.language || 'en',
      }),
    }, ctx);
    
    if (data.success) {
      ctx.session.isRegistered = true;
      ctx.session.customerId = data.data.id;
      await ctx.reply('✅ Registration successful!', {
        reply_markup: { remove_keyboard: true, inline_keyboard: [[{ text: '📋 Main Menu', callback_data: 'show_menu' }]] },
      });
    } else {
      await ctx.reply(`❌ Registration failed: ${data.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    await ctx.reply('❌ Network error. Please try again later.');
  }
});

// ==================== MAIN MENU ====================

bot.callbackQuery('show_menu', async (ctx) => {
  await ctx.answerCallbackQuery();
  await showMainMenu(ctx);
});

async function showMainMenu(ctx: MyContext) {
  const lang = ctx.session.language || 'en';
  await ctx.reply(
    lang === 'en' ? '📋 *Main Menu*\nChoose an option:' : '📋 *ዋና ምናሌ*\nአማራጭ ይምረጡ:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Order Kircha', callback_data: 'menu_order' }],
          [{ text: '📦 My Orders', callback_data: 'menu_orders' }],
          [{ text: '👤 Profile', callback_data: 'menu_profile' }],
          [{ text: '❓ Help', callback_data: 'menu_help' }],
        ],
      },
    }
  );
}

// ==================== ORDER ====================

bot.callbackQuery('menu_order', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/kircha/groups/available', {}, ctx);
    let message = '🛒 *Available Groups:*\n\n';
    if (data.success && data.data && data.data.length > 0) {
      for (const group of data.data) {
        const available = group.totalCapacity - group.reservedQuantity - group.soldQuantity;
        message += `*${group.nameEn}*\n📦 ${available}/${group.totalCapacity}\n💰 ${formatCurrency(group.unitPrice)}\n\n`;
      }
      await ctx.reply(message, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply('No groups available.');
    }
  } catch (error) {
    await ctx.reply('❌ Error fetching groups.');
  }
});

// ==================== ORDERS ====================

bot.callbackQuery('menu_orders', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/orders/my', {}, ctx);
    let message = '📦 *My Orders*\n\n';
    if (data.success && data.data && data.data.length > 0) {
      for (const order of data.data.slice(0, 5)) {
        message += `*${order.orderNumber}*\n💰 ${formatCurrency(order.totalAmount)}\n📌 ${order.status}\n\n`;
      }
    } else {
      message += 'No orders found.';
    }
    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    await ctx.reply('❌ Error fetching orders.');
  }
});

// ==================== PROFILE ====================

bot.callbackQuery('menu_profile', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/customers/me', {}, ctx);
    if (data.success) {
      const c = data.data;
      await ctx.reply(
        `👤 *Profile*\n📛 ${c.fullName}\n📱 ${c.user?.phone || 'N/A'}\n📅 ${formatDate(c.registrationDate)}`,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    await ctx.reply('❌ Error fetching profile.');
  }
});

// ==================== HELP ====================

bot.callbackQuery('menu_help', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '❓ *Help*\n\n1. /start - Begin\n2. Share phone to register\n3. Order Kircha\n4. Track orders\n\nContact: @AleKirchaAdmin',
    { parse_mode: 'Markdown' }
  );
});

// ==================== START ====================

await bot.init();

bot.start({
  allowed_updates: ['message', 'callback_query'],
});

console.log('🤖 Customer Bot is running...');
console.log(`📊 API URL: ${API_URL}`);
