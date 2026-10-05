// Render mit Playwright: setzt t Bild für Bild und speichert PNGs.
//   node render/render.js            alle Bilder nach out/frames
//   node render/render.js --stills   die fünf Freigabebilder nach out/stills
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

const C2 = { S00: 4.6, S01: 11.8, S02: 10.8, S03: 16.4, S04: 8.0, S05: 26.3, S06: 26.7, S07: 13.2, S08: 14.9, S09: 11.4, S10: 17.4, S11: 17.3, S12: 14.1, S13: 7.6, S14: 14.6, S15: 15.4, S16: 14.2, S17: 6.0 };

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
  const tabelle = ['| Szene | C2 (s) | berechnet (s) | Differenz | Beginn |', '|---|---|---|---|---|'];
  info.szenen.forEach((s) => tabelle.push(`| ${s.id} ${s.titel} | ${C2[s.id].toFixed(1)} | ${s.dauer.toFixed(1)} | ${(s.dauer - C2[s.id] >= 0 ? '+' : '')}${(s.dauer - C2[s.id]).toFixed(1)} | ${fmt(s.start)} |`));
  tabelle.push(`| **Summe einschließlich Übergänge** | 250,7 | ${info.gesamt.toFixed(1)} | | Ende ${fmt(info.gesamt)} |`);
  fs.mkdirSync(aus(), { recursive: true });
  fs.writeFileSync(aus('szenendauern.md'), `# Szenendauern\n\nBerechnet aus Leseregel und Animationszeiten. Schriften: ${schriften.serif} / ${schriften.sans}.\n\n${tabelle.join('\n')}\n`);
  console.log(tabelle.join('\n'));

  const bild = async (T, datei) => {
    await page.evaluate((T) => window.__bild(T), T);
    await page.screenshot({ path: datei, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  };
  const ende = (id) => { const s = info.szenen.find((x) => x.id === id); return s.start + s.dauer - 1 / FPS; };

  if (arg.includes('--stills')) {
    const stills = [['S03', 'S03_spiegel'], ['S05', 'S05_welle'], ['S06', 'S06_nach_dem_umbau'], ['S11', 'S11_sicherung'], ['S15', 'S15_endbild']];
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
      if (i % 300 === 0) console.log(`Bild ${i} von ${n}`);
    }
    console.log(`${n} Bilder in out/frames`);
  }
} finally {
  await browser.close();
  srv.close();
}
