const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Store } = require('../src/store');

test('persists subscriptions between restarts', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rivals-bot-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'store.json');
  const store = new Store(file);
  store.set('123', { channelId: '456', lastUrl: 'https://example.com' });
  assert.equal(new Store(file).get('123').channelId, '456');
  store.delete('123');
  assert.equal(new Store(file).get('123'), null);
});
test('rejects corrupted store instead of silently reposting news', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rivals-bot-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'store.json');
  fs.writeFileSync(file, '{bad json');
  assert.throws(() => new Store(file), /Unable to load/);
});
