import { eseg } from '../lib/core.js';
import { fabrik } from '../lib/fabrik.js';
import { blockEnde } from '../lib/fabrikZustand.js';

export function render(t, p) {
  const tausch = blockEnde(p, 0) + 0.2;
  return fabrik({
    halleOp: eseg(t, 0.1),
    dampfOp: eseg(t, 0.6) * (1 - eseg(t, tausch)),
    welleOp: eseg(t, 1.1), riemenOp: eseg(t, 1.6), maschinenOp: eseg(t, 2.1),
    rotT: t,
    motorOp: eseg(t, tausch + 0.6),
    kraftwerkOp: eseg(t, tausch + 1.2),
  });
}
