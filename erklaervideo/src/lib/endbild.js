// Endbild „Vier Stufen, ein Fundament“ nach D5, im Videoraster neu gezeichnet.
import { C, f, rect, line, txt, lerp, clamp } from './core.js';
import { messen, umbrechenFrei } from './text.js';

const L = {
  klammerX: 150, fundX: 172, fundY: 430, fundH: 290,
  grauB: 320, trennung: 24, zielX: 1580, zielB: 244,
  balkenH: 96, balkenAbstand: 12, balkenAnteil: [0.66, 0.565, 0.42],
  kastenSchrift: 28, kastenPad: 10, kastenH: 64, pfeilB: 22, abstandGM: 22, goldRand: 18,
};

const pfeilchen = (x, y, op) =>
  `<polygon points="${f(x)},${f(y - 8)} ${f(x + 11)},${f(y)} ${f(x)},${f(y + 8)}" fill="${C.weiss}" opacity="${f(op)}"/>`;

export function endbildLayout(B) {
  const k = B.kaesten.map((s) => Math.max(56, messen(s, L.kastenSchrift, 'sans', 700) + 2 * L.kastenPad));
  const inhalt = k.slice(0, 5).reduce((a, b) => a + b, 0) + 4 * L.pfeilB + L.abstandGM + k[5];
  const goldB = inhalt + 2 * L.goldRand;
  const fundB = L.grauB + L.trennung + goldB;
  const verfuegbar = L.zielX - 36 - L.fundX;
  return { k, goldB, fundB, ueberlauf: fundB - verfuegbar };
}

export function endbild(B, z = {}) {
  const {
    spiel = 1, spielText = 1, gold = 1, goldTitel = 1, kaesten = Array(6).fill(1), quer = 1,
    linie = 1, pm = 1, balken = [1, 1, 1], ziel = [1, 1, 1, 1], klammer = 1,
  } = z;
  const lay = endbildLayout(B);
  const x0 = L.fundX, y0 = L.fundY, h = L.fundH;
  const gx = x0 + L.grauB + L.trennung;
  const mitte = x0 + lay.fundB / 2;
  let s = '';

  // Pflicht-Hälfte: Spielregeln
  if (spiel > 0) {
    let p = rect(x0, y0, L.grauB, h, { fill: C.pflicht, rx: 0 });
    let q = '';
    q += txt(x0 + 22, y0 + 52, '1', { size: 38, fam: 'serif', fill: C.text, weight: 700 });
    q += txt(x0 + 52, y0 + 52, B.stufe1, { size: 36, weight: 700, fill: C.text });
    q += txt(x0 + 22, y0 + 100, B.spielregeln, { size: 32, weight: 700, fill: C.text });
    umbrechenFrei(B.spielregelnText, 28, L.grauB - 40).forEach((z2, i) => {
      q += txt(x0 + 22, y0 + 140 + i * 33, z2, { size: 28, fill: C.text });
    });
    const vb = messen(B.vermerk, 28, 'sans', 700) + 24;
    q += rect(x0 + 22, y0 + h - 64, vb, 44, { fill: C.s4, rx: 0 });
    q += txt(x0 + 34, y0 + h - 32, B.vermerk, { size: 28, weight: 700, fill: C.weiss });
    s += `<g opacity="${f(spiel)}">${p}<g opacity="${f(spielText)}">${q}</g></g>`;
  }

  // Mehrwert-Hälfte: Digital Ready
  if (gold > 0) {
    let p = rect(gx, y0, lay.goldB, h, { fill: C.gold, rx: 0 });
    let q = txt(gx + L.goldRand, y0 + 52, '1', { size: 38, fam: 'serif', fill: C.weiss, weight: 700 });
    q += txt(gx + L.goldRand + 30, y0 + 52, B.stufe1, { size: 36, weight: 700, fill: C.weiss });
    const tb = messen(B.stufe1, 36, 'sans', 700);
    q += txt(gx + L.goldRand + 30 + tb + 22, y0 + 52, `· ${B.digitalReady}`, { size: 32, fill: C.weiss });
    p += `<g opacity="${f(goldTitel)}">${q}</g>`;
    let x = gx + L.goldRand;
    const ky = y0 + 92;
    B.kaesten.forEach((name, i) => {
      const op = kaesten[i];
      if (i === 5) x += L.abstandGM - L.pfeilB;
      if (i > 0 && i < 5) p += pfeilchen(x - L.pfeilB + 5, ky + L.kastenH / 2, op);
      const umrandet = i === 5;
      p += rect(x, ky, lay.k[i], L.kastenH, { fill: umrandet ? 'none' : C.weiss, stroke: umrandet ? C.weiss : 'none', sw: 3, rx: 2, op });
      p += txt(x + lay.k[i] / 2, ky + L.kastenH / 2 + 10, name, { size: L.kastenSchrift, weight: 700, fill: umrandet ? C.weiss : C.text, anchor: 'middle', op });
      x += lay.k[i] + L.pfeilB;
    });
    p += txt(gx + L.goldRand, y0 + h - 40, B.querschnitt, { size: 28, weight: 700, fill: C.weiss, op: quer });
    s += `<g opacity="${f(gold)}">${p}</g>`;
  }

  // Gestrichelte Trennlinie mit PFLICHT und MEHRWERT
  const lx = x0 + L.grauB + L.trennung / 2;
  if (linie > 0) s += line(lx, y0, lx, lerp(y0, y0 + h + 22, linie), { stroke: C.orange, sw: 4, dash: '10 9' });
  s += txt(lx - 16, y0 + h + 40, B.pflicht, { size: 28, fill: C.grau, anchor: 'end', ls: 5, weight: 700, op: pm });
  s += txt(lx + 16, y0 + h + 40, B.mehrwert, { size: 28, fill: C.gold, ls: 5, weight: 700, op: pm });

  // Stufen 2 bis 4, mittig über der ganzen Zeile
  const farben = [C.s2, C.s3, C.s4];
  const zentren = [];
  B.stufen.forEach((name, i) => {
    const bw = lay.fundB * L.balkenAnteil[i];
    const by = y0 - (i + 1) * (L.balkenH + L.balkenAbstand);
    zentren.push(by + L.balkenH / 2);
    const p = clamp(balken[i]);
    if (p <= 0) return;
    const dy = (1 - p) * -36;
    const nr = name.split(' ')[0], rest = name.slice(nr.length + 1);
    s += `<g opacity="${f(p)}" transform="translate(0 ${f(dy)})">` +
      rect(mitte - bw / 2, by, bw, L.balkenH, { fill: farben[i], rx: 0 }) +
      txt(mitte - bw / 2 + 28, by + 62, nr, { size: 44, fam: 'serif', fill: C.weiss, weight: 700 }) +
      txt(mitte - bw / 2 + 74, by + 62, rest, { size: 44, weight: 700, fill: C.weiss }) +
      `</g>`;
  });

  // Zielgruppen rechts
  const zielZentren = [y0 + h / 2, ...zentren];
  B.zielgruppen.forEach((zg, i) => {
    if (ziel[i] <= 0) return;
    const zeilen = umbrechenFrei(zg, 28, L.zielB);
    const yy = zielZentren[i] - ((zeilen.length - 1) * 34) / 2 + 10;
    zeilen.forEach((z2, zi) => { s += txt(L.zielX, yy + zi * 34, z2, { size: 28, fill: C.text, op: ziel[i] }); });
  });

  // Klammer „Führung als Querschnitt“
  if (klammer > 0) {
    const top = y0 - 3 * (L.balkenH + L.balkenAbstand), bot = y0 + h;
    s += `<g opacity="${f(klammer)}">` +
      `<path d="M${L.klammerX + 16} ${top} H${L.klammerX} V${bot} H${L.klammerX + 16}" fill="none" stroke="${C.s4}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` +
      txt(L.klammerX - 22, (top + bot) / 2, B.fuehrung, { size: 28, weight: 700, fill: C.text, anchor: 'middle', rot: -90, ls: 2 }) +
      `</g>`;
  }
  return s;
}

// Texte des Endbilds aus den Beschriftungen von S14 und S15 (script.json bleibt einzige Quelle)
export function endbildTexte(script) {
  // Die Szenen mit dem Fundament und den Stufen, unabhängig von ihrer Nummer
  const b14 = script.szenen.find((s) => s.beschriftungen.includes('PFLICHT')).beschriftungen;
  const b15 = script.szenen.find((s) => s.beschriftungen.includes('Führung als Querschnitt')).beschriftungen;
  return {
    stufe1: b14[0].replace(/^1\s+/, ''),
    spielregeln: b14[1], spielregelnText: b14[2], vermerk: b14[3], digitalReady: b14[4],
    kaesten: b14.slice(5, 11), querschnitt: b14[11], pflicht: b14[12], mehrwert: b14[13],
    stufen: b15.slice(0, 3), zielgruppen: b15.slice(3, 7), fuehrung: b15[7],
  };
}
