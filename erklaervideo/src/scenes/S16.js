import { eseg, lerp, f } from '../lib/core.js';
import { endbild } from '../lib/endbild.js';
import { fabrik } from '../lib/fabrik.js';
import { K } from '../lib/kontext.js';

// Das Endbild tritt zurück, klein erscheint wieder die Welle aus S05
export function render(t) {
  const z = eseg(t, 0.2, 1.2);
  const sk = lerp(1, 0.5, z);
  const eb = `<g opacity="${f(lerp(1, 0.4, z))}" transform="translate(${f(960 * (1 - sk))} ${f(96 * (1 - sk))}) scale(${f(sk)})">${endbild(K.endbild)}</g>`;
  const w = eseg(t, 1.6, 0.7);
  const sw = 0.4;
  const welle = w > 0
    ? `<g opacity="${f(w)}" transform="translate(${f(960 - 970 * sw)} ${f(610 - 400 * sw)}) scale(${sw})">${fabrik({ halleOp: 1, motorOp: 1, welleOp: 1, riemenOp: 1, maschinenOp: 1, rotT: t })}</g>`
    : '';
  return eb + welle;
}
