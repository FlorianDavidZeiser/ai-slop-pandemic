// Zeitplan: Szenendauern aus Leseregel (D4) und Animationszeiten (script.json). Nichts von Hand gesetzt.
import { woerter } from './core.js';
import { anzeigenFuerBlock } from './text.js';

export const LESEREGEL = {
  block: (w) => Math.max(2.5, 0.4 * w + 1),
  marke: (w) => Math.max(2, 0.4 * w + 0.5),
  beschriftung: (w) => 0.3 * w,
};

// Szenenwechsel, bei denen das Bild durchläuft (D4b Kontinuität). Hier keine weiße Fläche.
const KONTINUITAET = new Set(['S00>S01', 'S07>S08', 'S15>S16']);

export function uebergang(a, b) {
  if (!b) return null;
  if (a.akt === b.akt || KONTINUITAET.has(`${a.id}>${b.id}`)) return { art: 'blende', dauer: 0.5 };
  return { art: 'weiss', dauer: 0.8 };
}

export function szenePlanen(s) {
  const meldungen = [];
  if (s.dauer_fest_s) {
    return { id: s.id, dauer: s.dauer_fest_s, vorlauf: 0, beschriftungEnde: 0, anzeigen: [], marke: null, meldungen };
  }
  const bWoerter = (s.beschriftungen || []).reduce((n, b) => n + woerter(b), 0);
  const vorlauf = s.animation_vorlauf_s;
  const beschriftungEnde = vorlauf + LESEREGEL.beschriftung(bWoerter);
  // Zahl oder Liste je Lücke zwischen zwei Blöcken. Teile eines geteilten Blocks folgen ohne Pause.
  const zw = s.animation_zwischen_s;
  const zwischenVor = (bi) => (Array.isArray(zw) ? zw[bi - 1] ?? zw[zw.length - 1] : zw);
  const zwischen = Array.isArray(zw) ? zw[0] : zw;
  let t = beschriftungEnde;
  const anzeigen = [];
  s.bloecke.forEach((block, bi) => {
    const groesse = s.anzeige === 'titel' ? 0 : 44;
    const a = groesse ? anzeigenFuerBlock(block, groesse) : { teile: [[block]], geteilt: false, fehler: null };
    if (a.fehler) meldungen.push(`${s.id}: ${a.fehler}`);
    if (a.geteilt) meldungen.push(`${s.id} Block ${bi + 1} passt nicht in zwei Zeilen und wird an der Satzgrenze in ${a.teile.length} Anzeigen geteilt.`);
    a.teile.forEach((zeilen, ti) => {
      const text = zeilen.join(' ');
      let dauer = LESEREGEL.block(woerter(text));
      const klein = bi === 0 && ti === 0 && s.kleingedruckt ? s.kleingedruckt : null;
      if (klein) dauer += LESEREGEL.block(woerter(klein));
      if (anzeigen.length && ti === 0) t += zwischenVor(bi);
      anzeigen.push({ start: t, lese: dauer, zeilen, klein, block: bi, teil: ti, woerter: woerter(text) + woerter(klein) });
      t += dauer;
    });
  });
  let marke = null;
  if (s.begriffsmarke) {
    const d = LESEREGEL.marke(woerter(s.begriffsmarke));
    marke = { start: t, dauer: d, text: s.begriffsmarke };
    t += d;
  }
  t += s.animation_nachlauf_s ?? 0.5;
  anzeigen.forEach((a, i) => { a.ende = i + 1 < anzeigen.length ? anzeigen[i + 1].start : t; });
  return { id: s.id, dauer: t, vorlauf, beschriftungEnde, anzeigen, marke, meldungen, zwischen };
}

export function zeitplan(script) {
  const szenen = script.szenen;
  const plaene = szenen.map(szenePlanen);
  let t = 0;
  const abschnitte = [];
  szenen.forEach((s, i) => {
    const p = plaene[i];
    p.start = t;
    abschnitte.push({ art: 'szene', i, start: t, ende: t + p.dauer });
    t += p.dauer;
    const u = uebergang(s, szenen[i + 1]);
    if (u) {
      abschnitte.push({ art: u.art, i, start: t, ende: t + u.dauer });
      t += u.dauer;
    }
  });
  return { plaene, abschnitte, gesamt: t, meldungen: plaene.flatMap((p) => p.meldungen) };
}
