import { eseg } from '../lib/core.js';
import { achsen } from '../lib/achsen.js';

export function render(t) {
  return achsen({
    kiLabel: 1, stromLabel: 1, kurveP: 1, sprungP: 1, kiPunkte: [1, 1], stromPunkte: [1, 1], hilfslinien: [1, 1],
    offenP: eseg(t, 0.3, 1.0),
  });
}
