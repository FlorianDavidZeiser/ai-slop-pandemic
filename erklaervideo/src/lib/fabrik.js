// Die Fabrik von oben, S05 bis S09 und verkleinert in S16. Eine Zeichnung, nur der Zustand ändert sich.
import { C, f, rect, line, circle, txt, lerp, easeIO, arrow, clamp } from './core.js';
import { maschine, maschinenKontur, elektromotor, person, pruefhaken, blitz } from './symbole.js';

export const FB = {
  halle: { x: 400, y: 130, w: 1300, h: 490 },
  platte: { y: 648, h: 82, ueberstand: 36 },
  welleY: 385, welleX0: 640, welleX1: 1660,
  dampf: { kessel: { x: 440, y: 340, w: 130, h: 90 }, schlot: { x: 458, y: 286, w: 30, h: 60 }, rad: { cx: 604, cy: 385, r: 40 } },
  motor: { cx: 560, cy: 385, r: 48 },
  reiheOben: 250, reiheUnten: 520,
  spalten: [790, 1010, 1230, 1450],
  neuY: 385, neuX0: 490, neuDx: 160,
  pfeilY: 476, pfeilX0: 440, pfeilX1: 1672,
  kraftwerk: { x: 120, y: 320, w: 180, h: 130 },
  mW: 140, mH: 94,
};

// Reihenfolge der Arbeit: Maschine k ist der wievielte Schritt. Oben und unten wechseln sich ab.
const SCHRITT = [0, 2, 4, 6, 7, 1, 3, 5];

const altPos = (k) => ({ x: FB.spalten[k % 4], y: k < 4 ? FB.reiheOben : FB.reiheUnten });
const neuPos = (k) => ({ x: FB.neuX0 + SCHRITT[k] * FB.neuDx, y: FB.neuY });

export function maschinenPos(k, p) {
  const a = altPos(k), b = neuPos(k), e = easeIO(p);
  // leichter Bogen, damit die Wege sich nicht überdecken
  return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) + Math.sin(e * Math.PI) * (k < 4 ? -40 : 40) };
}

// Weg des Materials in der alten Fabrik: im Zickzack von Maschine zu Maschine, quer über die Welle
const reihenfolge = [0, 5, 1, 6, 2, 7, 3, 4];
const ZICKZACK = [{ x: 640, y: FB.reiheOben }, ...reihenfolge.map(altPos), { x: 640, y: FB.reiheUnten }];
const GERADE = [{ x: FB.pfeilX0, y: FB.pfeilY }, { x: FB.pfeilX1 - 50, y: FB.pfeilY }];

function polylinie(pts) {
  const seg = [];
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    seg.push({ a: pts[i - 1], b: pts[i], d, s: L });
    L += d;
  }
  return { seg, L, d: pts.map((p, i) => `${i ? 'L' : 'M'}${f(p.x)} ${f(p.y)}`).join(' ') };
}
const PL = { zick: polylinie(ZICKZACK), gerade: polylinie(GERADE) };

function punktAuf(pl, s) {
  for (const g of pl.seg) if (s <= g.s + g.d) { const p = (s - g.s) / g.d; return { x: lerp(g.a.x, g.b.x, p), y: lerp(g.a.y, g.b.y, p) }; }
  const g = pl.seg[pl.seg.length - 1];
  return g.b;
}

// Material: Punkte, die den Weg entlang wandern. Geschwindigkeit in px/s.
function material(pl, t, op, anzahl, tempo, wegOp = 0) {
  if (op <= 0) return '';
  let s = '';
  if (wegOp > 0) s += `<path d="${pl.d}" fill="none" stroke="${C.grau}" stroke-width="2" stroke-dasharray="3 10" stroke-linecap="round" opacity="${f(wegOp * op * 0.5)}"/>`;
  const abstand = pl.L / anzahl;
  for (let i = 0; i < anzahl; i++) {
    const d = (t * tempo + i * abstand) % pl.L;
    const rand = clamp(Math.min(d, pl.L - d) / 50);
    const p = punktAuf(pl, d);
    s += circle(p.x, p.y, 9, { fill: C.grau, op: op * rand });
  }
  return s;
}

function welle(rotT, op) {
  if (op <= 0) return '';
  const { welleY: y, welleX0: x0, welleX1: x1 } = FB;
  return `<g opacity="${f(op)}">` +
    line(x0, y, x1, y, { sw: 14 }) +
    line(x0 + 10, y, x1 - 10, y, { stroke: C.weiss, sw: 4, dash: '12 36', dashoff: -rotT * 48 }) +
    `</g>`;
}

function dampfmaschine(rotT, op) {
  if (op <= 0) return '';
  const { kessel: k, schlot: s, rad: r } = FB.dampf;
  let d = rect(s.x, s.y, s.w, s.h, { fill: C.grau, rx: 6 });
  d += rect(k.x, k.y, k.w, k.h, { fill: C.grau, rx: 24 });
  // Schwungrad mit Speichen, dreht sich mit der Welle
  d += circle(r.cx, r.cy, r.r, { fill: C.weiss, stroke: C.grau, sw: 6 });
  for (let i = 0; i < 3; i++) {
    const a = rotT * 2.4 + (i * Math.PI) / 3;
    d += line(r.cx - Math.cos(a) * (r.r - 6), r.cy - Math.sin(a) * (r.r - 6), r.cx + Math.cos(a) * (r.r - 6), r.cy + Math.sin(a) * (r.r - 6), { stroke: C.grau, sw: 4 });
  }
  d += circle(r.cx, r.cy, 8, { fill: C.grau });
  d += line(r.cx + r.r, r.cy, FB.welleX0, r.cy, { stroke: C.grau, sw: 6 });
  return `<g opacity="${f(op)}">${d}</g>`;
}

function kraftwerk(op) {
  if (op <= 0) return '';
  const k = FB.kraftwerk;
  let s = rect(k.x + 120, k.y - 60, 34, 70, { fill: C.grau, rx: 6 }) + rect(k.x, k.y, k.w, k.h, { fill: C.grau, rx: 12 });
  s += blitz(k.x + k.w / 2 - 10, k.y + k.h / 2, 60, C.weiss);
  s += line(k.x + k.w, FB.welleY, FB.halle.x, FB.welleY, { stroke: C.grau, sw: 4 });
  return `<g opacity="${f(op)}">${s}</g>`;
}

// Stromnetz: Masten und Leitungen, die vom Bildrand kommen. Zeichnet sich mit p auf.
const MASTEN = [[-40, 230], [150, 300], [40, 470], [210, 420], [-30, 620], [170, 580]];
const LEITUNGEN = [[0, 1], [1, 3], [0, 2], [2, 3], [2, 4], [4, 5], [3, 5]];
function netz(p) {
  if (p <= 0) return '';
  let s = '';
  LEITUNGEN.forEach(([a, b], i) => {
    const q = clamp((p * 1.6 - i * 0.12) / 0.5);
    if (q <= 0) return;
    const [x1, y1] = MASTEN[a], [x2, y2] = MASTEN[b];
    s += line(x1, y1, lerp(x1, x2, q), lerp(y1, y2, q), { sw: 3 });
  });
  MASTEN.forEach(([x, y], i) => { s += circle(x, y, 12, { fill: C.weiss, stroke: C.blau, sw: 4, op: clamp((p * 1.6 - i * 0.1) / 0.3) }); });
  const zu = clamp((p - 0.55) / 0.45);
  if (zu > 0) s += line(MASTEN[3][0] + 12, MASTEN[3][1], lerp(MASTEN[3][0] + 12, FB.halle.x, zu), lerp(MASTEN[3][1], FB.welleY, zu), { sw: 4 });
  return s;
}

// Bodenplatte unter der Halle. Schiebt sich mit p von unten heran.
function platte(p, schriftOp) {
  if (p <= 0) return '';
  const h = FB.halle, pl = FB.platte;
  const y = lerp(pl.y + 60, pl.y, easeIO(p));
  return `<g opacity="${f(clamp(p * 3))}">` +
    rect(h.x - pl.ueberstand, y, h.w + 2 * pl.ueberstand, pl.h, { fill: C.flaeche, stroke: C.blau, sw: 4, rx: 8 }) +
    txt(h.x + h.w / 2, y + pl.h / 2 + 13, 'Sicherheitsvorschriften 1895', { size: 36, fam: 'serif', fill: C.blau, anchor: 'middle', op: schriftOp }) +
    `</g>`;
}

export function fabrik(z = {}) {
  const {
    halleOp = 1, dampfOp = 0, motorOp = 0, kraftwerkOp = 0, netzP = 0,
    platteP = 0, platteSchrift = 0, welleOp = 0, riemenOp = 0, rotT = 0,
    maschinenOp = 1, einzelmotoren = [], layout = [], pfeilP = 0,
    zickOp = 0, zickWegOp = 0, geradeOp = 0, materialT = 0,
    konturOp = 0, personOp = 0, hakenOp = 0,
  } = z;
  const h = FB.halle;
  let s = '';
  s += platte(platteP, platteSchrift);
  s += kraftwerk(kraftwerkOp);
  s += netz(netzP);
  s += rect(h.x, h.y, h.w, h.h, { fill: C.weiss, stroke: C.grau, sw: 4, rx: 16, op: halleOp });
  // alte Anordnung als blasse Kontur (S07)
  if (konturOp > 0) {
    let k = line(FB.welleX0, FB.welleY, FB.welleX1, FB.welleY, { stroke: C.grau, sw: 3, dash: '10 10' });
    for (let i = 0; i < 8; i++) { const a = altPos(i); k += maschinenKontur(a.x, a.y); }
    s += `<g opacity="${f(konturOp * 0.55)}">${k}</g>`;
  }
  // Material liegt unter Riemen, Welle und Maschinen
  s += material(PL.zick, materialT, zickOp, 14, 110, zickWegOp);
  if (riemenOp > 0) {
    for (let i = 0; i < 8; i++) {
      const a = altPos(i);
      const y2 = a.y < FB.welleY ? a.y + FB.mH / 2 : a.y - FB.mH / 2;
      s += line(a.x - 24, FB.welleY, a.x - 24, y2, { stroke: C.grau, sw: 2, op: riemenOp });
      s += line(a.x + 24, FB.welleY, a.x + 24, y2, { stroke: C.grau, sw: 2, op: riemenOp });
    }
  }
  s += welle(rotT, welleOp);
  s += dampfmaschine(rotT, dampfOp);
  if (motorOp > 0) s += `<g opacity="${f(motorOp)}">${line(FB.motor.cx + FB.motor.r, FB.welleY, FB.welleX0, FB.welleY, { stroke: C.grau, sw: 6 })}${elektromotor(FB.motor.cx, FB.motor.cy, FB.motor.r, 1)}</g>`;
  s += arrow(FB.pfeilX0, FB.pfeilY, FB.pfeilX1, FB.pfeilY, pfeilP, { head: 24 });
  s += material(PL.gerade, materialT, geradeOp, 12, 110);
  for (let k = 0; k < 8; k++) {
    const op = Array.isArray(maschinenOp) ? maschinenOp[k] : maschinenOp;
    if (op <= 0) continue;
    const p = maschinenPos(k, layout[k] || 0);
    let m = maschine(p.x, p.y);
    const em = einzelmotoren[k] || 0;
    if (em > 0) m += elektromotor(p.x + 38, p.y, 20 * (0.5 + 0.5 * em), em);
    s += op < 1 ? `<g opacity="${f(op)}">${m}</g>` : m;
  }
  s += person(470, 585, 1, personOp);
  s += pruefhaken(1620, 230, 36, hakenOp);
  return s;
}

// Hilfen für gestaffelte Abläufe
export const gestaffelt = (t, start, abstand, dauer, n = 8) =>
  Array.from({ length: n }, (_, i) => clamp((t - start - i * abstand) / dauer));
export const alle = (v) => Array(8).fill(v);
