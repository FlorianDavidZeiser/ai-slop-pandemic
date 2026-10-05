import { eseg } from '../lib/core.js';
import { endbild } from '../lib/endbild.js';
import { K } from '../lib/kontext.js';

// Die Stufen 2, 3, 4 setzen sich auf das Fundament, die Zielgruppen erscheinen mit ihnen
export function render(t, p) {
  const z = [p.w('Nutzen', 2), p.w('Umsetzen', 7), p.w('Transformieren', 12)];
  return endbild(K.endbild, {
    balken: z.map((x) => eseg(t, x - 0.2, 0.7)),
    ziel: [eseg(t, 0.2), ...z.map((x) => eseg(t, x + 0.6))],
    klammer: eseg(t, p.w('Führung', 22) - 0.2),
  });
}
