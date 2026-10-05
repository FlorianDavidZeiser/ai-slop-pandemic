import { eseg } from '../lib/core.js';
import { fabrik } from '../lib/fabrik.js';
import { nachUmbau } from '../lib/fabrikZustand.js';

// Das eigene Kraftwerk verblasst, eine Leitung kommt aus dem Netz
export function render(t, p) {
  return fabrik({
    ...nachUmbau(p, t),
    platteP: 1, platteSchrift: 1,
    kraftwerkOp: 1 - eseg(t, 0.4, 0.8),
    netzP: eseg(t, 1.1, 1.8),
  });
}
