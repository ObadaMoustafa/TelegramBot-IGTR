const ar = require('./locales/ar.json');
const en = require('./locales/en.json');

const locales = { ar, en };

function t(key, lang = 'ar') {
  const locale = locales[lang] || locales.ar;
  return locale[key] || ar[key] || key;
}

module.exports = { t };
