const { Markup } = require('telegraf');
const { t } = require('../i18n');
const { getLang } = require('../bot');
const managers = require('../managers');
const { editWithTyping, mainMenuBtn, escapeMd } = require('../utils');

async function notifyManagers(bot, lang, from) {
  const name = escapeMd([from.first_name, from.last_name].filter(Boolean).join(' '));
  const username = from.username ? `@${escapeMd(from.username)}` : '—';
  const clientLink = `[${name}](tg://user?id=${from.id})`;

  const message = t('manager.trial_request', lang)
    .replace('{name}', clientLink)
    .replace('{username}', username);

  const results = await Promise.allSettled(
    managers.map((id) => bot.telegram.sendMessage(id, message, { parse_mode: 'Markdown' }))
  );
  return results.some((r) => r.status === 'fulfilled');
}

function registerTrial(bot) {
  bot.hears(
    (text, ctx) => {
      const lang = getLang(ctx.from?.id) || 'ar';
      return text === t('main_menu.trial', lang);
    },
    (ctx) => {
      const lang = getLang(ctx.from.id) || 'ar';
      return ctx.replyWithMarkdown(
        t('trial.message', lang),
        Markup.inlineKeyboard([
          [Markup.button.callback(t('trial.already_installed', lang), 'trial_request')],
          [Markup.button.callback(t('trial.show_download', lang), 'trial_goto_download')],
        ])
      );
    }
  );

  bot.action('trial_request', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    const sent = await notifyManagers(bot, lang, ctx.from);
    if (sent) {
      return editWithTyping(ctx, t('trial.success', lang), {
        parse_mode: 'Markdown', ...Markup.inlineKeyboard([
          [Markup.button.callback(t('main_menu.download', lang), 'trial_goto_download')],
          [mainMenuBtn(lang)],
        ])
      });
    }
    return editWithTyping(ctx, t('trial.error', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[mainMenuBtn(lang)]]),
    });
  });

  // Go to download (new message — as if pressed from main menu)
  bot.action('trial_goto_download', (ctx) => {
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
}

module.exports = { registerTrial };
