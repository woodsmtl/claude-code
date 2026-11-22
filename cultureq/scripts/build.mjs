// Joins site/ back into one self-contained HTML file for the artifact: the inverse of split.mjs.
// Usage: node scripts/build.mjs [out=dist/cultureq.html]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const read = f => readFileSync(new URL('../site/' + f, import.meta.url), 'utf8');
export function build() {
  const html = read('index.html');
  const css = read('styles.css'), js = read('app.js');
  const a = '\n  <link rel="stylesheet" href="styles.css">\n', b = '\n  <script src="app.js"></script>\n';
  if (!html.includes(a) || !html.includes(b)) throw new Error('index.html is missing the styles.css or app.js tag');
  return html.replace(a, () => '\n  <style>\n' + css + '</style>\n').replace(b, () => '\n  <script>\n' + js + '  </script>\n');
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const out = process.argv[2] || 'dist/cultureq.html';
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, build());
  console.log('wrote', out);
}
