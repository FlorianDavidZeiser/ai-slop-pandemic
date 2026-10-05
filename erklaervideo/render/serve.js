// Kleiner lokaler Server für Vorschau und Render. Ohne Abhängigkeiten.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.ttf': 'font/ttf' };

// D4: Georgia und Calibri, wenn installiert. Sonst Gelasio und Carlito aus dem Projekt.
export function schriftenWaehlen() {
  let liste = '';
  try { liste = execSync('fc-list : family', { encoding: 'utf8' }); } catch { /* kein fontconfig */ }
  const hat = (n) => liste.split('\n').some((z) => z.split(',').map((s) => s.trim()).includes(n));
  return { serif: hat('Georgia') ? 'Georgia' : 'Gelasio', sans: hat('Calibri') ? 'Calibri' : 'Carlito' };
}

export function serverStarten(port = 0) {
  const schriften = schriftenWaehlen();
  const srv = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (url === '/api/schriften') { res.writeHead(200, { 'content-type': TYPEN['.json'] }); return res.end(JSON.stringify(schriften)); }
    let datei = url === '/' ? '/src/preview.html' : url;
    if (!datei.startsWith('/content/')) datei = datei.startsWith('/src/') ? datei : `/src${datei}`;
    const voll = path.join(wurzel, datei);
    if (!voll.startsWith(wurzel) || !fs.existsSync(voll) || fs.statSync(voll).isDirectory()) { res.writeHead(404); return res.end('nicht gefunden'); }
    res.writeHead(200, { 'content-type': TYPEN[path.extname(voll)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(voll).pipe(res);
  });
  return new Promise((ok) => srv.listen(port, '127.0.0.1', () => ok({ srv, port: srv.address().port, schriften })));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { port, schriften } = await serverStarten(Number(process.env.PORT || 5173));
  console.log(`Vorschau: http://127.0.0.1:${port}/  (Schriften: ${schriften.serif} / ${schriften.sans})`);
}
