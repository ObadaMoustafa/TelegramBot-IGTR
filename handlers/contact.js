const { Markup } = require('telegraf');
const { t } = require('../i18n');
const { getLang, getUserState, setUserState, clearUserState } = require('../bot');
const managers = require('../managers');
const { editWithTyping, mainMenuBtn, escapeMd } = require('../utils');

async function notifyManagers(bot, lang, from, subject, messages) {
  const name = escapeMd([from.first_name, from.last_name].filter(Boolean).join(' '));
  const username = from.username ? `@${escapeMd(from.username)}` : '—';
  const clientLink = `[${name}](tg://user?id=${from.id})`;
  const content = messages.map(escapeMd).join('\n\n— — —\n\n');

  const message = t('manager.contact_request', lang)
    .replace('{name}', clientLink)
    .replace('{username}', username)
    .replace('{subject}', escapeMd(subject))
    .replace('{content}', content);

  const results = await Promise.allSettled(
    managers.map((id) => bot.telegram.sendMessage(id, message, { parse_mode: 'Markdown' }))
  );
  return results.some((r) => r.status === 'fulfilled');
}

function contactKeyboard(lang) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('contact.done_btn', lang), 'contact_done')],
    [Markup.button.callback(t('contact.cancel_btn', lang), 'contact_cancel')],
  ]);
}

function cancelKeyboard(lang) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('contact.cancel_btn', lang), 'contact_cancel')],
  ]);
}

function registerContact(bot) {
  bot.hears(
    (text, ctx) => {
      const lang = getLang(ctx.from?.id) || 'ar';
      return text === t('main_menu.contact', lang);
    },
    (ctx) => {
      const lang = getLang(ctx.from.id) || 'ar';
      setUserState(ctx.from.id, { step: 'subject' });
      return ctx.replyWithMarkdown(t('contact.ask_subject', lang), cancelKeyboard(lang));
    }
  );

  bot.action('contact_done', async (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    const state = getUserState(ctx.from.id);
    ctx.answerCbQuery();
    if (!state) return;
    clearUserState(ctx.from.id);
    const sent = await notifyManagers(bot, lang, ctx.from, state.subject, state.messages);
    if (sent) {
      return editWithTyping(ctx, t('contact.success', lang), {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[mainMenuBtn(lang)]]),
      });
    }
    return editWithTyping(ctx, t('contact.error', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[mainMenuBtn(lang)]]),
    });
  });

  bot.action('contact_start', (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    setUserState(ctx.from.id, { step: 'subject' });
    return ctx.replyWithMarkdown(t('contact.ask_subject', lang), cancelKeyboard(lang));
  });

  bot.action('contact_cancel', (ctx) => {
    const lang = getLang(ctx.from.id) || 'ar';
    ctx.answerCbQuery();
    clearUserState(ctx.from.id);
    return editWithTyping(ctx, t('contact.cancelled', lang), {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[mainMenuBtn(lang)]]),
    });
  });
}

function contactMiddleware(ctx, next) {
  const state = getUserState(ctx.from?.id);
  if (!state || !ctx.message?.text) return next();
  if (ctx.message.text.startsWith('/')) return next();

  const lang = getLang(ctx.from.id) || 'ar';
  const text = ctx.message.text;

  if (state.step === 'subject') {
    setUserState(ctx.from.id, { step: 'message', subject: text });
    return ctx.replyWithMarkdown(t('contact.ask_message', lang), cancelKeyboard(lang));
  }

  if (state.step === 'message' || state.step === 'more') {
    const messages = [...(state.messages || []), text];
    setUserState(ctx.from.id, { ...state, step: 'more', messages });
    return ctx.replyWithMarkdown(t('contact.ask_more', lang), contactKeyboard(lang));
  }

  return next();
}

module.exports = { registerContact, contactMiddleware };
