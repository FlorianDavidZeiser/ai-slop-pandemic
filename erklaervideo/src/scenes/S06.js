import { eseg } from '../lib/core.js';
import { fabrik } from '../lib/fabrik.js';
import { nachUmbau } from '../lib/fabrikZustand.js';

// Die Bodenplatte schiebt sich unter die Halle. Die Fabrik steht darauf.
export function render(t, p) {
  return fabrik({ ...nachUmbau(p, t), platteP: eseg(t, 0.3, 1.0), platteSchrift: eseg(t, 1.1) });
}
