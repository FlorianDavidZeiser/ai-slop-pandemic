import { eseg, lerp, f } from '../lib/core.js';
import { endbild } from '../lib/endbild.js';
import { fabrik } from '../lib/fabrik.js';
import { K } from '../lib/kontext.js';

// Das Endbild tritt zurück und verblasst nach oben. Die Welle aus S05 kommt groß in die Mitte.
export function render(t) {
  const z = eseg(t, 0.2, 1.3);
  const sk = lerp(1, 0.36, z);
  const eb = `<g opacity="${f(lerp(1, 0.28, z))}" transform="translate(${f(960 * (1 - sk))} ${f(lerp(0, 60, z) - 100 * sk * z)}) scale(${f(sk)})">${endbild(K.endbild)}</g>`;
  const w = eseg(t, 1.5, 0.8);
  const sw = 0.62;
  const welle = w > 0
    ? `<g opacity="${f(w)}" transform="translate(${f(960 - 1050 * sw)} ${f(520 - 375 * sw)}) scale(${sw})">${fabrik({ halleOp: 1, motorOp: 1, welleOp: 1, riemenOp: 1, maschinenOp: 1, rotT: t, zickOp: 1, zickWegOp: 1, materialT: t })}</g>`
    : '';
  return eb + welle;
}
