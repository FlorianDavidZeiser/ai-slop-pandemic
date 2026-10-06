// Rendert das Stufenmodell allein als PNG (ohne Textband), z. B. als Asset für andere Werkzeuge.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { serverStarten } from './serve.js';
const wurzel = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { srv, port } = await serverStarten(0);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:${port}/?render=1`);
await page.waitForFunction(() => window.__bereit || window.__fehler);
await page.evaluate(async () => {
  const { endbild } = await import('/lib/endbild.js');
  const { K } = await import('/lib/kontext.js');
  const { svgHuelle } = await import('/lib/bild.js');
  document.getElementById('buehne').innerHTML = svgHuelle(`<rect width="1920" height="1080" fill="#fff"/><g transform="translate(0 120)">${endbild(K.endbild)}</g>`);
});
fs.mkdirSync(path.join(wurzel, 'out'), { recursive: true });
await page.screenshot({ path: path.join(wurzel, 'out', 'stufenturm.png'), clip: { x: 60, y: 160, width: 1800, height: 800 } });
await browser.close(); srv.close();
console.log('out/stufenturm.png');
