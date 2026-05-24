require('dotenv').config();

module.exports = (process.env.MANAGER_IDS || '')
  .split(',')
  .map((id) => parseInt(id.trim(), 10))
  .filter((id) => !isNaN(id));
