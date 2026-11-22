// Splits the single-file CultureQ page (as saved from the artifact) into site/index.html, styles.css and app.js.
// Usage: node scripts/split.mjs <single-file.html>
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync(process.argv[2], 'utf8');
// The artifact viewer wraps the page in its own skeleton; keep only the page itself.
let html = src.slice(src.indexOf('<!DOCTYPE html>'));
html = html.slice(0, html.indexOf('</html>') + 7) + '\n';
const style = html.match(/\n  <style>\n([\s\S]*?)<\/style>\n/);
const script = html.match(/\n  <script>\n([\s\S]*?)  <\/script>\n/);
if (!style || !script) throw new Error('style or script block not found');
writeFileSync('site/styles.css', style[1]);
writeFileSync('site/app.js', script[1]);
html = html.replace(style[0], '\n  <link rel="stylesheet" href="styles.css">\n')
           .replace(script[0], '\n  <script src="app.js"></script>\n');
writeFileSync('site/index.html', html);
console.log('index.html', html.length, 'styles.css', style[1].length, 'app.js', script[1].length);
