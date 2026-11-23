// ─────────────────────────────────────────────────────────────────────────────
//  Ещё наборы по описаниям: туалет, батареи, спальня, гостиная, стол на кухне, кондиционер
//  шкаф с тумбой под телевизор, стеллаж, панели и техника, стол у окна в спальне.
//  Как и кухня с ванной, ставятся во все варианты расстановки один раз;
//  «Поставить заново» в «Мебель» → «Добавить» возвращает их на место.
// ─────────────────────────────────────────────────────────────────────────────
import { COORDS, M, H, RAD, HEATING } from './plan.js';

const { X, Y } = COORDS;

// локальные оси предмета: x — вдоль ширины, z — вперёд (от стены); перевод в план и обратно
const R = (it) => { const r = (it.rot * Math.PI) / 180; return [Math.cos(r), Math.sin(r)]; };
const at = (it, lx, lz) => { const [c, s] = R(it); return [Math.round(it.x + lx * c - lz * s), Math.round(it.y + lx * s + lz * c)]; };
const local = (it, x, y) => { const [c, s] = R(it); const dx = x - it.x, dy = y - it.y; return [dx * c + dy * s, -dx * s + dy * c]; };
const top = (it) => (it.z || 0) + it.h;

// Туалет: унитаз у дальней стены, в 30 см от неё, посередине комнаты, лицом к двери
export const WC_SET = 'wc-v1';
export function wcItems() {
  const d = 650;
  return [
    { set: WC_SET, type: 'toilet', name: 'Унитаз', w: 380, d, h: 780, z: 0, rot: 90,
      x: X.kit1 - 300 - d / 2, y: (Y.toi0 + Y.toi1) / 2, color: '#f6f6f4' },
  ];
}

// Батареи — по plan.js (HEATING): под окнами кухни, гостиной и спальни
export const HEAT_SET = 'heat-v1';
export function heatingItems() {
  return HEATING.map((h) => ({
    set: HEAT_SET, type: 'radiator', name: h.name, w: h.sections * RAD.section, d: RAD.d, h: RAD.h, z: RAD.z, rot: 0,
    x: h.at, y: h.face + RAD.gap + RAD.d / 2, color: '#f4f4f2',
  }));
}

// Спальня: кровать 170 × 214 поперёк комнаты, изголовье у правой стены (если смотреть от двери),
// примерно посередине по длине комнаты; шкаф-купе 140 × 60 × 240 — сразу справа от входа, напротив кровати;
// по обе стороны изголовья тумбочки, над ними бра с льняным абажуром (по фото)
export const BED_SET = 'bedroom-v3';
export const BED_KEEP = ['bedroom-v1', 'bedroom-v2'];   // кровать и шкаф уже стоят — их не трогаем
export const BED_ADD = ['Тумбочка у окна', 'Тумбочка у шкафа', 'Бра у окна', 'Бра у шкафа'];
// current — предметы варианта: если кровать там уже подвинута, тумбочки и бра ставятся возле неё
export function bedroomItems(current = []) {
  const len = 2140, wid = 1700, ww = 1400, wd = 600;
  const bedDef = { set: BED_SET, type: 'bedSoft', name: 'Кровать 170 × 214', w: wid, d: len, h: 1050, z: 0, rot: 90,
    x: X.bed1 - len / 2, y: M.bedD / 2, color: '#d3ccc2' };
  const items = [
    bedDef,
    { set: BED_SET, type: 'wardrobeSlide', name: 'Шкаф-купе 140', w: ww, d: wd, h: 2400, z: 0, rot: 180,
      x: X.bed1 - ww / 2, y: Y.bed1 - wd / 2, color: '#ebe7e0' },
  ];
  const bed = current.find((it) => it.type === 'bedSoft' && /^bedroom/.test(it.set || '')) || bedDef;
  const r = (bed.rot * Math.PI) / 180;
  const fx = -Math.sin(r), fy = Math.cos(r), wx = Math.cos(r), wy = Math.sin(r);   // куда смотрит кровать и её ширина
  const hx = bed.x - fx * bed.d / 2, hy = bed.y - fy * bed.d / 2;                   // середина изголовья, у стены
  const ns = { w: 450, d: 400, h: 520 }, sc = { w: 200, d: 300, h: 320, z: 1050 };
  for (const [side, where] of [[-1, 'у окна'], [1, 'у шкафа']]) {
    const off = side * (bed.w / 2 + ns.w / 2);
    items.push({ set: BED_SET, type: 'nightstand', name: `Тумбочка ${where}`, w: ns.w, d: ns.d, h: ns.h, z: 0, rot: bed.rot,
      x: Math.round(hx + fx * ns.d / 2 + wx * off), y: Math.round(hy + fy * ns.d / 2 + wy * off), color: '#e9e4db' });
    items.push({ set: BED_SET, type: 'sconceDrum', name: `Бра ${where}`, w: sc.w, d: sc.d, h: sc.h, z: sc.z, rot: bed.rot,
      x: Math.round(hx + fx * sc.d / 2 + wx * off), y: Math.round(hy + fy * sc.d / 2 + wy * off), color: '#ece5d7' });
  }
  return items;
}

// Гостиная: диван 215 (по фото) у стены спальни, посередине комнаты, лицом к левой стене;
// рабочий стол Move 140 × 70 с электроподъёмом и деревянной столешницей — у левой стены рядом с окном,
// лицом к стене; торцом почти упирается в батарею
export const LIVING_SET = 'living-v4';
export const LIVING_OLD = ['living-v1'];                 // диван стоял у левой стены — заменяется
export const LIVING_KEEP = ['living-v2', 'living-v3'];   // диван уже у стены спальни — остаётся
export const LIVING_DROP = ['Рабочий стол Move 140'];    // стол стоял лицом к окну и был чёрный — заменяется
export function livingItems() {
  const len = 2150, dep = 950, dw = 1400, dd = 700;
  const radFront = Y.liv0 + RAD.gap + RAD.d;            // передняя грань батареи под окном
  return [
    { set: LIVING_SET, type: 'sofaSlim', name: 'Диван 215', w: len, d: dep, h: 880, z: 0, rot: 90,
      x: X.liv1 - dep / 2, y: (Y.liv0 + Y.liv1) / 2, color: '#8c8b6a' },
    { set: LIVING_SET, type: 'deskLift', name: 'Рабочий стол Move 140', w: dw, d: dd, h: 750, z: 0, rot: 270,
      x: X.liv0 + dd / 2, y: radFront + 10 + dw / 2, color: '#b5814f' },
  ];
}

// Кухня: стол 80 × 80 в углу у окна и кирпичной стены, в 20 см от окна (в углу стояк отопления и трубы
// к батарее). Над столом на кирпичной стене бра с четырьмя шариками (по фото)
export const DINING_SET = 'dining-v2';
export const DINING_KEEP = ['dining-v1'];
export const diningFix = (it) => ({ y: it.y + 100 });   // был в 10 см от окна — отодвигаем ещё на 10, где бы ни стоял
export function diningItems() {
  const t = 800, y0 = Y.top + 200;
  return [
    { set: DINING_SET, type: 'tableSquare', name: 'Стол 80 × 80', w: t, d: t, h: 750, z: 0, rot: 0,
      x: X.kit0 + t / 2, y: y0 + t / 2, color: '#a27c58' },
    { set: DINING_SET, type: 'sconceBalls', name: 'Бра с шариками', w: 130, d: 200, h: 800, z: 1000, rot: 270,
      x: X.kit0 + 100, y: y0 + t / 2, color: '#b8955a' },
  ];
}

// Кондиционер (место отмечено на снимке): прихожая, стена между дверью в гостиную и углом спальни,
// под потолком; обычный настенный блок 80 × 28 × 20 см
export const AC_SET = 'aircon-v1';
export function airconItems() {
  const w = 800, d = 200, h = 280;
  const y0 = Y.hall0, y1 = Y.liv1 - M.livingDoorFromBottom - M.livingDoor;   // от угла спальни до двери в гостиную
  return [
    { set: AC_SET, type: 'aircon', name: 'Кондиционер', w, d, h, z: M.ceiling - 80 - h, rot: 270,
      x: X.bed0 + d / 2, y: Math.round((y0 + y1) / 2), color: '#f7f7f5' },
  ];
}

// Гостиная: шкаф с тумбой под телевизор по чертежу (общая длина 3600, высота 2400), вдоль левой стены
// от угла напротив окна: распашной шкаф 918 в углу, дальше тумба 2682 × 500 (дверцы 900 — ящик с нишей —
// дверцы 900), на её левом краю открытые полки 450 до высоты 2400, над серединой тумбы телевизор.
// Глубины на чертеже нет — взята 450 для всего, как на фото. Розетки нарисованы по чертежу.
export const TVWALL_SET = 'tvwall-v2';
export const TVWALL_KEEP = ['tvwall-v1'];
export const TVWALL_DROP = ['Открытые полки 45'];                 // полки были 45 снаружи — проигрыватель не влезал
export const TVWALL_ADD = ['Открытые полки, внутри 45'];          // теперь 45 внутри, 48,6 снаружи
// current — предметы варианта: если тумба уже стоит, полки встают на её край у шкафа
export function tvwallItems(current) {
  const corner = Y.liv1, d = 450, cab = 918, base = 2682, col = 450 + 2 * 18;
  const front = '#e7e0d6', walnut = '#6f4d36';
  const unit = current && current.find((it) => it.type === 'tvUnit' && /^tvwall/.test(it.set || ''));
  const colPos = unit ? (() => { const [x, y] = at(unit, -unit.w / 2 + col / 2, -unit.d / 2 + d / 2); return { x, y, z: top(unit), rot: unit.rot }; })()
    : { x: X.liv0 + d / 2, y: corner - cab - col / 2, z: 500, rot: 270 };
  return [
    { set: TVWALL_SET, type: 'cabinetTall', name: 'Шкаф 90', w: cab, d, h: 2400, z: 0, rot: 270,
      x: X.liv0 + d / 2, y: corner - cab / 2, color: front },
    { set: TVWALL_SET, type: 'tvUnit', name: 'Тумба под телевизор 268', w: base, d, h: 500, z: 0, rot: 270,
      x: X.liv0 + d / 2, y: corner - cab - base / 2, color: front, color2: walnut },
    { set: TVWALL_SET, type: 'shelfOpen', name: 'Открытые полки, внутри 45', w: col, d, h: 1900, ...colPos, color: walnut },
    { set: TVWALL_SET, type: 'tv', name: 'Телевизор 55″', w: 1230, d: 60, h: 710, z: 800, rot: 270,
      x: X.liv0 + 30, y: corner - cab - base / 2, color: '#1c1d1f' },
  ];
}

// Гостиная, дополнения к столу и тумбе:
// · стеллаж-перегородка между тумбой и рабочим столом: ширина 30 см, длина на 15 см больше глубины стола,
//   высоту не называли — 2400, как шкаф и полки;
// · реечная панель (по фото) рядом с телевизором, со стороны стола: от тумбы до потолка;
// · саундбар на тумбе под телевизором;
// · проигрыватель Sony PS-LX310BT (43 × 10,8 × 36,7 см) на полке с розеткой в открытых полках;
// · монитор AOC CU34V5CW (80,8 × 25 × 41–54 см) на рабочем столе.
// current — предметы варианта: всё ставится возле стола, тумбы и полок там, где они стоят сейчас;
// если чего-то из них в варианте нет, то, что на нём стоит, не добавляется.
export const MEDIA_SET = 'media-v2';
export const MEDIA_KEEP = ['media-v1'];
export const MEDIA_DROP = ['Проигрыватель Sony PS-LX310BT'];   // ставится заново — по центру расширенных полок
export const MEDIA_ADD = ['Проигрыватель Sony PS-LX310BT'];
export function mediaItems(current) {
  const set = MEDIA_SET, walnut = '#6f4d36';
  const pick = (type, re, def) => (current ? current.find((it) => it.type === type && re.test(it.set || '')) : def);
  const [, deskDef] = livingItems();
  const [, unitDef, colDef, tvDef] = tvwallItems();
  const desk = pick('deskLift', /^living/, deskDef), unit = pick('tvUnit', /^tvwall/, unitDef);
  const col = pick('shelfOpen', /^tvwall/, colDef), tv = pick('tv', /^tvwall/, tvDef);
  const items = [];
  if (desk && unit && desk.rot === unit.rot) {
    // стеллаж: в промежутке между тумбой и столом, вплотную к стене
    const [dx] = local(unit, desk.x, desk.y), side = Math.sign(dx) || 1;
    const a = side * unit.w / 2, b = dx - side * desk.w / 2, sd = desk.d + 150;
    const [x, y] = at(unit, (a + b) / 2, -unit.d / 2 + sd / 2);
    items.push({ set, type: 'shelfDivider', name: 'Стеллаж 30', w: 300, d: sd, h: 2400, z: 0, rot: unit.rot, x, y, color: walnut });
  }
  if (unit && tv) {
    const [tx] = local(unit, tv.x, tv.y);
    // рейки: от края телевизора до конца тумбы со стороны стола (или с той стороны, где больше места)
    const [dx] = desk ? local(unit, desk.x, desk.y) : [unit.w / 2 - tx];
    const side = Math.sign(dx) || 1, a = tx + side * tv.w / 2, b = side * unit.w / 2, w = Math.abs(b - a);
    if (w >= 200) {
      const [x, y] = at(unit, (a + b) / 2, -unit.d / 2 + 11);
      items.push({ set, type: 'slatPanel', name: 'Реечная панель', w: Math.round(w), d: 22, h: M.ceiling - top(unit), z: top(unit), rot: unit.rot, x, y, color: walnut });
    }
    // саундбар: на тумбе под телевизором
    const sx = Math.max(-unit.w / 2 + 440, Math.min(unit.w / 2 - 440, tx));
    const [x, y] = at(unit, sx, -unit.d / 2 + 200);
    items.push({ set, type: 'soundbar', name: 'Саундбар', w: 880, d: 100, h: 65, z: top(unit), rot: unit.rot, x, y, color: '#1f2022' });
  }
  if (col) {
    // проигрыватель: на полке с розеткой (вторая снизу, её верх в 336 мм от низа полок при высоте 1900)
    const [x, y] = at(col, 0, 0);
    items.push({ set, type: 'turntable', name: 'Проигрыватель Sony PS-LX310BT', w: 430, d: 367, h: 108, rot: col.rot,
      z: Math.round((col.z || 0) + 336 * (col.h / 1900)), x, y, color: '#1b1c1e' });
  }
  if (desk) {
    // монитор: у дальнего края стола, по центру
    const [x, y] = at(desk, 0, -desk.d / 2 + 60 + 125);
    items.push({ set, type: 'monitorCurved', name: 'Монитор AOC CU34V5CW', w: 808, d: 250, h: 480, z: top(desk), rot: desk.rot, x, y, color: '#1b1c1e' });
  }
  return items;
}

// Спальня: стол у окна со шкафами (по фото) — вдоль всей стены с окном (240,5 см).
// Подоконника нет: столешница — его продолжение, поэтому она на высоте низа окна (в модели 85 см),
// в проёме до рамы лежит доска из того же дуба (это часть окна, см. plan.js).
// В простенках по 50 см тумбы с тремя ящиками; на них у стен закрытые шкафы по 30 см, ближе к окну —
// открытые полки по 17 см без стенки со стороны окна, чтобы сбоку ставить цветы. Справа в углу шкаф
// закрывает стояк. Над батареей в столешнице решётка, под столешницей два ящика.
export const STUDY_SET = 'study-v2';
export const STUDY_OLD = ['study-v1'];
export function studyItems() {
  const set = STUDY_SET, white = '#f1f1ee', oak = '#cfb38e';
  const x0 = X.bed0, x1 = X.bed1, win0 = (x0 + x1) / 2 - M.bedWinW / 2, win1 = win0 + M.bedWinW;
  const D = 600, topT = 30, deskH = H.winBottom, upD = 350, upTop = 2400, apronH = 120, apronD = 450;
  const cab = 300, shelf = 170, lw = win0 - x0, rw = x1 - win1, upH = upTop - deskH;
  const up = { d: upD, h: upH, z: deskH, rot: 0, y: upD / 2 };
  return [
    { set, type: 'drawerUnit', name: 'Тумба с ящиками у окна слева', w: lw, d: D, h: deskH - topT, z: 0, rot: 0, x: x0 + lw / 2, y: D / 2, color: white },
    { set, type: 'drawerUnit', name: 'Тумба с ящиками у окна справа', w: rw, d: D, h: deskH - topT, z: 0, rot: 0, x: x1 - rw / 2, y: D / 2, color: white },
    { set, type: 'windowTop', name: 'Столешница у окна', w: x1 - x0, d: D, h: topT, z: deskH - topT, rot: 0, x: (x0 + x1) / 2, y: D / 2, color: oak },
    { set, type: 'drawerApron', name: 'Ящики под столешницей', w: win1 - win0, d: apronD, h: apronH, z: deskH - topT - apronH, rot: 0,
      x: (win0 + win1) / 2, y: D - apronD / 2, color: white },
    { set, type: 'cabinetDoor', name: 'Шкаф у окна слева', w: cab, ...up, x: x0 + cab / 2, color: white },
    { set, type: 'shelfOpenR', name: 'Полки для цветов слева', w: shelf, ...up, x: x0 + cab + shelf / 2, color: oak },
    { set, type: 'shelfOpenL', name: 'Полки для цветов справа', w: shelf, ...up, x: x1 - cab - shelf / 2, color: oak },
    { set, type: 'cabinetDoor', name: 'Шкаф у окна справа', w: cab, ...up, x: x1 - cab / 2, color: white },
  ];
}
