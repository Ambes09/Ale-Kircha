// ============================================================
// FIX: PHONE HANDLER WITH PROPER KEYBOARD
// ============================================================

// Replace the phone handler with this version
// Delete the old one and add this:

bot.on('message:contact', async (ctx) => {
  const contact = ctx.message.contact;
  if (!contact) return;

  if (contact.user_id !== ctx.from?.id) {
    await ctx.reply('⚠️ Please share your own phone number.');
    return;
  }

  ctx.session.data.phone = contact.phone_number;
  ctx.session.phoneNumber = contact.phone_number;

  const lang = ctx.session.language || 'en';
  
  // Show confirmation with a small delay
  await ctx.reply(
    lang === 'en' 
      ? '✅ Phone number received!\n\nNow, please enter your first name:' 
      : '✅ ስልክ ቁጥር ተቀብለናል!\n\nእባክዎ የመጀመሪያ ስምዎን ያስገቡ:',
    {
      reply_markup: { remove_keyboard: true },
    }
  );

  // Start the registration conversation with a small delay
  setTimeout(async () => {
    try {
      await ctx.conversation.enter('registration');
    } catch (error) {
      console.error('Failed to enter registration:', error);
      await ctx.reply(
        lang === 'en' 
          ? '❌ Please send your first name:' 
          : '❌ እባክዎ የመጀመሪያ ስምዎን ያስገቡ:'
      );
    }
  }, 500);
});
