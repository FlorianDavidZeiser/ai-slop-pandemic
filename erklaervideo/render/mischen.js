// Tonmischung und Zusammenführung mit dem Bild.
//   node render/mischen.js           out/ton.wav aus Stimme und Musik, dann out/erklaervideo.mp4 mit Ton
// Grundlage: out/zeitplan.json (vom Render) und content/sprecher/*.mp3, content/sprecher/musik.wav.
// Pegel: Stimme auf -16 LUFS, Musik auf den Wert aus script.json (Standard -33 LUFS), unter der Stimme um weitere 6 dB abgesenkt.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const wurzel = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const aus = (...p) => path.join(wurzel, 'out', ...p);
const sp = (...p) => path.join(wurzel, 'content', 'sprecher', ...p);
const script = JSON.parse(fs.readFileSync(path.join(wurzel, 'content', 'script.json'), 'utf8'));
const info = JSON.parse(fs.readFileSync(aus('zeitplan.json'), 'utf8'));
const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });

// Integrierte Lautheit einer Datei in LUFS
function lufs(datei) {
  const out = execFileSync('ffmpeg', ['-i', datei, '-af', 'ebur128', '-f', 'null', '-'], { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  const txt = execFileSync('ffmpeg', ['-i', datei, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const m = (out + txt).match(/I:\s+(-?[\d.]+) LUFS/g);
  return Number(m[m.length - 1].match(/-?[\d.]+/)[0]);
}

const ZIEL_STIMME = -16;
const zielMusik = script.musik?.pegel_lufs ?? -33;
const gesamt = info.gesamt;

// 1. Stimme: jede Aufnahme an ihre Stelle, auf gleichen Pegel gebracht
const szenen = info.szenen.filter((s) => fs.existsSync(sp(`${s.id}.mp3`)) && s.sprechEnde > s.sprechStart);
const eingaben = [], filter = [];
szenen.forEach((s, i) => {
  const datei = sp(`${s.id}.mp3`);
  const gain = ZIEL_STIMME - lufs(datei);
  const start = Math.round((s.start + s.sprechStart) * 1000);
  eingaben.push('-i', datei);
  filter.push(`[${i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${gain.toFixed(2)}dB,adelay=${start}|${start}[v${i}]`);
});
filter.push(`${szenen.map((_, i) => `[v${i}]`).join('')}amix=inputs=${szenen.length}:normalize=0:dropout_transition=0,apad=whole_dur=${gesamt.toFixed(3)},atrim=0:${gesamt.toFixed(3)}[stimme]`);

// 2. Musik: in Schleife über die ganze Länge, ein- und ausgeblendet, unter der Stimme abgesenkt
const musik = sp('musik.wav');
let mischung = '[stimme]';
if (fs.existsSync(musik)) {
  const gainM = zielMusik - lufs(musik);
  eingaben.push('-stream_loop', '-1', '-i', musik);
  const mi = szenen.length;
  filter.push(`[${mi}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${gesamt.toFixed(3)},volume=${gainM.toFixed(2)}dB,afade=t=in:d=2,afade=t=out:st=${(gesamt - 5).toFixed(3)}:d=5[musik0]`);
  filter.push('[stimme]asplit[s1][s2]');
  // Absenkung: die Stimme steuert den Kompressor der Musik
  filter.push('[musik0][s2]sidechaincompress=threshold=0.015:ratio=6:attack=150:release=900:makeup=1[musik]');
  filter.push('[s1][musik]amix=inputs=2:normalize=0:dropout_transition=0[mix]');
  mischung = '[mix]';
} else {
  console.log('Hinweis: keine Musik gefunden, nur Stimme.');
}
ff([...eingaben, '-filter_complex', filter.join(';'), '-map', mischung, '-ar', '48000', '-c:a', 'pcm_s16le', aus('ton.wav')]);
console.log(`out/ton.wav: Stimme ${ZIEL_STIMME} LUFS, Musik ${zielMusik} LUFS, Lautheit gesamt ${lufs(aus('ton.wav')).toFixed(1)} LUFS`);

// 3. Bild und Ton zusammenführen
if (fs.existsSync(aus('erklaervideo.mp4'))) {
  ff(['-i', aus('erklaervideo.mp4'), '-i', aus('ton.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
    '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-movflags', '+faststart', '-shortest', aus('erklaervideo_mit_ton.mp4')]);
  fs.renameSync(aus('erklaervideo_mit_ton.mp4'), aus('erklaervideo.mp4'));
  console.log('out/erklaervideo.mp4 mit Ton');
} else {
  console.log('Hinweis: out/erklaervideo.mp4 fehlt, erst rendern und kodieren.');
}
