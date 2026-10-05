import { eseg } from '../lib/core.js';
import { fabrik, gestaffelt } from '../lib/fabrik.js';
import { blockEnde } from '../lib/fabrikZustand.js';

// Dampfmaschine, Welle, Riemen, Maschinen. Material im Zickzack. Dann Tausch gegen den Elektromotor.
export function render(t, p) {
  const tausch = blockEnde(p, 0) + 0.2;
  const ab = eseg(t, tausch, 0.5);
  return fabrik({
    halleOp: eseg(t, 0.1),
    dampfOp: eseg(t, 0.6) * (1 - ab),
    welleOp: eseg(t, 1.0), riemenOp: eseg(t, 1.5),
    maschinenOp: gestaffelt(t, 1.8, 0.1, 0.5),
    rotT: t,
    zickOp: eseg(t, 2.8), zickWegOp: eseg(t, 2.6), materialT: t,
    motorOp: eseg(t, tausch + 0.5),
    kraftwerkOp: eseg(t, tausch + 1.1),
  });
}
