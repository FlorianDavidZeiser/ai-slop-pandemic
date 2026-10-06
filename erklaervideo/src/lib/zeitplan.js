// Zeitplan Fassung 4: Die Stimme bestimmt die Szenendauern. Jede Szene hat Vorlauf, Sprechzeit, Nachlauf.
// Bildtext und Animation hängen an Wörtern der Aufnahme (Zeitstempel aus content/sprecher/<id>.json).
import { umbrechen } from './text.js';

// Szenenwechsel, bei denen das Bild durchläuft (Kontinuität). Hier keine weiße Fläche.
const KONTINUITAET = new Set(['S00>S01', 'S05>S06', 'S13>S14']);
const MARKE_MIN = 2.2; // Begriffsmarke mindestens so lange sichtbar

export function uebergang(a, b) {
  if (!b) return null;
  if (a.akt === b.akt || KONTINUITAET.has(`${a.id}>${b.id}`)) return { art: 'blende', dauer: 0.4 };
  return { art: 'weiss', dauer: 0.7 };
}

const norm = (w) => w.toLowerCase().replace(/[^0-9a-zäöüß-]/g, '');

// Sucht eine Wortfolge in den Zeitstempeln. Liefert den Index des ersten Wortes oder -1.
function wortIndex(woerter, phrase, ab = 0) {
  const ziel = phrase.split(/\s+/).map(norm).filter(Boolean);
  for (let i = ab; i <= woerter.length - ziel.length; i++) {
    if (ziel.every((z, k) => norm(woerter[i + k].word) === z)) return i;
  }
  return -1;
}

export function szenePlanen(s, audio) {
  const meldungen = [];
  const vorlauf = s.vorlauf_s ?? 0.5;
  const p = { id: s.id, vorlauf, meldungen, bildtext: null, marke: null, sprechStart: vorlauf, sprechEnde: vorlauf, woerter: [] };

  // Zeit, zu der ein Wort (oder eine Wortfolge) gesprochen wird, relativ zum Szenenanfang.
  // Fällt auf den Ersatzwert zurück und meldet es, wenn die Wörter fehlen.
  p.w = (phrase, ersatz = p.sprechEnde, ende = false) => {
    const i = wortIndex(p.woerter, phrase);
    if (i < 0) { meldungen.push(`${s.id}: Wort „${phrase}“ nicht in der Aufnahme`); return ersatz; }
    const j = i + phrase.trim().split(/\s+/).length - 1;
    return vorlauf + (ende ? p.woerter[j].end : p.woerter[i].start);
  };

  if (s.bildtext) {
    const zeilen = umbrechen(s.bildtext, 44);
    if (!zeilen) meldungen.push(`${s.id}: Bildtext passt nicht in zwei Zeilen: ${s.bildtext}`);
    p.bildtext = { text: s.bildtext, zeilen: zeilen || [s.bildtext], start: vorlauf };
  }

  if (s.dauer_fest_s || !audio) {
    p.dauer = s.dauer_fest_s ?? 6;
    return p;
  }
  p.woerter = audio.woerter;
  p.sprechEnde = vorlauf + audio.dauer;
  p.dauer = p.sprechEnde + (s.nachlauf_s ?? 0.6);
  if (p.bildtext) p.bildtext.start = s.bildtext_ab ? p.w(s.bildtext_ab, p.sprechEnde - 2.5) : p.sprechEnde - 2.5;
  if (s.begriffsmarke) {
    const start = Math.max(p.sprechEnde - 1.2, (p.bildtext ? p.bildtext.start : 0) + 1.6);
    p.marke = { text: s.begriffsmarke, start };
    p.dauer = Math.max(p.dauer, start + MARKE_MIN);
  }
  return p;
}

export function zeitplan(script, audios) {
  const szenen = script.szenen;
  const plaene = szenen.map((s) => szenePlanen(s, audios[s.id]));
  let t = 0;
  const abschnitte = [];
  szenen.forEach((s, i) => {
    const p = plaene[i];
    p.start = t;
    abschnitte.push({ art: 'szene', i, start: t, ende: t + p.dauer });
    t += p.dauer;
    const u = uebergang(s, szenen[i + 1]);
    if (u) { abschnitte.push({ art: u.art, i, start: t, ende: t + u.dauer }); t += u.dauer; }
  });
  return { plaene, abschnitte, gesamt: t, meldungen: plaene.flatMap((p) => p.meldungen) };
}
