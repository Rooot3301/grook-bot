import fs from 'fs';
import path from 'path';

const warnsFile = path.join(path.resolve(), 'src', 'data', 'warns.json');

function loadWarns() {
  if (!fs.existsSync(warnsFile)) {
    fs.writeFileSync(warnsFile, JSON.stringify({}), 'utf8');
  }
  try {
    return JSON.parse(fs.readFileSync(warnsFile, 'utf8'));
  } catch {
    return {};
  }
}

function saveWarns(warnsObj) {
  fs.writeFileSync(warnsFile, JSON.stringify(warnsObj, null, 2), 'utf8');
}

function createWarn(guildId, userId, reason, moderatorId) {
  const allWarns = loadWarns();
  if (!allWarns[guildId]) allWarns[guildId] = [];
  const newWarn = {
    id: `${Date.now()}`,
    userId,
    reason: reason || 'Aucune raison',
    moderatorId,
    createdAt: new Date().toISOString()
  };
  allWarns[guildId].push(newWarn);
  saveWarns(allWarns);
  return newWarn;
}

function getWarnsForUser(guildId, userId) {
  const allWarns = loadWarns();
  return (allWarns[guildId] || []).filter(w => w.userId === userId);
}

export { createWarn, getWarnsForUser };