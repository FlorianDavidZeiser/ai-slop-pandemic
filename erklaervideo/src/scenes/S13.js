import { C, eseg, rect, line, circle, lerp, f } from '../lib/core.js';
import { kiSymbol } from '../lib/symbole.js';

// Bestehender Arbeitsplatz, das KI-Symbol wird aufgesetzt. Am Arbeitsplatz ändert sich nichts.
export function render(t) {
  let s = '';
  const op = eseg(t, 0.1);
  s += `<g opacity="${f(op)}">`;
  s += rect(510, 540, 900, 90, { fill: C.flaeche, stroke: C.grau, sw: 4 });
  s += rect(750, 230, 420, 260, { fill: C.weiss, stroke: C.blau, sw: 4, rx: 14 });
  s += rect(900, 490, 120, 50, { fill: C.flaeche, stroke: C.blau, sw: 4, rx: 4 });
  s += rect(800, 562, 320, 46, { stroke: C.grau, sw: 2, rx: 8 });
  for (let i = 0; i < 6; i++) s += line(828 + i * 52, 585, 850 + i * 52, 585, { stroke: C.grauHell, sw: 4 });
  s += rect(1180, 564, 90, 42, { stroke: C.grau, sw: 2, rx: 8 });
  s += circle(960, 700, 46, { stroke: C.grau, sw: 4 });
  s += '</g>';
  const k = eseg(t, 1.0, 0.9);
  s += kiSymbol(960, lerp(130, 360, k), 140, k);
  return s;
}
