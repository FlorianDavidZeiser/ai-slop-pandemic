import { eseg, clamp } from '../lib/core.js';
import { fabrik, gestaffelt } from '../lib/fabrik.js';

// Welle und Riemen verschwinden, jede Maschine bekommt einen Motor, die Maschinen rücken in die Reihe.
export function render(t, p) {
  const motoren = p.w('eigenen', 2.5) - 0.2;
  const umbau = p.w('Jetzt', 5) + 0.2;
  const weg = 1 - eseg(t, 0.3, 0.7);
  return fabrik({
    halleOp: 1, kraftwerkOp: 1, maschinenOp: 1,
    welleOp: weg, riemenOp: weg, rotT: t,
    motorOp: 1 - eseg(t, 1.0, 0.6),
    zickOp: 1 - eseg(t, 0.2, 0.6), zickWegOp: 1 - eseg(t, umbau - 0.3, 0.4), materialT: t,
    einzelmotoren: gestaffelt(t, motoren, 0.13, 0.45),
    layout: gestaffelt(t, umbau, 0.36, 1.0),
    pfeilP: eseg(t, p.w('entlang', umbau + 3.5) - 0.2, 0.8),
    geradeOp: eseg(t, p.w('entlang', umbau + 3.5) + 0.9, 0.8) * clamp((t - umbau) / 3.6),
  });
}
