import re

with open('src/bot.ts', 'r') as f:
    content = f.read()

# ============================================================
# 1. CUSTOMERS - Fix empty state
# ============================================================

# Find admin_customers handler and add buttons
old_customers = r'''bot\.callbackQuery\('admin_customers', async \(ctx\) => \{
  await ctx\.answerCallbackQuery\(\);[\s\S]*?await ctx\.reply\([^)]*\);[\s\S]*?\}\)'''
new_customers = '''bot.callbackQuery('admin_customers', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/customers');
    const customers = data.data || [];
    let msg = '👥 *CUSTOMERS*\\n\\n';
    if (customers.length) {
      for (const c of customers.slice(0, 10)) {
        const statusIcon = c.status === 'ACTIVE' ? '🟢' : c.status === 'SUSPENDED' ? '🔴' : '⚪';
        msg += `${statusIcon} *${c.fullName || 'N/A'}*\\n`;
        msg += `   🆔 ${c.id?.substring(0, 8) || 'N/A'}\\n`;
        msg += `   📱 ${c.user?.phone || 'N/A'}\\n`;
        msg += `   📅 ${new Date(c.registrationDate).toLocaleDateString()}\\n\\n`;
      }
      if (customers.length > 10) msg += `... ${customers.length - 10} more\\n`;
    } else {
      msg += 'No customers found.\\n\\n[🔄 Refresh] [🔎 Search]\\n[📊 Stats] [🏠 Main Menu]';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'admin_customers' }],
          [{ text: '🔎 Search', callback_data: 'customers_search' }],
          [{ text: '📊 Stats', callback_data: 'customers_stats' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('👥 *CUSTOMERS*\\n\\nNo customers found.\\n\\n[🔄 Refresh] [🔎 Search]\\n[📊 Stats] [🏠 Main Menu]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'admin_customers' }],
          [{ text: '🔎 Search', callback_data: 'customers_search' }],
          [{ text: '📊 Stats', callback_data: 'customers_stats' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});'''

content = re.sub(old_customers, new_customers, content, flags=re.DOTALL)

# ============================================================
# 2. GROUPS - Fix empty state
# ============================================================

old_groups = r'''bot\.callbackQuery\('admin_groups', async \(ctx\) => \{
  await ctx\.answerCallbackQuery\(\);[\s\S]*?await ctx\.reply\([^)]*\);[\s\S]*?\}\)'''
new_groups = '''bot.callbackQuery('admin_groups', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/kircha/groups');
    const groups = data.data || [];
    let msg = '🥩 *GROUPS*\\n\\n';
    if (groups.length) {
      for (const g of groups.slice(0, 10)) {
        const avail = (g.maxQuota || 0) - (g.consumedQuota || 0);
        const statusIcon = g.status === 'OPEN' ? '🟢' : g.status === 'FULL' ? '📦' : g.status === 'COMPLETED' ? '✅' : '⚪';
        msg += `${statusIcon} *${g.name || 'N/A'}*\\n`;
        msg += `   📦 ${avail.toFixed(1)}/${g.maxQuota || 0}\\n`;
        msg += `   💰 ${formatCurrency(g.fullPrice || 0)}\\n\\n`;
      }
      if (groups.length > 10) msg += `... ${groups.length - 10} more\\n`;
    } else {
      msg += 'No groups found.\\n\\n[➕ Create Group] [🔄 Refresh]\\n[📋 Pending Requests] [🏠 Main Menu]';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create', callback_data: 'groups_create' }, { text: '🔄 Refresh', callback_data: 'admin_groups' }],
          [{ text: '📋 Pending', callback_data: 'groups_pending' }, { text: '🟢 Open', callback_data: 'groups_open' }],
          [{ text: '✅ Completed', callback_data: 'groups_completed' }, { text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('🥩 *GROUPS*\\n\\nNo groups found.\\n\\n[➕ Create Group] [🔄 Refresh]\\n[📋 Pending] [🏠 Main Menu]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create', callback_data: 'groups_create' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_groups' }],
          [{ text: '📋 Pending', callback_data: 'groups_pending' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});'''

content = re.sub(old_groups, new_groups, content, flags=re.DOTALL)

# ============================================================
# 3. ORDERS - Fix empty state
# ============================================================

old_orders = r'''bot\.callbackQuery\('admin_orders', async \(ctx\) => \{
  await ctx\.answerCallbackQuery\(\);[\s\S]*?await ctx\.reply\([^)]*\);[\s\S]*?\}\)'''
new_orders = '''bot.callbackQuery('admin_orders', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/orders');
    const orders = data.data || [];
    let msg = '📦 *ORDERS*\\n\\n';
    if (orders.length) {
      for (const o of orders.slice(0, 10)) {
        const statusIcon = o.orderStatus === 'PENDING' ? '🟡' : 
                          o.orderStatus === 'COMPLETED' ? '✅' : 
                          o.orderStatus === 'CANCELLED' ? '❌' : '🔵';
        msg += `${statusIcon} *${o.orderNumber || 'N/A'}*\\n`;
        msg += `   👤 ${o.customerName || 'N/A'}\\n`;
        msg += `   💰 ${formatCurrency(o.totalAmount || 0)}\\n\\n`;
      }
      if (orders.length > 10) msg += `... ${orders.length - 10} more\\n`;
    } else {
      msg += 'No orders found.\\n\\n[🔄 Refresh] [🔎 Search]\\n[📊 Summary] [🏠 Main Menu]';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'admin_orders' }],
          [{ text: '🔎 Search', callback_data: 'orders_search' }],
          [{ text: '📊 Summary', callback_data: 'orders_summary' }],
          [{ text: '🟡 Pending', callback_data: 'orders_pending' }],
          [{ text: '✅ Completed', callback_data: 'orders_completed' }],
          [{ text: '❌ Cancelled', callback_data: 'orders_cancelled' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('📦 *ORDERS*\\n\\nNo orders found.\\n\\n[🔄 Refresh] [🔎 Search]\\n[📊 Summary] [🏠 Main Menu]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'admin_orders' }],
          [{ text: '🔎 Search', callback_data: 'orders_search' }],
          [{ text: '📊 Summary', callback_data: 'orders_summary' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});'''

content = re.sub(old_orders, new_orders, content, flags=re.DOTALL)

# ============================================================
# 4. PAYMENTS - Fix empty state
# ============================================================

old_payments = r'''bot\.callbackQuery\('admin_payments', async \(ctx\) => \{
  await ctx\.answerCallbackQuery\(\);[\s\S]*?await ctx\.reply\([^)]*\);[\s\S]*?\}\)'''
new_payments = '''bot.callbackQuery('admin_payments', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/payments');
    const payments = data.data || [];
    let msg = '💳 *PAYMENTS*\\n\\n';
    if (payments.length) {
      for (const p of payments.slice(0, 10)) {
        const statusIcon = p.status === 'PENDING' ? '🟡' : 
                          p.status === 'VERIFIED' ? '✅' : 
                          p.status === 'REJECTED' ? '🔴' : '⚪';
        msg += `${statusIcon} *${p.paymentId || p.id}*\\n`;
        msg += `   💰 ${formatCurrency(p.amount || 0)}\\n`;
        msg += `   👤 ${p.customerName || 'N/A'}\\n\\n`;
      }
      if (payments.length > 10) msg += `... ${payments.length - 10} more\\n`;
    } else {
      msg += 'No payments found.\\n\\n[🔄 Refresh] [🔎 Search]\\n[📋 Pending Review] [🏠 Main Menu]';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'admin_payments' }],
          [{ text: '🔎 Search', callback_data: 'payments_search' }],
          [{ text: '📋 Pending Review', callback_data: 'payments_review' }],
          [{ text: '🟡 Pending', callback_data: 'payments_pending' }],
          [{ text: '✅ Verified', callback_data: 'payments_verified' }],
          [{ text: '🔴 Rejected', callback_data: 'payments_rejected' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('💳 *PAYMENTS*\\n\\nNo payments found.\\n\\n[🔄 Refresh] [🔎 Search]\\n[📋 Pending] [🏠 Main Menu]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'admin_payments' }],
          [{ text: '🔎 Search', callback_data: 'payments_search' }],
          [{ text: '📋 Pending', callback_data: 'payments_review' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});'''

content = re.sub(old_payments, new_payments, content, flags=re.DOTALL)

# ============================================================
# 5. REFUNDS - Fix empty state
# ============================================================

old_refunds = r'''bot\.callbackQuery\('admin_refunds', async \(ctx\) => \{
  await ctx\.answerCallbackQuery\(\);[\s\S]*?await ctx\.reply\([^)]*\);[\s\S]*?\}\)'''
new_refunds = '''bot.callbackQuery('admin_refunds', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/refunds');
    const refunds = data.data || [];
    let msg = '🔄 *REFUNDS*\\n\\n';
    if (refunds.length) {
      for (const r of refunds.slice(0, 10)) {
        const statusIcon = r.status === 'PENDING' ? '🟡' : 
                          r.status === 'APPROVED' ? '🟢' : 
                          r.status === 'REJECTED' ? '🔴' : 
                          r.status === 'COMPLETED' ? '✅' : '⚪';
        msg += `${statusIcon} *${r.refundId || r.id}*\\n`;
        msg += `   💰 ${formatCurrency(r.netRefund || 0)}\\n`;
        msg += `   👤 ${r.customerName || 'N/A'}\\n\\n`;
      }
      if (refunds.length > 10) msg += `... ${refunds.length - 10} more\\n`;
    } else {
      msg += 'No refunds found.\\n\\n[🔄 Refresh] [📋 Pending Approval]\\n[🏠 Main Menu]';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'admin_refunds' }],
          [{ text: '📋 Pending Approval', callback_data: 'refunds_review' }],
          [{ text: '🟡 Pending', callback_data: 'refunds_pending' }],
          [{ text: '🟢 Approved', callback_data: 'refunds_approved' }],
          [{ text: '✅ Completed', callback_data: 'refunds_completed' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('🔄 *REFUNDS*\\n\\nNo refunds found.\\n\\n[🔄 Refresh] [📋 Pending]\\n[🏠 Main Menu]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'admin_refunds' }],
          [{ text: '📋 Pending', callback_data: 'refunds_review' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});'''

content = re.sub(old_refunds, new_refunds, content, flags=re.DOTALL)

# ============================================================
# 6. DELIVERY - Fix empty state
# ============================================================

old_delivery = r'''bot\.callbackQuery\('admin_delivery', async \(ctx\) => \{
  await ctx\.answerCallbackQuery\(\);[\s\S]*?await ctx\.reply\([^)]*\);[\s\S]*?\}\)'''
new_delivery = '''bot.callbackQuery('admin_delivery', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/deliveries');
    const deliveries = data.data || [];
    let msg = '🚚 *DELIVERY MANAGEMENT*\\n\\n';
    if (deliveries.length) {
      for (const d of deliveries.slice(0, 10)) {
        const statusIcon = d.status === 'PENDING' ? '🟡' : 
                          d.status === 'ASSIGNED' ? '👤' : 
                          d.status === 'DELIVERED' ? '✅' : '🚚';
        msg += `${statusIcon} *${d.orderNumber || d.id}*\\n`;
        msg += `   👤 ${d.customerName || 'N/A'}\\n`;
        msg += `   📍 ${d.deliveryAddress || 'N/A'}\\n\\n`;
      }
      if (deliveries.length > 10) msg += `... ${deliveries.length - 10} more\\n`;
    } else {
      msg += 'No deliveries found.\\n\\n[➕ Create Delivery] [🔄 Refresh]\\n[📋 Pending] [🏠 Main Menu]';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create', callback_data: 'delivery_create' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_delivery' }],
          [{ text: '📋 Pending', callback_data: 'delivery_pending' }],
          [{ text: '👤 Assigned', callback_data: 'delivery_assigned' }],
          [{ text: '🚚 Out', callback_data: 'delivery_out' }],
          [{ text: '✅ Completed', callback_data: 'delivery_completed' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('🚚 *DELIVERY MANAGEMENT*\\n\\nNo deliveries found.\\n\\n[➕ Create] [🔄 Refresh]\\n[📋 Pending] [🏠 Main Menu]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create', callback_data: 'delivery_create' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_delivery' }],
          [{ text: '📋 Pending', callback_data: 'delivery_pending' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});'''

content = re.sub(old_delivery, new_delivery, content, flags=re.DOTALL)

# ============================================================
# 7. FEES - Fix empty state
# ============================================================

old_fees = r'''bot\.callbackQuery\('admin_fees', async \(ctx\) => \{
  await ctx\.answerCallbackQuery\(\);[\s\S]*?await ctx\.reply\([^)]*\);[\s\S]*?\}\)'''
new_fees = '''bot.callbackQuery('admin_fees', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/fees');
    const fees = data.data || [];
    let msg = '💵 *FEES & CHARGES*\\n\\n';
    if (fees.length) {
      for (const f of fees.slice(0, 10)) {
        const statusIcon = f.isActive ? '🟢' : '🔴';
        msg += `${statusIcon} *${f.name || 'N/A'}*\\n`;
        msg += `   📌 ${f.type || 'fixed'}: ${f.value || 0}\\n`;
        msg += `   📂 ${f.category || 'general'}\\n\\n`;
      }
      if (fees.length > 10) msg += `... ${fees.length - 10} more\\n`;
    } else {
      msg += 'No fees configured.\\n\\n[➕ Add Fee] [🏠 Main Menu]';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Fee', callback_data: 'fee_add' }],
          [{ text: '📋 Fee History', callback_data: 'fee_history' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_fees' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('💵 *FEES & CHARGES*\\n\\nNo fees configured.\\n\\n[➕ Add Fee] [🏠 Main Menu]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Fee', callback_data: 'fee_add' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});'''

content = re.sub(old_fees, new_fees, content, flags=re.DOTALL)

# ============================================================
# 8. BANK ACCOUNTS - Fix empty state
# ============================================================

old_banks = r'''bot\.callbackQuery\('admin_banks', async \(ctx\) => \{
  await ctx\.answerCallbackQuery\(\);[\s\S]*?await ctx\.reply\([^)]*\);[\s\S]*?\}\)'''
new_banks = '''bot.callbackQuery('admin_banks', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/banks');
    const banks = data.data || [];
    let msg = '🏦 *BANK ACCOUNTS*\\n\\n';
    if (banks.length) {
      for (const b of banks) {
        const statusIcon = b.isActive ? '🟢' : '🔴';
        msg += `${statusIcon} *${b.bankNameEn}* (${b.bankNameAm})\\n`;
        msg += `   📱 ${b.accountName}\\n`;
        msg += `   🔢 ${b.accountNumber}\\n`;
        if (b.isDefault) msg += `   ⭐ Default\\n`;
        msg += '\\n';
      }
    } else {
      msg += 'No bank accounts configured.\\n\\n[➕ Add Bank Account] [🏠 Main Menu]';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Bank', callback_data: 'bank_add' }],
          [{ text: '✏️ Edit', callback_data: 'bank_edit' }],
          [{ text: '🗑 Delete', callback_data: 'bank_delete' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_banks' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('🏦 *BANK ACCOUNTS*\\n\\nNo bank accounts configured.\\n\\n[➕ Add Bank] [🏠 Main Menu]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add Bank', callback_data: 'bank_add' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});'''

content = re.sub(old_banks, new_banks, content, flags=re.DOTALL)

# ============================================================
# 9. NOTIFICATIONS - Fix empty state
# ============================================================

old_notifications = r'''bot\.callbackQuery\('admin_notifications', async \(ctx\) => \{
  await ctx\.answerCallbackQuery\(\);[\s\S]*?await ctx\.reply\([^)]*\);[\s\S]*?\}\)'''
new_notifications = '''bot.callbackQuery('admin_notifications', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/admin/notifications/recent');
    const notifications = data.data || [];
    let msg = '🔔 *NOTIFICATIONS*\\n\\n';
    if (notifications.length) {
      for (const n of notifications.slice(0, 10)) {
        const emoji = n.type === 'CUSTOMER_REGISTERED' ? '🆕' : 
                      n.type === 'PAYMENT_SUBMITTED' ? '💳' : 
                      n.type === 'REFUND_REQUESTED' ? '↩️' : '📌';
        msg += `${emoji} *${n.title}*\\n`;
        msg += `${n.body?.substring(0, 80)}...\\n`;
        msg += `📅 ${new Date(n.createdAt).toLocaleString()}\\n\\n`;
      }
      if (notifications.length > 10) msg += `... ${notifications.length - 10} more\\n`;
    } else {
      msg += 'No new notifications.\\n\\n[📢 Send Notification] [📋 History]\\n[🔄 Refresh] [🏠 Main Menu]';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📢 Send', callback_data: 'notification_send' }],
          [{ text: '📋 History', callback_data: 'notification_history' }],
          [{ text: '⚙️ Settings', callback_data: 'settings_notification' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_notifications' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('🔔 *NOTIFICATIONS*\\n\\nNo new notifications.\\n\\n[📢 Send] [📋 History]\\n[⚙️ Settings] [🏠 Main Menu]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📢 Send', callback_data: 'notification_send' }],
          [{ text: '📋 History', callback_data: 'notification_history' }],
          [{ text: '⚙️ Settings', callback_data: 'settings_notification' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});'''

content = re.sub(old_notifications, new_notifications, content, flags=re.DOTALL)

# ============================================================
# 10. TERMS - Fix empty state
# ============================================================

old_terms = r'''bot\.callbackQuery\('admin_terms', async \(ctx\) => \{
  await ctx\.answerCallbackQuery\(\);[\s\S]*?await ctx\.reply\([^)]*\);[\s\S]*?\}\)'''
new_terms = '''bot.callbackQuery('admin_terms', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/terms');
    const terms = data.data || [];
    let msg = '📜 *TERMS MANAGEMENT*\\n\\n';
    if (terms.length) {
      for (const t of terms.slice(0, 10)) {
        const statusIcon = t.isActive ? '🟢' : '⚪';
        msg += `${statusIcon} *v${t.version || '1.0'}*\\n`;
        msg += `   📅 ${new Date(t.effectiveFrom || t.effectiveDate).toLocaleDateString()}\\n`;
        msg += `   ${t.isActive ? 'CURRENT' : 'DRAFT'}\\n\\n`;
      }
      if (terms.length > 10) msg += `... ${terms.length - 10} more\\n`;
    } else {
      msg += 'No terms found.\\n\\n[➕ Add Terms Version] [🏠 Main Menu]';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add', callback_data: 'terms_add' }],
          [{ text: '📋 Versions', callback_data: 'terms_versions' }],
          [{ text: '👁 Preview', callback_data: 'terms_preview' }],
          [{ text: '🚀 Publish', callback_data: 'terms_publish' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_terms' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('📜 *TERMS MANAGEMENT*\\n\\nNo terms found.\\n\\n[➕ Add] [🏠 Main Menu]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add', callback_data: 'terms_add' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});'''

content = re.sub(old_terms, new_terms, content, flags=re.DOTALL)

# ============================================================
# 11. FAQ - Fix empty state
# ============================================================

old_faq = r'''bot\.callbackQuery\('admin_faq', async \(ctx\) => \{
  await ctx\.answerCallbackQuery\(\);[\s\S]*?await ctx\.reply\([^)]*\);[\s\S]*?\}\)'''
new_faq = '''bot.callbackQuery('admin_faq', async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const data = await apiCall('/api/v1/faq');
    const faqs = data.data || [];
    let msg = '❓ *FAQ MANAGEMENT*\\n\\n';
    if (faqs.length) {
      for (const f of faqs.slice(0, 10)) {
        const statusIcon = f.isActive ? '🟢' : '🔴';
        msg += `${statusIcon} *${f.questionEn || 'N/A'}*\\n`;
        msg += `   📂 ${f.category || 'general'}\\n\\n`;
      }
      if (faqs.length > 10) msg += `... ${faqs.length - 10} more\\n`;
    } else {
      msg += 'No FAQs found.\\n\\n[➕ Add FAQ] [🏠 Main Menu]';
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add', callback_data: 'faq_add' }],
          [{ text: '📂 Categories', callback_data: 'faq_categories' }],
          [{ text: '✏️ Manage', callback_data: 'faq_manage' }],
          [{ text: '🔄 Refresh', callback_data: 'admin_faq' }],
          [{ text: '🔙 Back', callback_data: 'admin_menu' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  } catch {
    await ctx.reply('❓ *FAQ MANAGEMENT*\\n\\nNo FAQs found.\\n\\n[➕ Add] [🏠 Main Menu]', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Add', callback_data: 'faq_add' }],
          [{ text: '🏠 Main Menu', callback_data: 'admin_menu' }],
        ],
      },
    });
  }
});'''

content = re.sub(old_faq, new_faq, content, flags=re.DOTALL)

# Write the updated content
with open('src/bot.ts', 'w') as f:
    f.write(content)

print("✅ Fixed all empty states with proper action buttons")
