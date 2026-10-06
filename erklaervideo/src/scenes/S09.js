import { C, eseg, rect, line, circle, lerp, f } from '../lib/core.js';
import { person, pruefhaken } from '../lib/symbole.js';

// Links: Stromkreis, der Zeiger schlägt aus, die Sicherung springt. Rechts: Text mit unauffällig falscher Stelle,
// nichts springt. Am Ende markiert die Person genau diese Stelle.
function stromkreis(t, ueberlast) {
  const x0 = 160, x1 = 820, y0 = 200, y1 = 640, fx = 490;
  const ausschlag = Math.min(eseg(t, ueberlast, 0.9), 1 - eseg(t, ueberlast + 1.4, 0.6));
  const sprung = eseg(t, ueberlast + 0.9, 0.4);
  const luecke = 26 * sprung;
  let s = '';
  s += `<path d="M${fx - 60} ${y0} H${x0} V${y1} H${x1} V${y0} H${fx + 60}" fill="none" stroke="${C.blau}" stroke-width="4" stroke-linejoin="round"/>`;
  s += line(x0 - 24, 410, x0 + 24, 410, { sw: 4 }) + line(x0 - 13, 432, x0 + 13, 432, { sw: 4 });
  s += circle(x1, 420, 40, { fill: sprung > 0.5 ? C.weiss : C.flaeche, stroke: C.blau });
  s += line(x1 - 26, 394, x1 + 26, 446, { sw: 2 }) + line(x1 + 26, 394, x1 - 26, 446, { sw: 2 });
  s += rect(fx - 60 - luecke, y0 - 20, 60, 40, { fill: C.weiss, stroke: C.blau, rx: 8 });
  s += rect(fx + luecke, y0 - 20, 60, 40, { fill: C.weiss, stroke: C.blau, rx: 8 });
  if (sprung > 0) {
    const op = sprung * (1 - eseg(t, ueberlast + 2.2, 0.6));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
      s += line(fx + dx * 10, y0 + dy * 26, fx + dx * 24, y0 + dy * 46, { sw: 2, op });
    });
  }
  const mx = 490, my = 500, r = 110;
  s += `<path d="M${mx - r} ${my} A ${r} ${r} 0 0 1 ${mx + r} ${my}" fill="none" stroke="${C.grau}" stroke-width="2"/>`;
  const grenzW = lerp(Math.PI, 0, 0.75);
  s += line(mx + Math.cos(grenzW) * (r - 14), my - Math.sin(grenzW) * (r - 14), mx + Math.cos(grenzW) * (r + 8), my - Math.sin(grenzW) * (r + 8), { stroke: C.blau, sw: 4 });
  const w = lerp(Math.PI * 0.85, Math.PI * 0.1, ausschlag);
  s += line(mx, my, mx + Math.cos(w) * (r - 10), my - Math.sin(w) * (r - 10), { stroke: C.text, sw: 4 });
  s += circle(mx, my, 7, { fill: C.text });
  return s;
}

const TB = { x: 1020, y: 200, w: 560, h: 440 };
function textblock(op, markOp = 0) {
  if (op <= 0) return '';
  const { x, y, w, h } = TB;
  const breiten = [440, 400, 452, 330, 420, 446, 380, 260];
  let s = rect(x, y, w, h, { fill: C.weiss, stroke: C.grau, sw: 2 });
  breiten.forEach((b, i) => {
    const yy = y + 60 + i * 46;
    if (i === 4) {
      // die unauffällig falsche Stelle: sieht aus wie jede andere Zeile
      s += rect(x + 40, yy - 7, 150, 14, { fill: C.grauHell, rx: 7 });
      s += rect(x + 202, yy - 7, 96, 14, { fill: C.grauHell, rx: 7 });
      s += rect(x + 310, yy - 7, b - 270, 14, { fill: C.grauHell, rx: 7 });
    } else {
      s += rect(x + 40, yy - 7, b, 14, { fill: C.grauHell, rx: 7 });
    }
  });
  const my = y + 60 + 4 * 46;
  s += rect(x + 190, my - 22, 122, 44, { stroke: C.blau, sw: 4, rx: 10, op: markOp });
  return `<g opacity="${f(op)}">${s}</g>`;
}

export function render(t, p) {
  const ueberlast = p.w('Überlast', 2) - 0.2;
  const text = p.w('KI arbeitet', 8) - 0.4;
  const pruefen = p.w('Mensch', 16) - 0.6;
  let s = `<g opacity="${f(eseg(t, 0.1))}">${stromkreis(t, ueberlast)}</g>`;
  s += textblock(eseg(t, text), eseg(t, pruefen + 1.4));
  s += person(1700, 560, 1.1, eseg(t, pruefen));
  s += pruefhaken(1700, 380, 42, eseg(t, pruefen + 0.6));
  return s;
}
