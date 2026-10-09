const test = require('node:test');
const assert = require('node:assert/strict');
const { parseNews, fetchNews } = require('../src/news');

const fixture = `<div class="news"><a href="/gameupdate/20261006/41548_1315865.html"><h3>Marvel Rivals Version 20261009 Patch Notes</h3></a>
<a href="/gameupdate/20261006/41548_1315865.html">Duplicate article</a>
<a href="https://evil.example/news/1.html">Fake article</a>
<a href="/news/20261001/123.html">Another &amp; better update</a></div>`;

test('extracts official article links and deduplicates them', () => {
  assert.deepEqual(parseNews(fixture), [
    { title: 'Marvel Rivals Version 20261009 Patch Notes', url: 'https://www.marvelrivals.com/gameupdate/20261006/41548_1315865.html', description: '' },
    { title: 'Another & better update', url: 'https://www.marvelrivals.com/news/20261001/123.html', description: '' }
  ]);
});
test('rejects invalid markup and unrelated URLs', () => {
  assert.deepEqual(parseNews('<a href="https://evil.example/news/a.html">Some article</a>'), []);
  assert.throws(() => parseNews(null), TypeError);
});
test('surfaces upstream failures', async () => {
  await assert.rejects(fetchNews({ fetchImpl: async () => ({ ok: false, status: 503 }) }), /503/);
  await assert.rejects(fetchNews({ fetchImpl: async () => ({ ok: true, text: async () => '<html></html>' }) }), /No articles/);
});
