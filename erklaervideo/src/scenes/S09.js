import { eseg } from '../lib/core.js';
import { fabrik } from '../lib/fabrik.js';
import { nachUmbau } from '../lib/fabrikZustand.js';

export function render(t, p) {
  return fabrik({
    ...nachUmbau(p, t),
    platteP: 1, platteSchrift: 1,
    kraftwerkOp: 1 - eseg(t, 0.4, 0.7),
    netzP: eseg(t, 1.2, 1.4),
  });
}
