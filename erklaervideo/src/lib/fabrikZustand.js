// Zustand der Fabrik nach dem Umbau, Grundlage für S05 bis S07
import { alle } from './fabrik.js';

export const nachUmbau = (p, t) => ({
  halleOp: 1, kraftwerkOp: 1, maschinenOp: 1,
  einzelmotoren: alle(1), layout: alle(1), pfeilP: 1,
  geradeOp: 1, materialT: p.start + t,
});
