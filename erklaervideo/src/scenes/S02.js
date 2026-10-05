import { eseg } from '../lib/core.js';
import { achsen } from '../lib/achsen.js';

// Der Spiegel: 1867 und 1882 oben, 1882 genau über 2022
export function render(t, p) {
  return achsen({
    kiLabel: 1, ki2022: 1, ki2025: 1, vermerk: 1, sprungP: 1,
    stromLabel: eseg(t, p.w('schon', 1.0) - 0.3),
    strom1867: eseg(t, p.w('1867', 3) - 0.2),
    strom1882: eseg(t, p.w('1882', 8) - 0.2),
    hilfslinie: eseg(t, p.w('Strom ist', 14) - 0.2, 0.8),
    offenP: eseg(t, p.w('Was danach', 17), 1.0),
  });
}
