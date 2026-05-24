require('dotenv').config();

const { Markup } = require('telegraf');
const { bot, getLang, setLang } = require('./bot');
const { mainMenuKeyboard } = require('./keyboards/mainMenu');
const { t } = require('./i18n');
const { registerStart, showMainMenu } = require('./handlers/start');
const { registerAbout } = require('./handlers/about');
const { registerDownload } = require('./handlers/download');
const { registerTrial } = require('./handlers/trial');
const { registerPackages } = require('./handlers/packages');
const { registerContact, contactMiddleware } = require('./handlers/contact');
const { registerInstall } = require('./handlers/install');
const { registerMaintenance } = require('./handlers/maintenance');

bot.use(contactMiddleware);

registerStart(bot);
registerAbout(bot);
registerDownload(bot);
registerTrial(bot);
registerPackages(bot);
registerContact(bot);
registerInstall(bot);

if (process.env.DEV_MODE === 'true') {
  registerMaintenance(bot);
  console.log('⚙️  DEV_MODE is ON');
}

// Back to main menu from any inline button
bot.action('goto_main_menu', (ctx) => {
  const lang = getLang(ctx.from.id) || 'ar';
  ctx.answerCbQuery();
  return showMainMenu(ctx, lang);
});

// Language toggle from main menu
bot.hears(
  (text, ctx) => {
    const lang = getLang(ctx.from?.id) || 'ar';
    return text === t('main_menu.lang_toggle', lang);
  },
  (ctx) => {
    const currentLang = getLang(ctx.from.id) || 'ar';
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    setLang(ctx.from.id, newLang);
    return ctx.reply(t('main_menu.message', newLang), mainMenuKeyboard(newLang));
  }
);

// Fallback: unrecognized text when not in any flow
bot.on('text', (ctx) => {
  if (ctx.message.text.startsWith('/')) return;
  const lang = getLang(ctx.from?.id) || 'ar';
  return ctx.replyWithMarkdown(
    t('fallback.message', lang),
    Markup.inlineKeyboard([
      [Markup.button.callback(t('main_menu.contact', lang), 'contact_start')],
      [Markup.button.callback(t('back.main_menu', lang), 'goto_main_menu')],
    ])
  );
});

bot.catch((err) => {
  console.error('Bot error:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});

bot.launch().then(() => console.log('iGate-TR bot is running...'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
