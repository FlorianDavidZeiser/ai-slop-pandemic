// Erzeugt die Sprecherstimme je Szene über HeyGen (POST /v3/voices/speech) und legt sie ab:
//   content/sprecher/<id>.mp3   Audio
//   content/sprecher/<id>.json  Dauer, Zeitstempel je Wort, Prüfsumme des Textes
// Eine Szene wird nur neu erzeugt, wenn Text, Stimme oder Tempo sich geändert haben.
// Der Schlüssel liegt in der Umgebung (Header X-Api-Key wird dort angehängt) oder in HEYGEN_API_KEY.
//   node render/sprecher.js            fehlende oder veränderte Szenen erzeugen
//   node render/sprecher.js --neu      alles neu erzeugen
//   node render/sprecher.js --musik    Hintergrundmusik laden
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const wurzel = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ordner = path.join(wurzel, 'content', 'sprecher');
fs.mkdirSync(ordner, { recursive: true });
const script = JSON.parse(fs.readFileSync(path.join(wurzel, 'content', 'script.json'), 'utf8'));
const kopf = { 'Content-Type': 'application/json', ...(process.env.HEYGEN_API_KEY ? { 'X-Api-Key': process.env.HEYGEN_API_KEY } : {}) };

// Alle Aufrufe über curl, damit sie durch den Proxy der Umgebung laufen, der den Schlüssel anhängt.
const curl = (args) => execFileSync('curl', ['-sS', '-m', '180', ...args], { maxBuffer: 1 << 28 });
async function laden(url, ziel) { curl(['-o', ziel, '--fail', url]); }
function api(url, body) {
  const kopfArgs = Object.entries(kopf).flatMap(([k, v]) => ['-H', `${k}: ${v}`]);
  const out = curl([...kopfArgs, ...(body ? ['-X', 'POST', '--data-binary', JSON.stringify(body)] : []), '-w', '\n%{http_code}', url]).toString();
  const i = out.lastIndexOf('\n');
  return { status: Number(out.slice(i + 1)), json: JSON.parse(out.slice(0, i) || '{}') };
}

async function sprechen(s) {
  const st = script.stimme;
  const hash = crypto.createHash('sha256').update(`${st.voice_id}|${st.tempo}|${st.sprache}|${s.sprecher}`).digest('hex').slice(0, 16);
  const jsonPfad = path.join(ordner, `${s.id}.json`), mp3Pfad = path.join(ordner, `${s.id}.mp3`);
  if (!process.argv.includes('--neu') && fs.existsSync(jsonPfad) && fs.existsSync(mp3Pfad)) {
    const alt = JSON.parse(fs.readFileSync(jsonPfad, 'utf8'));
    if (alt.hash === hash) { console.log(`${s.id}: unverändert (${alt.dauer.toFixed(1)} s)`); return; }
  }
  const { status, json: j } = api('https://api.heygen.com/v3/voices/speech', { text: s.sprecher, voice_id: st.voice_id, language: st.sprache, speed: st.tempo });
  if (status !== 200 || !j.data) throw new Error(`${s.id}: HeyGen ${status} ${JSON.stringify(j).slice(0, 300)}`);
  await laden(j.data.audio_url, mp3Pfad);
  const woerter = j.data.word_timestamps.filter((w) => !/^<.*>$/.test(w.word));
  fs.writeFileSync(jsonPfad, JSON.stringify({ hash, dauer: j.data.duration, woerter, stimme: st.name, request_id: j.data.request_id }, null, 1));
  console.log(`${s.id}: erzeugt (${j.data.duration.toFixed(1)} s, ${woerter.length} Wörter)`);
}

if (process.argv.includes('--musik')) {
  const m = script.musik;
  const ziel = path.join(ordner, 'musik.wav');
  const { json: j } = api(`https://api.heygen.com/v3/audio/sounds?type=music&limit=20&query=${encodeURIComponent(m.beschreibung)}`);
  const t = (j.data || []).find((x) => x.id === m.id) || (j.data || [])[0];
  if (!t) throw new Error('Musik: keine Treffer');
  if (t.id !== m.id) console.log(`Hinweis: Titel ${m.id} nicht gefunden, nehme ${t.id}. Bitte id in script.json eintragen.`);
  await laden(t.audio_url, ziel);
  console.log(`Musik geladen: ${t.description} (${t.duration} s)`);
} else {
  for (const s of script.szenen) if (s.sprecher) await sprechen(s);
  const gesamt = script.szenen.filter((s) => s.sprecher).reduce((n, s) => n + JSON.parse(fs.readFileSync(path.join(ordner, `${s.id}.json`), 'utf8')).dauer, 0);
  console.log(`Sprechzeit gesamt: ${Math.floor(gesamt / 60)}:${String(Math.round(gesamt % 60)).padStart(2, '0')}`);
}
