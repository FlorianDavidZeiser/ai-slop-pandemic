import { eseg, arrow } from '../lib/core.js';
import { kiSymbol, karteikarte } from '../lib/symbole.js';

// Derselbe Kunde dreimal erfasst, der Agent schickt drei Pfeile los
export function render(t, p, szene) {
  const namen = szene.beschriftungen;
  const ys = [150, 350, 550], x = 1040, w = 600, h = 150;
  let s = '';
  ys.forEach((y, i) => { s += karteikarte(x, y, w, h, namen[i], eseg(t, 0.2 + i * 0.5)); });
  s += kiSymbol(400, 430, 150, eseg(t, 1.8));
  ys.forEach((y, i) => {
    s += arrow(492, 430, x - 18, y + h / 2, eseg(t, 2.4 + i * 0.5, 0.6), { head: 22 });
  });
  return s;
}
