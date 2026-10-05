import { eseg } from '../lib/core.js';
import { achsen } from '../lib/achsen.js';

export function render(t) {
  return achsen({
    kiLabel: 1, kurveP: 1, kiPunkte: [1, eseg(t, 1.0)],
    sprungP: eseg(t, 0.2, 1.0),
  });
}
