// Textmessung und Zeilenumbruch nach D4a. Läuft im Browser, nachdem die Schriften geladen sind.
import { FONTS, RASTER } from './core.js';

let ctx = null;
export function messen(s, size, fam = 'sans', weight = 400) {
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  ctx.font = `${weight} ${size}px "${fam === 'serif' ? FONTS.serif : FONTS.sans}"`;
  return ctx.measureText(s).width;
}

const passt = (z, size) =>
  z.length <= RASTER.zeichenProZeile && messen(z, size) <= RASTER.textBreite;

const saetze = (s) => s.split(/(?<=[.!?:])\s+(?=[A-ZÄÖÜ0-9„])/);

// Liefert die Zeilen eines Blocks (höchstens zwei) oder null, wenn er nicht passt.
export function umbrechen(s, size = 44) {
  if (passt(s, size)) return [s];
  // 1. Umbruch an einer Satzgrenze, wenn beide Zeilen passen
  const sz = saetze(s);
  let best = null;
  for (let i = 1; i < sz.length; i++) {
    const a = sz.slice(0, i).join(' '), b = sz.slice(i).join(' ');
    if (passt(a, size) && passt(b, size)) {
      const w = Math.max(messen(a, size), messen(b, size));
      if (!best || w < best.w) best = { w, z: [a, b] };
    }
  }
  if (best) return best.z;
  // 2. ausgewogener Umbruch an einer Wortgrenze, Komma bevorzugt
  const w = s.split(' ');
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(' '), b = w.slice(i).join(' ');
    if (passt(a, size) && passt(b, size)) {
      const m = Math.max(messen(a, size), messen(b, size)) - (/,$/.test(a) ? 60 : 0);
      if (!best || m < best.w) best = { w: m, z: [a, b] };
    }
  }
  return best ? best.z : null;
}

// Zerlegt einen Block, der nicht in zwei Zeilen passt, an Satzgrenzen in mehrere Anzeigen.
// Der Wortlaut bleibt Zeichen für Zeichen erhalten. Jede Teilung wird gemeldet.
export function anzeigenFuerBlock(s, size = 44) {
  const z = umbrechen(s, size);
  if (z) return { teile: [z], geteilt: false, fehler: null };
  const sz = saetze(s);
  const teile = [];
  let akt = [];
  for (const satz of sz) {
    const probe = [...akt, satz].join(' ');
    if (umbrechen(probe, size)) akt.push(satz);
    else {
      if (akt.length) teile.push(akt.join(' '));
      akt = [satz];
    }
  }
  if (akt.length) teile.push(akt.join(' '));
  const zeilen = teile.map((t) => umbrechen(t, size));
  if (zeilen.some((x) => !x)) return { teile: [], geteilt: true, fehler: `Satz passt nicht in zwei Zeilen: ${s}` };
  return { teile: zeilen, geteilt: true, fehler: null };
}

// Freier Umbruch für Beschriftungen in einer gegebenen Breite
export function umbrechenFrei(s, size, breite, fam = 'sans', weight = 400) {
  const w = s.split(' ');
  const zeilen = [];
  let akt = '';
  for (const wort of w) {
    const probe = akt ? `${akt} ${wort}` : wort;
    if (messen(probe, size, fam, weight) <= breite || !akt) akt = probe;
    else { zeilen.push(akt); akt = wort; }
  }
  if (akt) zeilen.push(akt);
  return zeilen;
}
