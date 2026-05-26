const { Markup } = require('telegraf');
const { t } = require('../i18n');
const { getLang, setUserState } = require('../bot');
const { editWithTyping, mainMenuBtn } = require('../utils');

const URL_IGATE = 'http://asc.vg/IGATETV-1.2.3.exe';
const URL_SMARTERS = 'https://www.iptvsmarters.com/IPTVSmartersProSetup-1.1.2.exe';

function registerPc(bot) {
  bot.action('pc_igate', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('pc.igate.download', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url(t('pc.igate.download_btn', lang), URL_IGATE)],
        [Markup.button.callback(t('pc.igate.next', lang), 'pc_igate_login')],
        [Markup.button.callback(t('back.previous', lang), 'download_computer')],
      ]),
    });
  });

  bot.action('pc_igate_login', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('pc.igate.login', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('pc.login.ok', lang), 'pc_success')],
        [Markup.button.callback(t('pc.login.fail', lang), 'pc_need_help')],
        [Markup.button.callback(t('pc.no_account_btn', lang), 'pc_no_account')],
        [Markup.button.callback(t('back.previous', lang), 'pc_igate')],
      ]),
    });
  });

  bot.action('pc_smarters', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('pc.smarters.download', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url(t('pc.smarters.download_btn', lang), URL_SMARTERS)],
        [Markup.button.callback(t('pc.smarters.next', lang), 'pc_smarters_login')],
        [Markup.button.callback(t('back.previous', lang), 'download_computer')],
      ]),
    });
  });

  bot.action('pc_smarters_login', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('pc.smarters.login', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('pc.login.ok', lang), 'pc_success')],
        [Markup.button.callback(t('pc.login.fail', lang), 'pc_need_help')],
        [Markup.button.callback(t('pc.no_account_btn', lang), 'pc_no_account')],
        [Markup.button.callback(t('back.previous', lang), 'pc_smarters')],
      ]),
    });
  });

  bot.action('pc_no_account', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('pc.no_account.message', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('main_menu.trial', lang), 'inst_goto_trial')],
        [Markup.button.callback(t('main_menu.packages', lang), 'inst_goto_packages')],
      ]),
    });
  });

  bot.action('pc_success', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.success', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[mainMenuBtn(lang)]]),
    });
  });

  bot.action('pc_need_help', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.need_help', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('install.contact_btn', lang), 'pc_contact')],
        [mainMenuBtn(lang)],
      ]),
    });
  });

  bot.action('pc_contact', (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    setUserState(ctx.from.id, { step: 'subject' });
    return ctx.replyWithMarkdown(
      t('contact.ask_subject', lang),
      Markup.inlineKeyboard([
        [Markup.button.callback(t('contact.cancel_btn', lang), 'contact_cancel')],
      ])
    );
  });
}

module.exports = { registerPc };
