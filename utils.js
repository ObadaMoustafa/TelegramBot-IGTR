const { Markup } = require('telegraf');
const { t } = require('./i18n');

async function editWithTyping(ctx, text, extra = {}) {
  await ctx.editMessageText('⌛️');
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return ctx.editMessageText(text, extra);
}

function mainMenuBtn(lang) {
  return Markup.button.callback(t('back.main_menu', lang), 'goto_main_menu');
}

// Escapes Markdown v1 special chars in user-supplied strings
// to prevent broken entities when names/usernames contain _ * ` [
function escapeMd(text) {
  return String(text).replace(/[_*`[]/g, '\\$&');
}

module.exports = { editWithTyping, mainMenuBtn, escapeMd };
