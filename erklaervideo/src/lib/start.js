// Startet das Projekt im Browser: Schriften laden und prüfen, Skript und Aufnahmen lesen, Zeitplan berechnen.
import { FONTS } from './core.js';
import { zeitplan } from './zeitplan.js';
import { gesamtBild, svgHuelle } from './bild.js';
import { endbildTexte, endbildLayout } from './endbild.js';
import { K } from './kontext.js';

async function schriftenLaden(wahl) {
  FONTS.serif = wahl.serif;
  FONTS.sans = wahl.sans;
  const css = [];
  if (wahl.serif === 'Gelasio') css.push(`@font-face{font-family:'Gelasio';src:url('fonts/Gelasio-VF.ttf') format('truetype');font-weight:400 700;}`);
  if (wahl.sans === 'Carlito') {
    css.push(`@font-face{font-family:'Carlito';src:url('fonts/Carlito-Regular.ttf') format('truetype');font-weight:400;}`);
    css.push(`@font-face{font-family:'Carlito';src:url('fonts/Carlito-Bold.ttf') format('truetype');font-weight:700;}`);
  }
  const st = document.createElement('style');
  st.textContent = css.join('\n');
  document.head.appendChild(st);
  const proben = [`400 44px "${FONTS.sans}"`, `700 44px "${FONTS.sans}"`, `400 40px "${FONTS.serif}"`, `700 40px "${FONTS.serif}"`];
  await Promise.all(proben.map((p) => document.fonts.load(p, 'ÄÖÜäöüß„“')));
  await document.fonts.ready;
  const fehlend = proben.filter((p) => !document.fonts.check(p, 'ÄÖÜäöüß„“'));
  // check() ist auch wahr, wenn eine Schrift gar nicht deklariert ist. Darum zusätzlich die geladenen Flächen zählen.
  const geladen = [...document.fonts].filter((ff) => ff.status === 'loaded').map((ff) => ff.family.replace(/"/g, ''));
  [wahl.serif, wahl.sans].filter((n) => n === 'Gelasio' || n === 'Carlito').forEach((n) => { if (!geladen.includes(n)) fehlend.push(`${n} nicht geladen`); });
  if (fehlend.length) throw new Error(`Schriftprüfung fehlgeschlagen: ${fehlend.join(', ')}`);
  return { serif: FONTS.serif, sans: FONTS.sans };
}

export async function starten() {
  const wahl = await (await fetch('/api/schriften')).json();
  const schriften = await schriftenLaden(wahl);
  const script = await (await fetch('/content/script.json')).json();
  const module = {}, audios = {};
  for (const s of script.szenen) {
    module[s.id] = await import(`../scenes/${s.id}.js`);
    if (s.sprecher) {
      const r = await fetch(`/content/sprecher/${s.id}.json`);
      if (!r.ok) throw new Error(`Aufnahme für ${s.id} fehlt. Bitte zuerst: node render/sprecher.js`);
      audios[s.id] = await r.json();
    }
  }
  K.script = script;
  K.endbild = endbildTexte(script);
  const zp = zeitplan(script, audios);
  K.zp = zp;
  const lay = endbildLayout(K.endbild);
  if (lay.ueberlauf > 0) zp.meldungen.push(`Endbild: Fundament ${Math.round(lay.ueberlauf)} px zu breit für das Raster.`);
  const ctx = { script, zp, module };
  return { ctx, schriften, bild: (T) => svgHuelle(gesamtBild(T, ctx)) };
}
