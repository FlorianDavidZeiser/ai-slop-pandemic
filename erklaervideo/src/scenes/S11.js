import { C, eseg, rect, line, circle, lerp, f } from '../lib/core.js';
import { kiSymbol } from '../lib/symbole.js';
import { fabrik } from '../lib/fabrik.js';

// Rechts klein die alte Fabrik, die umgebaut werden musste. Links der Arbeitsplatz, auf den die KI kommt.
export function render(t, p) {
  const fab = eseg(t, p.w('Einzelantrieb', 1.5) - 0.3);
  const umbauP = eseg(t, p.w('umgebaut', 3) - 0.2, 1.2);
  const platz = eseg(t, p.w('KI braucht', 7) - 0.4);
  const k = eseg(t, p.w('Software', 9) - 0.3, 0.9);
  let s = '';
  // kleine Fabrik: vor dem Umbau mit Welle, dann in der Reihe
  if (fab > 0) {
    const sw = 0.5;
    const alt = fabrik({ halleOp: 1, motorOp: 1, welleOp: 1, riemenOp: 1, maschinenOp: 1, rotT: t });
    const neu = fabrik({ halleOp: 1, maschinenOp: 1, einzelmotoren: Array(8).fill(1), layout: Array(8).fill(1), pfeilP: 1, geradeOp: 1, materialT: t });
    s += `<g opacity="${f(fab)}" transform="translate(${f(1000 - 400 * sw)} ${f(420 - 375 * sw)}) scale(${sw})">` +
      `<g opacity="${f(1 - umbauP)}">${alt}</g><g opacity="${f(umbauP)}">${neu}</g></g>`;
  }
  // Arbeitsplatz
  if (platz > 0) {
    const ox = -420;
    let a = rect(510 + ox, 540, 900, 90, { fill: C.flaeche, stroke: C.grau, sw: 4 });
    a += rect(750 + ox, 230, 420, 260, { fill: C.weiss, stroke: C.blau, sw: 4, rx: 14 });
    a += rect(900 + ox, 490, 120, 50, { fill: C.flaeche, stroke: C.blau, sw: 4, rx: 4 });
    a += rect(800 + ox, 562, 320, 46, { stroke: C.grau, sw: 2, rx: 8 });
    for (let i = 0; i < 6; i++) a += line(828 + ox + i * 52, 585, 850 + ox + i * 52, 585, { stroke: C.grauHell, sw: 4 });
    a += rect(1180 + ox, 564, 90, 42, { stroke: C.grau, sw: 2, rx: 8 });
    a += circle(960 + ox, 700, 46, { stroke: C.grau, sw: 4 });
    s += `<g opacity="${f(platz)}">${a}</g>`;
    s += kiSymbol(960 + ox, lerp(130, 360, k), 140, k);
  }
  return s;
}
