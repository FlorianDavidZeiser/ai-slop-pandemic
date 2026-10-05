import { eseg, arrow } from '../lib/core.js';
import { kiSymbol, karteikarte } from '../lib/symbole.js';

// Derselbe Kunde dreimal erfasst, der Agent schickt drei Pfeile los
export function render(t, p, szene) {
  const namen = szene.beschriftungen;
  const ys = [150, 350, 550], x = 1040, w = 600, h = 150;
  const karten = p.w('dreimal', 9) - 0.6, agent = p.w('Agent', karten + 3) - 0.4;
  let s = '';
  ys.forEach((y, i) => { s += karteikarte(x, y, w, h, namen[i], eseg(t, karten + i * 0.45)); });
  s += kiSymbol(400, 430, 150, eseg(t, agent));
  ys.forEach((y, i) => { s += arrow(492, 430, x - 18, y + h / 2, eseg(t, agent + 0.7 + i * 0.4, 0.6), { head: 22 }); });
  return s;
}
