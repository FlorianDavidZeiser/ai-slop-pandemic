import { eseg } from '../lib/core.js';
import { fabrik, gestaffelt } from '../lib/fabrik.js';

// Dampfmaschine, Welle, Riemen, Maschinen. Material im Zickzack. Dann Tausch gegen den Elektromotor.
export function render(t, p) {
  const tausch = p.w('Elektromotor', 16) - 0.3;
  const ab = eseg(t, tausch, 0.5);
  return fabrik({
    halleOp: eseg(t, 0.1),
    dampfOp: eseg(t, 0.5) * (1 - ab),
    welleOp: eseg(t, 0.9), riemenOp: eseg(t, 1.3),
    maschinenOp: gestaffelt(t, 1.5, 0.08, 0.5),
    rotT: t,
    zickOp: eseg(t, p.w('Material', 10) - 0.3), zickWegOp: eseg(t, p.w('Material', 10) - 0.5), materialT: t,
    motorOp: eseg(t, tausch + 0.5),
    kraftwerkOp: eseg(t, p.w('kaufen', tausch + 1.5) - 0.2),
  });
}
