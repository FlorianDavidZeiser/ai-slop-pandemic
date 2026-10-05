// Zustand der Fabrik nach dem Umbau, Grundlage für S07 bis S09
import { alle } from './fabrik.js';

export const nachUmbau = (p, t) => ({
  halleOp: 1, kraftwerkOp: 1, maschinenOp: 1,
  einzelmotoren: alle(1), layout: alle(1), pfeilP: 1,
  geradeOp: 1, materialT: p.start + t,
});

// erster Anzeigeabschnitt eines Blocks (Blöcke können an Satzgrenzen geteilt sein)
export const blockStart = (p, b) => p.anzeigen.find((a) => a.block === b);
export const blockEnde = (p, b) => {
  const teile = p.anzeigen.filter((a) => a.block === b);
  const l = teile[teile.length - 1];
  return l.start + l.lese;
};
