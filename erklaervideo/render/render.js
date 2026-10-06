// Render mit Playwright: setzt t Bild für Bild und speichert PNGs.
//   node render/render.js            alle Bilder nach out/frames, dazu out/zeitplan.json für die Tonmischung
//   node render/render.js --stills   Freigabebilder nach out/stills
//   node render/render.js --szenen   ein Bild pro Szene nach out/stills/szenen
//   --skala 0.5                      kleinere Auflösung (Animatic)
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { serverStarten } from './serve.js';

const FPS = 30;
const arg = process.argv.slice(2);
const skala = Number(arg[arg.indexOf('--skala') + 1]) || 1;
const wurzel = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const aus = (...p) => path.join(wurzel, 'out', ...p);

const { srv, port, schriften } = await serverStarten(0);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: skala });
  await page.goto(`http://127.0.0.1:${port}/?render=1`);
  await page.waitForFunction(() => window.__bereit || window.__fehler, null, { timeout: 30000 });
  const fehler = await page.evaluate(() => window.__fehler);
  if (fehler) throw new Error(`Abbruch: ${fehler}`);
  const info = await page.evaluate(() => window.__info);
  console.log(`Schriftprüfung bestanden: ${schriften.serif} / ${schriften.sans}`);
  info.meldungen.forEach((m) => console.log(`Hinweis: ${m}`));

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const tabelle = ['| Szene | Beginn | Dauer (s) | davon Sprechzeit (s) |', '|---|---|---|---|'];
  info.szenen.forEach((s) => tabelle.push(`| ${s.id} ${s.titel} | ${fmt(s.start)} | ${s.dauer.toFixed(1)} | ${(s.sprechEnde - s.sprechStart).toFixed(1)} |`));
  tabelle.push(`| **Gesamt einschließlich Übergänge** | | ${info.gesamt.toFixed(1)} | Ende ${fmt(info.gesamt)} |`);
  fs.mkdirSync(aus(), { recursive: true });
  fs.writeFileSync(aus('szenendauern.md'), `# Szenendauern\n\nDie Stimme bestimmt die Dauer. Schriften: ${schriften.serif} / ${schriften.sans}.\n\n${tabelle.join('\n')}\n`);
  fs.writeFileSync(aus('zeitplan.json'), JSON.stringify(info, null, 1));
  console.log(tabelle.join('\n'));

  const bild = async (T, datei) => {
    await page.evaluate((T) => window.__bild(T), T);
    await page.screenshot({ path: datei, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  };
  const ende = (id) => { const s = info.szenen.find((x) => x.id === id); return s.start + s.dauer - 1 / FPS; };

  if (arg.includes('--stills')) {
    const stills = [['S02', 'S02_spiegel'], ['S03', 'S03_welle'], ['S04', 'S04_nach_dem_umbau'], ['S09', 'S09_sicherung'], ['S11', 'S11_zwang'], ['S13', 'S13_endbild']];
    fs.mkdirSync(aus('stills'), { recursive: true });
    for (const [id, name] of stills) { await bild(ende(id), aus('stills', `${name}.png`)); console.log(`out/stills/${name}.png`); }
  } else if (arg.includes('--szenen')) {
    fs.mkdirSync(aus('stills', 'szenen'), { recursive: true });
    for (const s of info.szenen) await bild(ende(s.id), aus('stills', 'szenen', `${s.id}.png`));
    console.log(`${info.szenen.length} Szenenbilder in out/stills/szenen`);
  } else {
    fs.rmSync(aus('frames'), { recursive: true, force: true });
    fs.mkdirSync(aus('frames'), { recursive: true });
    const n = Math.round(info.gesamt * FPS);
    for (let i = 0; i < n; i++) {
      await bild(i / FPS, aus('frames', `${String(i).padStart(5, '0')}.png`));
      if (i % 600 === 0) console.log(`Bild ${i} von ${n}`);
    }
    console.log(`${n} Bilder in out/frames`);
  }
} finally {
  await browser.close();
  srv.close();
}
