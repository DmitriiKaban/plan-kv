// ─────────────────────────────────────────────────────────────────────────────
//  КУХОННЫЙ ГАРНИТУР — по эскизу и описанию:
//  столешница идёт по всей правой (наружной) стене, от окна до стены ванной,
//  поворачивает и продолжается вдоль стены ванной ещё на 40 см. Дальше —
//  холодильник 60 см в пенале: фасад со всех сторон, левая боковина продолжает
//  стену коридорчика, над холодильником шкафчик.
//
//  Верхние шкафы тоже заходят за угол: над продолжением столешницы, до пенала.
//
//  Высоты: нижние шкафы 91 см вместе со столешницей, фартук 60, верхние 90.
//  Ширины нижних модулей сняты с эскиза по пропорциям — если у тебя другие,
//  поправь числа w ниже и нажми «Поставить заново» в программе.
// ─────────────────────────────────────────────────────────────────────────────
import { COORDS, M } from './plan.js';

const { X, Y } = COORDS;

export const KITCHEN_SET = 'kitchen-v4';
export const KITCHEN_OLD = ['kitchen-v1', 'kitchen-v2', 'kitchen-v3'];   // прежние варианты — заменяются

export const KITCHEN_H = { base: 910, apron: 600, upper: 900 };
const DEPTH = { base: 600, upper: 320, tall: 600 };

export const KITCHEN_STYLE = {
  front: '#a6c6b9',   // мятные нижние фасады
  upper: '#f4ede3',   // кремовые верхние шкафы и пенал
  top: '#a27c58',     // столешница под дерево
  metal: '#45474b',   // графит: мойка, смеситель, ручка духовки, конфорки
};

// нижний ряд вдоль правой стены, от окна к углу
export const KITCHEN_BASE = [
  { type: 'kitchenBase', name: 'Нижний шкаф 40', w: 400 },
  { type: 'kitchenOven', name: 'Духовка и варочная панель 45', w: 600, hob: 450, burners: 3 },   // варочная 45 см на 3 конфорки
  { type: 'kitchenDrawers', name: 'Ящики 60', w: 600 },
  { type: 'sink', name: 'Мойка 44', w: 440 },
];
// угол: 60 см в углу + 40 см продолжения вдоль стены ванной
export const KITCHEN_CORNER = { name: 'Угловой шкаф', run: 400 };
// верхние шкафы вдоль правой стены, от окна; после них планка до углового верхнего шкафа
export const KITCHEN_UPPER = [
  { name: 'Верхний шкаф 40', w: 400 },
  { name: 'Верхний шкаф 60', w: 600 },
  { name: 'Верхний шкаф 60', w: 600 },
  { name: 'Верхний шкаф 60', w: 600 },
];

export function kitchenItems() {
  const wallX = X.kit1;            // правая наружная стена
  const wallY = Y.kit1;            // стена ванной (низ кухни)
  const S = KITCHEN_STYLE, Hh = KITCHEN_H;
  const common = { set: KITCHEN_SET, handles: false };
  const items = [];

  // 1. нижние модули вдоль правой стены, фасадом в комнату
  let y = Y.top;
  for (const m of KITCHEN_BASE) {
    items.push({
      ...common, type: m.type, name: m.name, w: m.w, d: DEPTH.base, h: Hh.base, z: 0, rot: 90,
      x: wallX - DEPTH.base / 2, y: y + m.w / 2, color: S.front, color2: S.top,
      ...(m.type === 'sink' || m.type === 'kitchenOven' ? { metal: S.metal } : {}),
      ...(m.hob ? { hob: m.hob, burners: m.burners } : {}),
    });
    y += m.w;
  }
  // 2. угловой модуль: стоит у стены ванной фасадом к окну, видна дверца 40 см
  const cornerW = DEPTH.base + KITCHEN_CORNER.run;
  items.push({
    ...common, type: 'kitchenCorner', name: KITCHEN_CORNER.name, w: cornerW, d: DEPTH.base, h: Hh.base, z: 0, rot: 180,
    x: wallX - cornerW / 2, y: wallY - DEPTH.base / 2, color: S.front, color2: S.top,
  });
  // 3. холодильник в пенале — от углового модуля до линии стены коридора
  const fridgeW = wallX - cornerW - X.bathOut;
  items.push({
    ...common, type: 'fridgeTall', name: 'Холодильник в пенале', w: fridgeW, d: DEPTH.tall,
    h: Hh.base + Hh.apron + Hh.upper, z: 0, rot: 180,
    x: X.bathOut + fridgeW / 2, y: wallY - DEPTH.tall / 2, color: S.upper,
  });
  // 4. верхние шкафы вдоль правой стены и планка до углового
  const zU = Hh.base + Hh.apron;
  y = Y.top;
  const filler = wallY - DEPTH.upper - Y.top - KITCHEN_UPPER.reduce((s, m) => s + m.w, 0);
  for (const m of [...KITCHEN_UPPER, ...(filler >= 10 ? [{ name: `Планка ${Math.round(filler / 10)}`, w: filler }] : [])]) {
    items.push({
      ...common, type: 'kitchenWall', name: m.name, w: m.w, d: DEPTH.upper, h: Hh.upper, z: zU, rot: 90,
      x: wallX - DEPTH.upper / 2, y: y + m.w / 2, color: S.upper,
    });
    y += m.w;
  }
  // 5. верхний шкаф за углом — над продолжением столешницы, от угла до пенала.
  //    Видна дверца у пенала, часть в углу — глухая, за рядом вдоль правой стены.
  items.push({
    ...common, type: 'kitchenWallCorner', name: 'Верхний угловой шкаф', w: cornerW, d: DEPTH.upper, h: Hh.upper, z: zU, rot: 180,
    x: wallX - cornerW / 2, y: wallY - DEPTH.upper / 2, color: S.upper,
  });
  return items;
}

// Фартук — крупные плиты 120 × 60 под мрамор (по фото): от окна по простенку, вдоль всей правой стены
// и за угол до пенала с холодильником; по высоте — от столешницы до верхних шкафов.
export function kitchenApron() {
  const cornerW = DEPTH.base + KITCHEN_CORNER.run, win = X.kit1 - M.kitPierR;
  return {
    id: 'apron', kind: 'slab', name: 'Фартук', rooms: ['kitchen'], slab: [1200, 600],
    h: [KITCHEN_H.base, KITCHEN_H.base + KITCHEN_H.apron],
    parts: [
      { side: 'N', from: win, to: X.kit1, offset: win },                       // простенок у окна
      { side: 'E', offset: Y.top + 300 },                                      // первый шов в 30 см от окна, как на фото
      { side: 'S', from: X.kit1 - cornerW, to: X.kit1, offset: X.kit1 - cornerW },   // за углом до пенала
    ],
  };
}

// длина вдоль правой стены (с углом) и сама стена — для проверки
export const KITCHEN_RUN = KITCHEN_BASE.reduce((s, m) => s + m.w, 0) + DEPTH.base;
export const KITCHEN_WALL = Y.kit1 - Y.top;
