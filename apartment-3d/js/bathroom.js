// ─────────────────────────────────────────────────────────────────────────────
//  ВАННАЯ (душевая) — по описанию, развёртке стены и фото:
//  справа от входа вдоль стены 144 см: умывальник 52 см, зазор 2 см, душ 89 см в углу.
//  Душ 90×90 с обрезанным углом (вдоль стен по 89 см, спереди 46 + 59 + 46),
//  смеситель и тропический душ чёрные, как на фото.
//  В левом углу стиральная машина 60 см со шкафчиком над ней,
//  электросушка в нише рядом со стиралкой, на уровне шкафчика.
//  Если у тебя иначе — поправь координаты ниже или просто перетащи предметы.
// ─────────────────────────────────────────────────────────────────────────────
import { COORDS, M } from './plan.js';

const { X, Y } = COORDS;

export const BATH_SET = 'bath-v2';
export const BATH_OLD = ['bath-v1'];
const BLACK = '#2b2b2c';     // смесители — матовые чёрные

export function bathItems() {
  const xE = X.bath1;                        // наружная стена
  const yN = Y.bath0, yS = Y.bath1;          // стена у кухни и стена туалета (справа от входа)
  const nicheX0 = X.bath0 + M.shaftW;        // ниша между коробом и наружной стеной
  const common = { set: BATH_SET };
  const shower = 890, washerD = 500, washerW = 600;
  const sinkW = 520, sinkD = 420, gap = 20;
  return [
    // душ в дальнем правом углу: наружная стена + стена туалета
    { ...common, type: 'showerPent', name: 'Душ 90×90', w: shower, d: shower, h: 2150, z: 0, rot: 180,
      x: xE - shower / 2, y: yS - shower / 2, color: '#f6f6f4', metal: BLACK },
    // умывальник справа от входа, в 2 см от душа
    { ...common, type: 'washbasin', name: 'Умывальник 52', w: sinkW, d: sinkD, h: 850, z: 0, rot: 180,
      x: xE - shower - gap - sinkW / 2, y: yS - sinkD / 2, color: '#f2f1ee', metal: BLACK },
    // стиралка у наружной стены, до душа; над ней шкафчик
    { ...common, type: 'washer', name: 'Стиральная машина 60', w: washerW, d: washerD, h: 850, z: 0, rot: 90,
      x: xE - washerD / 2, y: yS - shower - washerW / 2, color: '#f1f2f3' },
    { ...common, type: 'kitchenWall', name: 'Шкафчик над стиралкой', w: washerW, d: 300, h: 700, z: 1350, rot: 90,
      x: xE - 150, y: yS - shower - washerW / 2, color: '#f2f1ee' },
    // электросушка — в нише слева от стиралки, на уровне шкафчика
    { ...common, type: 'dryer', name: 'Электросушка', w: 560, d: 110, h: 520, z: 1620, rot: 0,
      x: (nicheX0 + xE) / 2, y: yN + 55, color: '#cfd2d5' },
  ];
}
