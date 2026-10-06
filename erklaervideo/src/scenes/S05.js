import { eseg } from '../lib/core.js';
import { fabrik } from '../lib/fabrik.js';
import { nachUmbau } from '../lib/fabrikZustand.js';

// Person neben dem Arbeitsfluss, die alte Anordnung als blasse Kontur, daneben der Prüfhaken
export function render(t, p) {
  const kontur = p.w('prüfen', 8) - 0.3;
  return fabrik({
    ...nachUmbau(p, t),
    personOp: eseg(t, p.w('jemand', 3) - 0.3),
    konturOp: eseg(t, kontur, 0.8) * (1 - eseg(t, p.w('Das Papier', kontur + 5) + 0.8)),
    hakenOp: eseg(t, p.w('passt', kontur + 2) - 0.2),
  });
}
