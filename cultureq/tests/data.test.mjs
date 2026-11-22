import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, CAL_WORDS, CATEGORIES, TONIGHT, CHROME, HTML } from './load-data.mjs';

const ROLES = new Set(['opens', 'deadline', 'event', 'start', 'session']);
const SETTINGS = new Set(['in-person', 'online', 'hybrid']);
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const STAMP = /checked ([A-Z][a-z]{2} \d{1,2}, \d{4})$/;

test('there are listings and ids are unique', () => {
  assert.ok(ITEMS.length >= 100, `only ${ITEMS.length} listings`);
  assert.equal(new Set(ITEMS.map(i => i.id)).size, ITEMS.length);
});

for (const i of ITEMS) {
  test(`listing ${i.id}: ${i.title}`, () => {
    for (const k of ['source', 'category', 'kind', 'title', 'organizer', 'description', 'setting', 'city', 'tz'])
      assert.ok(typeof i[k] === 'string' && i[k].trim(), `${k} missing`);
    assert.ok(CATEGORIES[i.category], `unknown category ${i.category}`);
    assert.ok(SETTINGS.has(i.setting), `unknown setting ${i.setting}`);
    assert.ok(i.price === null || typeof i.price === 'number', 'price must be number or null');
    if (i.lat == null || i.lon == null) assert.ok(i.lat == null && i.lon == null, 'lat and lon must both be set or both missing');
    else assert.ok(Number.isFinite(i.lat) && Math.abs(i.lat) <= 90 && Number.isFinite(i.lon) && Math.abs(i.lon) <= 180, 'lat/lon out of range');
    assert.doesNotThrow(() => new Intl.DateTimeFormat('en', { timeZone: i.tz }), `bad tz ${i.tz}`);
    assert.ok(Array.isArray(i.identities) && Array.isArray(i.audience));
    assert.ok(Array.isArray(i.dates) && Array.isArray(i.links) && i.links.length, 'needs at least one link');
    for (const d of i.dates) {
      assert.ok(ROLES.has(d.role), `date role ${d.role}`);
      assert.ok(d.label, 'date label');
      for (const v of [d.start, d.end].filter(Boolean)) {
        if (d.allDay) assert.match(v, DAY);
        assert.ok(!isNaN(Date.parse(v)), `unparseable date ${v}`);
      }
      if (d.end) assert.ok(Date.parse(d.end) >= Date.parse(d.start), 'end before start');
    }
    for (const l of i.links) assert.match(l.url, /^https:\/\//, `link not https: ${l.url}`);
    const w = CAL_WORDS[i.id];
    assert.ok(w, 'missing CAL_WORDS entry');
    assert.ok(w.length <= 8, `CAL_WORDS "${w}" longer than 8 letters`);
    const stamp = i.source.match(STAMP);
    assert.ok(stamp, `source has no "checked <date>": ${i.source}`);
    assert.ok(Date.parse(stamp[1]) <= Date.parse(TONIGHT), `stamp ${stamp[1]} is after TONIGHT (${TONIGHT})`);
    assert.match(i.title, /^[\p{Lu}\d“"'(]/u, 'title should start with a capital');
    assert.doesNotMatch(i.title + ' ' + i.description, /see site/i);
  });
}

test('site copy never says Black, minority or "see site"', () => {
  // Comments are not shown to visitors; only check strings the page renders.
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
  for (const [name, src] of [['app.js (non-data)', strip(CHROME)], ['index.html', strip(HTML)]]) {
    assert.doesNotMatch(src, /\bminority\b/i, name);
    assert.doesNotMatch(src, /\bBlack\b/, name);
    assert.doesNotMatch(src, /see site/i, name);
  }
});

test('integrations are not wired to anything live yet', () => {
  assert.match(CHROME, /const ANALYTICS_URL = '';/);
  assert.match(CHROME, /const CONTRIBUTE_LINKS = \{ 5: '', 10: '', 25: '', 50: '', other: '' \};/);
});
