# CultureQ

Front-end preview of CultureQ: events, programs and scholarships. *Increasing our access to cultural capital.*

Nothing here is deployed. The analytics worker, `ANALYTICS_URL` and the Stripe links (`CONTRIBUTE_LINKS`) are still to do.

## Layout

- `site/`: `index.html`, `styles.css`, `app.js`. Vanilla JS, no build step. Open `site/index.html` in a browser.
- `NIGHTLY.md` is the nightly task's procedure.
- `scripts/build.mjs` joins `site/` back into one page for the artifact (`node scripts/build.mjs` writes `dist/cultureq.html`).
- `scripts/split.mjs` regenerates `site/` from the single-file page saved from the artifact:
  `npm run split -- path/to/page.html`
- `tests/`
  - `data.test.mjs` checks every listing: required fields, categories, dates, time zones, https links,
    a `CAL_WORDS` entry of 8 letters or fewer, and a `checked <date>` stamp no later than `TONIGHT`. It also checks
    the site copy rules (no "Black", "minority" or "see site" outside listing data) and that no integration is wired up.
  - `ui.test.mjs` runs browser smoke tests on `site/` in Chromium over file://, with all network blocked:
    the views, search, calendar and map modes, the detail dialog and Outlook links, saving across a reload, the hidden
    Insights route, and no horizontal scroll at 360, 390, 768 and 1920 px.

## Running the tests

Node 20+ and Playwright with Chromium (`npm i -D playwright && npx playwright install chromium` on a fresh machine).

    npm test

## Source of truth

`site/` was generated from live artifact version `1795356456-8cf7` (Nov 22, 2026: 115 listings, max id 135).
The nightly re-check publishes to the artifact, so re-run `split` after it publishes.
