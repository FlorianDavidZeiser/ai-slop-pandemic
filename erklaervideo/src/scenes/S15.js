import { eseg } from '../lib/core.js';
import { endbild } from '../lib/endbild.js';
import { K } from '../lib/kontext.js';

// Die Stufen 2, 3, 4 setzen sich auf das Fundament, die Zielgruppen erscheinen rechts
export function render(t, p) {
  const k = p.beschriftungEnde / 7.6;
  const at = (x) => x * k;
  return endbild(K.endbild, {
    balken: [0, 1, 2].map((i) => eseg(t, at(0.4 + i * 1.5), 0.7)),
    ziel: [eseg(t, at(0.1)), ...[0, 1, 2].map((i) => eseg(t, at(1.1 + i * 1.5)))],
    klammer: eseg(t, at(5.6)),
  });
}
