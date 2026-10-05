import { eseg } from '../lib/core.js';
import { endbild } from '../lib/endbild.js';
import { K } from '../lib/kontext.js';

// Das Fundament baut sich auf: Spielregeln, Digital Ready, sechs Kästen, Trennlinie mit PFLICHT und MEHRWERT
export function render(t, p) {
  const k = p.beschriftungEnde / 11.5; // Abläufe passen sich der berechneten Dauer an
  const at = (x) => x * k;
  return endbild(K.endbild, {
    spiel: eseg(t, at(0.2)), spielText: eseg(t, at(0.9)),
    gold: eseg(t, at(2.4)), goldTitel: eseg(t, at(3.0)),
    kaesten: [0, 1, 2, 3, 4, 5].map((i) => eseg(t, at(3.9 + i * 0.85), 0.5)),
    quer: eseg(t, at(9.2)), linie: eseg(t, at(10.0), 0.7), pm: eseg(t, at(10.8)),
    balken: [0, 0, 0], ziel: [0, 0, 0, 0], klammer: 0,
  });
}
