// Wiederkehrende Objekte nach D4b. Alle Koordinaten absolut, Größen in px.
import { C, f, rect, circle, line, txt } from './core.js';

// Blitz, Mittelpunkt (cx, cy), Höhe h
export function blitz(cx, cy, h, fill = C.weiss) {
  const s = h / 24;
  const pts = [[2, -12], [-6, 2], [-0.5, 2], [-2, 12], [6, -2], [0.5, -2]]
    .map(([x, y]) => `${f(cx + x * s)},${f(cy + y * s)}`).join(' ');
  return `<polygon points="${pts}" fill="${fill}"/>`;
}

export const maschine = (cx, cy, o = {}) =>
  rect(cx - 70, cy - 47, 140, 94, { fill: C.flaeche, stroke: C.blau, sw: 4, op: o.op ?? 1 });

export const maschinenKontur = (cx, cy, op = 1) =>
  rect(cx - 70, cy - 47, 140, 94, { stroke: C.grau, sw: 3, dash: '10 10', op });

export function elektromotor(cx, cy, r, op = 1) {
  if (op <= 0) return '';
  return `<g${op < 1 ? ` opacity="${f(op)}"` : ''}>${circle(cx, cy, r, { fill: C.blau })}${blitz(cx, cy, r * 1.15)}</g>`;
}

export function person(cx, cy, s = 1, op = 1) {
  if (op <= 0) return '';
  return `<g${op < 1 ? ` opacity="${f(op)}"` : ''}>` +
    circle(cx, cy - 46 * s, 18 * s, { fill: C.grau }) +
    rect(cx - 26 * s, cy - 22 * s, 52 * s, 66 * s, { fill: C.grau, rx: 22 * s }) +
    `</g>`;
}

// Prüfhaken im Kreis. detail 0 bis 2 macht ihn genauer (S12).
export function pruefhaken(cx, cy, r, op = 1, detail = 0) {
  if (op <= 0) return '';
  const k = r / 30;
  let s = circle(cx, cy, r, { stroke: C.blau, sw: 4, fill: C.weiss });
  if (detail >= 1) s += circle(cx, cy, r - 10, { stroke: C.blau, sw: 2 });
  if (detail >= 2) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      s += line(cx + Math.cos(a) * (r + 8), cy + Math.sin(a) * (r + 8), cx + Math.cos(a) * (r + 18), cy + Math.sin(a) * (r + 18), { sw: 2 });
    }
  }
  s += `<path d="M${f(cx - 13 * k)} ${f(cy + 1 * k)} L${f(cx - 3 * k)} ${f(cy + 11 * k)} L${f(cx + 15 * k)} ${f(cy - 10 * k)}" fill="none" stroke="${C.blau}" stroke-width="${Math.max(4, 5 * k)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<g${op < 1 ? ` opacity="${f(op)}"` : ''}>${s}</g>`;
}

// KI-Symbol: abgerundetes Quadrat mit Kürzel
export function kiSymbol(cx, cy, size = 110, op = 1) {
  if (op <= 0) return '';
  return `<g${op < 1 ? ` opacity="${f(op)}"` : ''}>` +
    rect(cx - size / 2, cy - size / 2, size, size, { fill: C.blau, rx: 20 }) +
    txt(cx, cy + size * 0.16, 'KI', { size: Math.round(size * 0.44), fill: C.weiss, weight: 700, anchor: 'middle' }) +
    `</g>`;
}

export function karteikarte(x, y, w, h, s, op = 1) {
  if (op <= 0) return '';
  return `<g${op < 1 ? ` opacity="${f(op)}"` : ''}>` +
    rect(x, y, w, h, { fill: C.weiss, stroke: C.grau, sw: 2 }) +
    line(x + 28, y + 34, x + w - 28, y + 34, { stroke: C.grauHell, sw: 2 }) +
    txt(x + 32, y + h / 2 + 30, s, { size: 44, fill: C.text }) +
    `</g>`;
}
