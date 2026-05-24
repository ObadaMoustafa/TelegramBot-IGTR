const { Markup } = require('telegraf');
const { t } = require('../i18n');
const { getLang } = require('../bot');
const managers = require('../managers');
const { editWithTyping, mainMenuBtn, escapeMd } = require('../utils');

async function notifyManagers(bot, lang, from, packageName) {
  const name = escapeMd([from.first_name, from.last_name].filter(Boolean).join(' '));
  const username = from.username ? `@${escapeMd(from.username)}` : '—';
  const clientLink = `[${name}](tg://user?id=${from.id})`;

  const message = t('manager.package_request', lang)
    .replace('{name}', clientLink)
    .replace('{username}', username)
    .replace('{package}', packageName);

  const results = await Promise.allSettled(
    managers.map((id) => bot.telegram.sendMessage(id, message, { parse_mode: 'Markdown' }))
  );
  return results.some((r) => r.status === 'fulfilled');
}

function registerPackages(bot) {
  bot.hears(
    (text, ctx) => {
      const lang = getLang(ctx.from?.id) || 'ar';
      return text === t('main_menu.packages', lang);
    },
    (ctx) => {
      const lang = getLang(ctx.from.id) || 'ar';
      return ctx.replyWithMarkdown(
        t('packages.message', lang),
        Markup.inlineKeyboard([
          [Markup.button.callback(t('packages.yearly', lang), 'pkg_yearly')],
          [Markup.button.callback(t('packages.two_years', lang), 'pkg_two_years')],
        ])
      );
    }
  );

  bot.action('pkg_yearly', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    const packageName = t('packages.yearly', lang);
    const sent = await notifyManagers(bot, lang, ctx.from, packageName);
    if (sent) {
      return editWithTyping(ctx, t('packages.success', lang), {
        parse_mode: 'Markdown', ...Markup.inlineKeyboard([
          [Markup.button.callback(t('main_menu.download', lang), 'pkg_goto_download')],
          [mainMenuBtn(lang)],
        ])
      });
    }
    return editWithTyping(ctx, t('packages.error', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[mainMenuBtn(lang)]]),
    });
  });

  bot.action('pkg_two_years', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    const packageName = t('packages.two_years', lang);
    const sent = await notifyManagers(bot, lang, ctx.from, packageName);
    if (sent) {
      return editWithTyping(ctx, t('packages.success', lang), {
        parse_mode: 'Markdown', ...Markup.inlineKeyboard([
          [Markup.button.callback(t('main_menu.download', lang), 'pkg_goto_download')],
          [mainMenuBtn(lang)],
        ])
      });
    }
    return editWithTyping(ctx, t('packages.error', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[mainMenuBtn(lang)]]),
    });
  });

  // Go to download (new message — as if pressed from main menu)
  bot.action('pkg_goto_download', (ctx) => {
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

module.exports = { registerPackages };
