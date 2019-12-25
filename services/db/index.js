const oldDB = require('./old');
const newDB = require('./new');
const localDB = require('./local');

module.exports = {
  old: oldDB,
  new: newDB,
  local: localDB
};
