// ─────────────────────────────────────────────────────────────────────────────
//  ГЕОМЕТРИЯ КВАРТИРЫ — по обмерочному плану М 1:50
//
//  Все размеры в миллиметрах.
//  Ось X — слева направо по плану, ось Y — сверху вниз (от окон к входной двери).
//  Точка 0,0 — внутренний угол балкона у фасадной стены (левый верхний угол плана).
//
//  Если перемеришь что-то рулеткой — поменяй число в блоке «Замеры» ниже,
//  всё остальное (стены, проёмы, подписи, площади) пересчитается само.
// ─────────────────────────────────────────────────────────────────────────────

// ── Замеры с плана ───────────────────────────────────────────────────────────
export const M = {
  ceiling: 2500,          // высота потолка — с развёртки стены душевой (2500)

  livingW: 2640,          // гостиная, ширина
  livingD: 5500,          // гостиная, глубина (от стены балкона до нижней стены)
  balconyD: 1350,         // балкон, глубина

  bedW: 2405,             // спальня, ширина
  bedD: 4560,             // спальня, глубина (справа подписано 4495 — взято 4560, иначе не сходится с прихожей)

  kitchenW: 2430,         // кухня, ширина
  kitchenD: 2640,         // кухня, глубина до стены ванной

  hallW: 2550,            // прихожая, ширина вверху (до коридора)
  hallD: 2290,            // прихожая, глубина
  hallEntryLeft: 1140,    // от левой стены прихожей до входной двери
  entryDoor: 840,         // входная дверь (проём)
  hallEntryRight: 410,    // от двери до правой стены

  corridorLen: 2630,      // коридор к ванной и туалету
  bathW: 1440,            // ванная, ширина (725 + 715)
  bathD: 1630,            // ванная, глубина
  bathBlockW: 1665,       // блок ванной со стенами, как видно из кухни
  shaftW: 725,            // вентшахта в ванной
  shaftD: 215,
  toiletW: 1485,          // туалет
  toiletD: 710,

  bedWinW: 1407,          // окно спальни (по центру стены)
  kitPierL: 560,          // кухня: простенок слева от окна
  kitPierR: 570,          // кухня: простенок справа (560 + 1510 + 570 = 2640 > 2430, поэтому окно = остаток)
  balPierL: 480,          // стена балкона: простенок слева
  balWinW: 1013,          // окно на балкон
  balDoorW: 700,          // балконная дверь
  loggiaSolid: 570,       // глухой участок фасада балкона слева

  livingDoor: 910,        // дверь в гостиную
  livingDoorFromBottom: 450, // от нижней стены до проёма (по рисунку)
  bedDoor: 800,           // дверь в спальню
  bedDoorWall: 1490,      // стена справа от двери спальни
  bathDoor: 600,          // дверь в ванную
  bathDoorFromTop: 735,   // от верхней стены ванной до проёма (по рисунку)
  toiletDoor: 600,        // дверь в туалет
  toiletDoorFromTop: 60,
};

// ── Толщины стен (на плане не подписаны: где можно — выведены из размеров, остальное оценка) ──
export const T = {
  outer: 300,                         // наружные стены
  bottom: 200,                        // нижняя стена гостиной и прихожей
  livingBed: 150,                     // гостиная | спальня
  bedKitchen: M.hallW - M.bedW,       // 2550 − 2405 = 145
  balcony: 120,                       // балкон | гостиная
  bedHall: 120,                       // спальня | прихожая
  hallRight: M.hallW - (M.hallEntryLeft + M.entryDoor + M.hallEntryRight), // 2550 − 2390 = 160
  stair: 160,                         // стена к лестничной клетке
  bathTop: (M.corridorLen - M.bathD - M.toiletD) / 2,   // (2630 − 1630 − 710) / 2 = 145
  bathMid: (M.corridorLen - M.bathD - M.toiletD) / 2,
  bathLeft: 120,
  bathLining: M.bathBlockW - M.bathW - 120,             // 1665 − 1440 − 120 = 105
  toiletLeft: M.bathBlockW - M.toiletW,                 // 1665 − 1485 = 180
};

export const H = {
  door: 2050,           // высота дверного проёма
  winBottom: 850,       // подоконник
  winTop: 2300,         // верх окна
  balTop: 2250,         // верх балконного блока
  loggiaBottom: 1000,   // парапет балкона
  loggiaTop: 2450,
};

// ── Опорные координаты ───────────────────────────────────────────────────────
const X = {};
X.liv0 = 0;
X.liv1 = M.livingW;                       // 2640
X.bed0 = X.liv1 + T.livingBed;            // 2790  (и левая стена прихожей)
X.bed1 = X.bed0 + M.bedW;                 // 5195
X.kit0 = X.bed1 + T.bedKitchen;           // 5340  (и левая граница коридора)
X.kit1 = X.kit0 + M.kitchenW;             // 7770
X.bathOut = X.kit1 - M.bathBlockW;        // 6105  (коридор = 765)
X.bath0 = X.bathOut + T.bathLeft;         // 6225
X.bath1 = X.bath0 + M.bathW;              // 7665
X.toi0 = X.kit1 - M.toiletW;              // 6285
X.hallR = X.bed0 + M.hallEntryLeft + M.entryDoor + M.hallEntryRight; // 5180
X.out0 = -T.outer;
X.out1 = X.kit1 + T.outer;

const Y = {};
Y.top = 0;
Y.bal1 = M.balconyD;                      // 1350
Y.liv0 = Y.bal1 + T.balcony;              // 1470
Y.liv1 = Y.liv0 + M.livingD;              // 6970
Y.bed1 = M.bedD;                          // 4560
Y.hall0 = Y.bed1 + T.bedHall;             // 4680
Y.kit1 = M.kitchenD;                      // 2640
Y.bath0 = Y.kit1 + T.bathTop;             // 2785
Y.bath1 = Y.bath0 + M.bathD;              // 4415
Y.toi0 = Y.bath1 + T.bathMid;             // 4560
Y.toi1 = Y.toi0 + M.toiletD;              // 5270
Y.stair1 = Y.toi1 + T.stair;              // 5430
Y.out0 = -T.outer;
Y.out1 = Y.liv1 + T.bottom;               // 7170

export const COORDS = { X, Y };

const win = (from, to, extra = {}) => ({ type: 'window', from, to, bottom: H.winBottom, top: H.winTop, ...extra });
// door: hinge — у какого конца проёма петли ('from' | 'to'); swing — куда открывается (+1 / −1 по оси, перпендикулярной стене);
// style: 'strips' — межкомнатная дверь по фото (белая, три полосы матового стекла)
const door = (from, to, hinge, swing, extra = {}) => ({ type: 'door', from, to, bottom: 0, top: H.door, hinge, swing, ...extra });

const bedWinFrom = (X.bed0 + X.bed1) / 2 - M.bedWinW / 2;
const balWin0 = X.liv0 + M.balPierL;
const balWin1 = balWin0 + M.balWinW;
const bedDoor0 = X.bed1 - M.bedDoorWall - M.bedDoor;    // простенок слева = 2405 − 800 − 1490 = 115
const entry0 = X.bed0 + M.hallEntryLeft;

// ── Стены: прямоугольники [x0..x1] × [y0..y1], проёмы задаются вдоль длинной стороны ──
export const WALLS = [
  { id: 'facade', name: 'Фасад', x0: X.out0, y0: Y.out0, x1: X.out1, y1: Y.top, outer: true, openings: [
    { type: 'glazing', from: X.liv0 + M.loggiaSolid, to: X.liv1, bottom: H.loggiaBottom, top: H.loggiaTop, sill: 1 },
    // спальня: подоконника нет — столешница стола у окна его продолжает (доска в проёме из того же дуба)
    win(bedWinFrom, bedWinFrom + M.bedWinW, { sill: 1, board: { flush: true, color: '#cfb38e', t: 30 } }),
    win(X.kit0 + M.kitPierL, X.kit1 - M.kitPierR, { sill: 1 }),
  ] },
  { id: 'left', name: 'Левая наружная', x0: X.out0, y0: Y.top, x1: X.liv0, y1: Y.out1, outer: true, openings: [] },
  { id: 'right', name: 'Правая наружная', x0: X.kit1, y0: Y.top, x1: X.out1, y1: Y.stair1, outer: true, openings: [] },
  { id: 'bottom', name: 'Нижняя', x0: X.liv0, y0: Y.liv1, x1: X.hallR, y1: Y.out1, outer: true, openings: [
    // входная дверь открывается наружу, на площадку (на рисунке — внутрь)
    door(entry0, entry0 + M.entryDoor, 'from', +1, { name: 'Входная дверь', acc: 'входную дверь', leafColor: '#f3f3f1', closed: true }),
  ] },
  { id: 'hallRight', name: 'Прихожая справа', x0: X.hallR, y0: Y.stair1, x1: X.kit0, y1: Y.out1, outer: true, openings: [] },
  { id: 'stair', name: 'К лестнице', x0: X.hallR, y0: Y.toi1, x1: X.kit1, y1: Y.stair1, outer: true, openings: [] },

  { id: 'livingBed', name: 'Гостиная | спальня', x0: X.liv1, y0: Y.top, x1: X.bed0, y1: Y.liv1, openings: [
    door(Y.liv1 - M.livingDoorFromBottom - M.livingDoor, Y.liv1 - M.livingDoorFromBottom, 'to', -1, { name: 'Дверь в гостиную', style: 'strips' }),
  ] },
  { id: 'balcony', name: 'Балкон | гостиная', x0: X.liv0, y0: Y.bal1, x1: X.liv1, y1: Y.liv0, openings: [
    { type: 'window', from: balWin0, to: balWin1, bottom: H.winBottom, top: H.balTop, sill: 1 },
    // балконная дверь открывается на балкон, вправо (если смотреть из гостиной): петли справа
    door(balWin1, balWin1 + M.balDoorW, 'to', -1, { top: H.balTop, name: 'Балконная дверь', acc: 'балконную дверь', glass: true }),
  ] },
  { id: 'bedKitchen', name: 'Спальня | кухня', x0: X.bed1, y0: Y.top, x1: X.kit0, y1: Y.hall0, openings: [] },
  { id: 'bedHall', name: 'Спальня | прихожая', x0: X.bed0, y0: Y.bed1, x1: X.bed1, y1: Y.hall0, openings: [
    // дверь в спальню открывается внутрь спальни, к левой стене (на рисунке — в прихожую)
    door(bedDoor0, bedDoor0 + M.bedDoor, 'from', -1, { name: 'Дверь в спальню', style: 'strips' }),
  ] },
  { id: 'bathTop', name: 'Ванная сверху', x0: X.bathOut, y0: Y.kit1, x1: X.kit1, y1: Y.bath0, openings: [] },
  { id: 'bathLeft', name: 'Ванная слева', x0: X.bathOut, y0: Y.bath0, x1: X.bath0, y1: Y.bath1, openings: [
    door(Y.bath0 + M.bathDoorFromTop, Y.bath0 + M.bathDoorFromTop + M.bathDoor, 'to', -1, { name: 'Дверь в ванную', style: 'strips' }),
  ] },
  { id: 'bathMid', name: 'Ванная | туалет', x0: X.bathOut, y0: Y.bath1, x1: X.kit1, y1: Y.toi0, openings: [
    // ниша в душе над смесителем (по развёртке и фото): две полки 35 и 30 см
    { type: 'niche', from: X.bath1 - 560, to: X.bath1 - 50, bottom: 1350, top: 2040, depth: 100, side: -1, shelf: 1700 },
  ] },
  { id: 'bathLining', name: 'Короб в ванной', x0: X.bath1, y0: Y.bath0, x1: X.kit1, y1: Y.bath1, openings: [] },
  { id: 'toiletLeft', name: 'Туалет слева', x0: X.bathOut, y0: Y.toi0, x1: X.toi0, y1: Y.toi1, openings: [
    door(Y.toi0 + M.toiletDoorFromTop, Y.toi0 + M.toiletDoorFromTop + M.toiletDoor, 'to', -1, { name: 'Дверь в туалет', style: 'strips' }),
  ] },
];

// Неподвижные элементы (короба, шахты) — как стены, но без проёмов
export const FIXTURES = [
  { id: 'shaft', name: 'Вентшахта', x0: X.bath0, y0: Y.bath0, x1: X.bath0 + M.shaftW, y1: Y.bath0 + M.shaftD },
];

// ── Отопление (по фото): батареи под окнами, стояк в углу, подача сверху и обратка снизу с байпасом ──
// Батареи ставятся как мебель (их можно подвинуть), трубы — часть квартиры.
// at — середина батареи вдоль стены, face — стена с окном, riser — где стояк.
export const RAD = { section: 80, h: 570, d: 80, z: 120, gap: 40 };   // секция 8 см, высота 57 см, от пола 12, от стены 4
const kitWin0 = X.kit0 + M.kitPierL, kitWin1 = X.kit1 - M.kitPierR;
export const HEATING = [
  // кухня: 4 секции под правой створкой окна, трубы слева
  { id: 'kitchen', name: 'Батарея, 4 секции', sections: 4, face: Y.top, at: kitWin0 + (kitWin1 - kitWin0) * 0.6, riser: X.kit0 + 80 },
  // гостиная: 12 секций под окном на балкон, трубы слева
  { id: 'living', name: 'Батарея, 12 секций', sections: 12, face: Y.liv0, at: balWin0 + M.balWinW / 2, riser: X.liv0 + 80 },
  // спальня: 9 секций по центру окна, трубы как в гостиной, но справа
  { id: 'bedroom', name: 'Батарея, 9 секций', sections: 9, face: Y.top, at: (X.bed0 + X.bed1) / 2, riser: X.bed1 - 80 },
];

const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

// ── Помещения: контур пола (для подписей, площадей и мини-карты) ──
export const ROOMS = [
  { id: 'living', name: 'Гостиная', poly: rect(X.liv0, Y.liv0, X.liv1, Y.liv1) },
  { id: 'bedroom', name: 'Спальня', poly: rect(X.bed0, Y.top, X.bed1, Y.bed1) },
  { id: 'kitchen', name: 'Кухня', poly: rect(X.kit0, Y.top, X.kit1, Y.kit1) },
  { id: 'hall', name: 'Прихожая', poly: [[X.bed0, Y.hall0], [X.kit0, Y.hall0], [X.kit0, Y.toi1], [X.hallR, Y.toi1], [X.hallR, Y.liv1], [X.bed0, Y.liv1]],
    label: [(X.bed0 + X.hallR) / 2, (Y.hall0 + Y.liv1) / 2 + 250], size: [M.hallW, M.hallD] },
  { id: 'corridor', name: 'Коридор', poly: rect(X.kit0, Y.kit1, X.bathOut, Y.toi1), small: true },
  { id: 'bath', name: 'Ванная', poly: [[X.bath0 + M.shaftW, Y.bath0], [X.bath1, Y.bath0], [X.bath1, Y.bath1], [X.bath0, Y.bath1], [X.bath0, Y.bath0 + M.shaftD], [X.bath0 + M.shaftW, Y.bath0 + M.shaftD]],
    label: [(X.bath0 + X.bath1) / 2, (Y.bath0 + Y.bath1) / 2 + 100], size: [M.bathW, M.bathD] },
  { id: 'toilet', name: 'Туалет', poly: rect(X.toi0, Y.toi0, X.kit1, Y.toi1), small: true },
  { id: 'balcony', name: 'Балкон', poly: rect(X.liv0, Y.top, X.liv1, Y.bal1), outdoor: true },
];

// ── Покрытия стен: из них выбирают в карточке стены (инструмент «Обои» — валик слева) ──
// kind: wallpaper — обои (pattern — рисунок, repeat — размер повтора, мм), brick — кирпичик, paint — покраска.
// color — оттенок (умножается на рисунок), в карточке его можно поменять. Обои Natural Forest — рулон 53 см, по фото.
export const COVERS = [
  { id: 'nf1009', name: 'NF1009', note: 'бежевый лён', kind: 'wallpaper', pattern: 'linen', color: '#ebe5d8', repeat: [530, 530] },
  { id: 'nf1007', name: 'NF1007', note: 'светлый лён', kind: 'wallpaper', pattern: 'linen', color: '#fffcf5', repeat: [530, 530] },
  { id: 'nf3207', name: 'NF3207', note: 'папоротники', kind: 'wallpaper', pattern: 'fern', color: '#fcf7ec', repeat: [530, 640] },
  { id: 'linen-white', name: 'Белый лён', note: 'как NF1007, только белые', kind: 'wallpaper', pattern: 'linen', color: '#fffffc', repeat: [530, 530] },
  { id: 'stripes', name: 'Полоска', note: 'полосы по 8,8 см', kind: 'wallpaper', pattern: 'stripes', color: '#efe9df', repeat: [530, 530] },
  { id: 'plaster', name: 'Под бетон', note: 'декоративная штукатурка', kind: 'wallpaper', pattern: 'plaster', color: '#e8e5e0', repeat: [1200, 1200] },
  { id: 'brick', name: 'Кирпичик', note: 'белый, как на кухне', kind: 'brick', color: '#ffffff', courses: 39, brick: 246 },
  { id: 'paint', name: 'Краска', note: 'без обоев', kind: 'paint' },
];
// где стены можно менять: в ванной и туалете плитка — её не трогаем
export const COVER_ROOMS = ['living', 'bedroom', 'kitchen', 'hall', 'corridor', 'balcony'];

// ── Отделка стен поверх покраски (как сделано сейчас; в варианте её можно поменять на любой стене) ──
// rooms — помещения; sides — какие стены: N — у окон, S — к входу, W — левая, E — правая (по плану).
// Без sides — все стены помещения, включая короба и ниши. cover — покрытие из COVERS.
// parts — вместо sides, если отделка занимает часть стены: { side, from, to, offset } (мм вдоль стены,
// offset — где начинается первая плитка); h — полоса по высоте [от, до]. Фартук кухни добавляется из kitchen.js.
export const FINISHES = [
  // кухня: стена напротив гарнитура (к спальне) в белом кирпичике, 39 рядов от пола до потолка,
  // кирпич ≈ 24,6 см по длине (по фото)
  { id: 'brick', cover: 'brick', rooms: ['kitchen'], sides: ['W'] },
  // ванная и туалет: плитка 60 × 30, шов в шов
  { id: 'tile', kind: 'tile', name: 'Плитка 60×30', rooms: ['bath', 'toilet'], tile: [600, 300] },
  // обои: прихожая и коридор — NF1009, спальня — NF1007, а стена напротив кровати целиком в папоротниках NF3207,
  // гостиная — как NF1007, только белые
  { id: 'wp-hall', cover: 'nf1009', rooms: ['hall', 'corridor'] },
  { id: 'wp-bed', cover: 'nf1007', rooms: ['bedroom'], sides: ['N', 'S', 'E'] },
  { id: 'wp-bed-accent', cover: 'nf3207', rooms: ['bedroom'], sides: ['W'] },
  { id: 'wp-living', cover: 'linen-white', rooms: ['living'] },
];

// ── Плинтус: белый, 10 см, во всех комнатах, кроме кухни, ванной и туалета (и балкона) ──
// t — толщина, мм; у дверей обрывается у наличников
export const BASEBOARD = { h: 100, t: 15, color: '#f7f7f5', rooms: ['living', 'bedroom', 'hall', 'corridor'] };

// ── Молдинги: вертикальные белые планки на стыках отделки ──
// x, y — точка стыка на стене (мм), alongX — стена идёт вдоль X, k — в какую сторону от стены комната,
// w — ширина планки, t — насколько выступает от стены
export const MOLDINGS = [
  // левая стена: кирпичик на кухне переходит в обои коридорчика — стык закрывает молдинг 5 см от пола до потолка
  { name: 'Молдинг 5 см', x: X.kit0, y: Y.kit1, alongX: false, k: 1, w: 50, t: 15, color: '#f7f7f5' },
];

// Внешний контур (по наружным граням стен) — по нему строятся пол и потолок
export const OUTLINE = [
  [X.out0, Y.out0], [X.out1, Y.out0], [X.out1, Y.stair1], [X.kit0, Y.stair1], [X.kit0, Y.out1], [X.out0, Y.out1],
];

// Откуда начинается прогулка: гостиная у двери в прихожую, лицом к балкону.
// yaw — поворот взгляда в радианах (0 — к окнам, плюс — вправо)
export const START = { x: X.liv1 - 700, y: Y.liv1 - 600, yaw: -0.2 };

export const PLAN = { M, T, H, WALLS, FIXTURES, ROOMS, FINISHES, COVERS, COVER_ROOMS, BASEBOARD, MOLDINGS, RAD, HEATING, OUTLINE, START, COORDS };
