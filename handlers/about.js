const { Markup } = require('telegraf');
const { t } = require('../i18n');
const { getLang } = require('../bot');
const { mainMenuBtn } = require('../utils');
const { fileIdAbout } = require('../config');

function registerAbout(bot) {
  bot.hears(
    (text, ctx) => {
      const lang = getLang(ctx.from?.id) || 'ar';
      return text === t('main_menu.about', lang);
    },
    (ctx) => {
      const lang = getLang(ctx.from.id) || 'ar';
      return ctx.replyWithPhoto(fileIdAbout, {
        caption: t('about.message', lang),
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url(t('about.channel_btn', lang), 'https://t.me/IgateTR')],
          [mainMenuBtn(lang)],
        ]),
      });
    }
  );
}

module.exports = { registerAbout };
