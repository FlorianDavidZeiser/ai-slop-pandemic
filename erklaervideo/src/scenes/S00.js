import { eseg } from '../lib/core.js';
import { achsen } from '../lib/achsen.js';

// Zwei dünne, leere Zeitachsen übereinander. Der Titel kommt aus dem Textband (Anzeige „titel“).
export function render(t) {
  return achsen({ achsenP: eseg(t, 0.2, 1.2) });
}
