import { eseg, clamp } from '../lib/core.js';
import { fabrik, gestaffelt } from '../lib/fabrik.js';
import { blockEnde, blockStart } from '../lib/fabrikZustand.js';

// In drei Schritten: Welle und Riemen verschwinden, jede Maschine bekommt einen Motor,
// dann rücken die Maschinen nacheinander in die Reihenfolge der Arbeit.
export function render(t, p) {
  const umbau = blockEnde(p, 0) + 0.2;
  const teil2 = p.anzeigen.find((a) => a.block === 1 && a.teil === 1) || blockStart(p, 1);
  const weg = 1 - eseg(t, 0.3, 0.7);
  const layout = gestaffelt(t, umbau, 0.38, 1.0);
  const umgebaut = clamp((t - umbau) / 4.2);
  return fabrik({
    halleOp: 1, kraftwerkOp: 1, maschinenOp: 1,
    welleOp: weg, riemenOp: weg, rotT: t,
    motorOp: 1 - eseg(t, 1.0, 0.6),
    zickOp: 1 - eseg(t, 0.2, 0.6), zickWegOp: 1 - eseg(t, umbau - 0.3, 0.4), materialT: t,
    einzelmotoren: gestaffelt(t, 1.4, 0.13, 0.45),
    layout,
    pfeilP: eseg(t, umbau + 3.3, 0.8),
    geradeOp: eseg(t, Math.max(umbau + 4.0, teil2.start - 0.3), 0.8) * umgebaut,
  });
}
