// Setzt ein Einzelbild zusammen: Szene, Kopfzeile, Textband mit Bildtext und Begriffsmarke, Übergänge.
import { C, W, H, RASTER, FONTS, f, txt, rect, seg, easeIO } from './core.js';
import { messen } from './text.js';

const TEXT_BLENDE = 0.4;
const MARKE_BLENDE = 0.5;

function textband(szene, plan, t) {
  let s = '';
  if (!plan.bildtext) return s;
  if (szene.anzeige === 'titel') {
    const op = easeIO(seg(t, plan.bildtext.start, 0.8));
    return txt(W / 2, 236, plan.bildtext.text, { size: 84, fam: 'serif', anchor: 'middle', op });
  }
  const op = easeIO(seg(t, plan.bildtext.start, TEXT_BLENDE));
  if (op > 0) {
    plan.bildtext.zeilen.forEach((z, zi) => {
      s += txt(RASTER.textX, RASTER.bandOben + 44 + zi * 56, z, { size: 44, op });
    });
  }
  if (plan.marke) s += begriffsmarke(plan.marke.text, easeIO(seg(t, plan.marke.start, MARKE_BLENDE)));
  return s;
}

// unten rechts im Textband, rechtsbündig, orange Linie links, dunkler Text auf FFF3EA
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
  if (ab.art === 'blende') return `${a}<g opacity="${f(easeIO(p))}">${b}</g>`;
  if (p < 0.5) return `${a}<rect width="${W}" height="${H}" fill="${C.weiss}" opacity="${f(easeIO(p * 2))}"/>`;
  return `${b}<rect width="${W}" height="${H}" fill="${C.weiss}" opacity="${f(1 - easeIO((p - 0.5) * 2))}"/>`;
}

export const svgHuelle = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONTS.sans}">${inner}</svg>`;
