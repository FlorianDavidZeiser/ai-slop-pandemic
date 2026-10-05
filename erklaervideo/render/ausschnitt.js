// Bildstreifen eines Zeitbereichs für die Prüfung: node render/ausschnitt.js <von_s> <bis_s> <schritt_s> <datei>
import fs from 'node:fs';
import { chromium } from 'playwright';
import { serverStarten } from './serve.js';
const [von, bis, schritt, datei] = [Number(process.argv[2]), Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
const { srv, port } = await serverStarten(0);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.25 });
await page.goto(`http://127.0.0.1:${port}/?render=1`);
await page.waitForFunction(() => window.__bereit || window.__fehler);
fs.mkdirSync('out/pruef', { recursive: true });
let i = 0;
for (let T = von; T <= bis; T += schritt, i++) {
  await page.evaluate((T) => window.__bild(T), T);
  await page.screenshot({ path: `out/pruef/${String(i).padStart(3, '0')}.png`, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
}
await browser.close(); srv.close();
console.log(`${i} Bilder`);
