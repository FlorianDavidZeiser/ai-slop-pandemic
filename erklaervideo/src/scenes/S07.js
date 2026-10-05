import { eseg } from '../lib/core.js';
import { fabrik } from '../lib/fabrik.js';
import { nachUmbau, blockEnde } from '../lib/fabrikZustand.js';

// Person neben dem Pfeil, kurz die alte Anordnung als blasse Kontur, daneben der Prüfhaken
export function render(t, p) {
  const ende = blockEnde(p, 0);
  return fabrik({
    ...nachUmbau(p, t),
    personOp: eseg(t, 0.2),
    konturOp: eseg(t, 0.9) * (1 - eseg(t, ende - 1.2)),
    hakenOp: eseg(t, 1.7),
  });
}
