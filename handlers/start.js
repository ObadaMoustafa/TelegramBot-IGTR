const { Markup } = require('telegraf');
const { t } = require('../i18n');
const { getLang, setLang } = require('../bot');
const { mainMenuKeyboard } = require('../keyboards/mainMenu');

function showMainMenu(ctx, lang) {
  return ctx.reply(t('main_menu.message', lang), mainMenuKeyboard(lang));
}

function registerStart(bot) {
  bot.start((ctx) => {
    const lang = getLang(ctx.from.id);
    if (lang) {
      return showMainMenu(ctx, lang);
    }
    return ctx.reply(
      t('lang_select.message', 'ar'),
      Markup.inlineKeyboard([
        [Markup.button.callback(t('lang_select.ar', 'ar'), 'set_lang_ar')],
        [Markup.button.callback(t('lang_select.en', 'en'), 'set_lang_en')],
      ])
    );
  });

  bot.action('set_lang_ar', (ctx) => {
    setLang(ctx.from.id, 'ar');
    ctx.answerCbQuery();
    ctx.deleteMessage();
    return showMainMenu(ctx, 'ar');
  });

  bot.action('set_lang_en', (ctx) => {
    setLang(ctx.from.id, 'en');
    ctx.answerCbQuery();
    ctx.deleteMessage();
    return showMainMenu(ctx, 'en');
  });
}

module.exports = { registerStart, showMainMenu };
