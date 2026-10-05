// Zwei Zeitachsen für S00 bis S02. Nicht maßstäblich, drei gleich breite Abschnitte.
// Unten KI mit 2022 und 2025, oben Strom mit 1867 und 1882. 1882 steht genau über 2022: der Moment für alle.
import { C, f, line, circle, txt, drawPath, lerp } from './core.js';

export const AX = {
  x0: 300, x1: 1680,
  strom: 330, ki: 630,
  labor: 360, moment: 820, pflicht: 1010,
};
const abschnitt = (AX.x1 - AX.x0) / 3;
const KURVE_SPRUNG = `M${AX.moment} ${AX.ki} C 846 630, 856 560, 876 470 C 896 400, 940 372, 1040 366`;

function achse(y, p, offenP = 0) {
  let s = '';
  const xe = lerp(AX.x0, AX.x1, p);
  const grenze = AX.x0 + 2 * abschnitt;
  if (offenP <= 0) {
    s += line(AX.x0, y, xe, y);
  } else {
    s += line(AX.x0, y, Math.min(xe, grenze), y);
    if (xe > grenze) s += line(grenze, y, xe, y, { op: 1 - offenP });
    for (let i = 0; i < 9; i++) {
      const xa = grenze + 8 + i * 60;
      s += line(xa, y, xa + 28, y, { op: offenP * (1 - i / 10) });
    }
  }
  for (let k = 1; k <= 2; k++) {
    const x = AX.x0 + k * abschnitt;
    if (x <= xe) s += line(x, y - 12, x, y + 12, { stroke: C.grau, sw: 2 });
  }
  return s;
}

const jahr = (x, y, s, op) => txt(x, y, s, { size: 32, fam: 'serif', fill: C.grau, anchor: 'middle', op });
const punkt = (x, y, p) => (p > 0 ? circle(x, y, 10 * Math.min(1, p), { fill: C.blau }) : '');

export function achsen(z) {
  const {
    achsenP = 1, kiLabel = 0, stromLabel = 0, sprungP = 0,
    ki2022 = 0, ki2025 = 0, vermerk = 0, strom1867 = 0, strom1882 = 0, hilfslinie = 0, offenP = 0,
  } = z;
  let s = '';
  s += achse(AX.strom, achsenP);
  s += achse(AX.ki, achsenP, offenP);
  s += txt(96, AX.ki + 13, 'KI', { size: 40, weight: 700, op: kiLabel });
  s += txt(96, AX.strom + 13, 'Strom', { size: 40, weight: 700, op: stromLabel });
  s += drawPath(KURVE_SPRUNG, sprungP);
  if (hilfslinie > 0) {
    s += line(AX.moment, AX.strom + 14, AX.moment, lerp(AX.strom + 14, AX.ki - 14, hilfslinie), { stroke: C.grau, sw: 2, dash: '4 10' });
  }
  s += punkt(AX.moment, AX.ki, ki2022) + jahr(AX.moment, AX.ki + 56, '2022', ki2022);
  s += punkt(AX.pflicht, AX.ki, ki2025) + jahr(AX.pflicht, AX.ki + 56, '2025', ki2025);
  s += txt(AX.pflicht, AX.ki + 94, 'Art. 4 KI-Verordnung', { size: 28, fill: C.grau, anchor: 'middle', op: vermerk });
  s += punkt(AX.labor, AX.strom, strom1867) + jahr(AX.labor, AX.strom - 30, '1867', strom1867);
  s += punkt(AX.moment, AX.strom, strom1882) + jahr(AX.moment, AX.strom - 30, '1882', strom1882);
  return s;
}
