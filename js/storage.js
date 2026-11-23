// Сохранение: localStorage, файл JSON, ссылка с расстановкой в адресе.
const KEY = 'apartment3d.v1';

export function loadLocal() {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) { return null; }
}

export function saveLocal(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
}

const ITEM_KEYS = ['type', 'name', 'w', 'd', 'h', 'z', 'x', 'y', 'rot', 'color', 'color2', 'handles', 'metal', 'set', 'hob', 'burners'];
const HEX = /^#[0-9a-f]{6}$/i;
export function cleanItems(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((it) => it && typeof it === 'object').map((it) => {
    const o = {};
    for (const k of ITEM_KEYS) if (k in it) o[k] = it[k];
    for (const k of ['w', 'd', 'h', 'z', 'x', 'y', 'rot']) o[k] = Number.isFinite(+o[k]) ? +o[k] : 0;
    o.w = Math.max(10, o.w); o.d = Math.max(10, o.d); o.h = Math.max(1, o.h);
    o.type = typeof o.type === 'string' ? o.type : 'box';
    o.name = typeof o.name === 'string' && o.name.trim() ? o.name.slice(0, 60) : 'Предмет';
    o.color = HEX.test(o.color || '') ? o.color : '#cccccc';
    for (const k of ['color2', 'metal']) if (!HEX.test(o[k] || '')) delete o[k];
    if (o.handles !== false) delete o.handles;
    if (typeof o.set === 'string' && o.set) o.set = o.set.slice(0, 40); else delete o.set;
    // варочная панель: ширина, мм, и число конфорок
    for (const [k, lo, hi] of [['hob', 200, 1200], ['burners', 1, 6]]) {
      if (!(k in o)) continue;
      const v = Math.round(+o[k]);
      if (v >= lo && v <= hi) o[k] = v; else delete o[k];
    }
    return o;
  });
}

export function parseLayoutText(text) {
  const data = JSON.parse(text);
  if (Array.isArray(data)) return { name: 'Импорт', items: cleanItems(data) };
  if (data && Array.isArray(data.items)) return { name: String(data.name || 'Импорт').slice(0, 40), items: cleanItems(data.items) };
  if (data && Array.isArray(data.layouts)) {
    const cur = data.layouts.find((l) => l.id === data.current) || data.layouts[0];
    return { name: String(cur?.name || 'Импорт').slice(0, 40), items: cleanItems(cur?.items) };
  }
  throw new Error('Не похоже на файл расстановки');
}

export function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ── ссылка: deflate + base64url ──
const b64u = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const unb64u = (str) => {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
};

async function pipe(bytes, stream) {
  const res = await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer();
  return new Uint8Array(res);
}

// компактная форма: массив массивов вместо объектов
const pack = (layout) => ({ n: layout.name, i: layout.items.map((it) => {
  const a = [it.type, it.name, it.w, it.d, it.h, it.z || 0, Math.round(it.x), Math.round(it.y), it.rot || 0, it.color];
  if (it.color2 || it.handles === false || it.metal || it.set || it.hob) a.push(it.color2 || 0, it.handles === false ? 0 : 1, it.metal || 0, it.set || 0);
  if (it.hob) a.push(it.hob, it.burners || 0);
  return a;
}) });
const unpack = (p) => ({ name: p.n || 'Из ссылки', items: cleanItems((p.i || []).map((a) => ({
  type: a[0], name: a[1], w: a[2], d: a[3], h: a[4], z: a[5], x: a[6], y: a[7], rot: a[8], color: a[9],
  ...(a.length > 10 ? { color2: a[10] || undefined, handles: a[11] === 0 ? false : undefined, metal: a[12] || undefined, set: a[13] || undefined } : {}),
  ...(a.length > 14 ? { hob: a[14] || undefined, burners: a[15] || undefined } : {}),
}))) });

export async function encodeLayout(layout) {
  const raw = new TextEncoder().encode(JSON.stringify(pack(layout)));
  if (typeof CompressionStream === 'function') {
    try { return 'z' + b64u(await pipe(raw, new CompressionStream('deflate-raw'))); } catch (e) { /* ниже без сжатия */ }
  }
  return 'j' + b64u(raw);
}

export async function decodeLayout(code) {
  const kind = code[0], body = code.slice(1);
  let bytes = unb64u(body);
  if (kind === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  return unpack(JSON.parse(new TextDecoder().decode(bytes)));
}
