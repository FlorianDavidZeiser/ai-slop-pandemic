// Setzt ein Einzelbild zusammen: Szene, Kopfzeile, Textband, Begriffsmarke, Übergänge.
import { C, W, H, RASTER, FONTS, f, txt, rect, seg, easeIO } from './core.js';
import { messen } from './text.js';

const BLOCK_BLENDE = 0.3; // D4a: Überblendung 300 ms
const MARKE_BLENDE = 0.5;

function textband(szene, plan, t) {
  let s = '';
  if (szene.anzeige === 'titel') {
    plan.anzeigen.forEach((a) => {
      const op = easeIO(seg(t, a.start, 0.6));
      s += txt(W / 2, 220, a.zeilen[0], { size: 72, fam: 'serif', anchor: 'middle', op });
    });
    return s;
  }
  plan.anzeigen.forEach((a, i) => {
    const ein = seg(t, a.start, BLOCK_BLENDE);
    const naechste = plan.anzeigen[i + 1];
    const aus = naechste ? 1 - seg(t, naechste.start, BLOCK_BLENDE) : 1;
    const op = Math.min(ein, aus);
    if (op <= 0) return;
    a.zeilen.forEach((z, zi) => {
      s += txt(RASTER.textX, RASTER.bandOben + 44 + zi * 56, z, { size: 44, op });
    });
    if (a.klein) {
      const kop = Math.min(seg(t, a.start + 1.2, 0.5), aus);
      s += txt(RASTER.textX, RASTER.bandOben + 44 + a.zeilen.length * 56 + 4, a.klein, { size: 28, fill: C.grau, op: kop });
    }
  });
  if (plan.marke) s += begriffsmarke(plan.marke.text, easeIO(seg(t, plan.marke.start, MARKE_BLENDE)));
  return s;
}

// D4: unten rechts im Textband, rechtsbündig, orange Linie links, dunkler Text auf FFF3EA
export function begriffsmarke(text, op) {
  if (op <= 0) return '';
  const size = 40;
  const w = messen(text, size, 'serif') + 28 + 26;
  const h = 64, x = W - RASTER.rand - w, y = RASTER.bandUnten - h;
  return `<g opacity="${f(op)}">` +
    rect(x, y, w, h, { fill: C.flaecheOrange, rx: 0 }) +
    rect(x, y, 6, h, { fill: C.orange, rx: 0 }) +
    txt(x + 28, y + 45, text, { size, fam: 'serif', fill: C.text }) +
    `</g>`;
}

function kopfzeile(text) {
  return txt(RASTER.rand, RASTER.bildOben + 24, text.toUpperCase(), { size: 30, fill: C.orange, ls: 3, weight: 700 });
}

// Vollständiges Bild einer Szene zur lokalen Zeit t
export function szenenBild(szene, plan, modul, t) {
  const tt = Math.max(0, Math.min(t, plan.dauer));
  let s = `<rect width="${W}" height="${H}" fill="${C.weiss}"/>`;
  s += modul.render(tt, plan, szene);
  if (szene.kopfzeile) s += kopfzeile(szene.kopfzeile);
  s += textband(szene, plan, tt);
  return s;
}

export function gesamtBild(T, ctx) {
  const { script, zp, module } = ctx;
  const ab = zp.abschnitte.find((a) => T >= a.start && T < a.ende) || zp.abschnitte[zp.abschnitte.length - 1];
  const sz = script.szenen, pl = zp.plaene;
  const bildVon = (i, t) => szenenBild(sz[i], pl[i], module[sz[i].id], t);
  if (ab.art === 'szene') return bildVon(ab.i, T - ab.start);
  const p = (T - ab.start) / (ab.ende - ab.start);
  const a = bildVon(ab.i, pl[ab.i].dauer);
  const b = bildVon(ab.i + 1, 0);
  if (ab.art === 'blende') {
    return `${a}<g opacity="${f(easeIO(p))}">${b}</g>`;
  }
  // D4b: zwischen Akten über eine kurze weiße Fläche
  if (p < 0.5) return `${a}<rect width="${W}" height="${H}" fill="${C.weiss}" opacity="${f(easeIO(p * 2))}"/>`;
  return `${b}<rect width="${W}" height="${H}" fill="${C.weiss}" opacity="${f(1 - easeIO((p - 0.5) * 2))}"/>`;
}

export const svgHuelle = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONTS.sans}">${inner}</svg>`;
