const fs = require('fs');
const path = require('path');
const config = require('./config');

const DATA_FILE = path.join(__dirname, 'data', 'points.json');

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

function getPoints(userId) {
  const data = load();
  if (!(userId in data)) {
    data[userId] = config.startingPoints;
    save(data);
  }
  return data[userId];
}

function addPoints(userId, amount) {
  const data = load();
  if (!(userId in data)) data[userId] = config.startingPoints;
  data[userId] += amount;
  save(data);
  return data[userId];
}

module.exports = { getPoints, addPoints };
