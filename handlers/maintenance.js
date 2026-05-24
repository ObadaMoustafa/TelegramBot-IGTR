function registerMaintenance(bot) {
  // Returns the sender's Telegram numeric ID
  bot.command('myid', (ctx) => {
    ctx.reply(`Your Telegram ID: \`${ctx.from.id}\``, { parse_mode: 'Markdown' });
  });

  // Returns the file_id of a photo — send the photo first, then reply to it with /getfileid
  bot.command('getfileid', (ctx) => {
    const photo = ctx.message?.reply_to_message?.photo;
    if (!photo) return ctx.reply('ابعت الصورة الأول، ثم اعمل reply عليها بـ /getfileid');
    const fileId = photo[photo.length - 1].file_id;
    ctx.reply(`\`${fileId}\``, { parse_mode: 'Markdown' });
  });
}

module.exports = { registerMaintenance };
