import { eseg, seg } from '../lib/core.js';
import { achsen } from '../lib/achsen.js';

export function render(t, p) {
  const a = p.anzeigen;
  return achsen({
    kiLabel: eseg(t, 0.1),
    kiPunkte: [eseg(t, 0.7), 0],
    // langsam, damit die Kurve beim Lesen nicht stört
    kurveP: seg(t, a[0].start + 0.6, a[1].start + 1.2 - (a[0].start + 0.6)),
  });
}
