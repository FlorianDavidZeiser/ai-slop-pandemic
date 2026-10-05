// Grundlagen: Farben, Easing, SVG-Helfer. Alles rein funktional, keine Uhrzeit.

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  blau: '#004799',
  orange: '#FF6600',
  text: '#1A2430',
  grau: '#616870',
  grauHell: '#C3C8CF',
  flaeche: '#F2F5FA',
  flaecheOrange: '#FFF3EA',
  weiss: '#FFFFFF',
  // Endbild, wie in der Grafik des Papiers
  s4: '#1B2A4A',
  s3: '#D4712A',
  s2: '#0D7377',
  pflicht: '#B0A99F',
  gold: '#C4841D',
};

// Layoutraster nach D4a
export const RASTER = {
  rand: 96,
  bildOben: 96,
  bildUnten: 760,
  bandOben: 800,
  bandUnten: 1000,
  textX: 160,
  textBreite: 1100,
  zeichenProZeile: 55,
};

// Schriftfamilien, werden beim Start gesetzt (System oder freier Ersatz)
export const FONTS = { serif: 'Gelasio', sans: 'Carlito' };

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const easeIO = (x) => {
  x = clamp(x);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
// linearer Fortschritt von a über die Dauer d
export const seg = (t, a, d) => (d <= 0 ? (t >= a ? 1 : 0) : clamp((t - a) / d));
// weicher Fortschritt, Standarddauer 0,6 s (D4: 400 bis 700 ms)
export const eseg = (t, a, d = 0.6) => easeIO(seg(t, a, d));

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const f = (n) => (Math.round(n * 100) / 100).toString();

export function txt(x, y, s, o = {}) {
  const {
    size = 44, fam = 'sans', fill = C.text, weight = 400, anchor = 'start',
    op = 1, ls = 0, rot = 0,
  } = o;
  if (op <= 0) return '';
  const family = fam === 'serif' ? FONTS.serif : FONTS.sans;
  const tr = rot ? ` transform="rotate(${rot} ${f(x)} ${f(y)})"` : '';
  return `<text x="${f(x)}" y="${f(y)}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}${op < 1 ? ` opacity="${f(op)}"` : ''}${tr}>${esc(s)}</text>`;
}

export const g = (inner, { op = 1, tr = '' } = {}) =>
  op <= 0 || !inner ? '' : `<g${op < 1 ? ` opacity="${f(op)}"` : ''}${tr ? ` transform="${tr}"` : ''}>${inner}</g>`;

export const rect = (x, y, w, h, o = {}) => {
  const { fill = 'none', stroke = 'none', sw = 4, rx = 12, op = 1, dash = '' } = o;
  if (op <= 0) return '';
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}${op < 1 ? ` opacity="${f(op)}"` : ''}/>`;
};

export const line = (x1, y1, x2, y2, o = {}) => {
  const { stroke = C.blau, sw = 4, op = 1, dash = '', dashoff = 0 } = o;
  if (op <= 0) return '';
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}" stroke-dashoffset="${f(dashoff)}"` : ''}${op < 1 ? ` opacity="${f(op)}"` : ''}/>`;
};

export const circle = (cx, cy, r, o = {}) => {
  const { fill = 'none', stroke = 'none', sw = 4, op = 1 } = o;
  if (op <= 0) return '';
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${op < 1 ? ` opacity="${f(op)}"` : ''}/>`;
};

// Pfad, der sich mit p von 0 bis 1 aufzeichnet
export const drawPath = (d, p, o = {}) => {
  const { stroke = C.blau, sw = 4, op = 1, fill = 'none' } = o;
  if (p <= 0 || op <= 0) return '';
  return `<path d="${d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${f(1 - p)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${f(op)}"` : ''}/>`;
};

// Linie mit Pfeilspitze, zeichnet sich mit p auf
export function arrow(x1, y1, x2, y2, p = 1, o = {}) {
  const { stroke = C.blau, sw = 4, op = 1, head = 18 } = o;
  if (p <= 0 || op <= 0) return '';
  const xe = lerp(x1, x2, p), ye = lerp(y1, y2, p);
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx1 = xe - head * Math.cos(a - 0.45), hy1 = ye - head * Math.sin(a - 0.45);
  const hx2 = xe - head * Math.cos(a + 0.45), hy2 = ye - head * Math.sin(a + 0.45);
  const opa = op < 1 ? ` opacity="${f(op)}"` : '';
  return `<g${opa}><line x1="${f(x1)}" y1="${f(y1)}" x2="${f(xe)}" y2="${f(ye)}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>` +
    `<path d="M${f(hx1)} ${f(hy1)} L${f(xe)} ${f(ye)} L${f(hx2)} ${f(hy2)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

export const woerter = (s) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);
