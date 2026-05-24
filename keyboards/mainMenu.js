const { Markup } = require('telegraf');
const { t } = require('../i18n');

function mainMenuKeyboard(lang) {
  return Markup.keyboard([
    [t('main_menu.about', lang)],
    [t('main_menu.download', lang)],
    [t('main_menu.trial', lang)],
    [t('main_menu.packages', lang)],
    [t('main_menu.contact', lang)],
    [t('main_menu.lang_toggle', lang)],
  ]).resize().oneTime();
}

module.exports = { mainMenuKeyboard };
