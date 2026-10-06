import { eseg } from '../lib/core.js';
import { achsen } from '../lib/achsen.js';

// Heute: 2022 KI für alle, 2025 die Pflicht nach Artikel 4
export function render(t, p) {
  const t2022 = p.w('2022', 1.0), t2025 = p.w('2025', 6.0);
  return achsen({
    kiLabel: eseg(t, 0.1),
    ki2022: eseg(t, t2022 - 0.2), sprungP: eseg(t, t2022 + 0.2, 1.2),
    ki2025: eseg(t, t2025 - 0.2), vermerk: eseg(t, p.w('EU-KI-Verordnung', t2025 + 1) - 0.1),
  });
}
