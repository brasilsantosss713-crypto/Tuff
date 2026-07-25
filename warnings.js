const fs = require('fs');
const path = require('path');
const config = require('./config');

const DATA_FILE = path.join(__dirname, 'data', 'warnings.json');

function load() {
  if (!fs.existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Returns the current (possibly decayed) warning count for a user, without incrementing.
function getWarnings(userId) {
  const data = load();
  const entry = data[userId];
  if (!entry) return 0;

  const hoursSince = (Date.now() - entry.lastWarned) / (1000 * 60 * 60);
  if (hoursSince > config.moderation.warnResetHours) return 0;
  return entry.count;
}

// Adds a warning, applying decay first if the last warning is old. Returns the new count.
function addWarning(userId) {
  const data = load();
  const entry = data[userId];
  const hoursSince = entry ? (Date.now() - entry.lastWarned) / (1000 * 60 * 60) : Infinity;

  const currentCount = entry && hoursSince <= config.moderation.warnResetHours ? entry.count : 0;
  const newCount = currentCount + 1;

  data[userId] = { count: newCount, lastWarned: Date.now() };
  save(data);
  return newCount;
}

function resetWarnings(userId) {
  const data = load();
  delete data[userId];
  save(data);
}

module.exports = { getWarnings, addWarning, resetWarnings };
