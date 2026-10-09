const BASE_URL = 'https://www.marvelrivals.com/news/';
const ARTICLE_PATH = /^\/(?:news|gameupdate|announcement|events?|devdiaries|balance|notice)\/[^?#]+\.html$/i;

function decodeEntities(input) {
  return input.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (match, entity) => {
    const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
    if (entity[0] === '#') {
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code) : match;
    }
    return named[entity.toLowerCase()] ?? match;
  });
}

function plainText(html) {
  return decodeEntities(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function parseNews(html) {
  if (typeof html !== 'string') throw new TypeError('Expected HTML');
  const articles = [];
  const seen = new Set();
  const links = /<a\b([^>]*?)>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(links)) {
    const href = match[1].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i)?.slice(1).find(Boolean);
    if (!href) continue;
    let url;
    try { url = new URL(decodeEntities(href), BASE_URL); } catch { continue; }
    if (url.hostname !== 'www.marvelrivals.com' || !ARTICLE_PATH.test(url.pathname)) continue;
    url.search = '';
    url.hash = '';
    const canonical = url.toString();
    const title = plainText(match[2]);
    if (!title || title.length < 8 || seen.has(canonical)) continue;
    seen.add(canonical);
    articles.push({ title, url: canonical, description: '' });
  }
  return articles;
}

async function fetchNews({ fetchImpl = fetch, timeoutMs = 12_000 } = {}) {
  const response = await fetchImpl(BASE_URL, {
    headers: { 'user-agent': 'MarvelRivalsNewsBot/2.0 (+https://github.com/Gaut-raj/marvel-rivals-discord-bot)' },
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!response.ok) throw new Error(`News request failed: HTTP ${response.status}`);
  const articles = parseNews(await response.text());
  if (!articles.length) throw new Error('No articles found; the official news page layout may have changed');
  return articles;
}

module.exports = { parseNews, fetchNews, plainText };
