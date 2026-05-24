const { Markup } = require('telegraf');
const { t } = require('../i18n');
const { getLang, setUserState } = require('../bot');
const { editWithTyping, mainMenuBtn } = require('../utils');
const { iGateAppCode1, iGateAppCode2, fileIdDownloader } = require('../config');

const STORE_URL = 'https://play.google.com/store/apps/details?id=com.esaba.downloader';

async function showInstallStep1(ctx, lang) {
  return ctx.replyWithPhoto(fileIdDownloader, {
    caption: t('install.s1', lang),
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.url(t('install.s1.store_btn', lang), STORE_URL)],
      [Markup.button.callback(t('install.s1.next', lang), 'inst_s2')],
      [Markup.button.callback(t('back.previous', lang), 'download_start')],
    ]),
  });
}

function registerInstall(bot) {
  bot.action('inst_s1', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return showInstallStep1(ctx, lang);
  });

  bot.action('inst_s2', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return ctx.replyWithMarkdown(
      t('install.s2', lang).replace('{code}', iGateAppCode1),
      Markup.inlineKeyboard([
        [{ text: `📋 ${iGateAppCode1} — اضغط للنسخ`, copy_text: { text: iGateAppCode1 } }],
        [Markup.button.callback(t('install.s2.next', lang), 'inst_s3')],
        [Markup.button.callback(t('back.previous', lang), 'inst_s1')],
      ])
    );
  });

  // inst_s2_back: edit in place (called from step 3 back button — current msg is text)
  bot.action('inst_s2_back', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.s2', lang).replace('{code}', iGateAppCode1), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [{ text: `📋 ${iGateAppCode1} — اضغط للنسخ`, copy_text: { text: iGateAppCode1 } }],
        [Markup.button.callback(t('install.s2.next', lang), 'inst_s3')],
        [Markup.button.callback(t('back.previous', lang), 'inst_s1')],
      ]),
    });
  });

  bot.action('inst_s3', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.s3', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('install.s3.next', lang), 'inst_s4')],
        [Markup.button.callback(t('back.previous', lang), 'inst_s2_back')],
      ]),
    });
  });

  bot.action('inst_s4', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.s4', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('install.s4.yes', lang), 'inst_login_prompt')],
        [Markup.button.callback(t('install.s4.no', lang), 'inst_no_creds')],
        [Markup.button.callback(t('back.previous', lang), 'inst_s3')],
      ]),
    });
  });

  // Has credentials → show login result buttons
  bot.action('inst_login_prompt', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.login', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('install.login.ok', lang), 'inst_success')],
        [Markup.button.callback(t('install.login.fail', lang), 'inst_try_code2')],
        [Markup.button.callback(t('back.previous', lang), 'inst_s4')],
      ]),
    });
  });

  // Login success
  bot.action('inst_success', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.success', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[mainMenuBtn(lang)]]),
    });
  });

  // Login failed → try code 2
  bot.action('inst_try_code2', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.try_code2', lang).replace('{code}', iGateAppCode2), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [{ text: `📋 ${iGateAppCode2} — اضغط للنسخ`, copy_text: { text: iGateAppCode2 } }],
        [Markup.button.callback(t('install.try_code2.next', lang), 'inst_login2_prompt')],
        [Markup.button.callback(t('back.previous', lang), 'inst_login_prompt')],
      ]),
    });
  });

  // Login prompt after code 2
  bot.action('inst_login2_prompt', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.login', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('install.login2.ok', lang), 'inst_success')],
        [Markup.button.callback(t('install.login2.fail', lang), 'inst_need_help')],
        [Markup.button.callback(t('back.previous', lang), 'inst_try_code2')],
      ]),
    });
  });

  // Both codes failed → contact support
  bot.action('inst_need_help', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.need_help', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('install.contact_btn', lang), 'inst_contact')],
        [mainMenuBtn(lang)],
      ]),
    });
  });

  // Trigger contact flow from install (new message)
  bot.action('inst_contact', (ctx) => {
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

  // No credentials → trial or packages
  bot.action('inst_no_creds', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return editWithTyping(ctx, t('install.no_creds', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('main_menu.trial', lang), 'inst_goto_trial')],
        [Markup.button.callback(t('main_menu.packages', lang), 'inst_goto_packages')],
        [Markup.button.callback(t('back.previous', lang), 'inst_s4')],
      ]),
    });
  });

  // Go to trial (new message — as if pressed from main menu)
  bot.action('inst_goto_trial', (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return ctx.replyWithMarkdown(
      t('trial.message', lang),
      Markup.inlineKeyboard([
        [Markup.button.callback(t('trial.already_installed', lang), 'trial_request')],
        [Markup.button.callback(t('trial.show_download', lang), 'trial_goto_download')],
      ])
    );
  });

  // Go to packages (new message — as if pressed from main menu)
  bot.action('inst_goto_packages', (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    return ctx.replyWithMarkdown(
      t('packages.message', lang),
      Markup.inlineKeyboard([
        [Markup.button.callback(t('packages.yearly', lang), 'pkg_yearly')],
        [Markup.button.callback(t('packages.two_years', lang), 'pkg_two_years')],
      ])
    );
  });
}

module.exports = { registerInstall, showInstallStep1 };
