// Zwei Zeitachsen für S00 bis S04. Nicht maßstäblich, drei gleich breite Abschnitte (D4b).
import { C, f, line, circle, txt, drawPath, lerp } from './core.js';

export const AX = {
  x0: 300, x1: 1680,
  strom: 330, ki: 630,
  labor: 360, moment: 820,
};
const abschnitt = (AX.x1 - AX.x0) / 3;

const KURVE_VOR =
  `M${AX.labor} 630 C 400 630, 430 548, 470 548 C 510 548, 522 621, 560 621 ` +
  `C 600 621, 620 534, 655 534 C 690 534, 708 624, 748 624 L 808 624`;
const KURVE_SPRUNG = 'M808 624 C 832 624, 842 566, 862 486 C 882 414, 922 386, 1010 378';

function achse(y, p, offenP = 0) {
  let s = '';
  const xe = lerp(AX.x0, AX.x1, p);
  const grenze = AX.x0 + 2 * abschnitt;
  if (offenP <= 0) {
    s += line(AX.x0, y, xe, y);
  } else {
    s += line(AX.x0, y, Math.min(xe, grenze), y);
    if (xe > grenze) s += line(grenze, y, xe, y, { op: 1 - offenP });
    // offener Bereich: gestrichelt, nach rechts schwächer
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
const punkt = (x, y, p) => (p > 0 ? circle(x, y, 10 * p, { fill: C.blau }) : '');

export function achsen(z) {
  const {
    achsenP = 1, kiLabel = 0, stromLabel = 0, kurveP = 0, sprungP = 0,
    kiPunkte = [0, 0], stromPunkte = [0, 0], hilfslinien = [0, 0], offenP = 0,
  } = z;
  let s = '';
  s += achse(AX.strom, achsenP);
  s += achse(AX.ki, achsenP, offenP);
  s += txt(96, AX.ki + 13, 'KI', { size: 40, weight: 700, op: kiLabel });
  s += txt(96, AX.strom + 13, 'Strom', { size: 40, weight: 700, op: stromLabel });
  s += drawPath(KURVE_VOR, kurveP);
  s += drawPath(KURVE_SPRUNG, sprungP);
  // Hilfslinien von oben nach unten
  [AX.labor, AX.moment].forEach((x, i) => {
    if (hilfslinien[i] > 0) {
      s += line(x, AX.strom + 14, x, lerp(AX.strom + 14, AX.ki - 14, hilfslinien[i]), { stroke: C.grau, sw: 2, dash: '4 10' });
    }
  });
  s += punkt(AX.labor, AX.ki, kiPunkte[0]) + punkt(AX.moment, AX.ki, kiPunkte[1]);
  s += jahr(AX.labor, AX.ki + 56, '1950er', kiPunkte[0]) + jahr(AX.moment, AX.ki + 56, '2022', kiPunkte[1]);
  s += punkt(AX.labor, AX.strom, stromPunkte[0]) + punkt(AX.moment, AX.strom, stromPunkte[1]);
  s += jahr(AX.labor, AX.strom - 30, '1867', stromPunkte[0]) + jahr(AX.moment, AX.strom - 30, '1882', stromPunkte[1]);
  return s;
}

