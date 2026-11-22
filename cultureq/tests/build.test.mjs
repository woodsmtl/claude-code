import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../scripts/build.mjs';

test('build makes one self-contained page', () => {
  const html = build();
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.doesNotMatch(html, /href="styles\.css"|src="app\.js"/);
  assert.equal((html.match(/<script>/g) || []).length, 1);
  assert.match(html, /const ITEMS = \[/);
  assert.ok(html.length > 250_000 && html.length < 16_000_000);
});
