const fs = require('node:fs');
const path = require('node:path');

class Store {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
    this.subscriptions = {};
    try {
      const saved = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('Invalid store format');
      for (const [guildId, value] of Object.entries(saved)) {
        if (/^\d+$/.test(guildId) && value && /^\d+$/.test(value.channelId) && typeof value.lastUrl === 'string') {
          this.subscriptions[guildId] = { channelId: value.channelId, lastUrl: value.lastUrl };
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error(`Unable to load subscription store: ${error.message}`);
    }
  }

  all() { return { ...this.subscriptions }; }
  get(guildId) { return this.subscriptions[guildId] ?? null; }
  set(guildId, value) {
    this.subscriptions[guildId] = value;
    this.save();
  }
  delete(guildId) {
    delete this.subscriptions[guildId];
    this.save();
  }
  save() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const temp = this.filePath + '.tmp';
    fs.writeFileSync(temp, JSON.stringify(this.subscriptions, null, 2) + '\n', { mode: 0o600 });
    fs.renameSync(temp, this.filePath);
  }
}
module.exports = { Store };
