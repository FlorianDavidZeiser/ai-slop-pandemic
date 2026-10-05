import { eseg } from '../lib/core.js';
import { endbild } from '../lib/endbild.js';
import { K } from '../lib/kontext.js';

// Das Fundament baut sich auf: beide Hälften, dann Spielregeln, Digital Ready mit Kästen, Trennlinie
export function render(t, p) {
  const fund = p.w('Fundament', 3) - 0.3;
  const spiel = p.w('Spielregeln', fund + 4) - 0.3;
  const gold = p.w('Verständnis', spiel + 3) - 0.3;
  const wirksam = p.w('wirksam', gold + 3);
  return endbild(K.endbild, {
    spiel: eseg(t, fund), spielText: eseg(t, spiel),
    gold: eseg(t, fund + 0.3), goldTitel: eseg(t, gold),
    kaesten: [0, 1, 2, 3, 4, 5].map((i) => eseg(t, gold + 0.5 + i * 0.3, 0.5)),
    quer: eseg(t, gold + 2.6), linie: eseg(t, wirksam, 0.7), pm: eseg(t, wirksam + 0.5),
    balken: [0, 0, 0], ziel: [0, 0, 0, 0], klammer: 0,
  });
}
