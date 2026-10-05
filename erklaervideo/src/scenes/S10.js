import { eseg, arrow } from '../lib/core.js';
import { kiSymbol, karteikarte } from '../lib/symbole.js';

// Derselbe Kunde dreimal erfasst, der Agent schickt drei Pfeile los
export function render(t, p, szene) {
  const namen = szene.beschriftungen;
  const ys = [170, 365, 560], x = 1060, w = 540, h = 130;
  let s = '';
  ys.forEach((y, i) => { s += karteikarte(x, y, w, h, namen[i], eseg(t, 0.2 + i * 0.5)); });
  s += kiSymbol(380, 430, 130, eseg(t, 1.8));
  ys.forEach((y, i) => {
    s += arrow(462, 430, x - 16, y + h / 2, eseg(t, 2.4 + i * 0.5, 0.6), { head: 20 });
  });
  return s;
}
