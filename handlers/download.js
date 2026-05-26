const { Markup } = require('telegraf');
const { t } = require('../i18n');
const { getLang } = require('../bot');
const { editWithTyping, mainMenuBtn } = require('../utils');
const { showInstallStep1 } = require('./install');

function backBtn(lang) {
  return Markup.inlineKeyboard([[Markup.button.callback(t('back.previous', lang), 'download_start')]]);
}

function registerDownload(bot) {
  bot.hears(
    (text, ctx) => {
      const lang = getLang(ctx.from?.id) || 'ar';
      return text === t('main_menu.download', lang);
    },
    (ctx) => {
      const lang = getLang(ctx.from.id) || 'ar';
      return ctx.replyWithMarkdown(
        t('download.message', lang),
        Markup.inlineKeyboard([
          [Markup.button.callback(t('download.tv', lang), 'download_tv')],
          [Markup.button.callback(t('download.computer', lang), 'download_computer')],
          [Markup.button.callback(t('download.mobile', lang), 'download_mobile')],
        ])
      );
    }
  );

  bot.action('download_start', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return ctx.replyWithMarkdown(
      t('download.message', lang),
      Markup.inlineKeyboard([
        [Markup.button.callback(t('download.tv', lang), 'download_tv')],
        [Markup.button.callback(t('download.computer', lang), 'download_computer')],
        [Markup.button.callback(t('download.mobile', lang), 'download_mobile')],
      ])
    );
  });

  bot.action('download_tv', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('download.tv.choose_type', lang), {
      parse_mode: 'Markdown', ...Markup.inlineKeyboard([
        [Markup.button.callback(t('download.tv.android_tv', lang), 'download_android_tv')],
        [Markup.button.callback(t('download.tv.smart', lang), 'download_smart_tv')],
        [Markup.button.callback(t('back.previous', lang), 'download_start')],
      ])
    });
  });

  bot.action('download_android_tv', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return showInstallStep1(ctx, lang);
  });

  bot.action('download_smart_tv', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('download.smart.question', lang), {
      parse_mode: 'Markdown', ...Markup.inlineKeyboard([
        [Markup.button.callback(t('download.smart.stick', lang), 'install_stick')],
        [Markup.button.callback(t('download.smart.box', lang), 'install_box')],
        [Markup.button.callback(t('download.smart.neither', lang), 'download_neither')],
        [Markup.button.callback(t('back.previous', lang), 'download_tv')],
      ])
    });
  });

  bot.action('install_stick', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return showInstallStep1(ctx, lang);
  });

  bot.action('install_box', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return showInstallStep1(ctx, lang);
  });

  bot.action('download_neither', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('download.smart.neither.message', lang), {
      parse_mode: 'Markdown', ...Markup.inlineKeyboard([
        [Markup.button.callback(t('download.smart.bought_stick', lang), 'install_stick')],
        [Markup.button.callback(t('download.smart.bought_box', lang), 'install_box')],
        [Markup.button.callback(t('back.previous', lang), 'download_smart_tv')],
      ])
    });
  });

  bot.action('download_computer', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('pc.choose', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('pc.igate_btn', lang), 'pc_igate')],
        [Markup.button.callback(t('pc.smarters_btn', lang), 'pc_smarters')],
        [Markup.button.callback(t('back.previous', lang), 'download_start')],
      ]),
    });
  });

  bot.action('download_mobile', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('download.mobile.choose', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('download.mobile.android', lang), 'install_android_mobile')],
        [Markup.button.callback(t('download.mobile.ios', lang), 'download_ios')],
        [Markup.button.callback(t('back.previous', lang), 'download_start')],
      ]),
    });
  });

  bot.action('install_android_mobile', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return showInstallStep1(ctx, lang);
  });

  bot.action('download_ios', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.contact_steps', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('main_menu.contact', lang), 'contact_start')],
        [Markup.button.callback(t('back.previous', lang), 'download_mobile')],
      ]),
    });
  });
}

module.exports = { registerDownload };
