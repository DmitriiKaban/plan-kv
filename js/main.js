import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PLAN } from './plan.js';
import { Building } from './building.js';
import { CATALOG, SHAPES, SWATCHES, HAS_TOP, TOP_SWATCHES, iconSvg, shapeName, variantsOf } from './catalog.js';
import { kitchenItems, kitchenApron, KITCHEN_SET, KITCHEN_OLD, KITCHEN_H, KITCHEN_RUN, KITCHEN_WALL } from './kitchen.js';
import { bathItems, BATH_SET, BATH_OLD } from './bathroom.js';
import { wcItems, WC_SET, heatingItems, HEAT_SET, bedroomItems, BED_SET, BED_KEEP, BED_ADD, livingItems, LIVING_SET, LIVING_OLD, LIVING_KEEP, LIVING_SINCE, livingDrop, livingFix,
  diningItems, DINING_SET, DINING_KEEP, diningFix, airconItems, AC_SET, tvwallItems, TVWALL_SET, TVWALL_KEEP, TVWALL_DROP, TVWALL_ADD,
  mediaItems, MEDIA_SET, MEDIA_KEEP, mediaDrop, mediaFix, MEDIA_SINCE, studyItems, STUDY_SET, STUDY_OLD,
  chairItems, CHAIRS_SET, boilerItems, BOILER_SET, applianceItems, APPL_SET, hallItems, HALL_SET } from './sets.js';
import { Furniture, newId } from './furniture.js';
import { WalkControls, attachJoystick } from './walk.js';
import { Labels, Measure, Minimap } from './overlay.js';
import { LAMINATE_PRESETS, PLANK_SIZES } from './laminate.js';
import * as Store from './storage.js';
import { drawCoverPreview } from './finishes.js';

const MM = 0.001;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const isTouch = matchMedia('(pointer: coarse)').matches;
if (isTouch) document.body.classList.add('touch');
const isMobile = () => innerWidth <= 760;
const inFrame = (() => { try { return window.top !== window.self; } catch (e) { return true; } })();
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cmVal = (mm) => { const v = Math.round(mm) / 10; return Number.isInteger(v) ? String(v) : v.toFixed(1); };
const cmTxt = (mm) => cmVal(mm).replace('.', ',');
const dimsTxt = (it) => `${cmTxt(it.w)} × ${cmTxt(it.d)} × ${cmTxt(it.h)}`;
const dec = (v, n = 1) => v.toFixed(n).replace('.', ',');
const parseNum = (s) => parseFloat(String(s).replace(',', '.'));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const strip = ({ id, ...rest }) => rest;

// ── состояние ────────────────────────────────────────────────────────────────
const DEFAULTS = {
  laminate: 'oak-natural', plankSize: 'std', plankDir: 'y', wallColor: '#f2efe9', ceiling: PLAN.M.ceiling,
  doors: true, swings: true, dims: true, labels: true, shadows: !isTouch, snap: true, eye: 1600, ghost: false, cut: true,
  tile: true, brick: true, apron: true, wallpaper: true, baseboard: true, cutH: 2000,
};
let state = Store.loadLocal();
if (!state || !Array.isArray(state.layouts) || !state.layouts.length) {
  state = { v: 1, layouts: [{ id: 'l1', name: 'Вариант 1', items: [] }], current: 'l1' };
}
state.settings = { ...DEFAULTS, ...(state.settings || {}) };
for (const l of state.layouts) { l.items = Store.cleanItems(l.items); l.walls = Store.cleanWalls(l.walls); l.id = l.id || newId(); l.name = l.name || 'Вариант'; }
state.wallpapers = Store.cleanUserCovers(state.wallpapers);   // свои обои по фото (картинки — отдельно, см. storage.js)
if (!state.layouts.some((l) => l.id === state.current)) state.current = state.layouts[0].id;
// Встроенная мебель (кухня, ванная) ставится во все варианты один раз. Если её удалить — сама не вернётся.
// Новая версия набора заменяет старые (old) или дополняет их (keep: что уже стоит и, может быть, подвинуто, — остаётся,
// кроме предметов из drop — их новая версия ставит заново; если задан add — добавляются только эти новые предметы;
// fix поправляет то, что осталось от прежней версии, например сдвигает).
const SETS = [
  { id: KITCHEN_SET, old: KITCHEN_OLD, title: 'Кухонный гарнитур', items: kitchenItems },
  { id: BATH_SET, old: BATH_OLD, title: 'Ванная', items: bathItems },
  { id: WC_SET, old: [], title: 'Туалет', items: wcItems },
  { id: HEAT_SET, old: [], title: 'Батареи', items: heatingItems },
  { id: BED_SET, old: [], keep: BED_KEEP, add: BED_ADD, title: 'Спальня', items: bedroomItems },
  { id: LIVING_SET, old: LIVING_OLD, keep: LIVING_KEEP, drop: livingDrop, fix: livingFix, since: LIVING_SINCE, title: 'Гостиная', items: livingItems },
  { id: DINING_SET, old: [], keep: DINING_KEEP, add: [], fix: diningFix, title: 'Стол на кухне', items: diningItems },
  { id: AC_SET, old: [], title: 'Кондиционер', items: airconItems },
  { id: TVWALL_SET, old: [], keep: TVWALL_KEEP, drop: TVWALL_DROP, add: TVWALL_ADD, title: 'Шкаф и тумба под телевизор', items: tvwallItems },
  { id: MEDIA_SET, old: [], keep: MEDIA_KEEP, drop: mediaDrop, fix: mediaFix, since: MEDIA_SINCE, title: 'Стеллаж, панели и техника', items: mediaItems },
  { id: STUDY_SET, old: STUDY_OLD, title: 'Стол у окна в спальне', items: studyItems },
  { id: CHAIRS_SET, old: [], title: 'Стулья к столам', items: chairItems },
  { id: BOILER_SET, old: [], title: 'Бойлер', items: boilerItems },
  { id: APPL_SET, old: [], title: 'Техника на кухне', items: applianceItems },
  { id: HALL_SET, old: [], title: 'Прихожая', items: hallItems },
];
state.sets = state.sets || {};
const vnum = (id) => +(String(id || '').match(/-v(\d+)$/) || [0, 0])[1];   // номер версии набора: 'living-v3' → 3
const setsJustAdded = [], setsUpdated = [];
for (const set of SETS) {
  if (state.sets[set.id]) continue;
  const keep = set.keep || [], prev = [...set.old, ...keep];
  // drop — имена предметов или проверка (it) => bool: такие предметы прежней версии ставятся заново
  const dropIt = typeof set.drop === 'function' ? set.drop : (it) => (set.drop || []).includes(it.name);
  const replaces = prev.some((id) => state.sets[id]) || state.layouts.some((l) => l.items.some((it) => prev.includes(it.set)));
  for (const l of state.layouts) {
    const hadOld = l.items.some((it) => set.old.includes(it.set));
    const dropped = l.items.filter((it) => keep.includes(it.set) && dropIt(it));
    l.items = l.items.filter((it) => !set.old.includes(it.set) && !dropped.includes(it));
    const mine = l.items.filter((it) => it.set === set.id || keep.includes(it.set));
    const from = Math.max(0, ...[...mine, ...dropped].map((it) => vnum(it.set)));
    for (const it of mine) { if (set.fix && keep.includes(it.set)) Object.assign(it, set.fix(it)); it.set = set.id; }
    // набора в варианте ещё не было или стояла старая версия — ставим целиком; если его удалили из варианта — не возвращаем
    if (!mine.length && !dropped.length) { if (!replaces || hadOld) l.items.push(...Store.cleanItems(set.items(l.items))); continue; }
    if (!keep.length) continue;
    // дополнение: заново ставится то, что заменяется (по типу предмета), и то, чего в той версии набора ещё не было;
    // удалённое хозяином не возвращается. Без since — по старому правилу: всё недостающее (или только из add)
    // вид одного предмета (например, стеллаж по чертежу или с ровными полками) считается тем же типом
    const fam = (t) => (variantsOf(t) || [[t]])[0][0];
    const names = new Set(mine.map((it) => it.name)), redo = new Set(dropped.map((it) => fam(it.type)));
    const fresh = (it) => (set.since ? from < vnum(set.since[it.type]) : !set.add || set.add.includes(it.name));
    l.items.push(...Store.cleanItems(set.items(l.items).filter((it) => !names.has(it.name) && (redo.has(fam(it.type)) || fresh(it)))));
  }
  state.sets[set.id] = true;
  (replaces ? setsUpdated : setsJustAdded).push(set.title.toLowerCase());
}
delete state.kitchenV1;
// высота потолка теперь взята с развёртки душевой: старое значение по умолчанию (2600) меняем на 2500
if (!state.ceilingFromDrawing) {
  if (state.settings.ceiling === 2600) state.settings.ceiling = PLAN.M.ceiling;
  state.ceilingFromDrawing = true;
}
const S = state.settings;
const curLayout = () => state.layouts.find((l) => l.id === state.current) || state.layouts[0];

// ── рендер ───────────────────────────────────────────────────────────────────
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = S.shadows;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = false;          // сцена почти статична — тени пересчитываем только при изменениях
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
const SKY = new THREE.Color('#e9edf0');
scene.background = SKY;
scene.fog = new THREE.Fog(SKY, 35, 110);
// мягкое окружение: даёт отражения металлу и ровный рассеянный свет
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.4;

const hemi = new THREE.HemisphereLight('#ffffff', '#ddd6ca', 0.85);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff6ec', 1.7);
sun.castShadow = S.shadows;
sun.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.025;
scene.add(sun, sun.target);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: '#e2e0da', roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.03; ground.receiveShadow = true;
scene.add(ground);

PLAN.FINISHES.push(kitchenApron());              // фартук зависит от гарнитура, поэтому описан в kitchen.js
const building = new Building(scene, PLAN, renderer);
building.finishOn = { tile: S.tile, brick: S.brick, apron: S.apron, wallpaper: S.wallpaper };
building.covers = curLayout().walls;                  // обои, поменянные в этом варианте
for (const u of state.wallpapers) building.setUserCover({ ...u, canvas: null });   // картинки подгрузятся при запуске
building.baseboardOn = S.baseboard;
building.build({ ceiling: S.ceiling, wallColor: S.wallColor, laminate: S.laminate, plankSize: S.plankSize, plankDir: S.plankDir });
building.setFlags({ doors: S.doors, swings: S.swings, ceiling: false });

const B = building.bounds;
const center = new THREE.Vector3((B.x0 + B.x1) / 2 * MM, 0, (B.y0 + B.y1) / 2 * MM);
const sizeW = (B.x1 - B.x0) * MM, sizeH = (B.y1 - B.y0) * MM;
sun.position.set(center.x - 5, 12, center.z - 7);
sun.target.position.copy(center);
Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 40 });
sun.shadow.camera.updateProjectionMatrix();

// ── камеры ───────────────────────────────────────────────────────────────────
const persp = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.05, 400);
const walkCam = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.03, 400);
const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
ortho.up.set(0, 0, -1);
let mode = 'orbit';
let camera = persp;
let needsRender = true;
const requestRender = () => { needsRender = true; };
const shadowsDirty = () => { renderer.shadowMap.needsUpdate = true; needsRender = true; };
shadowsDirty();

// ── мебель, прогулка, подписи ────────────────────────────────────────────────
const furniture = new Furniture(scene, building, { onChange: onFurnitureChange, onSelect });
furniture.snapOn = S.snap;
furniture.showDims = S.dims;

let obstacleCache = null;
const obstacles = () => obstacleCache || (obstacleCache = S.ghost ? building.obstacles : building.obstacles.concat(furniture.walkObstacles()));
const walk = new WalkControls(walkCam, obstacles);
walk.eye = S.eye * MM;
let walkStarted = false;

const labels = new Labels($('#labels'));
const measure = new Measure(scene);
const minimap = new Minimap($('#minimap'), building, furniture);
attachJoystick($('#joystick'), walk);

const ray = new THREE.Raycaster();
ray.params.Line = { threshold: 0.005 };
const ndc = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

// Обработчики указателя регистрируются ДО OrbitControls, чтобы перехватывать перетаскивание мебели
let ptr = null;
let lastTap = null;
canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup', onPointerUp);
canvas.addEventListener('pointercancel', onPointerUp);
canvas.addEventListener('dblclick', (e) => {
  if (mode === 'walk' || measure.active || wallTool.active) return;
  setRay(e);
  if (furniture.pick(ray)) return;               // двойной щелчок по мебели — не телепорт
  walkHere(e);
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

const orbit = new OrbitControls(persp, canvas);
orbit.enableDamping = true; orbit.dampingFactor = 0.09;
orbit.maxPolarAngle = 1.48; orbit.minDistance = 1.5; orbit.maxDistance = 40;
orbit.screenSpacePanning = false;
orbit.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

const planCtl = new OrbitControls(ortho, canvas);
planCtl.enableRotate = false; planCtl.enableDamping = true; planCtl.dampingFactor = 0.12;
planCtl.screenSpacePanning = true; planCtl.zoomToCursor = true;
planCtl.minZoom = 0.6; planCtl.maxZoom = 12;
planCtl.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
planCtl.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN };
planCtl.enabled = false;

let planViewH = 10;
function updateOrtho() {
  const a = innerWidth / innerHeight;
  ortho.left = (-planViewH * a) / 2; ortho.right = (planViewH * a) / 2;
  ortho.top = planViewH / 2; ortho.bottom = -planViewH / 2;
  ortho.updateProjectionMatrix();
}

// ширина экрана, не закрытая панелью (на компьютере панель справа)
const visibleW = () => innerWidth - (!isMobile() && app.classList.contains('panel-open') ? 384 : 0);

function fitOrbit() {
  const vf = THREE.MathUtils.degToRad(persp.fov);
  const a = visibleW() / innerHeight;
  const hf = 2 * Math.atan(Math.tan(vf / 2) * a);
  const elev = 0.93;                                      // ~53° над горизонтом
  const effH = sizeH * Math.sin(elev) + 2.6 * Math.cos(elev);
  const dist = Math.max((sizeW / 2) / Math.tan(hf / 2), (effH / 2) / Math.tan(vf / 2)) * (isMobile() ? 1.14 : 1.2);
  orbit.target.copy(center);
  persp.position.set(center.x + dist * 0.04, dist * Math.sin(elev), center.z + dist * Math.cos(elev));
  orbit.update();
  requestRender();
}
function fitPlan() {
  const a = visibleW() / innerHeight;
  planViewH = Math.max(sizeH * (isMobile() ? 1.32 : 1.16), (sizeW * 1.08) / a);
  ortho.zoom = 1;
  updateOrtho();
  planCtl.target.copy(center);
  ortho.position.set(center.x, 60, center.z);
  ortho.lookAt(center);
  planCtl.update();
  requestRender();
}

function applyViewOffset() {
  const w = innerWidth, h = innerHeight;
  const off = !isMobile() && app.classList.contains('panel-open') ? 190 : 0;
  for (const cam of [persp, ortho]) {
    if (off) cam.setViewOffset(w, h, off, 0, w, h); else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  }
  requestRender();
}

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  persp.aspect = w / h; walkCam.aspect = w / h;
  walkCam.fov = w / h < 0.8 ? 78 : 70;
  persp.updateProjectionMatrix(); walkCam.updateProjectionMatrix();
  updateOrtho();
  applyViewOffset();
  requestRender();
}
addEventListener('resize', resize);
resize();
fitOrbit();
fitPlan();

// ── режимы ───────────────────────────────────────────────────────────────────
function setMode(m) {
  if (m === mode && camera) { /* повторное нажатие — без изменений */ }
  mode = m;
  app.dataset.mode = m;
  orbit.enabled = m === 'orbit';
  planCtl.enabled = m === 'plan';
  walk.enabled = m === 'walk';
  camera = m === 'orbit' ? persp : m === 'plan' ? ortho : walkCam;
  building.setFlags({ ceiling: m === 'walk' });
  if (m !== 'walk') building.fadeDoors(null);
  furniture.setOutlineOnTop(m === 'plan');
  sun.shadow.intensity = m === 'plan' ? 0 : 1;   // на плане тени только мешают
  hemi.intensity = m === 'walk' ? 0.7 : 0.85;
  applyCut();
  $$('.modes button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === m)));
  if (m === 'walk' && !walkStarted) {
    walk.setPose(PLAN.START.x * MM, PLAN.START.y * MM, PLAN.START.yaw);
    walkStarted = true;
  }
  if (m === 'walk') { walk.apply(); updateRoomChip(); if (isMobile() && furniture.selectedId) furniture.select(null); }
  if (measure.active) measure.cancel();
  if (m === 'plan' && wallTool.active) toggleWallTool(false);
  requestRender();
}
// срез стен в обзоре: на заданной высоте; если она не ниже потолка — стены целиком
function applyCut() {
  building.setCut(mode === 'orbit' && S.cut && S.cutH < S.ceiling ? S.cutH : null);
  $('#tCut').setAttribute('aria-pressed', String(!!S.cut));
  requestRender();
}

function walkHere(e) {
  const p = floorPoint(e, 0);
  if (!p) return;
  const room = building.roomAt(p.x / MM, p.z / MM);
  if (!room) { toast('Нажмите дважды на пол внутри квартиры'); return; }
  const d = new THREE.Vector3();
  camera.getWorldDirection(d);
  if (mode === 'plan') d.set(0, 0, -1);
  const yaw = Math.atan2(d.x, -d.z);
  walkStarted = true;
  setMode('walk');
  walk.setPose(p.x, p.z, yaw);
  updateRoomChip();
}

function updateRoomChip() {
  const r = building.roomAt(walk.pos.x / MM, walk.pos.z / MM);
  const chip = $('#roomChip');
  const t = r ? r.name : '';
  if (chip.textContent !== t) chip.textContent = t;
}

// ── указатель ────────────────────────────────────────────────────────────────
function setRay(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
}
function floorPoint(e, h = 0) {
  setRay(e);
  plane.constant = -h;
  const p = new THREE.Vector3();
  return ray.ray.intersectPlane(plane, p) ? p : null;
}
function measureHit(e) {
  if (mode === 'plan') { const p = floorPoint(e, 0); if (p) p.y = 0.012; return p; }
  setRay(e);
  const hits = ray.intersectObjects([...building.pickables, ...furniture.group.children], true)
    .filter((h) => h.object.isMesh && h.object.material !== furniture.redTint && building.hitVisible(h));
  return hits.length ? hits[0].point.clone() : null;
}

function onPointerDown(e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  if (ptr) { ptr.multi = true; return; }        // второй палец — это жест камеры, не нажатие
  const base = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  if (measure.active || wallTool.active) {
    ptr = { ...base, kind: measure.active ? 'measure' : 'wall' };
    if (mode === 'walk') { walk.lookStart(e); canvas.setPointerCapture(e.pointerId); }
    return;
  }
  setRay(e);
  const it = furniture.pick(ray);
  const canDrag = it && (it.id === furniture.selectedId || (mode !== 'walk' && !(it.type === 'rug' || it.h < 30)));
  if (canDrag) {
    const fp = floorPoint(e, (it.z || 0) * MM);
    if (fp) {
      ptr = { ...base, kind: 'drag', item: it.id, dx: it.x - fp.x / MM, dy: it.y - fp.z / MM };
      orbit.enabled = false; planCtl.enabled = false;
      canvas.setPointerCapture(e.pointerId);
      if (furniture.selectedId !== it.id) furniture.select(it.id);
      app.classList.add('grabbing');
      return;
    }
  }
  ptr = { ...base, kind: mode === 'walk' ? 'look' : 'cam', item: it ? it.id : null };
  if (mode === 'walk') { walk.lookStart(e); canvas.setPointerCapture(e.pointerId); }
}

let hoverQueued = null;
function onPointerMove(e) {
  if (ptr && e.pointerId === ptr.id) {
    if (!ptr.moved && Math.hypot(e.clientX - ptr.x, e.clientY - ptr.y) > (e.pointerType === 'mouse' ? 4 : 8)) ptr.moved = true;
    if (ptr.kind === 'drag') {
      if (!ptr.moved) return;
      const it = furniture.byId(ptr.item);
      if (!it) return;
      const fp = floorPoint(e, (it.z || 0) * MM);
      if (!fp) return;
      const rx = fp.x / MM + ptr.dx, ry = fp.z / MM + ptr.dy;
      const [x, y] = e.altKey ? [Math.round(rx), Math.round(ry)] : furniture.snap(it, rx, ry);
      if (x !== it.x || y !== it.y) { furniture.update(it.id, { x, y }, false); requestRender(); }
    } else if (mode === 'walk' && (ptr.kind === 'look' || ptr.kind === 'measure' || ptr.kind === 'wall')) {
      if (walk.lookMove(e)) requestRender();
    }
    return;
  }
  if (!ptr && e.pointerType === 'mouse') {
    if (!hoverQueued) requestAnimationFrame(() => { hover(hoverQueued); hoverQueued = null; });
    hoverQueued = e;
  }
}
function hover(e) {
  if (!e) return;
  if (measure.active) { measure.hover(measureHit(e)); requestRender(); return; }
  if (wallTool.active) { hoverWall(e); return; }
  if (mode === 'walk') { app.classList.remove('grab'); return; }
  setRay(e);
  const it = furniture.pick(ray);
  app.classList.toggle('grab', !!it && !(it.type === 'rug' && it.id !== furniture.selectedId));
}

function onPointerUp(e) {
  if (!ptr || e.pointerId !== ptr.id) return;
  const p = ptr; ptr = null;
  orbit.enabled = mode === 'orbit'; planCtl.enabled = mode === 'plan';
  app.classList.remove('grabbing');
  if (mode === 'walk') walk.lookEnd(e);
  try { canvas.releasePointerCapture(e.pointerId); } catch (err) { /* уже отпущен */ }
  if (e.type === 'pointercancel') { if (p.kind === 'drag' && p.moved) commitHistory(); return; }
  if (p.kind === 'drag') { if (p.moved) commitHistory(); return; }
  if (p.moved || p.multi) return;
  // короткое нажатие
  if (p.kind === 'measure') {
    const hit = measureHit(e);
    if (hit) { measure.click(hit); requestRender(); }
    return;
  }
  if (p.kind === 'wall') { tapWall(e); return; }
  if (p.item) { furniture.select(p.item); return; }
  const now = performance.now();
  if (lastTap && now - lastTap.t < 340 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30 && mode !== 'walk' && e.pointerType !== 'mouse') {
    lastTap = null; walkHere(e); return;
  }
  lastTap = { t: now, x: e.clientX, y: e.clientY };
  if (furniture.selectedId) furniture.select(null);
}

$('#minimap').addEventListener('click', (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  if (!minimap.T) return;
  const [x, y] = minimap.toPlan(e.clientX - r.left, e.clientY - r.top);
  if (!building.roomAt(x, y)) return;
  walk.setPose(x * MM, y * MM, walk.yaw, walk.pitch);
  updateRoomChip(); requestRender();
});

// ── мебель: изменения и история ──────────────────────────────────────────────
const hist = { stack: [], idx: -1 };
// мебель (с идентификаторами — чтобы после отмены выделение не перескакивало) и обои варианта
function snapshot() { return JSON.stringify({ i: furniture.items, w: curLayout().walls || {} }); }
function resetHistory() { hist.stack = [snapshot()]; hist.idx = 0; updateUndo(); }
function commitHistory() {
  const s = snapshot();
  if (hist.stack[hist.idx] === s) { persist(); return; }
  hist.stack = hist.stack.slice(0, hist.idx + 1);
  hist.stack.push(s);
  if (hist.stack.length > 150) hist.stack.shift();
  hist.idx = hist.stack.length - 1;
  persist(); updateUndo(); renderList(); renderLayouts(); fillInspector();
}
function restore(idx) {
  hist.idx = idx;
  const sel = furniture.selectedId, snap = JSON.parse(hist.stack[idx]), l = curLayout();
  furniture.setItems(snap.i);
  if (JSON.stringify(l.walls || {}) !== JSON.stringify(snap.w || {})) { l.walls = snap.w || {}; building.setCovers(l.walls); renderWallCard(); }
  if (sel && furniture.byId(sel)) furniture.select(sel); else furniture.select(null);
  obstacleCache = null;
  persist(); updateUndo(); renderList(); renderLayouts(); shadowsDirty();
}
const undo = () => { if (hist.idx > 0) restore(hist.idx - 1); };
const redo = () => { if (hist.idx < hist.stack.length - 1) restore(hist.idx + 1); };
function updateUndo() {
  $('#tUndo').disabled = hist.idx <= 0;
  $('#tRedo').disabled = hist.idx >= hist.stack.length - 1;
}

function onFurnitureChange(commit) {
  obstacleCache = null;
  shadowsDirty();
  if (commit) commitHistory();
  else fillInspector();
}
function onSelect(it) {
  const ins = $('#inspector');
  if (!it) ins.hidden = true;
  else {
    ins.hidden = false;
    fillInspector(it, true);
    if (isMobile()) setPanel(false);
  }
  renderList();
  requestRender();
}

let saveTimer = 0;
function saveNow() {
  clearTimeout(saveTimer); saveTimer = 0;
  if (!Store.saveLocal(state) && !persist.warned) { persist.warned = true; toast('Браузер не даёт сохранять — расстановка пропадёт после перезагрузки. Скачайте файл.'); }
}
function persist() {
  curLayout().items = furniture.items.map(strip);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 250);
}
// закрыли или свернули вкладку — сохраняем сразу, не дожидаясь таймера
addEventListener('pagehide', () => { if (saveTimer) saveNow(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && saveTimer) saveNow(); });

function placementPoint() {
  let x, y;
  if (mode === 'walk') { const f = walk.forward(); x = (walk.pos.x + f.x * 1.3) / MM; y = (walk.pos.z + f.z * 1.3) / MM; }
  else { const t = mode === 'plan' ? planCtl.target : orbit.target; x = t.x / MM; y = t.z / MM; }
  if (!building.roomAt(x, y) || building.roomAt(x, y).small) { const r = building.rooms.find((q) => q.id === 'living'); [x, y] = r.label; }
  return [Math.round(x / 10) * 10, Math.round(y / 10) * 10];
}

function addItem(data) {
  const [x, y] = placementPoint();
  const probe = { id: '__probe', rot: 0, z: 0, ...data, x, y };
  const [sx, sy] = furniture.snap(probe, x, y);
  const it = furniture.add({ ...data, z: data.z || 0, rot: 0, x: sx, y: sy });
  if (isMobile()) setPanel(false);
  toast(`«${it.name}» на плане — перетащите на место`);
  return it;
}

// ── инспектор ────────────────────────────────────────────────────────────────
function fillInspector(it = furniture.selected, force = false) {
  if (!it) return;
  const set = (sel, v) => { const el = $(sel); if (force || document.activeElement !== el) el.value = v; };
  set('#insName', it.name);
  set('#insW', cmVal(it.w)); set('#insD', cmVal(it.d)); set('#insH', cmVal(it.h)); set('#insZ', cmVal(it.z || 0));
  set('#insRot', Math.round(it.rot));
  const room = building.roomAt(it.x, it.y);
  const msgs = furniture.conflicts.get(it.id) || [];
  $('#insStatus').innerHTML = `${esc(room ? room.name : 'Вне комнат')}, ${dimsTxt(it)} см` +
    msgs.map((m) => `<span class="${m.kind === 'door' ? 'door' : 'bad'}">${esc(cap(m.text))}</span>`).join('');
  $$('#insColors button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === it.color)));
  $('#insTopRow').hidden = !HAS_TOP.has(it.type);
  // вид предмета (например, стеллаж: по чертежу, зеркально, ровные полки)
  const vars = variantsOf(it.type);
  $('#insVarRow').hidden = !vars;
  if (vars) $('#insVar').innerHTML = vars.map(([t, n, hint]) => `<button data-t="${t}" title="${esc(hint || n)}" aria-pressed="${t === it.type}">${esc(n)}</button>`).join('');
  $$('#insTop button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === (it.color2 || '#cfc6b8'))));
  const ci = $('#insColors input'); if (ci && document.activeElement !== ci) ci.value = it.color;
}

function bindInspector() {
  const sel = () => furniture.selected;
  $('#insName').addEventListener('input', (e) => { const it = sel(); if (it) { it.name = e.target.value || 'Предмет'; renderList(); } });
  $('#insName').addEventListener('change', () => commitHistory());
  const dims = [['#insW', 'w', 10], ['#insD', 'd', 10], ['#insH', 'h', 1], ['#insZ', 'z', 0]];
  for (const [id, key, min] of dims) {
    const el = $(id);
    const apply = (commit) => {
      const it = sel(); if (!it) return;
      const v = parseNum(el.value);
      if (!Number.isFinite(v) || v * 10 < min || v > 2000) return;
      const mm = Math.round(v * 10);
      if (mm === it[key] && !commit) return;
      furniture.update(it.id, { [key]: mm }, commit);
      furniture.reselect();
    };
    el.addEventListener('input', () => apply(false));
    el.addEventListener('change', () => { apply(true); fillInspector(sel(), true); });
  }
  $$('.ins-rot [data-rot]').forEach((b) => b.addEventListener('click', () => rotateSel(+b.dataset.rot)));
  $('#insRot').addEventListener('change', (e) => {
    const it = sel(); const v = parseNum(e.target.value);
    if (it && Number.isFinite(v)) furniture.update(it.id, { rot: ((v % 360) + 360) % 360 });
  });
  const colors = $('#insColors');
  colors.innerHTML = SWATCHES.map((c) => `<button data-c="${c}" style="background:${c}" aria-label="Цвет ${c}"></button>`).join('') + '<input type="color" aria-label="Свой цвет">';
  colors.addEventListener('click', (e) => { const b = e.target.closest('button'); const it = sel(); if (b && it) furniture.update(it.id, { color: b.dataset.c }); furniture.reselect(); });
  const tops = $('#insTop');
  tops.innerHTML = TOP_SWATCHES.map(([c, n]) => `<button data-c="${c}" style="background:${c}" title="${n}" aria-label="Столешница: ${n}"></button>`).join('');
  tops.addEventListener('click', (e) => { const b = e.target.closest('button'); const it = sel(); if (b && it) furniture.update(it.id, { color2: b.dataset.c }); });
  $('#insVar').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-t]'), it = sel();
    if (!b || !it || b.dataset.t === it.type) return;
    furniture.update(it.id, { type: b.dataset.t }); furniture.reselect();
    toast(`${it.name}: ${b.textContent.toLowerCase()}`);
  });
  const ci = colors.querySelector('input');
  ci.addEventListener('input', () => { const it = sel(); if (it) { furniture.update(it.id, { color: ci.value }, false); furniture.reselect(); } });
  ci.addEventListener('change', () => commitHistory());
  $$('.pad [data-nudge]').forEach((b) => b.addEventListener('click', () => nudge(b.dataset.nudge, +$('#nudgeStep').value)));
  $('#insDup').addEventListener('click', () => { const it = sel(); if (it) { furniture.duplicate(it.id); toast('Копия добавлена рядом'); } });
  $('#insDel').addEventListener('click', () => { const it = sel(); if (it) { furniture.remove(it.id); toast(`«${it.name}» удалён. Ctrl+Z или ↶ — вернуть`); } });
  $('#insClose').addEventListener('click', () => furniture.select(null));
}

function rotateSel(delta) {
  const it = furniture.selected; if (!it) return;
  let r = it.rot + delta;
  if (Math.abs(delta) === 90) r = Math.round(r / 90) * 90;
  furniture.update(it.id, { rot: ((r % 360) + 360) % 360 });
}

function nudge(dir, step) {
  const it = furniture.selected; if (!it) return;
  const f = new THREE.Vector3();
  if (mode === 'plan') f.set(0, 0, -1); else { camera.getWorldDirection(f); f.y = 0; }
  if (f.lengthSq() < 1e-6) f.set(0, 0, -1);
  let fx = 0, fz = 0;
  if (Math.abs(f.x) > Math.abs(f.z)) fx = Math.sign(f.x); else fz = Math.sign(f.z);
  const rx = -fz, rz = fx;
  const v = { up: [fx, fz], down: [-fx, -fz], right: [rx, rz], left: [-rx, -rz] }[dir];
  furniture.update(it.id, { x: it.x + v[0] * step, y: it.y + v[1] * step });
}

// ── панель: каталог, список, настройки ───────────────────────────────────────
function setPanel(open, tab) {
  app.classList.toggle('panel-open', open);
  $('#btnPanel').setAttribute('aria-expanded', String(open));
  if (tab) setTab(tab);
  applyViewOffset();
}
function setTab(tab) {
  $$('.tabs [data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  $$('.tab-body').forEach((el) => { el.hidden = el.dataset.tab !== tab; });
}

// модули встроенных наборов как отдельные пресеты — чтобы добавить ещё один такой же
const presetsOf = (set) => {
  const seen = new Set();
  return set.items().filter((it) => { const k = it.type + it.w + it.h; if (seen.has(k)) return false; seen.add(k); return true; })
    .map(({ x, y, rot, set: _s, ...rest }) => rest);
};
let catalogGroups = [];

function placeSet(set) {
  const keep = furniture.items.filter((it) => it.set !== set.id && !set.old.includes(it.set) && !(set.keep || []).includes(it.set));
  const had = keep.length !== furniture.items.length;
  furniture.select(null);
  furniture.setItems([...keep, ...set.items(keep).map((it) => ({ id: newId(), ...it }))]);   // набор встаёт возле остальной мебели
  commitHistory(); shadowsDirty();
  const n = [...furniture.conflicts.keys()].filter((id) => furniture.byId(id)?.set === set.id).length;
  const clash = n === 1 ? '1 предмет задевает другую мебель' : `${n} ${n < 5 ? 'предмета задевают' : 'предметов задевают'} другую мебель`;
  toast(`${set.title}: ${had ? 'поставлено заново' : 'поставлено'}` + (n ? `, но ${clash} — она подсвечена красным` : ''));
  if (isMobile()) setPanel(false);
}

function renderSetCard() {
  const fits = KITCHEN_RUN <= KITCHEN_WALL;
  // что расставлено по описаниям: коротко, по строке на набор
  const info = {
    [KITCHEN_SET]: { sw: ['#f4ede3', '#a27c58', '#a6c6b9'],
      text: `Угол ${cmTxt(KITCHEN_RUN)} + 40 см${fits ? '' : `, длиннее стены ${cmTxt(KITCHEN_WALL)}`}, пенал с холодильником, верхние шкафы за угол` },
    [BATH_SET]: { sw: ['#d9d5cf', '#f6f6f4', '#2b2b2c'], text: 'Умывальник 52 и душ 90×90 справа, стиралка, сушка' },
    [WC_SET]: { sw: ['#d9d5cf', '#f6f6f4', '#f6f6f4'], text: 'Унитаз в 30 см от дальней стены' },
    [HEAT_SET]: { sw: ['#f4f4f2', '#f3f3f0', '#c8372a'], text: 'Кухня 4, гостиная 12, спальня 9 секций, трубы у стояков' },
    [BED_SET]: { sw: ['#d3ccc2', '#ebe7e0', '#c9a27a'], text: 'Кровать 170 × 214 поперёк комнаты, тумбочки и бра по бокам, шкаф-купе 140 справа от входа' },
    [LIVING_SET]: { sw: ['#8c8b6a', '#b5814f', '#1e1e20'], text: 'Диван 215 у стены спальни, рабочий стол 130 у левой стены возле окна' },
    [DINING_SET]: { sw: ['#a27c58', '#fbfaf6', '#b8955a'], text: 'Стол 80 × 80 в углу, в 20 см от окна, над ним бра с шариками 40 см' },
    [AC_SET]: { sw: ['#f7f7f5', '#e9e9e6', '#3a3d40'], text: 'В прихожей под потолком, между дверью в гостиную и углом спальни' },
    [TVWALL_SET]: { sw: ['#e7e0d6', '#6f4d36', '#1c1d1f'], text: 'По чертежу, 3,6 м вдоль левой стены гостиной от угла: шкаф 90, тумба 268, полки внутри 45, телевизор' },
    [MEDIA_SET]: { sw: ['#6f4d36', '#1c1c1d', '#1b1c1e'], text: 'Стеллаж 35 по чертежу между тумбой и столом, рейки у телевизора, саундбар, проигрыватель, монитор' },
    [STUDY_SET]: { sw: ['#f1f1ee', '#cfb38e', '#4a4642'], text: 'Глубина 50 см, столешница — продолжение подоконника; по бокам шкафы 30 и полки для цветов 17, внизу ящики' },
    [CHAIRS_SET]: { sw: ['#1d1e20', '#3a3c3f', '#9a9ea3'], text: 'Кресло с подголовником — за рабочий стол в гостиной, компьютерный стул — к столу у окна в спальне' },
    [BOILER_SET]: { sw: ['#f4f4f2', '#dfe1e2', '#4fb6ff'], text: '⌀38,5 × 77 на стене за унитазом, низ на 1,45 м' },
    [APPL_SET]: { sw: ['#c3c7cb', '#f4f4f2', '#111214'], text: 'Чайник слева от плиты, микроволновка на угловой столешнице у холодильника' },
    [HALL_SET]: { sw: ['#c9c2b8', '#cfb48e', '#1b1c1d'], text: 'Domenica справа от входа: тумба 1D и вешалка над ней, комод 2D1S и зеркало над ним' },
  };
  $('#setCard').innerHTML = `<h3>Расставлено по твоим описаниям</h3>` + SETS.map((set, i) => {
    const c = info[set.id] || { sw: ['#eee', '#ddd', '#ccc'], text: '' };
    return `
    <div class="set-card">
      <div class="set-sw" aria-hidden="true">${c.sw.map((col) => `<i style="background:${col}"></i>`).join('')}</div>
      <div class="set-text"><b>${esc(set.title)}</b><small>${esc(c.text)}</small></div>
      <button class="btn" data-set="${i}" type="button" title="Поставить заново: ${esc(set.title.toLowerCase())}">Заново</button>
    </div>`;
  }).join('');
  $$('#setCard [data-set]').forEach((b) => b.addEventListener('click', () => placeSet(SETS[+b.dataset.set])));
}

function renderCatalog() {
  renderSetCard();
  catalogGroups = [{ group: 'Модули кухни', items: presetsOf(SETS[0]) }, { group: 'Ванная по описанию', items: presetsOf(SETS[1]) },
    { group: 'Остальное по описанию', items: SETS.slice(2).flatMap(presetsOf) }, ...CATALOG];
  $('#catalog').innerHTML = catalogGroups.map((g, gi) => `<div class="cat-group"><h3>${esc(g.group)}</h3>${g.items.map((it, ii) =>
    `<button class="cat-item" data-g="${gi}" data-i="${ii}" title="Добавить: ${esc(it.name)}">${iconSvg(it.type)}<span><b>${esc(it.name)}</b><small>${dimsTxt(it)} см${it.z ? `, на высоте ${cmTxt(it.z)}` : ''}</small></span><span class="plus"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span></button>`).join('')}</div>`).join('');
  $('#catalog').addEventListener('click', (e) => {
    const b = e.target.closest('.cat-item'); if (!b) return;
    const p = catalogGroups[+b.dataset.g].items[+b.dataset.i];
    addItem({ ...p, z: p.z || 0 });
  });
  // быстрое добавление по размерам
  const shapeSel = $('#qaShape');
  shapeSel.innerHTML = SHAPES.map(([t, n]) => `<option value="${t}">${esc(n)}</option>`).join('');
  shapeSel.value = 'sofa';
  const presetOf = (t) => CATALOG.flatMap((g) => g.items).find((i) => i.type === t) || { w: 1000, d: 500, h: 700, color: '#9db2c6' };
  const fillDefaults = () => {
    const p = presetOf(shapeSel.value);
    $('#qaW').placeholder = cmVal(p.w); $('#qaD').placeholder = cmVal(p.d); $('#qaH').placeholder = cmVal(p.h);
  };
  shapeSel.addEventListener('change', fillDefaults);
  fillDefaults();
  $('#quickAdd').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = shapeSel.value, p = presetOf(t);
    const val = (id) => { const el = $(id); const v = parseNum(el.value || el.placeholder); return Number.isFinite(v) && v > 0 ? Math.round(v * 10) : null; };
    const w = val('#qaW'), d = val('#qaD'), h = val('#qaH');
    if (!w || !d || !h) { toast('Впишите ширину, глубину и высоту в сантиметрах'); return; }
    const name = $('#qaName').value.trim() || shapeName(t);
    addItem({ type: t, name, w, d, h, z: p.z || 0, color: p.color });
    $('#qaName').value = ''; $('#qaW').value = ''; $('#qaD').value = ''; $('#qaH').value = '';
  });
  // в форме required мешает подставлять значения-подсказки
  for (const id of ['#qaW', '#qaD', '#qaH']) $(id).required = false;
}

function renderList() {
  const items = furniture.items;
  $('#itemCount').textContent = items.length ? String(items.length) : '';
  const list = $('#itemList');
  if (!items.length) {
    list.innerHTML = '<p class="empty">Пока пусто. Выберите мебель на вкладке «Добавить» или впишите размеры с ценника.</p>';
    return;
  }
  const groups = new Map();
  for (const r of building.rooms) groups.set(r.id, { name: r.name, items: [] });
  groups.set('_', { name: 'Вне комнат', items: [] });
  for (const it of items) { const r = building.roomAt(it.x, it.y); groups.get(r ? r.id : '_').items.push(it); }
  let html = '';
  for (const g of groups.values()) {
    if (!g.items.length) continue;
    html += `<div class="room-group"><h4>${esc(g.name)} <span>${g.items.length}</span></h4>`;
    for (const it of g.items) {
      const bad = furniture.conflicts.get(it.id);
      html += `<button class="li${it.id === furniture.selectedId ? ' sel' : ''}" data-id="${it.id}"><i class="sw" style="background:${esc(it.color)}"></i><span><b>${esc(it.name)}</b>${bad ? `<span class="warn">${esc(cap(bad[0].text))}</span>` : ''}</span><small>${dimsTxt(it)}</small></button>`;
    }
    html += '</div>';
  }
  list.innerHTML = html;
}

function renderLayouts() {
  $('#layoutSel').innerHTML = state.layouts.map((l) => `<option value="${l.id}"${l.id === state.current ? ' selected' : ''}>${esc(l.name)} (${l.items.length})</option>`).join('');
  $('#layoutDel').disabled = state.layouts.length < 2;
}
function switchLayout(id, saveCurrent = true) {
  if (saveCurrent) persist();
  state.current = id;
  furniture.select(null);
  furniture.setItems(curLayout().items.map((it) => ({ id: newId(), ...it })));
  building.setCovers(curLayout().walls);
  obstacleCache = null;
  resetHistory(); renderList(); renderLayouts(); persist(); shadowsDirty(); renderWallCard();
}
function addLayout(name, items, walls = {}) {
  const l = { id: newId(), name: name.slice(0, 40), items: Store.cleanItems(items), walls: Store.cleanWalls(walls) };
  state.layouts.push(l);
  switchLayout(l.id);
  return l;
}

function lamPreview(cv, p) {
  const ctx = cv.getContext('2d');
  const w = cv.width = 160, h = cv.height = 60;
  const rows = 4, rh = h / rows;
  let seed = p.id.length * 31;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let r = 0; r < rows; r++) {
    const off = rnd() * 80;
    for (let x = -off; x < w; x += 110) {
      ctx.fillStyle = p.base; ctx.globalAlpha = 1; ctx.fillRect(x, r * rh, 110, rh);
      ctx.globalAlpha = 0.18 + rnd() * 0.12; ctx.fillStyle = rnd() < 0.5 ? p.dark : p.light; ctx.fillRect(x, r * rh, 110, rh);
      ctx.globalAlpha = 0.35; ctx.strokeStyle = p.dark;
      for (let i = 0; i < 5; i++) { const y = r * rh + 2 + rnd() * (rh - 4); ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 30, y + 2, x + 70, y - 2, x + 110, y + 1); ctx.lineWidth = 0.6; ctx.stroke(); }
      ctx.globalAlpha = 0.5; ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x, r * rh, 1, rh); ctx.fillRect(x, r * rh, 110, 0.8);
    }
  }
  ctx.globalAlpha = 1;
}

const WALL_COLORS = [['#f2efe9', 'Тёплый белый'], ['#f6f6f4', 'Белый'], ['#e0e1de', 'Светло-серый'], ['#d9d0c4', 'Грейж'], ['#cdd5c8', 'Шалфей'], ['#cfd9e0', 'Серо-голубой'], ['#e7d7c3', 'Песочный'], ['#9aa3a8', 'Графит светлый']];

function renderSettings() {
  $('#lamList').innerHTML = LAMINATE_PRESETS.map((p) => `<button data-id="${p.id}" aria-pressed="${p.id === S.laminate}"><canvas></canvas><span>${esc(p.name)}</span></button>`).join('');
  $$('#lamList button').forEach((b) => lamPreview(b.querySelector('canvas'), LAMINATE_PRESETS.find((p) => p.id === b.dataset.id)));
  $('#lamList').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    S.laminate = b.dataset.id; building.setLaminate(S.laminate, S.plankSize);
    $$('#lamList button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    savePrefs();
  });
  $('#plankSize').innerHTML = PLANK_SIZES.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  $('#plankSize').value = S.plankSize;
  $('#plankSize').addEventListener('change', (e) => { S.plankSize = e.target.value; building.setLaminate(S.laminate, S.plankSize); savePrefs(); });
  const dirBtns = $$('#plankDir button');
  const syncDir = () => dirBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.dir === S.plankDir)));
  dirBtns.forEach((b) => b.addEventListener('click', () => { S.plankDir = b.dataset.dir; building.setPlankDir(S.plankDir); syncDir(); savePrefs(); }));
  syncDir();

  const wc = $('#wallColors');
  wc.innerHTML = WALL_COLORS.map(([c, n]) => `<button data-c="${c}" style="background:${c}" title="${n}" aria-label="${n}" aria-pressed="${c === S.wallColor}"></button>`).join('') + `<input type="color" value="${S.wallColor}" aria-label="Свой цвет стен">`;
  const setWall = (c) => { S.wallColor = c; building.setWallColor(c); $$('#wallColors button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === c))); savePrefs(); };
  wc.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setWall(b.dataset.c); });
  wc.querySelector('input').addEventListener('input', (e) => setWall(e.target.value));

  const ceil = $('#ceilH');
  ceil.value = cmVal(S.ceiling);
  ceil.addEventListener('change', () => {
    const v = parseNum(ceil.value);
    if (!Number.isFinite(v) || v < 220 || v > 400) { ceil.value = cmVal(S.ceiling); toast('Высота потолка — от 220 до 400 см'); return; }
    S.ceiling = Math.round(v * 10);
    building.build({ ceiling: S.ceiling });
    building.setFlags({ ceiling: mode === 'walk' });
    syncCutH(); applyCut(); furniture.refresh(); obstacleCache = null; savePrefs(); shadowsDirty();
  });

  // высота стен в обзоре
  const cutH = $('#cutH');
  cutH.addEventListener('input', () => { S.cutH = Math.round(+cutH.value * 10); S.cut = true; syncCutH(); applyCut(); });
  cutH.addEventListener('change', savePrefs);
  syncCutH();

  const toggles = [
    ['#optDims', 'dims', (v) => { furniture.showDims = v; furniture.refresh(); }],
    ['#optSwings', 'swings', (v) => building.setFlags({ swings: v })],
    ['#optDoors', 'doors', (v) => { building.setFlags({ doors: v }); shadowsDirty(); }],
    ['#optLabels', 'labels', () => {}],
    ['#optShadows', 'shadows', (v) => setShadows(v)],
    ['#optSnap', 'snap', (v) => { furniture.snapOn = v; }],
    ['#optGhost', 'ghost', () => { obstacleCache = null; }],
    ['#optTile', 'tile', (v) => { building.setFinish('tile', v); shadowsDirty(); }],
    ['#optBrick', 'brick', (v) => { building.setFinish('brick', v); shadowsDirty(); }],
    ['#optApron', 'apron', (v) => { building.setFinish('apron', v); shadowsDirty(); }],
    ['#optWallpaper', 'wallpaper', (v) => { building.setFinish('wallpaper', v); shadowsDirty(); }],
    ['#optBaseboard', 'baseboard', (v) => { building.setBaseboard(v); shadowsDirty(); }],
  ];
  for (const [id, key, fn] of toggles) {
    const el = $(id);
    el.checked = !!S[key];
    el.addEventListener('change', () => { S[key] = el.checked; fn(el.checked); savePrefs(); requestRender(); });
  }
  const eye = $('#eyeH');
  eye.value = cmVal(S.eye);
  eye.addEventListener('change', () => {
    const v = parseNum(eye.value);
    if (!Number.isFinite(v) || v < 100 || v > 200) { eye.value = cmVal(S.eye); return; }
    S.eye = Math.round(v * 10); walk.eye = S.eye * MM; walk.apply(); savePrefs(); requestRender();
  });
}

function syncCutH() {
  const el = $('#cutH');
  if (!el) return;
  el.max = String(Math.round(S.ceiling / 10));
  el.value = String(Math.round(Math.min(S.cutH, S.ceiling) / 10));
  $('#cutHVal').textContent = S.cutH >= S.ceiling ? 'до потолка' : `${dec(S.cutH / 1000, 2)} м`;
}

function setShadows(v) {
  renderer.shadowMap.enabled = v; sun.castShadow = v; shadowsDirty();
  scene.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); });
}
function savePrefs() { persist(); requestRender(); }

// ── данные: файл, код, ссылка ────────────────────────────────────────────────
// файл — с картинками своих обоев; код и ссылка — без них (вместо фото на другом устройстве будет его основной цвет)
function layoutPayload(withImg = true) {
  const l = curLayout(), p = { app: 'apartment-3d', v: 1, name: l.name, items: furniture.items.map(strip) };
  if (Object.keys(l.walls || {}).length) {
    p.walls = withImg ? l.walls : wallsForShare(l.walls);
    const ws = usedPhotos(l.walls).map((u) => ({ ...u, img: Store.loadCoverImage(u.id) || undefined }));
    if (withImg && ws.length) p.wallpapers = ws;
  }
  return p;
}
const usedPhotos = (walls) => { const ids = new Set(Object.values(walls || {}).map((v) => v.id)); return state.wallpapers.filter((u) => ids.has(u.id)); };
function wallsForShare(walls) {
  const out = {};
  for (const [k, v] of Object.entries(walls || {})) {
    const u = state.wallpapers.find((q) => q.id === v.id);
    out[k] = u ? { ...v, a: u.avg, n: u.name } : v;
  }
  return out;
}
// свои обои из файла: картинки сохраняются в этом браузере
async function importPhotos(list) {
  let added = 0;
  for (const u of list || []) {
    if (!u.img || state.wallpapers.some((q) => q.id === u.id)) continue;
    const { img, ...meta } = u;
    Store.saveCoverImage(u.id, img);
    state.wallpapers.push(meta);
    try { building.setUserCover({ ...meta, canvas: imageCanvas(await loadImage(img)) }); added++; } catch (e) { building.setUserCover({ ...meta, canvas: null }); }
  }
  if (added) { building.setCovers(curLayout().walls); persist(); shadowsDirty(); renderWallCard(true); }
}
async function copyText(text, okMsg, title) {
  try { await navigator.clipboard.writeText(text); toast(okMsg); }
  catch (e) {
    dialog(title, `<p>Скопируйте вручную:</p><textarea rows="6" readonly>${esc(text)}</textarea>`, [['Готово', true]]);
    const ta = $('#modalBody textarea'); ta.focus(); ta.select();
  }
}
function bindData() {
  $('#layoutSel').addEventListener('change', (e) => switchLayout(e.target.value));
  $('#layoutCopy').addEventListener('click', () => { const l = curLayout(); addLayout(`${l.name} — копия`, furniture.items.map(strip), l.walls); toast('Копия создана — меняйте её, исходный вариант останется'); });
  $('#layoutRename').addEventListener('click', async () => {
    const l = curLayout();
    const ok = await dialog('Название варианта', `<input type="text" id="dlgName" maxlength="40" value="${esc(l.name)}">`, [['Отмена', false], ['Сохранить', true]]);
    if (ok) { const v = ($('#dlgName')?.value || dialog.last.dlgName || '').trim(); if (v) { l.name = v; renderLayouts(); persist(); } }
  });
  $('#layoutDel').addEventListener('click', async () => {
    if (state.layouts.length < 2) return;
    const l = curLayout();
    if (!(await dialog('Удалить вариант?', `<p>«${esc(l.name)}» и вся его мебель будут удалены.</p>`, [['Отмена', false], ['Удалить', true]]))) return;
    state.layouts = state.layouts.filter((x) => x.id !== l.id);
    switchLayout(state.layouts[0].id, false);
    toast(`Вариант «${l.name}» удалён`);
  });
  $('#dExport').addEventListener('click', () => {
    const p = layoutPayload();
    if (inFrame) { copyText(JSON.stringify(p), 'Код расстановки скопирован', 'Код расстановки'); return; }
    Store.downloadJson(`kvartira-${p.name.replace(/[^\wа-яё-]+/gi, '_')}.json`, p);
  });
  $('#dCopy').addEventListener('click', () => copyText(JSON.stringify(layoutPayload(false)), 'Код расстановки скопирован', 'Код расстановки'));
  if (inFrame) $('#dLink').hidden = true;
  $('#dLink').addEventListener('click', async () => {
    const l = curLayout();
    const code = await Store.encodeLayout({ name: l.name, items: furniture.items, walls: wallsForShare(l.walls) });
    const url = `${location.origin}${location.pathname}#l=${code}`;
    copyText(url, usedPhotos(l.walls).length ? 'Ссылка скопирована. Свои обои по фото в неё не помещаются — там будет их основной цвет; с фото — через «Скачать файл»'
      : 'Ссылка скопирована — откройте её на телефоне или отправьте', 'Ссылка на расстановку');
  });
  $('#dImport').addEventListener('change', async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try { const l = Store.parseLayoutText(await f.text()); addLayout(l.name, l.items, l.walls); importPhotos(l.wallpapers); toast(`Открыт вариант «${l.name}»`); }
    catch (err) { toast('Не получилось прочитать файл: ' + err.message); }
  });
  $('#dPaste').addEventListener('click', async () => {
    const ok = await dialog('Вставить код расстановки', '<textarea id="dlgCode" rows="7" placeholder="{&quot;items&quot;: [...]}"></textarea>', [['Отмена', false], ['Открыть', true]]);
    if (!ok) return;
    try { const l = Store.parseLayoutText(dialog.last.dlgCode || ''); addLayout(l.name, l.items, l.walls); importPhotos(l.wallpapers); toast(`Открыт вариант «${l.name}»`); }
    catch (err) { toast('Код не подошёл: ' + err.message); }
  });
  $('#dClear').addEventListener('click', async () => {
    if (!furniture.items.length) return;
    if (!(await dialog('Очистить вариант?', '<p>Вся мебель этого варианта будет убрана. Отменить можно кнопкой ↶.</p>', [['Отмена', false], ['Очистить', true]]))) return;
    furniture.select(null); furniture.setItems([]); commitHistory(); shadowsDirty();
  });
}

// ── диалог и уведомления ─────────────────────────────────────────────────────
function dialog(title, body, actions) {
  return new Promise((resolve) => {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = body;
    const act = $('#modalActions');
    act.innerHTML = actions.map(([t, v], i) => `<button class="btn${i === actions.length - 1 ? ' primary' : ''}" data-i="${i}">${esc(t)}</button>`).join('');
    const modal = $('#modal');
    modal.hidden = false;
    const close = (v) => {
      dialog.last = {};
      $$('#modalBody input, #modalBody textarea').forEach((el) => { if (el.id) dialog.last[el.id] = el.value; });
      modal.hidden = true; act.onclick = null; modal.onclick = null; document.removeEventListener('keydown', onKey, true);
      resolve(v);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); close(false); }
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); close(actions[actions.length - 1][1]); }
    };
    document.addEventListener('keydown', onKey, true);
    act.onclick = (e) => { const b = e.target.closest('button'); if (b) close(actions[+b.dataset.i][1]); };
    modal.onclick = (e) => { if (e.target === modal) close(false); };
    setTimeout(() => { const f = $('#modalBody input, #modalBody textarea') || act.lastElementChild; f && f.focus(); }, 30);
  });
}
dialog.last = {};

let toastTimer = 0;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 3200);
}

function showHelp() {
  const touch = isTouch;
  dialog('Как пользоваться', `
    <ul>
      <li><b>Обзор</b> — квартира сверху: ${touch ? 'одним пальцем вращать, двумя — приближать и сдвигать' : 'левая кнопка — вращать, правая — сдвигать, колесо — приближать'}.</li>
      <li><b>План</b> — вид строго сверху, удобно расставлять мебель.</li>
      <li><b>Прогулка</b> — ${touch ? 'джойстик слева — идти, водить пальцем по экрану — смотреть' : '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> — идти, тянуть мышью — смотреть, <kbd>Shift</kbd> — быстрее'}. ${touch ? 'Двойное касание пола' : 'Двойной щелчок по полу'} в обзоре — встать в этой точке.</li>
      <li><b>Мебель</b> — выберите из каталога или впишите размеры с ценника. Предмет можно таскать, поворачивать и менять размеры.</li>
      <li>Синие цифры — расстояние от выбранного предмета до стен и соседней мебели, в сантиметрах. Красный контур — предмет заходит в стену или в другую мебель, оранжевая надпись — мешает открыть дверь.</li>
      <li><b>Рулетка</b> — нажмите две точки, покажет расстояние.</li>
      <li><b>Обои</b> — валик слева${touch ? '' : ' (<kbd>O</kbd>)'}: нажмите на стену и выберите обои, оттенок или своё фото обоев. Можно сразу на всю комнату. Обои хранятся в варианте — сделайте копию варианта, чтобы сравнить.</li>
      ${touch ? '' : '<li>Клавиши: <kbd>R</kbd> — повернуть, <kbd>Del</kbd> — удалить, <kbd>Ctrl</kbd>+<kbd>D</kbd> — копия, стрелки — сдвиг на 1 см (с <kbd>Shift</kbd> — на 10), <kbd>Ctrl</kbd>+<kbd>Z</kbd> — отменить.</li>'}
    </ul>
    <p>Всё сохраняется в этом браузере. Для другого устройства — «Расстановка» → «Скопировать ссылку» или «Скачать файл».</p>`, [['Понятно', true]]);
}

// ── обои: инструмент «валик» и карточка стены ────────────────────────────────
// Включили валик → нажатие на стену выбирает её (мебель в это время не мешает), в карточке — обои, оттенок,
// своё фото. Обои хранятся в варианте: l.walls[ключ стены] = { id, c }; что совпадает с планом — не хранится.
const TINTS = [['#f4eee4', 'Беж'], ['#ebe6de', 'Тёплый серый'], ['#e3e5e2', 'Светло-серый'], ['#dce3d6', 'Шалфей'], ['#dbe3ea', 'Голубой'], ['#f0dfd6', 'Пудра'], ['#d9d0c2', 'Тауп'], ['#c8c3ba', 'Серо-бежевый']];
const wallTool = { active: false, key: null };

function toggleWallTool(on = !wallTool.active) {
  wallTool.active = on;
  app.classList.toggle('walling', on);
  $('#tWall').setAttribute('aria-pressed', String(on));
  if (on) {
    if (measure.active) toggleMeasure(false);
    furniture.select(null);
    if (mode === 'plan') setMode('orbit');            // сверху стен не видно
    if (isMobile()) setPanel(false);
  } else {
    selectWall(null);
  }
  building.highlightSurface(null, 'hover');
  requestRender();
}

// стена под указателем (мебель не мешает: луч идёт только по стенам, полу и потолку)
function wallAt(e) {
  setRay(e);
  const hit = ray.intersectObjects(building.pickables, false).find((h) => building.hitVisible(h));
  return hit ? building.surfaceAt(hit) : null;
}
function hoverWall(e) {
  const sf = wallAt(e);
  building.highlightSurface(sf && sf.editable && sf.key !== wallTool.key ? sf.key : null, 'hover');
  requestRender();
}
// выбранная стена вспыхивает и гаснет — заливка не должна искажать цвет обоев, ради которого её выбрали
let flash = null;
function flashWall(key) {
  if (flash) cancelAnimationFrame(flash.raf);
  building.highlightSurface(key, 'sel');
  const m = building.mat.hl && building.mat.hl.sel;
  if (!key || !m) { flash = null; return; }
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / 900);
    m.opacity = 0.28 * (1 - k * k);
    requestRender();
    if (k < 1) flash.raf = requestAnimationFrame(step);
    else { building.highlightSurface(null, 'sel'); m.opacity = 0.28; flash = null; }
  };
  flash = { raf: requestAnimationFrame(step) };
}
function selectWall(key) {
  wallTool.key = key;
  flashWall(key);
  if (key) building.highlightSurface(null, 'hover');
  $('#wallCard').hidden = !key;
  if (key) renderWallCard(true);
  requestRender();
}
function tapWall(e) {
  const sf = wallAt(e);
  if (!sf) { selectWall(null); return; }
  if (!sf.editable) { toast(`${sf.roomName}: здесь плитка, её не меняем`); return; }
  selectWall(sf.key);
}

// название покрытия для карточки
function coverInfo(cv) {
  if (cv.finish) { const f = PLAN.FINISHES.find((q) => q.id === cv.finish); return { name: f ? f.name : 'Плитка', note: '' }; }
  const base = PLAN.COVERS.find((q) => q.id === cv.id);
  if (base) return { name: base.name, note: base.note, base };
  const user = state.wallpapers.find((q) => q.id === cv.id);
  if (user) return { name: user.name, note: 'своё фото', user };
  return { name: cv.n || 'Своё фото', note: 'фото осталось на устройстве, где его добавили', missing: true };
}
const sameCover = (a, b) => a.id === b.id && (a.c || '') === (b.c || '');
// записать покрытие стены в обои варианта; если оно как по плану — правка не нужна
function putCover(walls, sf, spec) {
  const plan = building.planCover(sf);
  if (!plan.finish && sameCover(plan, spec)) delete walls[sf.key]; else walls[sf.key] = spec;
}
function applyCover(keys, spec, record = true) {
  const l = curLayout(), walls = { ...(l.walls || {}) };
  for (const k of keys) { const sf = building.surface(k); if (sf && sf.editable) putCover(walls, sf, { ...spec }); }
  l.walls = walls;
  building.setCovers(walls);
  if (record) commitHistory(); else persist();
  renderWallCard();
  shadowsDirty();
}

function paintPreview(cv, lk) {
  if (!lk || lk.kind === 'paint') { drawCoverPreview(cv, null, 1, 1, lk ? lk.color : S.wallColor); return; }
  const tx = building.texFor(lk);
  drawCoverPreview(cv, tx && tx.t.map.image, tx ? tx.repW : 1, tx ? tx.repH : 1, lk.color);
}
function buildCoverGrid() {
  const all = [...PLAN.COVERS.map((c) => ({ id: c.id, name: c.name, title: `${c.name} — ${c.note}` })),
    ...state.wallpapers.map((u) => ({ id: u.id, name: u.name, title: `${u.name} — своё фото` }))];
  $('#wcCovers').innerHTML = all.map((c) => `<button data-id="${esc(c.id)}" title="${esc(c.title)}"><canvas width="112" height="112"></canvas><span>${esc(c.name)}</span></button>`).join('')
    + '<label class="add-photo" title="Фото образца обоев или картинка из магазина — она повторится по стене"><i>+</i><span>Своё фото</span><input type="file" id="wcPhoto" accept="image/*"></label>';
  $$('#wcCovers button').forEach((b, i) => paintPreview(b.querySelector('canvas'), building.look({ id: all[i].id })));
  $('#wcPhoto').addEventListener('change', onPhotoPicked);
}
function renderWallCard(grid = false) {
  const card = $('#wallCard'), sf = wallTool.key && building.surface(wallTool.key);
  if (!sf) { card.hidden = true; return; }
  const own = (curLayout().walls || {})[sf.key], cv = building.coverOf(sf), info = coverInfo(cv);
  $('#wcRoom').textContent = sf.roomName;
  $('#wcInfo').textContent = `стена ${dec(sf.len / 1000, 2)} м${sf.win && sf.door ? ', с окном и дверью' : sf.win ? ', с окном' : sf.door ? ', с дверью' : ''}`;
  $('#wcNow').innerHTML = `<b>${esc(info.name)}</b>${info.note ? ` — ${esc(info.note)}` : ''}${cv.c ? ', свой оттенок' : ''}${own ? '' : '<em>как по плану</em>'}`;
  if (grid || !$('#wcCovers').childElementCount) buildCoverGrid();
  $$('#wcCovers button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === cv.id)));
  // оттенок: у обоев — от образца, у краски — цвета стен; у своего фото оттенка нет
  const tintable = !info.user && !info.missing && !cv.finish;
  $('#wcColorRow').hidden = !tintable;
  if (tintable) {
    const paint = cv.id === 'paint', def = paint ? S.wallColor : info.base.color, cur = (cv.c || def).toLowerCase();
    const list = paint ? WALL_COLORS : [[info.base.color, 'Как у образца'], ...TINTS];
    $('#wcColors').innerHTML = list.map(([c, n]) => `<button data-c="${c}" style="background:${c}" title="${n}" aria-label="${n}" aria-pressed="${c.toLowerCase() === cur}"></button>`).join('')
      + `<input type="color" value="${cur}" aria-label="Свой оттенок">`;
  }
  $('#wcPhotoRow').hidden = !info.user;
  if (info.user && document.activeElement !== $('#wcPhotoW')) $('#wcPhotoW').value = cmVal(info.user.w);
  $('#wcReset').disabled = !own;
  $('#wcRoomAll').disabled = !!cv.finish;
}
function setTint(c, record = true) {
  const sf = building.surface(wallTool.key); if (!sf) return;
  const cv = building.coverOf(sf); if (cv.finish) return;
  const base = PLAN.COVERS.find((q) => q.id === cv.id), def = cv.id === 'paint' ? null : base && base.color;
  const spec = { id: cv.id };
  if (!def || c.toLowerCase() !== def.toLowerCase()) spec.c = c.toLowerCase();
  applyCover([sf.key], spec, record);
}

// своё фото: уменьшаем до 1024 px, храним как JPEG; основной цвет — на случай, если фото не будет
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = typeof src === 'string' ? src : URL.createObjectURL(src);
    img.onload = () => { if (typeof src !== 'string') URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { if (typeof src !== 'string') URL.revokeObjectURL(url); reject(new Error('картинка не открылась')); };
    img.src = url;
  });
}
function imageCanvas(img, max = 1024) {
  const k = Math.min(1, max / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round((img.naturalWidth || img.width) * k)); cv.height = Math.max(1, Math.round((img.naturalHeight || img.height) * k));
  cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
  return cv;
}
function avgColor(cv) {
  const one = document.createElement('canvas'); one.width = one.height = 1;
  const c = one.getContext('2d'); c.drawImage(cv, 0, 0, 1, 1);
  const d = c.getImageData(0, 0, 1, 1).data;
  return '#' + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
}
async function onPhotoPicked(e) {
  const f = e.target.files[0]; e.target.value = '';
  const key = wallTool.key;
  if (!f || !key) return;
  let cv;
  try { cv = imageCanvas(await loadImage(f)); } catch (err) { toast('Не получилось открыть картинку — попробуйте JPEG или PNG'); return; }
  const id = 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
  const name = (f.name || '').replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim().slice(0, 30) || `Фото ${state.wallpapers.length + 1}`;
  const u = { id, name, w: 530, avg: avgColor(cv) };
  const saved = Store.saveCoverImage(id, cv.toDataURL('image/jpeg', 0.86));
  state.wallpapers.push(u);
  building.setUserCover({ ...u, canvas: cv });
  applyCover([key], { id });
  renderWallCard(true);
  toast(saved ? 'Фото на стене. Если рисунок крупнее или мельче, чем в жизни, поправьте ширину рисунка'
    : 'Фото на стене, но браузеру не хватило места его сохранить — после перезагрузки его не будет');
}
async function loadPhotos() {
  let n = 0;
  for (const u of state.wallpapers) {
    const url = Store.loadCoverImage(u.id);
    if (!url) continue;
    try { building.setUserCover({ ...u, canvas: imageCanvas(await loadImage(url)) }); n++; } catch (e) { /* испорченная картинка — будет основной цвет */ }
  }
  if (n) { building.setCovers(curLayout().walls); shadowsDirty(); if (wallTool.key) renderWallCard(true); }
}

function bindWallCard() {
  $('#tWall').addEventListener('click', () => toggleWallTool());
  $('#wallHintDone').addEventListener('click', () => toggleWallTool(false));
  $('#wcClose').addEventListener('click', () => selectWall(null));
  $('#wcCovers').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-id]');
    if (b && wallTool.key) applyCover([wallTool.key], { id: b.dataset.id });
  });
  $('#wcColors').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setTint(b.dataset.c); });
  $('#wcColors').addEventListener('input', (e) => { if (e.target.type === 'color') setTint(e.target.value, false); });
  $('#wcColors').addEventListener('change', (e) => { if (e.target.type === 'color') commitHistory(); });
  $('#wcRoomAll').addEventListener('click', () => {
    const sf = building.surface(wallTool.key); if (!sf) return;
    const cv = building.coverOf(sf); if (cv.finish) return;
    applyCover(building.surfaces.filter((q) => q.room === sf.room && q.editable).map((q) => q.key), { id: cv.id, ...(cv.c ? { c: cv.c } : {}) });
    toast(`${sf.roomName}: на всех стенах — ${coverInfo(cv).name}`);
  });
  $('#wcReset').addEventListener('click', () => {
    const l = curLayout(); if (!wallTool.key || !(l.walls || {})[wallTool.key]) return;
    const walls = { ...l.walls }; delete walls[wallTool.key];
    l.walls = walls; building.setCovers(walls); commitHistory(); renderWallCard(); shadowsDirty();
  });
  $('#wcPhotoW').addEventListener('change', () => {
    const sf = building.surface(wallTool.key); if (!sf) return;
    const u = state.wallpapers.find((q) => q.id === building.coverOf(sf).id); if (!u) return;
    const v = parseNum($('#wcPhotoW').value);
    if (!Number.isFinite(v) || v < 5 || v > 500) { $('#wcPhotoW').value = cmVal(u.w); toast('Ширина рисунка — от 5 до 500 см'); return; }
    u.w = Math.round(v * 10);
    building.setUserCover({ ...building.userCovers.get(u.id), w: u.w });
    building.setCovers(curLayout().walls); persist(); shadowsDirty();
  });
  $('#wcPhotoDel').addEventListener('click', async () => {
    const sf = building.surface(wallTool.key); if (!sf) return;
    const u = state.wallpapers.find((q) => q.id === building.coverOf(sf).id); if (!u) return;
    if (!(await dialog('Удалить фото обоев?', `<p>«${esc(u.name)}» уберётся со всех стен во всех вариантах — там станет как по плану.</p>`, [['Отмена', false], ['Удалить', true]]))) return;
    state.wallpapers = state.wallpapers.filter((q) => q.id !== u.id);
    Store.removeCoverImage(u.id); building.removeUserCover(u.id);
    for (const l of state.layouts) for (const [k, v] of Object.entries(l.walls || {})) if (v.id === u.id) delete l.walls[k];
    building.setCovers(curLayout().walls); commitHistory(); renderWallCard(true); shadowsDirty();
  });
  $('#wallsPick').addEventListener('click', () => { toggleWallTool(true); if (!isMobile()) setPanel(false); toast('Нажмите на стену'); });
  $('#wallsReset').addEventListener('click', async () => {
    const l = curLayout();
    if (!Object.keys(l.walls || {}).length) { toast('Обои и так как по плану'); return; }
    if (!(await dialog('Вернуть обои как по плану?', `<p>Все стены варианта «${esc(l.name)}» станут как были. Отменить можно кнопкой ↶.</p>`, [['Отмена', false], ['Вернуть', true]]))) return;
    l.walls = {}; building.setCovers(l.walls); commitHistory(); renderWallCard(); shadowsDirty();
  });
}

// ── клавиатура ───────────────────────────────────────────────────────────────
addEventListener('keydown', (e) => {
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
  if (!$('#modal').hidden) return;
  const mod = e.ctrlKey || e.metaKey;
  const it = furniture.selected;
  if (mod && e.code === 'KeyZ') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && e.code === 'KeyY') { e.preventDefault(); redo(); return; }
  if (mod && e.code === 'KeyD') { e.preventDefault(); if (it) furniture.duplicate(it.id); return; }
  if (mod) return;
  if (e.key === 'Escape') {
    if (measure.active) toggleMeasure(false);
    else if (wallTool.active) { if (wallTool.key) selectWall(null); else toggleWallTool(false); }
    else furniture.select(null);
    return;
  }
  if ((e.key === 'Delete' || e.key === 'Backspace') && it) { e.preventDefault(); furniture.remove(it.id); return; }
  if (e.code === 'KeyR' && it) { rotateSel(e.shiftKey ? -90 : 90); return; }
  if (e.code === 'KeyM') { toggleMeasure(); return; }
  if (e.code === 'KeyO') { toggleWallTool(); return; }
  if (e.key === '1') setMode('orbit');
  if (e.key === '2') setMode('plan');
  if (e.key === '3') setMode('walk');
  if (mode !== 'walk' && it && e.key.startsWith('Arrow')) {
    e.preventDefault();
    nudge({ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key], e.shiftKey ? 100 : 10);
  }
});

function toggleMeasure(on = !measure.active) {
  if (on && wallTool.active) toggleWallTool(false);
  measure.active = on;
  if (!on) measure.cancel();
  app.classList.toggle('measuring', on);
  $('#tMeasure').setAttribute('aria-pressed', String(on));
  if (on) furniture.select(null);
  requestRender();
}

// ── кнопки ───────────────────────────────────────────────────────────────────
$$('.modes button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
$('#btnPanel').addEventListener('click', () => setPanel(!app.classList.contains('panel-open')));
$('#panelClose').addEventListener('click', () => setPanel(false));
$$('.tabs [data-tab]').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
$('#itemList').addEventListener('click', (e) => {
  const b = e.target.closest('.li'); if (!b) return;
  const it = furniture.byId(b.dataset.id); if (!it) return;
  furniture.select(it.id);
  focusOn(it);
});
$('#tUndo').addEventListener('click', undo);
$('#tRedo').addEventListener('click', redo);
$('#tMeasure').addEventListener('click', () => toggleMeasure());
$('#measureClear').addEventListener('click', () => { measure.clear(); requestRender(); });
$('#tCut').addEventListener('click', () => { S.cut = !S.cut; applyCut(); savePrefs(); });
$('#tReset').addEventListener('click', () => {
  if (mode === 'orbit') fitOrbit();
  else if (mode === 'plan') fitPlan();
  else { walk.setPose(PLAN.START.x * MM, PLAN.START.y * MM, PLAN.START.yaw); updateRoomChip(); requestRender(); }
});
const fsOk = !!(document.documentElement.requestFullscreen);
if (!fsOk) $('#tFull').hidden = true;
$('#tFull').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch (e) { toast('Браузер не разрешил полноэкранный режим'); }
});
$('#tHelp').addEventListener('click', showHelp);
// свайп вниз по ручке закрывает панель на телефоне
(() => {
  let y0 = null;
  const head = $('.panel');
  head.addEventListener('touchstart', (e) => { if (e.target.closest('.grip, .panel-head')) y0 = e.touches[0].clientY; }, { passive: true });
  head.addEventListener('touchmove', (e) => { if (y0 != null && e.touches[0].clientY - y0 > 60) { y0 = null; setPanel(false); } }, { passive: true });
  head.addEventListener('touchend', () => { y0 = null; });
})();

// плавный перенос камеры к предмету
let tween = null;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function focusOn(it) {
  const to = new THREE.Vector3(it.x * MM, 0, it.y * MM);
  const dur = reduceMotion ? 1 : 450;
  if (mode === 'orbit') tween = { ctl: orbit, cam: persp, from: orbit.target.clone(), to, t0: performance.now(), dur };
  else if (mode === 'plan') tween = { ctl: planCtl, cam: ortho, from: planCtl.target.clone(), to, t0: performance.now(), dur };
  if (isMobile()) setPanel(false);
}
function stepTween(now) {
  if (!tween) return;
  const k = Math.min(1, (now - tween.t0) / tween.dur), e = 1 - Math.pow(1 - k, 3);
  const p = tween.from.clone().lerp(tween.to, e);
  const delta = p.clone().sub(tween.ctl.target);
  tween.ctl.target.add(delta); tween.cam.position.add(delta);
  if (k >= 1) tween = null;
  requestRender();
}

// ── цикл отрисовки ───────────────────────────────────────────────────────────
const lastCam = new THREE.Matrix4(), lastProj = new THREE.Matrix4();
const roomLabelPos = new Map();
function roomLabels() {
  const out = [];
  for (const r of building.rooms) {
    if (!roomLabelPos.has(r.id)) roomLabelPos.set(r.id, new THREE.Vector3(r.label[0] * MM, 0.02, r.label[1] * MM));
    const html = r.small
      ? `<b>${esc(r.name)}</b><span class="a">${dec(r.area)} м²</span>`
      : `<b>${esc(r.name)}</b><span class="a">${dec(r.area)} м²</span><span class="s">${dec(Math.round(r.size[0] / 10) / 100, 2)} × ${dec(Math.round(r.size[1] / 10) / 100, 2)}</span>`;
    out.push({ key: 'r' + r.id, pos: roomLabelPos.get(r.id), html, cls: 'room' + (r.small ? ' small' : '') });
  }
  return out;
}

// если кадры идут медленно (слабый телефон), понемногу снижаем разрешение
const perf = { last: 0, sum: 0, n: 0, dpr: Math.min(window.devicePixelRatio || 1, 2) };
function trackPerf(now) {
  if (perf.last && now - perf.last < 200) {
    perf.sum += now - perf.last; perf.n++;
    if (perf.n >= 40) {
      const avg = perf.sum / perf.n;
      if (avg > 42 && perf.dpr > 1) { perf.dpr = Math.max(1, perf.dpr - 0.25); renderer.setPixelRatio(perf.dpr); renderer.setSize(innerWidth, innerHeight, false); }
      perf.sum = 0; perf.n = 0;
    }
  }
  perf.last = now;
}

let lastT = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - lastT) / 1000);
  lastT = now;
  stepTween(now);
  if (mode === 'orbit') orbit.update();
  else if (mode === 'plan') planCtl.update();
  else if (walk.update(dt)) { updateRoomChip(); needsRender = true; }
  camera.updateMatrixWorld();
  if (!needsRender && camera.matrixWorld.equals(lastCam) && camera.projectionMatrix.equals(lastProj)) return;
  lastCam.copy(camera.matrixWorld); lastProj.copy(camera.projectionMatrix);
  needsRender = false;
  trackPerf(now);
  // в прогулке размеры видны, только если выбранный предмет в той же комнате
  const sel = furniture.selected;
  let dimsOn = !!sel && furniture.showDims;
  if (dimsOn && mode === 'walk') {
    const here = building.roomAt(walk.pos.x / MM, walk.pos.z / MM), there = building.roomAt(sel.x, sel.y);
    dimsOn = !!here && here === there;
  }
  furniture.helpers.visible = dimsOn;
  if (mode === 'walk') building.fadeDoors(walk.pos.x / MM, walk.pos.z / MM);
  renderer.render(scene, camera);
  if (mode === 'walk') updateRoomChip();
  const items = [];
  if (S.labels && mode !== 'walk') items.push(...roomLabels());
  if (dimsOn) furniture.dimLabels.forEach((d, i) => items.push({ key: 'd' + i, pos: d.pos, html: d.text, cls: 'dim' }));
  items.push(...measure.labels());
  labels.sync(items, camera, innerWidth, innerHeight);
  if (mode === 'walk') minimap.draw(walk);
}

// ── запуск ───────────────────────────────────────────────────────────────────
function areaInfo() {
  const living = building.rooms.filter((r) => !r.outdoor).reduce((s, r) => s + r.area, 0);
  const bal = building.rooms.filter((r) => r.outdoor).reduce((s, r) => s + r.area, 0);
  $('#areaInfo').textContent = `${dec(living)} м² и балкон ${dec(bal)} м²`;
}

async function boot() {
  furniture.setItems(curLayout().items.map((it) => ({ id: newId(), ...it })));
  // расстановка из ссылки (#l=...) сохраняется как новый вариант
  if (location.hash.startsWith('#l=')) {
    try {
      const l = await Store.decodeLayout(location.hash.slice(3));
      addLayout(l.name || 'Из ссылки', l.items, l.walls);
      setTimeout(() => toast(`Открыт вариант «${l.name}» из ссылки. Ваши варианты на месте — в «Расстановке».`), 400);
    } catch (e) { toast('Ссылка повреждена — расстановку открыть не удалось'); }
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* в песочнице может быть запрещено */ }
  }
  resetHistory();
  renderCatalog(); renderSettings(); renderLayouts(); renderList(); bindInspector(); bindData(); bindWallCard(); areaInfo();
  loadPhotos();
  setMode('orbit');
  applyCut();
  if (!isMobile()) setPanel(true, 'add');
  fitOrbit(); fitPlan();
  let seen = false;
  try { seen = localStorage.getItem('apartment3d.help') === '1'; localStorage.setItem('apartment3d.help', '1'); } catch (e) { seen = true; }
  if (!seen) setTimeout(showHelp, 600);
  if (setsJustAdded.length || setsUpdated.length) {
    Store.saveLocal(state);
    const parts = [];
    const list = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} и ${a[a.length - 1]}`);
    if (setsJustAdded.length) parts.push(`Добавлено: ${list(setsJustAdded)}.`);
    if (setsUpdated.length) parts.push(`Обновлено: ${list(setsUpdated)}.`);
    setTimeout(() => toast(`${parts.join(' ')} Каждый предмет можно выбрать и поправить.`), seen ? 500 : 200);
  }
  requestAnimationFrame(frame);
  // ссылка для отладки из консоли браузера
  window.__app = { THREE, scene, building, furniture, walk, setMode, addItem, renderer, measure, get camera() { return camera; }, orbit, planCtl, fitOrbit, fitPlan, setPanel, toggleMeasure,
    toggleWallTool, selectWall, wallTool, undo, redo, switchLayout, get state() { return state; } };
}
boot();
