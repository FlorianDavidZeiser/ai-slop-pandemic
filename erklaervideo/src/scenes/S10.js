import { C, eseg, rect, line, txt } from '../lib/core.js';
import { pruefhaken } from '../lib/symbole.js';
import { umbrechenFrei } from '../lib/text.js';

// Skala der Automatisierung. Der Prüfhaken wird nach rechts größer und genauer.
export function render(t, p, szene) {
  const felder = szene.beschriftungen;
  const x0 = 160, gesamt = 1600, luecke = 24, w = (gesamt - 2 * luecke) / 3, y = 470, h = 170;
  const zeiten = [p.w('Unterstützt', 2), p.w('Führt', 5), p.w('Arbeitet', 8)];
  let s = line(x0, y + h + 46, x0 + gesamt, y + h + 46, { stroke: C.grau, sw: 2, op: eseg(t, 0.2) });
  felder.forEach((label, i) => {
    const x = x0 + i * (w + luecke);
    const op = eseg(t, zeiten[i] - 0.3);
    s += rect(x, y, w, h, { fill: C.flaeche, stroke: C.blau, sw: 2, op });
    const zeilen = umbrechenFrei(label, 36, w - 60);
    const yy = y + h / 2 - ((zeilen.length - 1) * 44) / 2 + 13;
    zeilen.forEach((z, zi) => { s += txt(x + w / 2, yy + zi * 44, z, { size: 36, anchor: 'middle', op }); });
    const r = [34, 50, 68][i];
    s += pruefhaken(x + w / 2, y - 40 - r, r, eseg(t, zeiten[i] + 0.9), i);
  });
  return s;
}
