// Die Fabrik von oben, S05 bis S09 und verkleinert in S16. Eine Zeichnung, nur der Zustand ändert sich.
import { C, f, rect, line, circle, txt, lerp, easeIO, arrow, clamp } from './core.js';
import { maschine, maschinenKontur, elektromotor, dampfmaschine, person, pruefhaken, blitz } from './symbole.js';

export const FB = {
  halle: { x: 300, y: 150, w: 1340, h: 500 },
  platte: { x: 262, y: 120, w: 1416, h: 624 },
  welleY: 400, welleX0: 470, welleX1: 1600,
  motor: { cx: 400, cy: 400, r: 50 },
  dampf: { x: 330, y: 340, w: 140, h: 120 },
  reiheOben: 260, reiheUnten: 540,
  spalten: [640, 880, 1120, 1360],
  neuY: 370, neuX0: 470, neuDx: 150,
  pfeilY: 468, pfeilX0: 380, pfeilX1: 1612,
  kraftwerk: { x: 110, y: 200, w: 140, h: 110 },
};

// Reihenfolge der Arbeit: Maschine k wandert auf Platz PLATZ[k]
const PLATZ = [1, 3, 5, 7, 0, 2, 4, 6];

const altPos = (k) => ({ x: FB.spalten[k % 4], y: k < 4 ? FB.reiheOben : FB.reiheUnten });
const neuPos = (k) => ({ x: FB.neuX0 + PLATZ[k] * FB.neuDx, y: FB.neuY });

export function maschinenPos(k, p) {
  const a = altPos(k), b = neuPos(k), e = easeIO(p);
  // leichter Bogen, damit sich die Wege nicht überdecken
  return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) + Math.sin(e * Math.PI) * (k < 4 ? -30 : 30) };
}

function welle(rotT, op) {
  if (op <= 0) return '';
  const { welleY: y, welleX0: x0, welleX1: x1 } = FB;
  return `<g opacity="${f(op)}">` +
    line(x0, y, x1, y, { sw: 12 }) +
    line(x0, y, x1, y, { stroke: C.weiss, sw: 4, dash: '10 34', dashoff: -rotT * 44 }) +
    `</g>`;
}

function kraftwerk(op, motorOp) {
  if (op <= 0) return '';
  const k = FB.kraftwerk;
  let s = rect(k.x + 96, k.y - 36, 26, 50, { fill: C.grau, rx: 6 }) + rect(k.x, k.y, k.w, k.h, { fill: C.grau });
  s += blitz(k.x + k.w / 2, k.y + k.h / 2, 46, C.weiss);
  s += `<path d="M${k.x + 70} ${k.y + k.h} V${FB.welleY} H${FB.halle.x}" fill="none" stroke="${C.grau}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (motorOp > 0) s += line(FB.halle.x, FB.welleY, FB.motor.cx - FB.motor.r, FB.welleY, { stroke: C.grau, op: motorOp });
  return `<g opacity="${f(op)}">${s}</g>`;
}

function netz(p) {
  if (p <= 0) return '';
  const k = [[120, 520], [220, 470], [180, 600]];
  let s = '';
  s += line(k[0][0], k[0][1], k[1][0], k[1][1], { sw: 2 }) + line(k[1][0], k[1][1], k[2][0], k[2][1], { sw: 2 }) + line(k[0][0], k[0][1], k[2][0], k[2][1], { sw: 2 });
  k.forEach(([x, y]) => { s += circle(x, y, 13, { fill: C.weiss, stroke: C.blau }); });
  const zu = clamp((p - 0.4) / 0.6);
  if (zu > 0) s += line(k[1][0] + 13, k[1][1], lerp(k[1][0] + 13, FB.halle.x, zu), k[1][1], { sw: 4 });
  return `<g opacity="${f(clamp(p / 0.4))}">${s}</g>`;
}

function platte(p, schriftOp) {
  if (p <= 0) return '';
  const a = FB.halle, b = FB.platte, e = easeIO(p);
  const x = lerp(a.x, b.x, e), y = lerp(a.y, b.y, e);
  const w = lerp(a.w, b.w, e), h = lerp(a.h, b.h, e);
  return rect(x, y, w, h, { fill: C.flaeche, stroke: C.blau, sw: 2, rx: 16, op: Math.min(1, p * 2) }) +
    txt(a.x + a.w / 2, b.y + b.h - 34, 'Sicherheitsvorschriften 1895', { size: 36, fam: 'serif', fill: C.blau, anchor: 'middle', op: schriftOp });
}

function material(t, op) {
  if (op <= 0) return '';
  const { pfeilX0: x0, pfeilX1: x1, pfeilY: y } = FB;
  const laenge = x1 - x0 - 50, abstand = laenge / 15;
  let s = '';
  for (let i = 0; i * abstand < laenge; i++) {
    const d = (t * 40 + i * abstand) % laenge;
    const rand = clamp(Math.min(d, laenge - d) / 60);
    s += circle(x0 + 16 + d, y, 8, { fill: C.grau, op: op * rand });
  }
  return s;
}

export function fabrik(z = {}) {
  const {
    halleOp = 1, dampfOp = 0, motorOp = 0, kraftwerkOp = 0, netzP = 0,
    platteP = 0, platteSchrift = 0, welleOp = 0, riemenOp = 0, rotT = 0,
    maschinenOp = 1, einzelmotoren = [], layout = [], pfeilP = 0,
    materialOp = 0, materialT = 0, konturOp = 0, personOp = 0, hakenOp = 0,
  } = z;
  const h = FB.halle;
  let s = '';
  s += platte(platteP, platteSchrift);
  s += kraftwerk(kraftwerkOp, motorOp);
  s += netz(netzP);
  s += rect(h.x, h.y, h.w, h.h, { fill: C.weiss, stroke: C.grau, sw: 4, rx: 16, op: halleOp });
  // alte Anordnung als blasse Kontur (S07)
  if (konturOp > 0) {
    let k = line(FB.welleX0, FB.welleY, FB.welleX1, FB.welleY, { stroke: C.grau, sw: 2, dash: '8 8' });
    for (let i = 0; i < 8; i++) { const a = altPos(i); k += maschinenKontur(a.x, a.y); }
    s += `<g opacity="${f(konturOp * 0.6)}">${k}</g>`;
  }
  if (riemenOp > 0) {
    for (let i = 0; i < 8; i++) {
      const a = altPos(i);
      const y2 = a.y < FB.welleY ? a.y + 40 : a.y - 40;
      s += line(a.x - 20, FB.welleY, a.x - 20, y2, { stroke: C.grau, sw: 2, op: riemenOp });
      s += line(a.x + 20, FB.welleY, a.x + 20, y2, { stroke: C.grau, sw: 2, op: riemenOp });
    }
  }
  s += welle(rotT, welleOp);
  s += dampfmaschine(FB.dampf.x, FB.dampf.y, FB.dampf.w, FB.dampf.h, dampfOp);
  s += elektromotor(FB.motor.cx, FB.motor.cy, FB.motor.r, motorOp);
  s += arrow(FB.pfeilX0, FB.pfeilY, FB.pfeilX1, FB.pfeilY, pfeilP, { head: 22 });
  s += material(materialT, materialOp);
  for (let k = 0; k < 8; k++) {
    const op = Array.isArray(maschinenOp) ? maschinenOp[k] : maschinenOp;
    if (op <= 0) continue;
    const p = maschinenPos(k, layout[k] || 0);
    let m = maschine(p.x, p.y);
    const em = einzelmotoren[k] || 0;
    if (em > 0) m += elektromotor(p.x + 30, p.y, 18 * (0.6 + 0.4 * em), em);
    s += op < 1 ? `<g opacity="${f(op)}">${m}</g>` : m;
  }
  s += person(380, 600, 1, personOp);
  s += pruefhaken(1520, 262, 34, hakenOp);
  return s;
}

// Hilfen für gestaffelte Abläufe
export const gestaffelt = (t, start, abstand, dauer, n = 8) =>
  Array.from({ length: n }, (_, i) => clamp((t - start - i * abstand) / dauer));
export const alle = (v) => Array(8).fill(v);
