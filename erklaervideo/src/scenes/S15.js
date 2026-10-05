import { C, eseg, txt } from '../lib/core.js';

// Abspann: Verweis auf das Papier, Quellen, Vermerk
export function render(t, p, szene) {
  const a = szene.abspann;
  let s = txt(960, 380, a.hinweis, { size: 52, anchor: 'middle', op: eseg(t, 0.2) });
  a.quellen.forEach((q, i) => { s += txt(960, 500 + i * 40, q, { size: 28, fill: C.grau, anchor: 'middle', op: eseg(t, 1.0) }); });
  s += txt(960, 900, a.vermerk, { size: 28, fill: C.grau, anchor: 'middle', op: eseg(t, 1.6) });
  return s;
}
