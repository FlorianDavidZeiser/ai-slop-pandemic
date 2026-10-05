import { eseg } from '../lib/core.js';
import { fabrik } from '../lib/fabrik.js';
import { nachUmbau, blockStart, blockEnde } from '../lib/fabrikZustand.js';

// Person neben dem Pfeil, kurz die alte Anordnung als blasse Kontur, daneben der Prüfhaken
export function render(t, p) {
  const teil2 = p.anzeigen.find((a) => a.block === 0 && a.teil === 1) || blockStart(p, 0);
  const ende = blockEnde(p, 0);
  return fabrik({
    ...nachUmbau(p, t),
    personOp: eseg(t, 0.3),
    konturOp: eseg(t, 1.1, 0.8) * (1 - eseg(t, ende - 0.6)),
    hakenOp: eseg(t, teil2.start + 1.2),
  });
}
