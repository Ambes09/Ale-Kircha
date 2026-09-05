// ============================================================
// REAL ADMIN HANDLERS - Replace "Coming Soon"
// ============================================================

// GROUPS - Real data
export async function adminGroups(ctx: any) {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/groups');
    const groups = data.data || [];
    let msg = '🥩 *GROUPS*\n\n';
    if (groups.length) {
      for (const g of groups) {
        msg += `📌 ${g.name || 'N/A'}\n`;
        msg += `   📊 Quota: ${g.totalQuota || 0}\n`;
        msg += `   💰 ${g.unitPrice || 0} ETB\n\n`;
      }
    } else {
      msg += 'No groups found. Create your first group!';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create Group', callback_data: 'groups_create' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load groups.');
  }
}

// FEES - Real data
export async function adminFees(ctx: any) {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/fees');
    const fees = data.data || [];
    let msg = '💵 *FEES & CHARGES*\n\n';
    if (fees.length) {
      for (const f of fees) {
        msg += `📌 ${f.name || 'N/A'}\n`;
        msg += `   ${f.type}: ${f.value}\n\n`;
      }
    } else {
      msg += 'No fees configured.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Fee', callback_data: 'fee_add' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load fees.');
  }
}

// FAQ - Real data
export async function adminFAQ(ctx: any) {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/faq');
    const faqs = data.data || [];
    let msg = '❓ *FAQ*\n\n';
    if (faqs.length) {
      for (const f of faqs) {
        msg += `📌 ${f.questionEn || 'N/A'}\n`;
        msg += `   ${f.isActive ? '🟢 Active' : '🔴 Inactive'}\n\n`;
      }
    } else {
      msg += 'No FAQs found.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add FAQ', callback_data: 'faq_add' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load FAQs.');
  }
}

// TERMS - Real data
export async function adminTerms(ctx: any) {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/terms');
    const terms = data.data || [];
    let msg = '📜 *TERMS*\n\n';
    if (terms.length) {
      for (const t of terms) {
        msg += `📌 v${t.version || '1.0'}\n`;
        msg += `   ${t.isActive ? '🟢 Active' : '⚪ Inactive'}\n`;
        msg += `   📅 ${new Date(t.effectiveDate).toLocaleDateString()}\n\n`;
      }
    } else {
      msg += 'No terms found.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create Terms', callback_data: 'terms_create' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load terms.');
  }
}

// AUDIT - Real data
export async function adminAudit(ctx: any) {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/audit');
    const logs = data.data || [];
    let msg = '📋 *AUDIT LOG*\n\n';
    if (logs.length) {
      for (const log of logs.slice(0, 10)) {
        msg += `📌 ${log.action || 'Unknown'}\n`;
        msg += `   👤 ${log.username || 'System'}\n`;
        msg += `   📅 ${new Date(log.createdAt).toLocaleString()}\n\n`;
      }
    } else {
      msg += 'No audit logs found.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔎 Filter', callback_data: 'audit_filter' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load audit logs.');
  }
}

// NOTIFICATIONS - Real data
export async function adminNotifications(ctx: any) {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/notifications/recent');
    const notifications = data.data || [];
    let msg = '🔔 *NOTIFICATIONS*\n\n';
    if (notifications.length) {
      for (const n of notifications.slice(0, 10)) {
        msg += `📌 ${n.title || 'N/A'}\n`;
        msg += `   📅 ${new Date(n.createdAt).toLocaleString()}\n\n`;
      }
    } else {
      msg += 'No notifications.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📢 Send', callback_data: 'notification_send' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load notifications.');
  }
}

// ADMIN USERS - Real data
export async function adminUsers(ctx: any) {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/users');
    const users = data.data || [];
    let msg = '👤 *ADMIN USERS*\n\n';
    if (users.length) {
      for (const u of users) {
        msg += `📌 ${u.username || u.telegramId || 'N/A'}\n`;
        msg += `   🔹 ${u.role || 'ADMIN'}\n`;
        msg += `   ${u.isActive ? '🟢 Active' : '🔴 Inactive'}\n\n`;
      }
    } else {
      msg += 'No admin users found.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Admin', callback_data: 'users_add' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load admin users.');
  }
}

// BANKS - Real data
export async function adminBanks(ctx: any) {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/banks');
    const banks = data.data || [];
    let msg = '🏦 *BANK ACCOUNTS*\n\n';
    if (banks.length) {
      for (const b of banks) {
        msg += `📌 ${b.bankName || 'N/A'}\n`;
        msg += `   📱 ${b.accountName || 'N/A'}\n`;
        msg += `   🔢 ${b.accountNumber || 'N/A'}\n\n`;
      }
    } else {
      msg += 'No bank accounts configured.';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Bank', callback_data: 'bank_add' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❌ Failed to load banks.');
  }
}
