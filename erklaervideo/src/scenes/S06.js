import { eseg } from '../lib/core.js';
import { fabrik, gestaffelt } from '../lib/fabrik.js';
import { blockEnde } from '../lib/fabrikZustand.js';

export function render(t, p) {
  const a0 = p.anzeigen[0];
  const umbau = blockEnde(p, 0);
  const welleWeg = 1 - eseg(t, 0.2);
  return fabrik({
    halleOp: 1, kraftwerkOp: 1, maschinenOp: 1,
    welleOp: welleWeg, riemenOp: welleWeg, rotT: 0,
    motorOp: 1 - eseg(t, 0.9),
    einzelmotoren: gestaffelt(t, a0.start + 0.4, 0.15, 0.5),
    pfeilP: eseg(t, umbau + 0.1, 0.8),
    layout: gestaffelt(t, umbau + 0.7, 0.25, 1.2),
    materialOp: eseg(t, umbau + 3.4),
    materialT: p.start + t,
  });
}
