import { C, eseg, rect, line, circle, lerp } from '../lib/core.js';
import { kiSymbol } from '../lib/symbole.js';

// Bestehender Arbeitsplatz, das KI-Symbol wird aufgesetzt. Am Arbeitsplatz ändert sich nichts.
export function render(t) {
  let s = '';
  const op = eseg(t, 0.1);
  s += `<g opacity="${op.toFixed(3)}">`;
  s += rect(620, 470, 680, 90, { fill: C.flaeche, stroke: C.grau, sw: 4 });
  s += rect(800, 230, 320, 200, { fill: C.weiss, stroke: C.blau, sw: 4 });
  s += line(960, 430, 960, 470, { sw: 4 });
  s += rect(860, 492, 200, 44, { stroke: C.grau, sw: 2, rx: 8 });
  s += circle(960, 650, 46, { stroke: C.grau, sw: 4 });
  s += rect(700, 494, 110, 44, { stroke: C.grau, sw: 2, rx: 8 });
  s += '</g>';
  const k = eseg(t, 1.0, 0.8);
  s += kiSymbol(960, lerp(170, 330, k), 110, k);
  return s;
}
