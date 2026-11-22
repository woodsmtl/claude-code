// Pulls the data constants out of site/app.js without running the UI.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
export const APP = readFileSync(new URL('../site/app.js', import.meta.url), 'utf8');
export const HTML = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const dataEnd = APP.indexOf('/* =====', APP.indexOf('const ITEMS'));
const cw = APP.match(/const CAL_WORDS = \{[\s\S]*?\n\};/)[0];
const ctx = {};
vm.runInNewContext(APP.slice(0, dataEnd).replace("'use strict';", '') + '\n' + cw +
  '\nthis.out = { ITEMS, CAL_WORDS, CATEGORIES, TONIGHT };', ctx);
export const { ITEMS, CAL_WORDS, CATEGORIES, TONIGHT } = ctx.out;
// Everything in app.js that is not listing data: the site's own copy.
export const CHROME = APP.slice(dataEnd);
