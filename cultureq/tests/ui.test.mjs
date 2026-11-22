// Browser smoke tests. Uses the Playwright library (no test runner) against site/index.html over file://.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const PAGE = pathToFileURL(new URL('../site/index.html', import.meta.url).pathname).href;

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

async function open(hash = '', width = 1280) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text()) && errors.push(m.text()));
  await page.route(u => !u.protocol.startsWith('file'), r => r.abort());   // no fonts, no analytics: offline and deterministic
  await page.goto(PAGE + hash);
  await page.waitForSelector('#nav button');
  return { page, ctx, errors };
}

test('home renders with four nav tabs and no errors', async () => {
  const { page, ctx, errors } = await open();
  assert.equal(await page.locator('#nav button').count(), 4);
  assert.match(await page.locator('footer').innerText(), /Increasing our access to cultural capital\./);
  assert.equal(await page.locator('.brand-mark').innerText(), 'CQ');
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('OurQueue lists cards, search narrows them, and every mode renders', async () => {
  const { page, ctx, errors } = await open('#our');
  await page.waitForSelector('.card[data-act="open"]');
  assert.ok(await page.locator('.card[data-act="open"]').count() > 0);
  await page.fill('#q', 'kwanzaa');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const titles = await page.locator('.card[data-act="open"] h3').allInnerTexts();
  assert.ok(titles.length > 0 && titles.every(t => /kwanzaa/i.test(t)), titles.join(' | '));
  for (const mode of ['calendar', 'map', 'list']) {
    await page.click(`[data-act="mode"][data-mode="${mode}"]`);
    assert.equal(await page.getAttribute(`[data-act="mode"][data-mode="${mode}"]`, 'aria-pressed'), 'true');
  }
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('a card opens its detail dialog with calendar links', async () => {
  const { page, ctx, errors } = await open('#our');
  await page.locator('.card[data-act="open"]').first().click();
  await page.waitForSelector('#detail[open]');
  const hrefs = await page.$$eval('#detail a[href]', as => as.map(a => a.href));
  const outlook = hrefs.filter(h => /outlook\.(live|office)\.com\/calendar\/0\/deeplink\/compose\?/.test(h));
  assert.equal(outlook.length, 2, 'expected Outlook.com and Microsoft 365 links');
  for (const h of outlook) {
    const q = new URL(h).searchParams;
    assert.equal(q.get('rru'), 'addevent');
    assert.ok(q.get('subject') && q.get('startdt') && q.get('enddt'), h);
  }
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('saving an item updates the MyQueue count and survives a reload', async () => {
  const { page, ctx } = await open('#our');
  const star = page.locator('.card .star[data-act="fav"]').first();
  await star.click();
  await page.waitForSelector('#nav .count');
  assert.equal((await page.locator('#nav .count').innerText()).trim(), '1');
  await page.reload();
  await page.waitForSelector('#nav .count');
  assert.equal((await page.locator('#nav .count').innerText()).trim(), '1');
  await ctx.close();
});

test('#insights without a key falls back to home', async () => {
  const { page, ctx } = await open('#insights');
  assert.equal(await page.evaluate(() => location.hash), '#home');
  await ctx.close();
});

for (const width of [360, 390, 768, 1920]) {
  test(`no horizontal scroll at ${width}px`, async () => {
    for (const hash of ['#home', '#our', '#my', '#submit']) {
      const { page, ctx, errors } = await open(hash, width);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(over <= 0, `${hash} overflows by ${over}px`);
      assert.deepEqual(errors, [], hash);
      await ctx.close();
    }
  });
}
