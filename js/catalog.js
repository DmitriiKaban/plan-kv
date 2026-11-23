// Каталог мебели: размеры по умолчанию (мм), простые 3D-модели и значки «как на плане».
import * as THREE from 'three';

const MM = 0.001;

// ── пресеты ── w — ширина, d — глубина, h — высота, z — высота от пола (мм)
export const CATALOG = [
  { group: 'Гостиная', items: [
    { type: 'sofaSlim', name: 'Диван 215 с подушками', w: 2150, d: 950, h: 880, color: '#8c8b6a' },
    { type: 'sofa', name: 'Диван', w: 2200, d: 950, h: 850, color: '#8b9098' },
    { type: 'cornerSofa', name: 'Угловой диван', w: 2600, d: 1600, h: 850, color: '#7f8894' },
    { type: 'armchair', name: 'Кресло', w: 850, d: 850, h: 850, color: '#b3a08b' },
    { type: 'coffeeTable', name: 'Журнальный столик', w: 1000, d: 600, h: 450, color: '#a27b56' },
    { type: 'tvStand', name: 'ТВ-тумба', w: 1800, d: 400, h: 500, color: '#e8e4dd' },
    { type: 'tvUnit', name: 'ТВ-тумба с нишей', w: 2682, d: 450, h: 500, color: '#e7e0d6', color2: '#6f4d36' },
    { type: 'shelfOpen', name: 'Открытые полки, внутри 45', w: 486, d: 450, h: 1900, z: 500, color: '#6f4d36' },
    { type: 'cabinetTall', name: 'Шкаф распашной 90', w: 918, d: 450, h: 2400, color: '#e7e0d6' },
    { type: 'shelfDivider', name: 'Стеллаж-перегородка', w: 300, d: 850, h: 2400, color: '#6f4d36' },
    { type: 'slatPanel', name: 'Реечная панель', w: 700, d: 22, h: 2000, z: 500, color: '#6f4d36' },
    { type: 'soundbar', name: 'Саундбар', w: 880, d: 100, h: 65, z: 500, color: '#1f2022' },
    { type: 'turntable', name: 'Проигрыватель Sony PS-LX310BT', w: 430, d: 367, h: 108, z: 500, color: '#1b1c1e' },
    { type: 'tv', name: 'Телевизор 55″', w: 1230, d: 60, h: 710, z: 800, color: '#1c1d1f' },
    { type: 'shelf', name: 'Стеллаж', w: 800, d: 350, h: 1800, color: '#e6e1d8' },
    { type: 'rug', name: 'Ковёр', w: 2000, d: 1400, h: 10, color: '#c7bcad' },
    { type: 'lamp', name: 'Торшер', w: 400, d: 400, h: 1600, color: '#2d2e30' },
    { type: 'plant', name: 'Растение', w: 450, d: 450, h: 1200, color: '#e7e4dd' },
  ] },
  { group: 'Спальня', items: [
    { type: 'bedSoft', name: 'Кровать 170×214, мягкое изголовье', w: 1700, d: 2140, h: 1050, color: '#d3ccc2' },
    { type: 'bed', name: 'Кровать 160×200', w: 1700, d: 2150, h: 1000, color: '#c9bba8' },
    { type: 'bed', name: 'Кровать 140×200', w: 1500, d: 2150, h: 1000, color: '#c9bba8' },
    { type: 'bed', name: 'Кровать 90×200', w: 1000, d: 2100, h: 900, color: '#c9bba8' },
    { type: 'nightstand', name: 'Тумбочка', w: 450, d: 400, h: 520, color: '#e9e4db' },
    { type: 'sconceDrum', name: 'Бра с абажуром', w: 200, d: 300, h: 320, z: 1050, color: '#ece5d7' },
    { type: 'wardrobeSlide', name: 'Шкаф-купе 140', w: 1400, d: 600, h: 2400, color: '#ebe7e0' },
    { type: 'wardrobeSlide', name: 'Шкаф-купе 180', w: 1800, d: 600, h: 2400, color: '#ebe7e0' },
    { type: 'wardrobe', name: 'Шкаф распашной', w: 1000, d: 580, h: 2200, color: '#ebe7e0' },
    { type: 'dresser', name: 'Комод', w: 1200, d: 450, h: 850, color: '#e8e4dd' },
    { type: 'desk', name: 'Письменный стол', w: 1200, d: 600, h: 750, color: '#b08d68' },
    { type: 'deskLift', name: 'Стол с электроподъёмом 140', w: 1400, d: 700, h: 750, color: '#b5814f' },
    { type: 'monitorCurved', name: 'Монитор AOC 34″ изогнутый', w: 808, d: 250, h: 480, z: 750, color: '#1b1c1e' },
    { type: 'chair', name: 'Стул', w: 450, d: 520, h: 900, color: '#55585c' },
    { type: 'drawerUnit', name: 'Тумба с 3 ящиками', w: 500, d: 600, h: 820, color: '#f1f1ee' },
    { type: 'windowTop', name: 'Столешница с решёткой над батареей', w: 2400, d: 600, h: 30, z: 820, color: '#cfb38e' },
    { type: 'drawerApron', name: 'Ящики под столешницу', w: 1400, d: 450, h: 120, z: 700, color: '#f1f1ee' },
    { type: 'cabinetDoor', name: 'Шкаф с дверцей 30', w: 300, d: 350, h: 1550, z: 850, color: '#f1f1ee' },
    { type: 'shelfOpenR', name: 'Полки для цветов, открыты справа', w: 170, d: 350, h: 1550, z: 850, color: '#cfb38e' },
    { type: 'shelfOpenL', name: 'Полки для цветов, открыты слева', w: 170, d: 350, h: 1550, z: 850, color: '#cfb38e' },
    { type: 'shelfFramed', name: 'Полки в белой раме', w: 500, d: 350, h: 1650, z: 750, color: '#cfb38e' },
  ] },
  { group: 'Кухня', items: [
    { type: 'kitchenBase', name: 'Нижний модуль 60', w: 600, d: 600, h: 870, color: '#efede8' },
    { type: 'kitchenBase', name: 'Нижний модуль 40', w: 400, d: 600, h: 870, color: '#efede8' },
    { type: 'kitchenDrawers', name: 'Модуль с ящиками 60', w: 600, d: 600, h: 870, color: '#efede8' },
    { type: 'kitchenOven', name: 'Духовка и варочная 60', w: 600, d: 600, h: 870, color: '#efede8' },
    { type: 'kitchenWall', name: 'Верхний модуль 60', w: 600, d: 320, h: 720, z: 1450, color: '#efede8' },
    { type: 'kitchenTall', name: 'Пенал 60', w: 600, d: 600, h: 2100, color: '#efede8' },
    { type: 'kitchenCorner', name: 'Угловой модуль 100', w: 1000, d: 600, h: 870, color: '#efede8' },
    { type: 'kitchenWallCorner', name: 'Верхний угловой 100', w: 1000, d: 320, h: 720, z: 1450, color: '#efede8' },
    { type: 'fridgeTall', name: 'Холодильник в пенале', w: 665, d: 600, h: 2200, color: '#efede8' },
    { type: 'sink', name: 'Мойка с тумбой', w: 600, d: 600, h: 870, color: '#efede8' },
    { type: 'stove', name: 'Плита', w: 600, d: 600, h: 870, color: '#e9eaeb' },
    { type: 'fridge', name: 'Холодильник', w: 600, d: 650, h: 1850, color: '#e8eaec' },
    { type: 'diningTable', name: 'Обеденный стол', w: 1100, d: 700, h: 750, color: '#b08d68' },
    { type: 'roundTable', name: 'Круглый стол', w: 900, d: 900, h: 750, color: '#b08d68' },
    { type: 'tableSquare', name: 'Стол 80×80', w: 800, d: 800, h: 750, color: '#a27c58' },
    { type: 'sconceBalls', name: 'Бра с шариками', w: 130, d: 200, h: 800, z: 1000, color: '#b8955a' },
    { type: 'chair', name: 'Стул', w: 450, d: 520, h: 900, color: '#55585c' },
  ] },
  { group: 'Ванная и туалет', items: [
    { type: 'bathtub', name: 'Ванна 140×70', w: 1400, d: 700, h: 560, color: '#f6f6f4' },
    { type: 'shower', name: 'Душевой поддон 80×80', w: 800, d: 800, h: 2000, color: '#f3f3f1' },
    { type: 'showerPent', name: 'Душ 90×90 с обрезанным углом', w: 890, d: 890, h: 2150, color: '#f6f6f4' },
    { type: 'washbasin', name: 'Раковина с тумбой', w: 600, d: 460, h: 850, color: '#efede8' },
    { type: 'dryer', name: 'Электросушка', w: 560, d: 110, h: 520, z: 1620, color: '#cfd2d5' },
    { type: 'washer', name: 'Стиральная машина', w: 600, d: 450, h: 850, color: '#f1f2f3' },
    { type: 'toilet', name: 'Унитаз', w: 380, d: 650, h: 780, color: '#f6f6f4' },
    { type: 'boiler', name: 'Бойлер 80 л', w: 450, d: 450, h: 800, z: 1300, color: '#f2f2f0' },
  ] },
  { group: 'Прихожая и прочее', items: [
    { type: 'wardrobe', name: 'Шкаф в прихожую', w: 1000, d: 400, h: 2200, color: '#ebe7e0' },
    { type: 'dresser', name: 'Обувница', w: 800, d: 300, h: 1000, color: '#e8e4dd' },
    { type: 'radiator', name: 'Радиатор', w: 800, d: 100, h: 600, z: 120, color: '#f4f4f2' },
    { type: 'aircon', name: 'Кондиционер', w: 800, d: 200, h: 280, z: 2140, color: '#f7f7f5' },
    { type: 'box', name: 'Коробка', w: 1000, d: 500, h: 700, color: '#9db2c6' },
  ] },
];

export const SHAPES = [
  ['box', 'Коробка'], ['sofa', 'Диван'], ['sofaSlim', 'Диван с подушками'], ['cornerSofa', 'Угловой диван'], ['armchair', 'Кресло'],
  ['bed', 'Кровать'], ['bedSoft', 'Кровать с мягким изголовьем'], ['wardrobe', 'Шкаф'], ['wardrobeSlide', 'Шкаф-купе'], ['dresser', 'Комод / тумба'], ['nightstand', 'Тумбочка'],
  ['desk', 'Стол'], ['deskLift', 'Стол с электроподъёмом'], ['diningTable', 'Обеденный стол'], ['roundTable', 'Круглый стол'], ['coffeeTable', 'Журнальный столик'],
  ['chair', 'Стул'], ['shelf', 'Стеллаж'], ['tvStand', 'ТВ-тумба'], ['tv', 'Телевизор'],
  ['kitchenBase', 'Кухонный модуль'], ['kitchenDrawers', 'Кухня: ящики'], ['kitchenOven', 'Кухня: духовка и варочная'], ['kitchenWall', 'Верхний модуль'], ['kitchenTall', 'Кухня: пенал'], ['kitchenCorner', 'Кухня: угловой модуль'], ['kitchenWallCorner', 'Кухня: верхний угловой'], ['fridgeTall', 'Холодильник в пенале'], ['sink', 'Мойка'], ['stove', 'Плита'],
  ['fridge', 'Холодильник'], ['bathtub', 'Ванна'], ['shower', 'Душ'], ['washbasin', 'Раковина'],
  ['showerPent', 'Душ с обрезанным углом'], ['washer', 'Стиральная машина'], ['toilet', 'Унитаз'], ['boiler', 'Бойлер'], ['dryer', 'Электросушка'], ['radiator', 'Радиатор'],
  ['rug', 'Ковёр'], ['lamp', 'Торшер'], ['plant', 'Растение'],
  ['tableSquare', 'Стол квадратный'], ['sconceBalls', 'Бра с шариками'], ['sconceDrum', 'Бра с абажуром'], ['aircon', 'Кондиционер'],
  ['tvUnit', 'ТВ-тумба с нишей'], ['shelfOpen', 'Открытые полки'], ['cabinetTall', 'Шкаф с ручками-кнопками'],
  ['drawerUnit', 'Тумба с ящиками'], ['shelfOpenR', 'Полки, открытые справа'], ['shelfOpenL', 'Полки, открытые слева'], ['windowTop', 'Столешница у окна'], ['drawerApron', 'Ящики под столешницу'], ['shelfFramed', 'Полки в раме'], ['cabinetDoor', 'Шкаф с дверцей'],
  ['shelfDivider', 'Стеллаж-перегородка'], ['slatPanel', 'Реечная панель'], ['soundbar', 'Саундбар'], ['turntable', 'Проигрыватель винила'], ['monitorCurved', 'Монитор изогнутый'],
];

export const SWATCHES = ['#ebe7e0', '#f4ede3', '#a6c6b9', '#d9cfc2', '#b08d68', '#7a5a3f', '#8b9098', '#4f5560', '#2d2e30', '#9db2c6', '#5f7a8c', '#a3ae97', '#c98f7a', '#e2c36f'];

// ── значки: вид сверху, как условные обозначения на плане ──
const ICON = {
  sofa: '<rect x="4" y="12" width="36" height="22" rx="2"/><path d="M9 12v22M35 12v22M9 18h26M22 18v16"/>',
  sofaSlim: '<rect x="5" y="12" width="34" height="22" rx="3"/><path d="M8 12v22M36 12v22"/><rect x="9" y="14" width="8" height="5" rx="2"/><rect x="18" y="14" width="8" height="5" rx="2"/><rect x="27" y="14" width="8" height="5" rx="2"/>',
  cornerSofa: '<path d="M4 8h36v30H26V20H4z"/><path d="M4 14h30M34 14v24M15 14v6"/>',
  armchair: '<rect x="9" y="9" width="26" height="26" rx="3"/><path d="M14 9v26M30 9v26M14 15h16"/>',
  coffeeTable: '<rect x="6" y="13" width="32" height="18" rx="2"/>',
  tvStand: '<rect x="4" y="16" width="36" height="12"/><path d="M16 16v12M28 16v12"/>',
  tv: '<path d="M6 20h32v4H6z"/><path d="M14 28h16"/>',
  shelf: '<rect x="8" y="14" width="28" height="16"/><path d="M8 22h28"/>',
  rug: '<rect x="5" y="9" width="34" height="26" rx="1" stroke-dasharray="3 2"/><rect x="10" y="14" width="24" height="16"/>',
  lamp: '<circle cx="22" cy="22" r="12"/><circle cx="22" cy="22" r="3"/>',
  plant: '<circle cx="22" cy="22" r="13"/><path d="M22 9v26M9 22h26M13 13l18 18M31 13 13 31"/>',
  bed: '<rect x="8" y="4" width="28" height="36" rx="1"/><rect x="11" y="7" width="9" height="6" rx="2"/><rect x="24" y="7" width="9" height="6" rx="2"/><path d="M8 18h28"/>',
  bedSoft: '<path d="M8 40V11q0-7 7-7h14q7 0 7 7v29z"/><rect x="11" y="9" width="9" height="6" rx="3"/><rect x="24" y="9" width="9" height="6" rx="3"/><path d="M8 20h28"/>',
  nightstand: '<rect x="11" y="11" width="22" height="22"/><path d="M11 29h22"/>',
  wardrobe: '<rect x="4" y="14" width="36" height="16"/><path d="M4 14l36 16M22 14v16"/>',
  wardrobeSlide: '<rect x="4" y="14" width="36" height="16"/><path d="M4 26h20M20 23h20M14 18l-4 2 4 2M30 18l4 2-4 2"/>',
  dresser: '<rect x="6" y="14" width="32" height="16"/><path d="M6 26h32"/>',
  desk: '<rect x="5" y="12" width="34" height="20"/><path d="M26 12v20"/>',
  deskLift: '<rect x="5" y="12" width="34" height="20"/><path d="M11 13v18M33 13v18"/><rect x="9.5" y="20" width="3" height="4"/><rect x="31.5" y="20" width="3" height="4"/>',
  chair: '<rect x="13" y="13" width="18" height="18" rx="2"/><path d="M13 17h18"/>',
  kitchenBase: '<rect x="9" y="9" width="26" height="26"/><path d="M9 31h26"/>',
  kitchenWall: '<rect x="9" y="15" width="26" height="14" stroke-dasharray="3 2"/>',
  kitchenWallCorner: '<rect x="9" y="15" width="26" height="14" stroke-dasharray="3 2"/><path d="M18 15v14"/>',
  kitchenDrawers: '<rect x="9" y="9" width="26" height="26"/><path d="M9 31h26M15 27h14"/>',
  kitchenOven: '<rect x="9" y="9" width="26" height="26"/><circle cx="16" cy="16" r="3.5"/><circle cx="28" cy="16" r="3.5"/><circle cx="16" cy="27" r="3.5"/><circle cx="28" cy="27" r="3.5"/>',
  kitchenTall: '<rect x="9" y="8" width="26" height="28"/><path d="M9 8l26 28"/>',
  kitchenCorner: '<path d="M6 8h32v28H22V20H6z"/><path d="M22 20h16"/>',
  fridgeTall: '<rect x="8" y="8" width="28" height="28"/><rect x="11" y="11" width="22" height="22"/><path d="M11 25h22"/>',
  showerPent: '<path d="M8 8h28v14L22 36H8z"/><circle cx="14" cy="14" r="2"/>',
  dryer: '<rect x="8" y="18" width="28" height="8" rx="1"/><path d="M8 22h28M14 18v8M30 18v8"/>',
  sink: '<rect x="9" y="9" width="26" height="26"/><rect x="14" y="16" width="16" height="13" rx="3"/><circle cx="22" cy="12.5" r="1.5"/>',
  stove: '<rect x="9" y="9" width="26" height="26"/><circle cx="16" cy="16" r="4"/><circle cx="28" cy="16" r="4"/><circle cx="16" cy="28" r="4"/><circle cx="28" cy="28" r="4"/>',
  fridge: '<rect x="9" y="8" width="26" height="28"/><path d="M9 31h26M13 31v5"/>',
  diningTable: '<rect x="9" y="13" width="26" height="18"/><path d="M13 9h6M25 9h6M13 35h6M25 35h6"/>',
  roundTable: '<circle cx="22" cy="22" r="13"/>',
  bathtub: '<rect x="4" y="11" width="36" height="22" rx="3"/><rect x="8" y="15" width="28" height="14" rx="6"/><circle cx="12" cy="22" r="1.5"/>',
  shower: '<rect x="8" y="8" width="28" height="28"/><path d="M8 8l28 28M36 8 8 36"/><circle cx="22" cy="22" r="2"/>',
  washbasin: '<rect x="8" y="12" width="28" height="20"/><ellipse cx="22" cy="23" rx="9" ry="6"/>',
  washer: '<rect x="9" y="11" width="26" height="22"/><circle cx="22" cy="22" r="7"/>',
  toilet: '<rect x="14" y="5" width="16" height="9" rx="1"/><ellipse cx="22" cy="26" rx="7" ry="11"/>',
  boiler: '<circle cx="22" cy="22" r="12"/><path d="M22 14v16"/>',
  radiator: '<rect x="6" y="18" width="32" height="8"/><path d="M11 18v8M16 18v8M21 18v8M26 18v8M31 18v8"/>',
  box: '<rect x="8" y="10" width="28" height="24"/><path d="M8 10l28 24M36 10 8 34"/>',
  tableSquare: '<rect x="9" y="9" width="26" height="26" rx="1"/><path d="M12 12h3v3h-3zM29 12h3v3h-3zM12 29h3v3h-3zM29 29h3v3h-3z"/>',
  sconceBalls: '<path d="M13 9h18M22 9v7"/><circle cx="22" cy="24" r="8"/><circle cx="22" cy="24" r="2.5"/>',
  sconceDrum: '<path d="M13 8h18M22 8v6"/><circle cx="22" cy="26" r="11"/><circle cx="22" cy="26" r="7"/>',
  aircon: '<rect x="5" y="15" width="34" height="14" rx="4"/><path d="M9 24h26M9 20.5h26"/>',
  tvUnit: '<rect x="3" y="16" width="38" height="12"/><path d="M16 16v12M28 16v12M16 21h12"/>',
  shelfOpen: '<rect x="10" y="14" width="24" height="16"/><path d="M13 14v13h18V14"/>',
  cabinetTall: '<rect x="6" y="14" width="32" height="16"/><path d="M6 27h32M22 27v3"/><circle cx="19" cy="24" r="1.2"/><circle cx="25" cy="24" r="1.2"/>',
  shelfDivider: '<rect x="16" y="4" width="12" height="36"/><path d="M16 22h12"/>',
  drawerUnit: '<rect x="10" y="8" width="24" height="28"/><path d="M10 31h24M14 33h16"/>',
  windowTop: '<rect x="3" y="12" width="38" height="20"/><path d="M15 15h14M15 17h14"/>',
  drawerApron: '<rect x="5" y="14" width="34" height="16" stroke-dasharray="3 2"/><path d="M22 14v16M7 27h13M24 27h13"/>',
  shelfFramed: '<rect x="10" y="14" width="24" height="14"/><path d="M13 14v11h18V14"/>',
  shelfOpenR: '<path d="M34 14H14v14h20"/><path d="M14 24h20" stroke-dasharray="2 2"/>',
  shelfOpenL: '<path d="M10 14h20v14H10"/><path d="M10 24h20" stroke-dasharray="2 2"/>',
  cabinetDoor: '<rect x="10" y="14" width="24" height="14"/><path d="M10 25h24M13 25v3"/>',
  slatPanel: '<rect x="5" y="18" width="34" height="6"/><path d="M9 18v6M13 18v6M17 18v6M21 18v6M25 18v6M29 18v6M33 18v6"/>',
  soundbar: '<rect x="6" y="19" width="32" height="7" rx="3.5"/><path d="M10 22.5h24" stroke-dasharray="1 2"/>',
  turntable: '<rect x="7" y="9" width="30" height="26" rx="2"/><circle cx="19" cy="22" r="9"/><circle cx="19" cy="22" r="1"/><path d="M33 12l-5 14"/>',
  monitorCurved: '<path d="M5 15q17 8 34 0M5 19q17 8 34 0"/><path d="M22 23v7M16 31h12"/>',
};
export function iconSvg(type) {
  return `<svg viewBox="0 0 44 44" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${ICON[type] || ICON.box}</svg>`;
}

// ── материалы ──
const matCache = new Map();
function mat(color, rough = 0.8, metal = 0, extra = {}) {
  const key = `${color}|${rough}|${metal}|${JSON.stringify(extra)}`;
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }));
  return matCache.get(key);
}
const DARK = '#2b2c2e', WHITE = '#f4f3ef', STEEL = '#b9bdc1', LINE = '#3a3b3e';

// дерево для столешниц: светлая текстура с волокнами вдоль длины, оттенок задаёт цвет предмета
let woodTex = null;
function woodTexture() {
  if (woodTex) return woodTex;
  const W = 1024, H = 256, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  let seed = 20251123;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  ctx.fillStyle = '#f4f4f4'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 16; i++) {                                    // широкие тональные полосы
    const y = r() * H, h = 8 + r() * 34;
    ctx.fillStyle = `rgba(${r() < 0.6 ? '110,110,110' : '255,255,255'},${0.05 + r() * 0.08})`;
    ctx.fillRect(0, y - h / 2, W, h);
  }
  for (let k = 0; k < 3; k++) {                                     // «соборный» рисунок
    const cx = r() * W, cy = H * (0.25 + r() * 0.5), n = 6 + Math.floor(r() * 5);
    for (let i = 0; i < n; i++) {
      const rx = 40 + i * (22 + r() * 10), ry = 3 + i * 3.2;
      ctx.beginPath();
      for (let t = -1; t <= 1.0001; t += 0.04) { const x = cx + t * rx * 2.2, y = cy - (1 - t * t) * ry + ry * 0.5; t === -1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.strokeStyle = `rgba(80,80,80,${0.08 + r() * 0.1})`; ctx.lineWidth = 0.8 + r() * 1.2; ctx.stroke();
    }
  }
  for (let i = 0; i < 110; i++) {                                   // волокна
    const y0 = r() * H, amp = 0.4 + r() * 2.4, fr = 0.002 + r() * 0.007, ph = r() * 6.28;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 16) {
      const y = y0 + Math.sin(x * fr + ph) * amp + Math.sin(x * fr * 3.3 + ph * 1.7) * amp * 0.35;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = r() < 0.75 ? `rgba(70,70,70,${0.06 + r() * 0.14})` : `rgba(255,255,255,${0.1 + r() * 0.12})`;
    ctx.lineWidth = 0.5 + r() * 1.4; ctx.stroke();
  }
  for (let i = 0; i < 260; i++) {                                   // поры
    ctx.fillStyle = `rgba(60,60,60,${0.08 + r() * 0.12})`;
    ctx.fillRect(r() * W, r() * H, 3 + r() * 12, 0.8);
  }
  woodTex = new THREE.CanvasTexture(cv);
  woodTex.colorSpace = THREE.SRGBColorSpace;
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
  woodTex.anisotropy = 4;
  return woodTex;
}
// UV по размеру: рисунок повторяется каждые 1 м вдоль волокон и 25 см поперёк — у длинных и коротких
// деталей одинаковая плотность, а у деталей одного предмета волокна продолжаются (o — сдвиг детали в предмете)
export function woodUV(geo, ox = 0, oy = 0, oz = 0) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + ox, y = p.getY(i) + oy, z = p.getZ(i) + oz;
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
    const [a, b] = ny > 0.5 ? [x, z] : nx > 0.5 ? [z, y] : [x, y];
    uv.setXY(i, a / 1.0, b / 0.25);
  }
  uv.needsUpdate = true;
  return geo;
}
// похож ли цвет на дерево (коричневато-оранжевый); белые, серые и чёрные — камень
function isWood(hex) {
  const v = parseInt((hex || '#000000').slice(1), 16), r = (v >> 16) / 255, g = ((v >> 8) & 255) / 255, b = (v & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  if (d < 0.06) return false;
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = (mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
  if (h < 0) h += 360;
  return h >= 15 && h <= 50 && s > 0.15;
}
const woodCache = new Map();
export function woodMat(color) {
  if (!woodCache.has(color)) woodCache.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0, map: woodTexture() }));
  return woodCache.get(color);
}
// металл смесителей: светлый — хром, тёмный — матовый чёрный
function fixtureMetal(hex, def) {
  const c = new THREE.Color(hex || def);
  return c.r * 0.3 + c.g * 0.59 + c.b * 0.11 < 0.15 ? mat(hex || def, 0.5, 0.25) : mat(hex || def, 0.2, 0.9);
}

function lighten(hex, k) {
  const c = new THREE.Color(hex);
  const hsl = {}; c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.min(1, hsl.l + k));
  return '#' + c.getHexString();
}

// построители: размеры в метрах, центр основания в (0,0,0), фасад смотрит в +Z
function B(g, w, h, d, x, y, z, m, shadow = true) {
  if (w <= 0.0005 || h <= 0.0005 || d <= 0.0005) return null;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow; mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}
function WB(g, w, h, d, x, y, z, color, shadow = true) {
  if (w <= 0.0005 || h <= 0.0005 || d <= 0.0005) return null;
  const mesh = new THREE.Mesh(woodUV(new THREE.BoxGeometry(w, h, d), x, y, z), woodMat(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow; mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}
function C(g, rt, rb, h, x, y, z, m, seg = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}
const legs = (g, W, D, H, t, inset, m) => {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(g, t, H, t, sx * (W / 2 - inset - t / 2), H / 2, sz * (D / 2 - inset - t / 2), m);
};
// тонкие линии-швы на фасаде (дверцы, ящики)
const seamV = (g, x, y0, y1, zf, m) => B(g, 0.004, y1 - y0, 0.003, x, (y0 + y1) / 2, zf + 0.0015, m, false);
const seamH = (g, x0, x1, y, zf, m) => B(g, x1 - x0, 0.004, 0.003, (x0 + x1) / 2, y, zf + 0.0015, m, false);
const handle = (g, x, y, zf, vert, len = 0.12) => B(g, vert ? 0.012 : len, vert ? len : 0.012, 0.02, x, y, zf + 0.01, mat(STEEL, 0.3, 0.8), false);

// узкие открытые полки у окна: задняя стенка, верх и полки из дуба примерно через 38 см; со стороны шкафа —
// тонкая дубовая облицовка, со стороны окна стенки нет, чтобы сбоку ставить цветы (open: +1 — открыты справа)
function flowerShelves(g, W, D, H, c, open) {
  const t = 0.018, lin = 0.008, cx = (open * lin) / 2, iw = W - lin;
  WB(g, lin, H, D, -open * (W / 2 - lin / 2), H / 2, 0, c);
  WB(g, iw, t, D, cx, H - t / 2, 0, c);
  WB(g, iw, H - t, 0.01, cx, (H - t) / 2, -D / 2 + 0.005, c);
  const n = Math.max(2, Math.round(H / 0.38)), step = (H - t) / n;
  for (let i = 0; i < n; i++) WB(g, iw, t, D - 0.01, cx, i * step + t / 2, 0.005, c);
}

// круглая ручка-кнопка (как на чертеже шкафа с тумбой), орех
function knob(g, x, y, zf) {
  const k = C(g, 0.013, 0.011, 0.022, x, y, zf + 0.011, mat('#6f4d36', 0.5), 16);
  k.rotation.x = Math.PI / 2; k.castShadow = false;
}

// розетки в одной рамке: x — центр блока, рамки по 71 мм; 'socket' — розетка, 'blank' — выключатель/заглушка
function sockets(g, x, y, z, kinds) {
  const step = 0.071, x0 = x - (step * (kinds.length - 1)) / 2;
  const white = mat('#f6f6f4', 0.4), dark = mat('#2a2b2d', 0.6), face = mat('#ececea', 0.5);
  B(g, step * kinds.length + 0.006, 0.077, 0.008, x, y, z + 0.004, white, false);
  kinds.forEach((kind, i) => {
    const cx = x0 + i * step;
    if (kind === 'socket') {
      const c = C(g, 0.021, 0.021, 0.004, cx, y, z + 0.009, face, 20); c.rotation.x = Math.PI / 2;
      for (const dx of [-0.0095, 0.0095]) { const h = C(g, 0.0022, 0.0022, 0.002, cx + dx, y, z + 0.0112, dark, 8); h.rotation.x = Math.PI / 2; }
    } else B(g, 0.05, 0.05, 0.004, cx, y, z + 0.009, face, false);
    if (i) B(g, 0.0015, 0.065, 0.002, cx - step / 2, y, z + 0.0085, mat('#d6d6d3', 0.5), false);
  });
}

// мягкий короб (обивка, матрас, подушка): скруглённые углы в плане и фаска сверху и снизу
function softSlab(g, w, d, h, x, y0, z, r, b, m) {
  const W2 = w / 2 - b, D2 = d / 2 - b, rr = Math.max(0.002, Math.min(r, W2 * 0.9, D2 * 0.9));
  const s = new THREE.Shape();
  s.moveTo(-W2 + rr, -D2); s.lineTo(W2 - rr, -D2); s.quadraticCurveTo(W2, -D2, W2, -D2 + rr);
  s.lineTo(W2, D2 - rr); s.quadraticCurveTo(W2, D2, W2 - rr, D2); s.lineTo(-W2 + rr, D2);
  s.quadraticCurveTo(-W2, D2, -W2, D2 - rr); s.lineTo(-W2, -D2 + rr); s.quadraticCurveTo(-W2, -D2, -W2 + rr, -D2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.002, h - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 6 });
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(x, y0 + b, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}

// коробка по границам (x0..x1, y0..y1, z0..z1)
const BX = (g, x0, x1, y0, y1, z0, z1, m) => B(g, x1 - x0, y1 - y0, z1 - z0, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, m);

// корпус нижнего кухонного модуля: цоколь + корпус с фасадом; cut — место под чашу мойки
function kitBody(g, W, D, H, c, it, cut) {
  const modern = it.handles === false, top = 0.038, plinth = 0.1, m = mat(c, 0.6);
  B(g, W - 0.004, plinth, D - 0.08, 0, plinth / 2, -0.04, mat(modern ? '#e9e8e4' : '#3a3b3d', 0.8));
  const cx = (W - 0.004) / 2, z0 = -D / 2, z1 = D / 2 - 0.04, yTop = H - top;
  if (!cut) { BX(g, -cx, cx, plinth, yTop, z0, z1, m); }
  else {
    BX(g, -cx, cx, plinth, cut.y, z0, z1, m);
    BX(g, -cx, cx, cut.y, yTop, cut.z1, z1, m);
    BX(g, -cx, cx, cut.y, yTop, z0, cut.z0, m);
    BX(g, -cx, cut.x0, cut.y, yTop, cut.z0, cut.z1, m);
    BX(g, cut.x1, cx, cut.y, yTop, cut.z0, cut.z1, m);
  }
  // швы по краям фасада — чтобы соседние модули читались
  if (modern) for (const sx of [-1, 1]) seamV(g, sx * (cx - 0.001), plinth + 0.004, yTop - 0.004, z1, mat(LINE, 0.8));
}
// столешница (её цвет — второй цвет предмета); hole — вырез под мойку
function kitTop(g, W, D, H, it, hole) {
  // столешница: деревянная — с текстурой дерева (волокна вдоль гарнитура), камень — однотонная
  const top = 0.038, color = it.color2 || '#cfc6b8', y = H - top / 2, m = mat(color, 0.5);
  const P = (w, d, x, z) => (isWood(color) ? WB(g, w, top, d, x, y, z, color) : B(g, w, top, d, x, y, z, m));
  if (!hole) { P(W, D, 0, 0); return; }
  const { x0, x1, z0, z1 } = hole;
  P(W, z0 + D / 2, 0, (-D / 2 + z0) / 2);
  P(W, D / 2 - z1, 0, (z1 + D / 2) / 2);
  P(x0 + W / 2, z1 - z0, (-W / 2 + x0) / 2, (z0 + z1) / 2);
  P(W / 2 - x1, z1 - z0, (x1 + W / 2) / 2, (z0 + z1) / 2);
}

const BUILD = {
  box(g, W, D, H, c) { B(g, W, H, D, 0, H / 2, 0, mat(c, 0.85)); },

  sofa(g, W, D, H, c) {
    const m = mat(c, 0.95), mc = mat(lighten(c, 0.05), 0.95), lg = mat(DARK, 0.6);
    const legH = 0.06, seatH = Math.min(0.45, H * 0.55), backD = Math.min(0.24, D * 0.28), armW = Math.min(0.2, W * 0.12);
    const armH = Math.min(H * 0.78, seatH + 0.2);
    legs(g, W, D, legH, 0.04, 0.04, lg);
    B(g, W, seatH - legH - 0.1, D, 0, legH + (seatH - legH - 0.1) / 2, 0, m);
    B(g, W, H - legH, backD, 0, legH + (H - legH) / 2, -D / 2 + backD / 2, m);
    for (const s of [-1, 1]) B(g, armW, armH - legH, D, s * (W / 2 - armW / 2), legH + (armH - legH) / 2, 0, m);
    const inner = W - 2 * armW, n = inner > 1.7 ? 3 : inner > 0.9 ? 2 : 1, gap = 0.012;
    const cw = (inner - gap * (n - 1)) / n, cd = D - backD - 0.02;
    for (let i = 0; i < n; i++) B(g, cw, 0.1, cd, -inner / 2 + cw / 2 + i * (cw + gap), seatH - 0.05, -D / 2 + backD + cd / 2, mc);
    const bw = (inner - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) B(g, bw, Math.max(0.05, H - seatH - 0.06), 0.14, -inner / 2 + bw / 2 + i * (bw + gap), seatH + (H - seatH - 0.06) / 2, -D / 2 + backD + 0.07, mc);
  },

  cornerSofa(g, W, D, H, c) {
    const m = mat(c, 0.95), mc = mat(lighten(c, 0.05), 0.95), lg = mat(DARK, 0.6);
    const legH = 0.06, seatH = Math.min(0.45, H * 0.55), backD = Math.min(0.24, D * 0.2), armW = 0.18;
    const sd = Math.min(0.95, D);           // глубина основной части
    const cw = Math.min(0.95, W / 2);       // ширина оттоманки (справа)
    legs(g, W, sd, legH, 0.04, 0.04, lg);
    // основная часть
    B(g, W, seatH - legH - 0.1, sd, 0, legH + (seatH - legH - 0.1) / 2, -D / 2 + sd / 2, m);
    B(g, W, H - legH, backD, 0, legH + (H - legH) / 2, -D / 2 + backD / 2, m);
    B(g, armW, Math.min(H * 0.78, seatH + 0.2) - legH, sd, -W / 2 + armW / 2, legH + (Math.min(H * 0.78, seatH + 0.2) - legH) / 2, -D / 2 + sd / 2, m);
    // оттоманка
    const ld = D - sd;
    if (ld > 0.05) {
      B(g, cw, seatH - legH - 0.1, ld, W / 2 - cw / 2, legH + (seatH - legH - 0.1) / 2, D / 2 - ld / 2, m);
      B(g, cw, 0.1, ld - 0.02, W / 2 - cw / 2, seatH - 0.05, D / 2 - ld / 2 - 0.01, mc);
    }
    B(g, backD, H - legH, D, W / 2 - backD / 2, legH + (H - legH) / 2, 0, m);
    B(g, W - armW - backD - 0.02, 0.1, sd - backD - 0.02, (-W / 2 + armW + W / 2 - backD) / 2, seatH - 0.05, -D / 2 + backD + (sd - backD) / 2, mc);
  },

  armchair(g, W, D, H, c) { BUILD.sofa(g, W, D, H, c); },

  bed(g, W, D, H, c) {
    const m = mat(c, 0.95), lg = mat(DARK, 0.6);
    const frameH = 0.32, headT = 0.08;
    legs(g, W, D, 0.06, 0.05, 0.03, lg);
    B(g, W, frameH - 0.06, D - headT, 0, 0.06 + (frameH - 0.06) / 2, headT / 2, m);
    B(g, W, H, headT, 0, H / 2, -D / 2 + headT / 2, m);
    const mw = W - 0.06, md = D - headT - 0.06;
    B(g, mw, 0.22, md, 0, frameH + 0.11, -D / 2 + headT + 0.01 + md / 2, mat('#f1efea', 0.9));
    const n = W > 1.25 ? 2 : 1, pw = Math.min(0.62, (mw - 0.1) / n);
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? 0 : (i === 0 ? -1 : 1) * (mw / 4);
      B(g, pw, 0.12, 0.36, x, frameH + 0.22 + 0.06, -D / 2 + headT + 0.24, mat('#ffffff', 0.9));
    }
    const bd = md * 0.66;
    B(g, mw + 0.02, 0.05, bd, 0, frameH + 0.22 + 0.02, -D / 2 + headT + 0.01 + md - bd / 2, mat(lighten(c, -0.12), 0.95));
  },

  bedSoft(g, W, D, H, c) {
    // кровать с мягким изголовьем (по фото): высокое скруглённое изголовье, мягкое основание,
    // тонкие чёрные ножки, светлое постельное и плед в ногах
    const m = mat(c, 0.98), legH = 0.08, baseH = 0.3, headT = 0.09;
    const legM = mat('#1e1e20', 0.45, 0.5);
    for (const sx of [-1, 1]) for (const z of [-D / 2 + headT + 0.09, D / 2 - 0.09]) C(g, 0.013, 0.009, legH, sx * (W / 2 - 0.09), legH / 2, z, legM, 10);
    softSlab(g, W, D - headT, baseH, 0, legH, headT / 2, 0.03, 0.025, m);
    // изголовье: скруглённые верхние углы, мягкая кромка
    const e = 0.012, hw = W / 2 - e, top = H - e, bot = 0.05, rad = Math.min(0.3, hw * 0.45);
    const sh = new THREE.Shape();
    sh.moveTo(-hw, bot); sh.lineTo(hw, bot); sh.lineTo(hw, top - rad); sh.quadraticCurveTo(hw, top, hw - rad, top);
    sh.lineTo(-hw + rad, top); sh.quadraticCurveTo(-hw, top, -hw, top - rad); sh.closePath();
    const hb = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: headT - 2 * e, bevelEnabled: true, bevelThickness: e, bevelSize: e, bevelSegments: 3, curveSegments: 18 }), m);
    hb.position.z = -D / 2 + e; hb.castShadow = true; hb.receiveShadow = true;
    g.add(hb);
    // матрас, подушки, одеяло и плед
    const bd = D - headT, y0 = legH + baseH - 0.03, zc = headT / 2;
    softSlab(g, W - 0.07, bd - 0.06, 0.2, 0, y0, zc, 0.04, 0.035, mat('#f3f2ee', 0.95));
    const pw = Math.min(0.66, (W - 0.2) / 2);
    for (const sx of [-1, 1]) softSlab(g, pw, 0.36, 0.13, sx * (pw / 2 + 0.03), y0 + 0.19, -D / 2 + headT + 0.25, 0.06, 0.05, mat('#e8e6e1', 0.95));
    const dd = bd * 0.68;
    softSlab(g, W - 0.03, dd, 0.06, 0, y0 + 0.18, D / 2 - dd / 2 - 0.02, 0.03, 0.025, mat('#cdc8c1', 0.97));
    softSlab(g, W + 0.01, 0.42, 0.07, 0, y0 + 0.185, D / 2 - 0.36, 0.02, 0.02, mat('#9e8f80', 0.98));
  },

  nightstand(g, W, D, H, c) {
    const m = mat(c, 0.7), lm = mat(LINE, 0.8);
    B(g, W, H - 0.05, D, 0, 0.05 + (H - 0.05) / 2, 0, m);
    legs(g, W, D, 0.05, 0.03, 0.02, mat(DARK, 0.6));
    seamH(g, -W / 2 + 0.01, W / 2 - 0.01, 0.05 + (H - 0.05) * 0.55, D / 2, lm);
    handle(g, 0, 0.05 + (H - 0.05) * 0.78, D / 2, false, 0.1);
    handle(g, 0, 0.05 + (H - 0.05) * 0.3, D / 2, false, 0.1);
  },

  wardrobe(g, W, D, H, c) {
    const m = mat(c, 0.7), lm = mat(LINE, 0.8);
    B(g, W, H - 0.06, D, 0, 0.06 + (H - 0.06) / 2, 0, m);
    B(g, W - 0.02, 0.06, D - 0.04, 0, 0.03, -0.02, mat(lighten(c, -0.25), 0.8));
    const n = Math.max(1, Math.round(W / 0.55));
    for (let i = 1; i < n; i++) seamV(g, -W / 2 + (W * i) / n, 0.07, H - 0.01, D / 2, lm);
    for (let i = 0; i < n; i++) {
      const x0 = -W / 2 + (W * i) / n, x1 = x0 + W / n;
      handle(g, i % 2 === 0 ? x1 - 0.05 : x0 + 0.05, H * 0.5, D / 2, true, 0.22);
    }
  },

  wardrobeSlide(g, W, D, H, c) {
    // шкаф-купе: корпус, верхняя и нижняя направляющие, раздвижные двери в два ряда с вертикальными профилями
    const m = mat(c, 0.6), prof = mat('#b9bcc0', 0.35, 0.7), plinth = 0.06, rail = 0.05;
    B(g, W, H - plinth, D - 0.06, 0, plinth + (H - plinth) / 2, -0.03, m);
    B(g, W - 0.02, plinth, D - 0.1, 0, plinth / 2, -0.05, mat(lighten(c, -0.25), 0.8));
    B(g, W, rail, 0.06, 0, H - rail / 2, D / 2 - 0.03, prof, false);
    B(g, W, 0.02, 0.06, 0, plinth + 0.01, D / 2 - 0.03, prof, false);
    const n = Math.max(2, Math.round(W / 0.9)), dw = (W + 0.03 * (n - 1)) / n, hh = H - rail - plinth - 0.02;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + dw / 2 + i * (dw - 0.03), z = i % 2 === 0 ? D / 2 - 0.012 : D / 2 - 0.042;
      B(g, dw, hh, 0.018, x, plinth + 0.02 + hh / 2, z, m, false);
      for (const sx of [-1, 1]) B(g, 0.022, hh, 0.03, x + sx * (dw / 2 - 0.011), plinth + 0.02 + hh / 2, z + 0.006, prof, false);
    }
  },

  sofaSlim(g, W, D, H, c) {
    // диван по фото: низкий корпус с ящиком, одна длинная подушка сиденья с кантом,
    // тонкие подлокотники со скруглённым верхом, три большие подушки у спинки, чёрные ножки
    const m = mat(c, 0.97), dark = mat(lighten(c, -0.06), 0.97), legs4 = mat('#1e1e20', 0.5, 0.3);
    const legH = 0.04, armT = Math.min(0.1, W * 0.06), armH = Math.min(0.62, H * 0.72), backT = 0.2;
    const seatY = 0.3, seatH = 0.15, inW = W - 2 * armT;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) C(g, 0.022, 0.022, legH, sx * (W / 2 - 0.12), legH / 2, sz * (D / 2 - 0.12), legs4, 12);
    softSlab(g, inW - 0.02, D - backT - 0.04, seatY - legH, 0, legH, backT / 2 - 0.02, 0.02, 0.015, dark);      // корпус с ящиком
    softSlab(g, inW, D - backT, seatH + 0.02, 0, seatY - 0.02, backT / 2, 0.04, 0.035, m);                   // сиденье
    softSlab(g, inW, backT, Math.min(H - 0.12, 0.72) - legH, 0, legH, -D / 2 + backT / 2, 0.03, 0.025, m);   // спинка
    // подлокотники: профиль со скруглённым верхним передним углом, выдавленный по ширине
    const r = Math.min(0.14, armH * 0.3), z0 = -D / 2, z1 = D / 2, y0 = legH, y1 = armH;
    const sh = new THREE.Shape();
    sh.moveTo(z0, y0); sh.lineTo(z1, y0); sh.lineTo(z1, y1 - r); sh.quadraticCurveTo(z1, y1, z1 - r, y1); sh.lineTo(z0, y1); sh.closePath();
    for (const sx of [-1, 1]) {
      const geo = new THREE.ExtrudeGeometry(sh, { depth: armT - 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 12 });
      geo.rotateY(-Math.PI / 2);                         // профиль в плоскости YZ, толщина — по X
      const arm = new THREE.Mesh(geo, m);
      arm.position.x = sx > 0 ? W / 2 - 0.01 : -W / 2 + armT - 0.01;
      arm.castShadow = true; arm.receiveShadow = true;
      g.add(arm);
    }
    // три подушки у спинки, слегка откинуты назад
    const pw = (inW - 0.04) / 3, ph = Math.min(0.5, H - seatY - seatH + 0.05);
    for (let i = 0; i < 3; i++) {
      const p = softSlab(g, pw - 0.02, 0.17, ph, -inW / 2 + 0.02 + pw / 2 + i * pw, seatY + seatH - 0.03, -D / 2 + backT + 0.07, 0.07, 0.06, m);
      p.rotation.x = -0.18;
    }
  },

  dresser(g, W, D, H, c) {
    const m = mat(c, 0.7), lm = mat(LINE, 0.8);
    B(g, W, H - 0.06, D, 0, 0.06 + (H - 0.06) / 2, 0, m);
    legs(g, W, D, 0.06, 0.03, 0.03, mat(DARK, 0.6));
    const n = Math.max(2, Math.round((H - 0.06) / 0.22));
    for (let i = 1; i < n; i++) seamH(g, -W / 2 + 0.01, W / 2 - 0.01, 0.06 + ((H - 0.06) * i) / n, D / 2, lm);
    for (let i = 0; i < n; i++) handle(g, 0, 0.06 + ((H - 0.06) * (i + 0.5)) / n, D / 2, false, Math.min(0.16, W * 0.2));
  },

  desk(g, W, D, H, c) {
    const m = mat(c, 0.6), lg = mat(DARK, 0.5, 0.3);
    B(g, W, 0.03, D, 0, H - 0.015, 0, m);
    legs(g, W, D, H - 0.03, 0.04, 0.03, lg);
  },
  deskLift(g, W, D, H, c) {
    // стол с электроподъёмом (Move): деревянная столешница, две телескопические прямоугольные стойки на опорах 70 см,
    // кронштейны и поперечина под столешницей, пульт спереди справа. Высота стола — высота предмета (62,5–127,5 см)
    const frame = mat('#1d1e20', 0.55, 0.3), top = 0.018;   // столешница 1,8 см, как на сайте
    const xs = W / 2 - Math.min(0.13, W * 0.1), footL = Math.min(0.7, D - 0.02), yTop = H - top;
    B(g, W, top, D, 0, H - top / 2, 0, woodMat(c));
    for (const sx of [-1, 1]) {
      const x = sx * xs;
      B(g, 0.07, 0.03, footL, x, 0.015, 0, frame);                                   // опора
      for (const z of [-footL / 2 + 0.03, footL / 2 - 0.03]) C(g, 0.012, 0.014, 0.008, x, 0.004, z, mat('#111112', 0.8), 10);
      const yOuter = Math.max(0.2, Math.min(0.55, yTop - 0.12));
      B(g, 0.07, yOuter - 0.03, 0.05, x, 0.03 + (yOuter - 0.03) / 2, 0, frame);       // нижняя секция стойки
      B(g, 0.06, yTop - 0.03 - yOuter, 0.042, x, yOuter + (yTop - 0.03 - yOuter) / 2, 0, frame);   // выдвижная секция
      B(g, 0.06, 0.03, D - 0.12, x, yTop - 0.015, 0, frame);                          // кронштейн под столешницей
    }
    B(g, 2 * xs, 0.03, 0.05, 0, yTop - 0.02, -0.04, frame);                           // поперечина
    // пульт с дисплеем
    B(g, 0.12, 0.022, 0.05, W / 2 - 0.26, yTop - 0.011, D / 2 - 0.035, mat('#18191b', 0.4), false);
    B(g, 0.03, 0.004, 0.012, W / 2 - 0.29, yTop - 0.012, D / 2 - 0.009, mat('#9fd0ff', 0.3, 0, { emissive: '#3a78b0' }), false);
  },
  diningTable(g, W, D, H, c) { BUILD.desk(g, W, D, H, c); },

  tableSquare(g, W, D, H, c) {
    // кухонный стол: деревянная столешница, царги и четыре квадратные ножки
    const top = 0.028, legT = 0.045, inset = 0.035, apronH = 0.07;
    B(g, W, top, D, 0, H - top / 2, 0, woodMat(c));
    const wood = mat(lighten(c, -0.08), 0.6);
    legs(g, W, D, H - top, legT, inset, wood);
    const a = inset + legT / 2;
    for (const sz of [-1, 1]) B(g, W - 2 * a, apronH, 0.02, 0, H - top - apronH / 2, sz * (D / 2 - a), wood);
    for (const sx of [-1, 1]) B(g, 0.02, apronH, D - 2 * a, sx * (W / 2 - a), H - top - apronH / 2, 0, wood);
  },

  sconceBalls(g, W, D, H, c) {
    // бра по фото: латунная круглая накладка с коротким кронштейном, чёрный провод, латунная трубка
    // и четыре матовых белых шара, между шарами тонкие латунные кольца. Цвет предмета — цвет латуни
    const brass = mat(c, 0.35, 0.75), black = mat('#18191b', 0.6);
    const glass = mat('#fbfaf6', 0.45, 0, { emissive: '#fff0d4', emissiveIntensity: 0.3 });
    const z0 = -D / 2, top = H - 0.06, zc = z0 + Math.max(0.07, Math.min(0.13, D - 0.065));
    const plate = C(g, 0.05, 0.05, 0.022, 0, top, z0 + 0.011, brass, 28); plate.rotation.x = Math.PI / 2;
    const armL = zc - (z0 + 0.022) + 0.01;
    const arm = C(g, 0.008, 0.008, armL, 0, top, z0 + 0.022 + armL / 2, brass, 12); arm.rotation.x = Math.PI / 2;
    const r = Math.min(0.06, W / 2), fin = 0.018;
    C(g, 0.006, 0.012, fin, 0, fin / 2, zc, brass, 10);                  // наконечник снизу
    let y = fin;
    for (let i = 0; i < 4; i++) {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), glass);
      ball.position.set(0, y + r, zc); ball.castShadow = true;
      g.add(ball);
      y += 2 * r + 0.004;
      if (i < 3) C(g, r * 0.42, r * 0.42, 0.008, 0, y - 0.002, zc, brass, 20);   // кольцо в перехвате
    }
    const tubeH = 0.06;
    C(g, 0.006, 0.006, tubeH, 0, y + tubeH / 2, zc, brass, 10);
    const cordH = top - (y + tubeH);
    if (cordH > 0.005) C(g, 0.0025, 0.0025, cordH, 0, y + tubeH + cordH / 2, zc, black, 8);
  },

  sconceDrum(g, W, D, H, c) {
    // бра по фото: чёрная круглая накладка, кронштейн из светлого дерева, чёрная трубка
    // и абажур-цилиндр из льна: сверху бежевый, снизу светлый. Цвет предмета — цвет абажура
    const black = mat('#1d1e20', 0.55, 0.3), wood = mat('#c9a27a', 0.6);
    const sr = Math.min(W / 2, 0.11), sh = Math.min(0.19, H * 0.6);
    const z0 = -D / 2, top = H - 0.055, zc = D / 2 - sr;
    const plate = C(g, 0.05, 0.05, 0.028, 0, top, z0 + 0.014, black, 28); plate.rotation.x = Math.PI / 2;
    const armL = zc - (z0 + 0.028) + 0.015;
    const arm = C(g, 0.015, 0.015, armL, 0, top, z0 + 0.028 + armL / 2, wood, 16); arm.rotation.x = Math.PI / 2;
    C(g, 0.006, 0.006, top - sh, 0, sh + (top - sh) / 2, zc, black, 10);
    C(g, sr, sr, sh * 0.5, 0, sh * 0.75, zc, mat(lighten(c, -0.12), 0.95), 40);
    C(g, sr, sr, sh * 0.48, 0, sh * 0.24, zc, mat(c, 0.95, 0, { emissive: '#40342a', emissiveIntensity: 0.5 }), 40);
    C(g, sr * 0.985, sr * 0.985, sh * 0.03, 0, sh * 0.49, zc, mat('#8f8578', 0.9), 40);   // щель между полосами
  },

  // ── шкаф с тумбой под телевизор по чертежу: распашной шкаф, открытые полки на тумбе, длинная тумба ──
  cabinetTall(g, W, D, H, c) {
    // распашной шкаф: фасады цвета предмета, утопленный цоколь, круглые ручки-кнопки у середины
    const m = mat(c, 0.55), lm = mat(lighten(c, -0.3), 0.8), pl = 0.04;
    B(g, W, H - pl, D, 0, pl + (H - pl) / 2, 0, m);
    B(g, W - 0.02, pl, D - 0.06, 0, pl / 2, -0.03, mat(lighten(c, -0.4), 0.8));
    const n = Math.max(1, Math.round(W / 0.45));
    for (let i = 1; i < n; i++) seamV(g, -W / 2 + (W * i) / n, pl + 0.003, H - 0.003, D / 2, lm);
    for (let i = 0; i < n; i++) {
      const x0 = -W / 2 + (W * i) / n, x1 = x0 + W / n;
      knob(g, n === 1 ? x1 - 0.05 : i % 2 === 0 ? x1 - 0.045 : x0 + 0.045, pl + (H - pl) / 2, D / 2);
    }
  },

  shelfOpen(g, W, D, H, c, it = {}) {
    // открытые полки (по чертежу): боковины, полки и задняя стенка из ореха; просветы снизу вверх
    // 300, 450, 350, 350, 342 мм при высоте 1900 (иначе пропорционально), полки 18 мм
    const m = woodMat(c), t = 0.018;
    for (const sx of [-1, 1]) B(g, t, H, D, sx * (W / 2 - t / 2), H / 2, 0, m);
    B(g, W - 2 * t, H, 0.012, 0, H / 2, -D / 2 + 0.006, m);                                      // задняя стенка
    const gaps = [0.3, 0.45, 0.35, 0.35, 0.342], k = H / (gaps.reduce((a, b) => a + b, 0) + 6 * t);
    let y = 0;
    const panel = () => { B(g, W - 2 * t, t * k, D - 0.012, 0, y + (t * k) / 2, 0.006, m); y += t * k; };
    panel();
    for (const gp of gaps) { y += gp * k; panel(); }
    // розетка по чертежу: 1100 мм от пола и от угла, то есть в 182 мм от левой боковины, на 600 мм выше низа полок
    if (/^tvwall/.test(it.set || '')) sockets(g, -W / 2 + 0.182, 0.6, -D / 2 + 0.012, ['socket']);
  },

  tvUnit(g, W, D, H, c, it = {}) {
    // тумба под телевизор (по чертежу): по краям секции с двумя дверцами, посередине ящик и над ним
    // открытая ниша 250 мм; фасады цвета предмета, столешница и ниша — орех (второй цвет)
    const m = mat(c, 0.55), lm = mat(lighten(c, -0.3), 0.8), wood = woodMat(it.color2 || '#6f4d36');
    const pl = 0.04, top = 0.025, side = Math.min(0.9, W / 3), mid = W - 2 * side, bodyH = H - top - pl;
    B(g, W - 0.02, pl, D - 0.06, 0, pl / 2, -0.03, mat(lighten(c, -0.4), 0.8));                 // цоколь
    for (const sx of [-1, 1]) {
      const cx = sx * (W / 2 - side / 2);
      B(g, side, bodyH, D, cx, pl + bodyH / 2, 0, m);
      seamV(g, cx, pl + 0.003, H - top - 0.003, D / 2, lm);                                      // две дверцы
      for (const dx of [-0.045, 0.045]) knob(g, cx + dx, pl + bodyH / 2, D / 2);
      seamV(g, sx * mid / 2, pl + 0.003, H - top - 0.003, D / 2, lm);                            // стык с серединой
    }
    const nb = Math.max(pl + 0.1, H - 0.25), nh = H - top - nb;                                  // низ ниши — 250 мм от верха
    B(g, mid, nb - pl, D, 0, pl + (nb - pl) / 2, 0, m);                                          // ящик
    knob(g, 0, pl + (nb - pl) / 2, D / 2);
    B(g, mid, 0.012, D - 0.012, 0, nb + 0.006, 0.006, wood);                                     // ниша: дно,
    B(g, mid, nh, 0.012, 0, nb + nh / 2, -D / 2 + 0.006, wood);                                  // задняя стенка
    for (const sx of [-1, 1]) B(g, 0.01, nh, D - 0.012, sx * (mid / 2 - 0.005), nb + nh / 2, 0.006, wood);   // и бока
    B(g, W, top, D + 0.01, 0, H - top / 2, 0.005, wood);                                         // столешница
    // блок розеток по чертежу: центр в 2400 мм от угла (1482 мм от левого края тумбы), на высоте 350 мм
    if (/^tvwall/.test(it.set || '')) {
      const x = Math.max(-mid / 2 + 0.2, Math.min(mid / 2 - 0.2, -W / 2 + 1.482));
      sockets(g, x, Math.min(0.35, nb + nh / 2), -D / 2 + 0.012, ['blank', 'socket', 'socket', 'socket', 'socket']);
    }
  },

  // ── стол у окна со шкафами (по фото): белый корпус без ручек, светлый дуб ──
  drawerUnit(g, W, D, H, c) {
    // тумба с ящиками: фасады без ручек — над каждым ящиком тёмный паз; цоколь утоплен
    const m = mat(c, 0.45), groove = mat('#4a4642', 0.7), pl = Math.min(0.06, H * 0.1);
    B(g, W, H - pl, D, 0, pl + (H - pl) / 2, 0, m);
    B(g, W - 0.02, pl, D - 0.05, 0, pl / 2, -0.025, mat(lighten(c, -0.35), 0.8));
    const n = Math.max(1, Math.round((H - pl) / 0.22)), fh = (H - pl) / n;
    for (let i = 0; i < n; i++) B(g, W - 0.008, 0.014, 0.006, 0, H - i * fh - 0.009, D / 2 - 0.002, groove, false);
  },

  windowTop(g, W, D, H, c) {
    // столешница: дуб; у стены по центру — решётка, чтобы тепло от батареи под столом шло к окну
    WB(g, W, H, D, 0, H / 2, 0, c);
    const gw = Math.min(0.7, W * 0.6), gz = -D / 2 + 0.07, dark = mat('#2c2a28', 0.7), bar = mat('#8a8680', 0.5);
    B(g, gw, 0.002, 0.08, 0, H + 0.0005, gz, dark, false);
    const n = Math.floor(gw / 0.02);
    for (let i = 0; i <= n; i++) B(g, 0.004, 0.003, 0.076, -gw / 2 + (gw * i) / n, H + 0.0015, gz, bar, false);
  },

  drawerApron(g, W, D, H, c) {
    // ящики под столешницей: по ящику примерно на каждые 70 см, паз сверху каждого фасада
    const m = mat(c, 0.45), groove = mat('#4a4642', 0.7), lm = mat(lighten(c, -0.3), 0.8);
    B(g, W, H, D, 0, H / 2, 0, m);
    const n = Math.max(1, Math.round(W / 0.7)), fw = W / n;
    for (let i = 0; i < n; i++) {
      if (i) seamV(g, -W / 2 + i * fw, 0.003, H - 0.003, D / 2, lm);
      B(g, fw - 0.01, 0.014, 0.006, -W / 2 + fw * (i + 0.5), H - 0.009, D / 2 - 0.002, groove, false);
    }
  },

  shelfFramed(g, W, D, H, c) {
    // открытые полки: белые боковины и верх, внутри светлый дуб — задняя стенка и полки примерно через 40 см
    const frame = mat('#f1f1ee', 0.45), wood = woodMat(c), t = 0.018;
    for (const sx of [-1, 1]) B(g, t, H, D, sx * (W / 2 - t / 2), H / 2, 0, frame);
    B(g, W, t, D, 0, H - t / 2, 0, frame);
    B(g, W - 2 * t, H - t, 0.01, 0, (H - t) / 2, -D / 2 + 0.005, wood);
    const n = Math.max(2, Math.round(H / 0.4)), step = (H - t) / n;
    for (let i = 0; i < n; i++) B(g, W - 2 * t, t, D - 0.01, 0, i * step + t / 2, 0.005, wood);
  },

  cabinetDoor(g, W, D, H, c) {
    // закрытый шкаф: белый корпус, дверцы без ручек — вертикальный паз у края, на удобной высоте снизу
    const m = mat(c, 0.45), groove = mat('#4a4642', 0.7), lm = mat(lighten(c, -0.3), 0.8);
    B(g, W, H, D, 0, H / 2, 0, m);
    const n = Math.max(1, Math.round(W / 0.6)), fw = W / n;
    for (let i = 0; i < n; i++) {
      if (i) seamV(g, -W / 2 + i * fw, 0.003, H - 0.003, D / 2, lm);
      B(g, fw - 0.01, 0.014, 0.006, -W / 2 + fw * (i + 0.5), 0.009, D / 2 - 0.002, groove, false);   // паз снизу дверцы
    }
  },

  shelfOpenR(g, W, D, H, c) { flowerShelves(g, W, D, H, c, 1); },    // открыты справа
  shelfOpenL(g, W, D, H, c) { flowerShelves(g, W, D, H, c, -1); },   // открыты слева

  shelfDivider(g, W, D, H, c) {
    // стеллаж-перегородка: открыт с обеих сторон; торцевые стойки (у стены и со стороны комнаты),
    // полки примерно через 38 см и стойка посередине, на утопленном цоколе; орех
    const m = woodMat(c), t = 0.022, base = 0.05;
    for (const sz of [-1, 1]) B(g, W, H, t, 0, H / 2, sz * (D / 2 - t / 2), m);
    B(g, W - 0.03, base, D - 2 * t, 0, base / 2, 0, mat('#2a2420', 0.8));
    const rows = Math.max(2, Math.round((H - base) / 0.38)), step = (H - base - t) / rows;
    for (let i = 0; i <= rows; i++) B(g, W, t, D - 2 * t, 0, base + t / 2 + i * step, 0, m);
    B(g, W, H - base - 2 * t, t, 0, base + t + (H - base - 2 * t) / 2, 0, m);
  },

  slatPanel(g, W, D, H, c) {
    // реечная панель (по фото): вертикальные рейки 27 мм с шагом 40 мм на чёрном войлоке
    const felt = mat('#1c1c1d', 0.95), sw = 0.027, pitch = 0.04;
    B(g, W, H, Math.min(0.009, D / 2), 0, H / 2, -D / 2 + Math.min(0.009, D / 2) / 2, felt);
    const n = Math.max(1, Math.floor((W - sw) / pitch) + 1), x0 = -((n - 1) * pitch) / 2;
    const shades = [mat(c, 0.55), mat(lighten(c, 0.012), 0.55), mat(lighten(c, -0.015), 0.55)];
    for (let i = 0; i < n; i++) B(g, sw, H, D - 0.009, x0 + i * pitch, H / 2, 0.0045, shades[(i * 7) % 3]);
  },

  soundbar(g, W, D, H, c) {
    // саундбар: скруглённый корпус, спереди решётка из ткани, на ней маленький индикатор
    softSlab(g, W, D, H, 0, 0, 0, Math.min(0.03, D * 0.3), Math.min(0.012, H * 0.2), mat(c, 0.6));
    B(g, W - 0.06, H * 0.62, 0.002, 0, H * 0.5, D / 2 - 0.0005, mat(lighten(c, 0.03), 0.95), false);
    B(g, 0.012, 0.004, 0.002, W / 2 - 0.08, H * 0.2, D / 2 + 0.001, mat('#ffffff', 0.4, 0, { emissive: '#ffffff', emissiveIntensity: 0.6 }), false);
  },

  turntable(g, W, D, H, c) {
    // проигрыватель Sony PS-LX310BT (43 × 10,8 × 36,7 см): чёрный корпус на ножках, алюминиевый диск 296 мм
    // с резиновым ковриком, прямой тонарм справа сзади, кнопки спереди слева, дымчатая крышка
    const body = mat(c, 0.45), alu = mat('#c9ccd0', 0.3, 0.85), black = mat('#111112', 0.7);
    const feet = 0.012, cover = Math.min(0.035, H * 0.33), plinth = H - feet - cover;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) C(g, 0.022, 0.025, feet, sx * (W / 2 - 0.05), feet / 2, sz * (D / 2 - 0.05), black, 16);
    B(g, W, plinth, D, 0, feet + plinth / 2, 0, body);
    const top = feet + plinth, pr = Math.min(0.148, D * 0.42), px = -W / 2 + 0.03 + pr, pz = 0.012;
    C(g, pr, pr, 0.012, px, top + 0.006, pz, alu, 48);
    C(g, pr - 0.004, pr - 0.004, 0.003, px, top + 0.0135, pz, black, 48);
    C(g, 0.0035, 0.0035, 0.018, px, top + 0.015, pz, alu, 10);
    // тонарм: опора справа сзади, прямая трубка к краю диска, головка
    const ax = W / 2 - 0.075, az = -D / 2 + 0.085;
    C(g, 0.022, 0.024, 0.018, ax, top + 0.009, az, black, 24);
    const ex = px + pr * 0.75, ez = pz + pr * 0.45, len = Math.hypot(ex - ax, ez - az);
    const arm = C(g, 0.004, 0.004, len, (ax + ex) / 2, top + 0.024, (az + ez) / 2, alu, 10);
    arm.rotation.z = Math.PI / 2; arm.rotation.y = -Math.atan2(ez - az, ex - ax);
    const head = B(g, 0.03, 0.01, 0.018, ex, top + 0.022, ez, black, false);
    head.rotation.y = -Math.atan2(ez - az, ex - ax);
    C(g, 0.006, 0.006, 0.02, ax + 0.005, top + 0.01, az + 0.12, black, 10);           // подставка тонарма
    for (const [bx, bw] of [[-W / 2 + 0.05, 0.03], [-W / 2 + 0.095, 0.03]]) B(g, bw, 0.004, 0.012, bx, top + 0.002, D / 2 - 0.03, mat('#3a3b3d', 0.4), false);
    // крышка: дымчатый пластик
    const lid = mat('#3c4046', 0.08, 0, { transparent: true, opacity: 0.28, depthWrite: false });
    const l = B(g, W - 0.004, cover, D - 0.01, 0, top + cover / 2, -0.004, lid, false);
    l.renderOrder = 3;
  },

  monitorCurved(g, W, D, H, c) {
    // монитор AOC CU34V5CW (34″, 21:9, изгиб 1500R): изогнутая панель, задняя крышка с выступом,
    // стойка с регулировкой высоты и плоское основание. Высота предмета — до верха экрана
    const black = mat(c, 0.5), R = 1.5, t = 0.022, ph = Math.min(0.37, H - 0.03);
    const th = Math.asin(Math.min(0.95, W / 2 / R)), zf = -D / 2 + 0.105;      // середина экрана спереди
    const y0 = H - ph;                                                              // низ панели над столом
    const pts = [];
    const N = 28;
    for (let i = 0; i <= N; i++) { const a = -th + (2 * th * i) / N; pts.push([R * Math.sin(a), zf + R - R * Math.cos(a)]); }
    for (let i = N; i >= 0; i--) { const a = -th + (2 * th * i) / N; pts.push([(R + t) * Math.sin(a), zf + R - (R + t) * Math.cos(a)]); }
    const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: ph, bevelEnabled: false, curveSegments: 1 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, y0, 0);
    const panel = new THREE.Mesh(geo, black);
    panel.castShadow = true; panel.receiveShadow = true;
    g.add(panel);
    // экран: изогнутая полоса чуть впереди панели; снизу узкая планка
    const scr = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.0015, R - 0.0015, ph - 0.026, 40, 1, true, Math.PI - th * 0.985, 2 * th * 0.985),
      mat('#0b0c0f', 0.15, 0.2, { side: THREE.BackSide }));
    scr.position.set(0, y0 + 0.022 + (ph - 0.026) / 2, zf + R);
    g.add(scr);
    // задний выступ, стойка, основание
    B(g, 0.34, 0.2, 0.04, 0, y0 + ph * 0.48, zf - t - 0.02, black);
    const nz = zf - t - 0.055;
    B(g, 0.075, y0 + ph * 0.5 - 0.012, 0.03, 0, 0.012 + (y0 + ph * 0.5 - 0.012) / 2, nz, black);
    B(g, 0.3, 0.012, 0.2, 0, 0.006, Math.min(D / 2 - 0.1, nz + 0.075), black);
  },

  aircon(g, W, D, H, c) {
    // настенный блок кондиционера: сбоку — плоская спина и верх, скруглённый перед, снизу скос с жалюзи
    const e = 0.006, m = mat(c, 0.3), dark = mat('#3a3d40', 0.6);
    const z0 = -D / 2 + e, z1 = D / 2 - e, y1 = H - e, r = Math.min(0.07, H * 0.3, D * 0.4);
    const s = new THREE.Shape();
    s.moveTo(z0, e + 0.02);
    s.lineTo(z0, y1);
    s.lineTo(z1 - r, y1);
    s.quadraticCurveTo(z1, y1, z1, y1 - r);
    s.lineTo(z1, H * 0.36);
    s.quadraticCurveTo(z1, H * 0.2, z1 - 0.05, H * 0.12);
    s.lineTo(z0 + 0.03, e);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: W - 2 * e, bevelEnabled: true, bevelThickness: e, bevelSize: e, bevelSegments: 2, curveSegments: 12 });
    geo.rotateY(-Math.PI / 2);
    geo.translate(W / 2 - e, 0, 0);
    const body = new THREE.Mesh(geo, m);
    body.castShadow = true; body.receiveShadow = true;
    g.add(body);
    B(g, W - 0.03, 0.003, 0.003, 0, H * 0.38, D / 2 - 0.0005, dark, false);               // шов передней панели
    const slot = B(g, W - 0.08, 0.022, 0.05, 0, H * 0.13, D / 2 - 0.06, dark, false);      // щель жалюзи
    slot.rotation.x = -0.55;
    const flap = B(g, W - 0.09, 0.005, 0.055, 0, H * 0.09, D / 2 - 0.035, m, false);       // заслонка
    flap.rotation.x = 0.35;
    B(g, 0.06, 0.018, 0.003, W / 2 - 0.1, H * 0.55, D / 2 + 0.0005, mat('#1d1f22', 0.3), false);   // дисплей
    B(g, 0.022, 0.008, 0.002, W / 2 - 0.1, H * 0.55, D / 2 + 0.002, mat('#9ad1ff', 0.4, 0, { emissive: '#4a9bd8' }), false);
  },
  coffeeTable(g, W, D, H, c) {
    const m = mat(c, 0.6);
    B(g, W, 0.035, D, 0, H - 0.0175, 0, m);
    B(g, W - 0.08, 0.02, D - 0.08, 0, H * 0.3, 0, m);
    legs(g, W, D, H - 0.035, 0.035, 0.02, mat(DARK, 0.5, 0.3));
  },
  roundTable(g, W, D, H, c) {
    const m = mat(c, 0.6), lg = mat(DARK, 0.5, 0.3);
    const top = C(g, W / 2, W / 2, 0.03, 0, H - 0.015, 0, m, 40);
    top.scale.z = D / W;
    C(g, 0.035, 0.035, H - 0.03, 0, (H - 0.03) / 2, 0, lg, 16);
    const base = C(g, Math.min(W, D) * 0.25, Math.min(W, D) * 0.28, 0.02, 0, 0.01, 0, lg, 32);
    base.castShadow = false;
  },

  chair(g, W, D, H, c) {
    const m = mat(c, 0.7), lg = mat(DARK, 0.5, 0.3);
    const seatH = Math.min(0.46, H * 0.52);
    B(g, W, 0.04, D, 0, seatH, 0, m);
    legs(g, W, D, seatH - 0.02, 0.03, 0.01, lg);
    B(g, W, H - seatH, 0.03, 0, seatH + (H - seatH) / 2, -D / 2 + 0.015, m);
  },

  shelf(g, W, D, H, c) {
    const m = mat(c, 0.75), t = 0.018;
    for (const s of [-1, 1]) B(g, t, H, D, s * (W / 2 - t / 2), H / 2, 0, m);
    B(g, W - 2 * t, H, 0.006, 0, H / 2, -D / 2 + 0.003, mat(lighten(c, -0.08), 0.8));
    const n = Math.max(2, Math.round(H / 0.36));
    for (let i = 0; i <= n; i++) B(g, W - 2 * t, t, D, 0, Math.min(H - t / 2, t / 2 + ((H - t) * i) / n), 0, m);
  },

  tvStand(g, W, D, H, c) {
    const m = mat(c, 0.7), lm = mat(LINE, 0.8);
    B(g, W, H - 0.05, D, 0, 0.05 + (H - 0.05) / 2, 0, m);
    legs(g, W, D, 0.05, 0.03, 0.03, mat(DARK, 0.6));
    const n = Math.max(1, Math.round(W / 0.6));
    for (let i = 1; i < n; i++) seamV(g, -W / 2 + (W * i) / n, 0.06, H - 0.01, D / 2, lm);
  },

  tv(g, W, D, H, c) {
    B(g, W, H, Math.max(0.02, D * 0.6), 0, H / 2, 0, mat(c, 0.4, 0.1));
    B(g, W - 0.02, H - 0.02, 0.003, 0, H / 2, Math.max(0.02, D * 0.6) / 2 + 0.0015, mat('#0b0c0e', 0.15, 0.2), false);
  },

  kitchenBase(g, W, D, H, c, it = {}) {
    const lm = mat(LINE, 0.8), modern = it.handles === false;
    kitBody(g, W, D, H, c, it);
    kitTop(g, W, D, H, it);
    const zf = D / 2 - 0.02, top = 0.038;
    if (W >= 0.55) seamV(g, 0, 0.105, H - top - 0.005, zf, lm);
    if (!modern) {
      seamH(g, -W / 2 + 0.005, W / 2 - 0.005, H - top - 0.15, zf, lm);
      handle(g, 0, H - top - 0.075, zf, false, Math.min(0.2, W * 0.4));
    }
  },
  kitchenDrawers(g, W, D, H, c, it = {}) {
    const lm = mat(LINE, 0.8), modern = it.handles === false;
    kitBody(g, W, D, H, c, it);
    kitTop(g, W, D, H, it);
    const zf = D / 2 - 0.02, y0 = 0.1, y1 = H - 0.038;
    const fh = y1 - y0, cuts = [y1 - fh * 0.18, y1 - fh * 0.59];   // мелкий ящик сверху и два глубоких, как на эскизе
    for (const y of cuts) seamH(g, -W / 2 + 0.005, W / 2 - 0.005, y, zf, lm);
    if (!modern) for (const [a, b] of [[cuts[0], y1], [cuts[1], cuts[0]], [y0, cuts[1]]]) handle(g, 0, (a + b) / 2 + (b - a) * 0.3, zf, false, Math.min(0.24, W * 0.4));
  },
  kitchenOven(g, W, D, H, c, it = {}) {
    const modern = it.handles === false, top = 0.038, zf = D / 2 - 0.02;
    kitBody(g, W, D, H, c, it);
    kitTop(g, W, D, H, it);
    // нижний ящик под духовкой
    seamH(g, -W / 2 + 0.005, W / 2 - 0.005, 0.27, zf, mat(LINE, 0.8));
    if (!modern) handle(g, 0, 0.22, zf, false, Math.min(0.24, W * 0.4));
    // встроенная духовка 595 × 595
    const ow = Math.min(0.595, W - 0.01), oy0 = 0.275, oy1 = Math.min(H - top - 0.008, oy0 + 0.595);
    B(g, ow, oy1 - oy0, 0.03, 0, (oy0 + oy1) / 2, zf + 0.012, mat('#1b1c1e', 0.25, 0.2), false);
    B(g, ow - 0.06, (oy1 - oy0) * 0.62, 0.004, 0, oy0 + (oy1 - oy0) * 0.4, zf + 0.029, mat('#0c0d0f', 0.08, 0.3), false);
    B(g, ow - 0.08, 0.016, 0.022, 0, oy0 + (oy1 - oy0) * 0.8, zf + 0.04, it.metal ? fixtureMetal(it.metal, STEEL) : mat(STEEL, 0.3, 0.7), false);
    B(g, ow, 0.07, 0.004, 0, oy1 - 0.035, zf + 0.029, mat('#2a2b2e', 0.3, 0.3), false);
    // варочная панель: стекло и конфорки с решётками; ширина и число конфорок — из предмета (по умолчанию 58 см, 4)
    const hw = Math.min(it.hob ? it.hob / 1000 - 0.01 : 0.58, W - 0.04), hd = Math.min(0.51, D - 0.08);
    B(g, hw, 0.006, hd, 0, H + 0.003, 0.01, mat('#18191b', 0.15, 0.2), false);
    const cap = fixtureMetal(it.metal, '#3b3d40');
    // три конфорки: две слева (спереди и сзади), большая справа посередине
    const spots = (it.burners || 4) === 3
      ? [[-0.25, -0.24, 0.045], [-0.25, 0.24, 0.05], [0.24, 0, 0.065]]
      : [[-0.25, -0.24, 0.06], [-0.25, 0.24, 0.045], [0.25, -0.24, 0.045], [0.25, 0.24, 0.05]];
    for (const [fx, fz, r] of spots) {
      const cx = fx * hw, cz = 0.01 + fz * hd;
      C(g, r + 0.02, r + 0.02, 0.01, cx, H + 0.011, cz, mat('#2a2b2d', 0.6), 20).castShadow = false;
      C(g, r * 0.55, r * 0.55, 0.012, cx, H + 0.02, cz, cap, 20).castShadow = false;
    }
  },
  sink(g, W, D, H, c, it = {}) {
    const modern = it.handles === false, lm = mat(LINE, 0.8), zf = D / 2 - 0.02, top = 0.038;
    // мойка и смеситель: светлый металл блестит, тёмный (графит) — матовый, как кварцевая мойка
    const metal = it.metal ? fixtureMetal(it.metal, STEEL) : mat(STEEL, 0.28, 0.85);
    // чаша: в столешнице и корпусе вырез, под ним — настоящая чаша, видна изнутри
    const bw = Math.min(W - 0.08, 0.46), bd = Math.min(D - 0.18, 0.42), bz = 0.03, depth = 0.17;
    kitBody(g, W, D, H, c, it, { x0: -bw / 2 - 0.01, x1: bw / 2 + 0.01, z0: bz - bd / 2 - 0.01, z1: bz + bd / 2 + 0.01, y: H - depth - 0.02 });
    kitTop(g, W, D, H, it, { x0: -bw / 2, x1: bw / 2, z0: bz - bd / 2, z1: bz + bd / 2 });
    const yb = H - depth, t = 0.008;
    B(g, bw, t, bd, 0, yb, bz, metal, false);
    B(g, bw, depth, t, 0, yb + depth / 2, bz - bd / 2 + t / 2, metal, false);
    B(g, bw, depth, t, 0, yb + depth / 2, bz + bd / 2 - t / 2, metal, false);
    B(g, t, depth, bd, -bw / 2 + t / 2, yb + depth / 2, bz, metal, false);
    B(g, t, depth, bd, bw / 2 - t / 2, yb + depth / 2, bz, metal, false);
    // бортик чаши
    for (const [w, d, x, z] of [[bw + 0.03, 0.015, 0, bz - bd / 2 - 0.0075], [bw + 0.03, 0.015, 0, bz + bd / 2 + 0.0075], [0.015, bd, -bw / 2 - 0.0075, bz], [0.015, bd, bw / 2 + 0.0075, bz]]) B(g, w, 0.004, d, x, H + 0.002, z, metal, false);
    C(g, 0.022, 0.022, 0.006, 0, yb + 0.006, bz, mat('#2b2c2e', 0.4), 16);
    // смеситель «гусак»
    const zr = bz - bd / 2 - 0.05, R = 0.085, yt = H + 0.3;
    C(g, 0.022, 0.026, 0.05, 0, H + 0.025, zr, metal, 16);
    C(g, 0.013, 0.013, yt - H, 0, H + (yt - H) / 2, zr, metal, 12);
    const arc = new THREE.Mesh(new THREE.TorusGeometry(R, 0.013, 8, 24, Math.PI), metal);
    arc.rotation.y = -Math.PI / 2; arc.position.set(0, yt, zr + R); arc.castShadow = true;
    g.add(arc);
    C(g, 0.013, 0.011, 0.07, 0, yt - 0.035, zr + 2 * R, metal, 12);
    B(g, 0.012, 0.012, 0.075, 0.03, H + 0.12, zr, metal, false);
    if (W >= 0.55) seamV(g, 0, 0.105, H - top - 0.005, zf, lm);
    if (!modern) handle(g, 0, H - top - 0.075, zf, false, Math.min(0.2, W * 0.4));
  },
  kitchenCorner(g, W, D, H, c, it = {}) {
    // угловой нижний модуль: дверца на видимой части справа, слева — глухой угол под соседним модулем
    const lm = mat(LINE, 0.8), top = 0.038, zf = D / 2 - 0.02;
    kitBody(g, W, D, H, c, it);
    kitTop(g, W, D, H, it);
    const dw = Math.max(0.15, Math.min(W - 0.05, it.door ? it.door / 1000 : W - D));
    const xs = W / 2 - dw;
    seamV(g, xs, 0.105, H - top - 0.005, zf, lm);
    if (it.handles !== false) handle(g, xs + 0.05, H - top - 0.1, zf, true, 0.14);
  },
  fridgeTall(g, W, D, H, c, it = {}) {
    // пенал под встроенный холодильник: панели вокруг, двери холодильника и шкафчик сверху
    const m = mat(c, 0.6), lm = mat(LINE, 0.8), modern = it.handles === false;
    const plinth = 0.1, zf = D / 2 - 0.02;
    B(g, W - 0.004, plinth, D - 0.08, 0, plinth / 2, -0.04, mat(modern ? '#e9e8e4' : '#3a3b3d', 0.8));
    B(g, W - 0.004, H - plinth, D - 0.02, 0, plinth + (H - plinth) / 2, -0.01, m);
    const fw = Math.min(0.6, W - 0.04), topH = Math.min(0.45, H * 0.2), yTop = H - topH;
    for (const sx of [-1, 1]) seamV(g, sx * (W / 2 - 0.003), plinth + 0.004, H - 0.004, zf, lm);
    if (W - fw > 0.02) for (const sx of [-1, 1]) seamV(g, sx * fw / 2, plinth + 0.004, yTop, zf, lm);
    seamH(g, -W / 2 + 0.003, W / 2 - 0.003, yTop, zf, lm);
    const ySplit = plinth + 0.72;                       // морозилка снизу, холодильник сверху
    seamH(g, -fw / 2, fw / 2, ySplit, zf, lm);
    if (!modern) {
      handle(g, fw / 2 - 0.05, ySplit + 0.3, zf, true, 0.3);
      handle(g, fw / 2 - 0.05, ySplit - 0.15, zf, true, 0.18);
      handle(g, 0, yTop + 0.06, zf, false, Math.min(0.3, W * 0.4));
    }
  },
  stove(g, W, D, H, c) {
    const m = mat(c, 0.5, 0.1);
    B(g, W, H - 0.04, D - 0.02, 0, (H - 0.04) / 2, -0.01, m);
    B(g, W, 0.04, D, 0, H - 0.02, 0, mat('#151618', 0.2, 0.1));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const r = C(g, 0.075, 0.075, 0.003, sx * W * 0.22, H + 0.0015, sz * D * 0.2, mat('#3b3d40', 0.5), 28);
      r.castShadow = false;
    }
    B(g, W - 0.08, H * 0.42, 0.006, 0, H * 0.42, (D - 0.02) / 2 - 0.01 + 0.003, mat('#202124', 0.15, 0.2), false);
    handle(g, 0, H * 0.67, (D - 0.02) / 2 - 0.01, false, W * 0.6);
  },
  kitchenWall(g, W, D, H, c, it = {}) {
    const m = mat(c, 0.6), lm = mat(LINE, 0.8), modern = it.handles === false;
    B(g, W - 0.004, H, D, 0, H / 2, 0, m);
    if (modern) {   // подъёмные фасады без ручек, тонкие швы по краям
      for (const sx of [-1, 1]) seamV(g, sx * (W / 2 - 0.003), 0.004, H - 0.004, D / 2, lm);
      seamH(g, -W / 2 + 0.003, W / 2 - 0.003, 0.003, D / 2, lm);
      if (W >= 0.85) seamV(g, 0, 0.005, H - 0.005, D / 2, lm);
      return;
    }
    if (W >= 0.55) seamV(g, 0, 0.005, H - 0.005, D / 2, lm);
    handle(g, W >= 0.55 ? -0.04 : W / 2 - 0.05, 0.08, D / 2, true, 0.12);
    if (W >= 0.55) handle(g, 0.04, 0.08, D / 2, true, 0.12);
  },
  kitchenWallCorner(g, W, D, H, c, it = {}) {
    // верхний угловой: дверца на видимой части справа, слева — глухой угол за соседним рядом шкафов
    const m = mat(c, 0.6), lm = mat(LINE, 0.8);
    B(g, W - 0.004, H, D, 0, H / 2, 0, m);
    const dw = Math.max(0.15, Math.min(W - 0.05, W - D)), xs = W / 2 - dw;
    for (const sx of [-1, 1]) seamV(g, sx * (W / 2 - 0.003), 0.004, H - 0.004, D / 2, lm);
    seamH(g, -W / 2 + 0.003, W / 2 - 0.003, 0.003, D / 2, lm);
    seamV(g, xs, 0.004, H - 0.004, D / 2, lm);
    if (it.handles !== false) handle(g, xs + 0.05, 0.08, D / 2, true, 0.12);
  },
  kitchenTall(g, W, D, H, c, it = {}) {
    const m = mat(c, 0.6), lm = mat(LINE, 0.8), modern = it.handles === false;
    B(g, W - 0.004, 0.1, D - 0.08, 0, 0.05, -0.04, mat(modern ? '#e9e8e4' : '#3a3b3d', 0.8));
    B(g, W - 0.004, H - 0.1, D - 0.02, 0, 0.1 + (H - 0.1) / 2, -0.01, m);
    if (W >= 0.85) seamV(g, 0, 0.105, H - 0.005, D / 2 - 0.02, lm);
    if (modern) for (const sx of [-1, 1]) seamV(g, sx * (W / 2 - 0.003), 0.104, H - 0.004, D / 2 - 0.02, lm);
    if (!modern) {
      seamH(g, -W / 2 + 0.005, W / 2 - 0.005, Math.min(H - 0.3, 1.95), D / 2 - 0.02, lm);
      handle(g, W / 2 - 0.05, 1.1, D / 2 - 0.02, true, 0.3);
      handle(g, W / 2 - 0.05, Math.min(H - 0.15, 2.1), D / 2 - 0.02, true, 0.15);
    }
  },
  fridge(g, W, D, H, c) {
    const m = mat(c, 0.4, 0.15), lm = mat(LINE, 0.8);
    B(g, W, H, D - 0.03, 0, H / 2, -0.015, m);
    B(g, W - 0.006, H - 0.02, 0.03, 0, H / 2 + 0.005, D / 2 - 0.015, m);
    seamH(g, -W / 2, W / 2, H * 0.36, D / 2, lm);
    handle(g, W / 2 - 0.05, H * 0.46, D / 2, true, 0.3);
    handle(g, W / 2 - 0.05, H * 0.24, D / 2, true, 0.2);
  },

  bathtub(g, W, D, H, c) {
    const m = mat(c, 0.25), t = 0.07;
    B(g, W, 0.1, D, 0, 0.05, 0, m);
    B(g, W, H - 0.1, t, 0, 0.1 + (H - 0.1) / 2, -D / 2 + t / 2, m);
    B(g, W, H - 0.1, t, 0, 0.1 + (H - 0.1) / 2, D / 2 - t / 2, m);
    B(g, t, H - 0.1, D - 2 * t, -W / 2 + t / 2, 0.1 + (H - 0.1) / 2, 0, m);
    B(g, t, H - 0.1, D - 2 * t, W / 2 - t / 2, 0.1 + (H - 0.1) / 2, 0, m);
    B(g, W - 2 * t, 0.004, D - 2 * t, 0, 0.102, 0, mat('#e7ecef', 0.2), false);
    C(g, 0.012, 0.012, 0.16, -W / 2 + 0.04, H + 0.08, 0, mat(STEEL, 0.2, 0.9), 10);
  },
  shower(g, W, D, H, c) {
    B(g, W, 0.15, D, 0, 0.075, 0, mat(c, 0.3));
    const glass = mat('#d6e6ee', 0.05, 0, { transparent: true, opacity: 0.25, depthWrite: false });
    const fr = mat(STEEL, 0.3, 0.8);
    B(g, W, H - 0.15, 0.008, 0, 0.15 + (H - 0.15) / 2, D / 2 - 0.004, glass, false);
    B(g, 0.008, H - 0.15, D, W / 2 - 0.004, 0.15 + (H - 0.15) / 2, 0, glass, false);
    B(g, W, 0.02, 0.02, 0, H, D / 2 - 0.01, fr, false);
    B(g, 0.02, 0.02, D, W / 2 - 0.01, H, 0, fr, false);
    C(g, 0.012, 0.012, 1.0, -W / 2 + 0.06, 0.15 + 0.9, -D / 2 + 0.06, fr, 10);
  },
  washbasin(g, W, D, H, c, it = {}) {
    // тумба с дверцами и керамическая столешница со встроенной чашей
    const lm = mat(LINE, 0.8), top = 0.05, plinth = 0.08, zf = D / 2 - 0.02;
    const ceramic = mat('#f7f7f5', 0.18), chrome = fixtureMetal(it.metal, '#d0d3d6');
    const bw = Math.min(W - 0.16, 0.5), bd = Math.min(D - 0.14, 0.34), bz = 0.02, depth = 0.13;
    B(g, W - 0.004, plinth, D - 0.06, 0, plinth / 2, -0.03, mat('#e9e8e4', 0.8));
    const cx = (W - 0.004) / 2, yT = H - top;
    BX(g, -cx, cx, plinth, yT - depth - 0.02, -D / 2, D / 2 - 0.04, mat(c, 0.6));
    BX(g, -cx, cx, yT - depth - 0.02, yT, bz + bd / 2 + 0.01, D / 2 - 0.04, mat(c, 0.6));
    BX(g, -cx, cx, yT - depth - 0.02, yT, -D / 2, bz - bd / 2 - 0.01, mat(c, 0.6));
    BX(g, -cx, -bw / 2 - 0.01, yT - depth - 0.02, yT, bz - bd / 2 - 0.01, bz + bd / 2 + 0.01, mat(c, 0.6));
    BX(g, bw / 2 + 0.01, cx, yT - depth - 0.02, yT, bz - bd / 2 - 0.01, bz + bd / 2 + 0.01, mat(c, 0.6));
    // столешница с вырезом и чаша
    const y = H - top / 2;
    B(g, W, top, bz - bd / 2 + D / 2, 0, y, (-D / 2 + bz - bd / 2) / 2, ceramic);
    B(g, W, top, D / 2 - bz - bd / 2, 0, y, (bz + bd / 2 + D / 2) / 2, ceramic);
    B(g, W / 2 - bw / 2, top, bd, (-W / 2 - bw / 2) / 2, y, bz, ceramic);
    B(g, W / 2 - bw / 2, top, bd, (W / 2 + bw / 2) / 2, y, bz, ceramic);
    const yb = H - top - depth, t = 0.01;
    B(g, bw, t, bd, 0, yb, bz, ceramic, false);
    B(g, bw, depth + top, t, 0, yb + (depth + top) / 2, bz - bd / 2 + t / 2, ceramic, false);
    B(g, bw, depth + top, t, 0, yb + (depth + top) / 2, bz + bd / 2 - t / 2, ceramic, false);
    B(g, t, depth + top, bd, -bw / 2 + t / 2, yb + (depth + top) / 2, bz, ceramic, false);
    B(g, t, depth + top, bd, bw / 2 - t / 2, yb + (depth + top) / 2, bz, ceramic, false);
    C(g, 0.018, 0.018, 0.006, 0, yb + 0.008, bz, chrome, 16);
    // смеситель
    const zr = bz - bd / 2 - 0.04;
    C(g, 0.022, 0.025, 0.16, 0, H + 0.08, zr, chrome, 16);
    B(g, 0.03, 0.025, 0.12, 0, H + 0.15, zr + 0.06, chrome, false);
    B(g, 0.012, 0.012, 0.06, 0, H + 0.19, zr - 0.01, chrome, false);
    // дверцы
    if (W >= 0.7) seamV(g, 0, plinth + 0.005, yT - 0.005, zf, lm);
    for (const sx of [-1, 1]) seamV(g, sx * (cx - 0.001), plinth + 0.004, yT - 0.004, zf, lm);
    if (it.handles !== false) {
      if (W >= 0.7) for (const sx of [-1, 1]) handle(g, sx * 0.04, yT - 0.12, zf, true, 0.12);
      else handle(g, W / 2 - 0.05, yT - 0.12, zf, true, 0.12);
    }
  },
  showerPent(g, W, D, H, c, it = {}) {
    // пятиугольный поддон: угол комнаты сзади слева, срезанный угол спереди справа
    const s = Math.min((it.side || 460) / 1000, W * 0.6, D * 0.6), trayH = 0.15;
    const x0 = -W / 2, x1 = W / 2, z0 = -D / 2, z1 = D / 2;
    const P = [[x0, z0], [x1, z0], [x1, z0 + s], [x0 + s, z1], [x0, z1]];
    const shape = new THREE.Shape(P.map(([x, z]) => new THREE.Vector2(x, -z)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: trayH, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const tray = new THREE.Mesh(geo, mat(c, 0.3));
    tray.castShadow = true; tray.receiveShadow = true;
    g.add(tray);
    // профили стекла — светлый металл; смесители, душ и трап — цвета it.metal (на фото чёрные)
    const chrome = mat('#cfd2d5', 0.2, 0.9), fit = fixtureMetal(it.metal, '#cfd2d5');
    C(g, 0.045, 0.045, 0.004, x0 + 0.2, trayH + 0.002, z0 + 0.2, fit, 20).castShadow = false;
    // стекло: две прямые стенки по 46 см и дверь по диагонали
    const glass = mat('#d4e5ec', 0.05, 0, { transparent: true, opacity: 0.24, depthWrite: false });
    const gTop = Math.min(H, trayH + 2.0);
    const panel = (a, b, thick, mtl, y0, y1) => {
      const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, y1 - y0, thick), mtl);
      m.position.set((a[0] + b[0]) / 2, (y0 + y1) / 2, (a[1] + b[1]) / 2);
      m.rotation.y = Math.atan2(-dz, dx);
      m.castShadow = false;
      g.add(m);
      return m;
    };
    for (const [a, b] of [[P[1], P[2]], [P[2], P[3]], [P[3], P[4]]]) {
      panel(a, b, 0.008, glass, trayH, gTop);
      panel(a, b, 0.016, chrome, gTop - 0.016, gTop);          // профиль сверху
    }
    for (const p of [P[2], P[3]]) C(g, 0.009, 0.009, gTop - trayH, p[0], (trayH + gTop) / 2, p[1], chrome, 10);
    // на задней стене (по фото и развёртке): термостат с изливом в 40 см от угла, над ними ниша,
    // тропический душ на кронштейне из той же стены, ручная лейка на держателе ближе к углу
    const mx = x0 + Math.min(0.4, W * 0.45), wz = z0;
    const disc = (r, t, x, y, z) => { const m = C(g, r, r, t, x, y, z, fit, 24); m.rotation.x = Math.PI / 2; m.castShadow = false; return m; };
    disc(0.075, 0.012, mx + 0.07, 1.2, wz + 0.006);
    disc(0.024, 0.035, mx + 0.07, 1.2, wz + 0.03);
    B(g, 0.026, 0.026, 0.13, mx - 0.12, 1.12, wz + 0.065, fit, false);
    B(g, 0.022, 0.035, 0.024, mx - 0.12, 1.1, wz + 0.12, fit, false);
    B(g, 0.02, 0.02, 0.34, mx, 2.25, wz + 0.17, fit, false);
    C(g, 0.1, 0.1, 0.012, mx, 2.235, wz + 0.34, fit, 32).castShadow = false;
    C(g, 0.016, 0.016, 0.22, x0 + 0.11, 1.17, wz + 0.05, fit, 10);
    B(g, 0.04, 0.03, 0.04, x0 + 0.11, 1.28, wz + 0.02, fit, false);
  },
  dryer(g, W, D, H, c) {
    // электросушка-«лесенка» на стене
    const m = mat(c, 0.25, 0.75), n = Math.max(3, Math.round(H / 0.09));
    const zb = D / 2 - 0.02;
    for (const sx of [-1, 1]) C(g, 0.016, 0.016, H, sx * (W / 2 - 0.016), H / 2, zb, m, 12);
    for (let i = 0; i < n; i++) {
      const bar = C(g, 0.011, 0.011, W - 0.032, 0, 0.03 + (i * (H - 0.06)) / (n - 1), zb, m, 10);
      bar.rotation.z = Math.PI / 2;
    }
    for (const sx of [-1, 1]) for (const y of [0.08, H - 0.08]) B(g, 0.02, 0.02, D - 0.02, sx * (W / 2 - 0.016), y, -0.01, m);
  },
  washer(g, W, D, H, c) {
    const m = mat(c, 0.35);
    B(g, W, H, D, 0, H / 2, 0, m);
    B(g, W - 0.02, 0.1, 0.004, 0, H - 0.06, D / 2 + 0.002, mat('#d9dcdf', 0.4), false);
    const door = C(g, W * 0.3, W * 0.3, 0.03, 0, H * 0.45, D / 2 + 0.012, mat('#c4c8cc', 0.3, 0.5), 36);
    door.rotation.x = Math.PI / 2;
    const glass = C(g, W * 0.22, W * 0.22, 0.034, 0, H * 0.45, D / 2 + 0.014, mat('#2c3238', 0.1, 0.2), 36);
    glass.rotation.x = Math.PI / 2;
  },
  toilet(g, W, D, H, c) {
    const m = mat(c, 0.2);
    const tankD = Math.min(0.2, D * 0.3);
    B(g, W * 0.95, H - 0.4, tankD, 0, 0.4 + (H - 0.4) / 2, -D / 2 + tankD / 2, m);
    const base = C(g, W * 0.3, W * 0.25, 0.4, 0, 0.2, -D / 2 + tankD + (D - tankD) * 0.4, m, 28);
    base.scale.z = 1.5;
    const bowl = C(g, W * 0.5, W * 0.42, 0.06, 0, 0.42, -D / 2 + tankD + (D - tankD) * 0.45, m, 32);
    bowl.scale.z = (D - tankD) / W;
  },
  boiler(g, W, D, H, c) {
    const b = C(g, W / 2, W / 2, H, 0, H / 2, 0, mat(c, 0.35), 32);
    b.scale.z = D / W;
  },
  radiator(g, W, D, H, c) {
    const m = mat(c, 0.4);
    const n = Math.max(3, Math.round(W / 0.08));
    const fw = W / n;
    for (let i = 0; i < n; i++) B(g, fw * 0.75, H, D, -W / 2 + fw * (i + 0.5), H / 2, 0, m);
    B(g, W, 0.04, D * 0.4, 0, 0.05, 0, m);
    B(g, W, 0.04, D * 0.4, 0, H - 0.05, 0, m);
  },
  rug(g, W, D, H, c) {
    const r = B(g, W, Math.max(0.004, H), D, 0, Math.max(0.004, H) / 2, 0, mat(c, 1));
    r.castShadow = false;
    B(g, W - 0.12, 0.002, D - 0.12, 0, Math.max(0.004, H) + 0.001, 0, mat(lighten(c, -0.08), 1), false);
  },
  lamp(g, W, D, H, c) {
    const m = mat(c, 0.5, 0.3);
    C(g, W * 0.4, W * 0.42, 0.03, 0, 0.015, 0, m, 28);
    C(g, 0.012, 0.012, H - 0.3, 0, (H - 0.3) / 2, 0, m, 10);
    const shade = C(g, W * 0.3, W / 2, 0.32, 0, H - 0.16, 0, mat('#f1ebe0', 0.9, 0, { emissive: '#3a3020' }), 32);
    shade.castShadow = false;
  },
  plant(g, W, D, H, c) {
    const potH = Math.min(0.4, H * 0.32);
    C(g, W * 0.32, W * 0.26, potH, 0, potH / 2, 0, mat(c, 0.6), 24);
    const leaf = mat('#5e7f4f', 0.9), leaf2 = mat('#6f9160', 0.9);
    const fh = H - potH;
    const blobs = [[0, 0.55, 0, 0.36], [-0.18, 0.4, 0.1, 0.28], [0.2, 0.42, -0.06, 0.3], [0.05, 0.78, 0.05, 0.26], [-0.08, 0.28, -0.16, 0.24]];
    blobs.forEach(([x, y, z, r], i) => {
      const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r * Math.min(W, 0.7), 1), i % 2 ? leaf : leaf2);
      s.position.set(x * W, potH + y * fh, z * D);
      s.scale.y = 1.15; s.castShadow = true;
      g.add(s);
    });
  },
};

export function buildModel(item) {
  const g = new THREE.Group();
  const fn = BUILD[item.type] || BUILD.box;
  fn(g, item.w * MM, item.d * MM, item.h * MM, item.color || '#cccccc', item);
  return g;
}

// у каких предметов есть столешница (для выбора её цвета в инспекторе)
// мелочи на мебели (техника): с мебелью под собой и рядом не конфликтуют
export const ACCESSORY = new Set(['soundbar', 'turntable', 'monitorCurved']);

export const HAS_TOP = new Set(['kitchenBase', 'sink', 'kitchenDrawers', 'kitchenOven', 'kitchenCorner', 'tvUnit']);
export const TOP_SWATCHES = [['#a27c58', 'Дерево'], ['#c9a77f', 'Светлый дуб'], ['#6f4d36', 'Орех'], ['#ebe7df', 'Белый камень'], ['#b8b4ac', 'Серый камень'], ['#2e2f31', 'Чёрный']];

export function shapeName(type) {
  return (SHAPES.find((s) => s[0] === type) || [type, type])[1];
}
