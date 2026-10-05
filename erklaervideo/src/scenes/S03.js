import { eseg } from '../lib/core.js';
import { achsen } from '../lib/achsen.js';

// Spiegel: die Punkte der oberen Achse stehen genau über denen der unteren (D7).
export function render(t, p) {
  const t2 = p.anzeigen[1].start - p.zwischen;
  return achsen({
    kiLabel: 1, kurveP: 1, sprungP: 1, kiPunkte: [1, 1],
    stromLabel: eseg(t, 0.1),
    stromPunkte: [eseg(t, 0.6), eseg(t, t2 + 0.1)],
    hilfslinien: [eseg(t, 1.0, 0.7), eseg(t, t2 + 0.7, 0.7)],
  });
}
