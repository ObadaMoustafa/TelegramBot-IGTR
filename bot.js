const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// In-memory user language store: { userId -> 'ar' | 'en' }
const userLang = new Map();

function getLang(userId) {
  return userLang.get(userId) || null;
}

function setLang(userId, lang) {
  userLang.set(userId, lang);
}

// In-memory user contact flow state: { userId -> { step, subject?, messages? } }
const userState = new Map();

function getUserState(userId) {
  return userState.get(userId) || null;
}

function setUserState(userId, state) {
  userState.set(userId, state);
}

function clearUserState(userId) {
  userState.delete(userId);
}

module.exports = { bot, getLang, setLang, getUserState, setUserState, clearUserState };
