import * as THREE from 'three';

// ============================================================
// 逐玉记 · Three.js 网页版
// 程序化生成良渚王城：水环 / 祭坛 / 稻田 / 建筑 / 树林 / 角色
// 系统：第三人称漫游 · 对话 · 玉石拾取 · 岩石巨怪讨伐战
// ============================================================

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

// ---------- 渲染器 / 场景 / 相机 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
$('game').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb9b4);
scene.fog = new THREE.Fog(0x9fb9b4, 70, 190);

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 14, 20);

// ---------- 光照 ----------
const hemi = new THREE.HemisphereLight(0xdfeaff, 0x6b5a3e, 1.05);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe6b8, 2.0);
sun.position.set(30, 55, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -70; sun.shadow.camera.right = 70;
sun.shadow.camera.top = 70; sun.shadow.camera.bottom = -70;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 160;
sun.shadow.bias = -0.0005;
scene.add(sun);

// 补光
const fill = new THREE.DirectionalLight(0xbfe3d8, 0.5);
fill.position.set(-30, 20, -25);
scene.add(fill);

// ---------- 材质库 ----------
const MAT = {
  grass: new THREE.MeshStandardMaterial({ color: 0x7d8f5a, roughness: 1 }),
  grass2: new THREE.MeshStandardMaterial({ color: 0x6c8049, roughness: 1 }),
  water: new THREE.MeshStandardMaterial({ color: 0x4a8f96, roughness: .25, metalness: .1, transparent: true, opacity: .86 }),
  soil: new THREE.MeshStandardMaterial({ color: 0x9a8055, roughness: 1 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x8d8878, roughness: .95 }),
  stoneDark: new THREE.MeshStandardMaterial({ color: 0x6b6555, roughness: 1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x7a5b3a, roughness: 1 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xd9c9a3, roughness: 1 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x8a5b3f, roughness: 1 }),
  jade: new THREE.MeshStandardMaterial({ color: 0x6fb79f, roughness: .35, metalness: .25, emissive: 0x1e5e4c, emissiveIntensity: .5 }),
  jadeGlow: new THREE.MeshStandardMaterial({ color: 0xa8e0c8, emissive: 0x5fd6a8, emissiveIntensity: 1.6, roughness: .2 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd9b36a, roughness: .4, metalness: .65 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x4f7042, roughness: 1 }),
  leaf2: new THREE.MeshStandardMaterial({ color: 0x5f8049, roughness: 1 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x6b4f33, roughness: 1 }),
  rice: new THREE.MeshStandardMaterial({ color: 0x9fb55e, roughness: 1 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xd7a97f, roughness: 1 }),
  clothKing: new THREE.MeshStandardMaterial({ color: 0x8c4a3a, roughness: 1 }),
  clothElder: new THREE.MeshStandardMaterial({ color: 0xd8cfb6, roughness: 1 }),
  clothGuard: new THREE.MeshStandardMaterial({ color: 0x5a6b7a, roughness: 1 }),
  rock: new THREE.MeshStandardMaterial({ color: 0x77776e, roughness: 1, flatShading: true }),
  rockDark: new THREE.MeshStandardMaterial({ color: 0x5c5c55, roughness: 1, flatShading: true }),
};

// ---------- 工具：几何体 ----------
function box(w, h, d, mat, x, y, z, parent = scene, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true;
  parent.add(m); return m;
}
function cyl(rt, rb, h, mat, x, y, z, parent = scene, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}
function sph(r, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
  m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m;
}
function disk(r, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), mat);
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z);
  m.receiveShadow = true; parent.add(m); return m;
}

// ============================================================
// 世界构建
// ============================================================
const world = new THREE.Group();
scene.add(world);
const GROUND_R = 62;

// 草地大地
disk(GROUND_R + 40, MAT.grass, 0, -.05, 0, world);
// 中心岛台地
disk(GROUND_R, MAT.grass2, 0, 0, 0, world);
// 环形水系（两条同心环带）
function ring(ri, ro, mat, y) {
  const g = new THREE.RingGeometry(ri, ro, 64);
  const m = new THREE.Mesh(g, mat);
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true;
  world.add(m); return m;
}
ring(46, 56, MAT.water, .06);
// 水岸
ring(44, 46, MAT.soil, .04);
ring(56, 58, MAT.soil, .04);
// 中心土色广场
disk(16, MAT.soil, 0, .02, 0, world);

// ---------- 祭坛（中心） ----------
const altar = new THREE.Group();
altar.position.set(0, 0, 6);
world.add(altar);
cyl(9, 10, 1.2, MAT.stone, 0, .6, 0, altar, 32);
cyl(7, 7.6, 1, MAT.stone, 0, 1.7, 0, altar, 32);
cyl(5, 5.4, .9, MAT.stoneDark, 0, 2.6, 0, altar, 32);
// 玉琮（中心方形柱，内圆）—— 良渚标志
const cong = new THREE.Group();
cong.position.y = 5.4; altar.add(cong);
box(2.6, 4.2, 2.6, MAT.jade, 0, 0, 0, cong);
cyl(.85, .85, 4.4, MAT.jadeGlow, 0, 0, 0, cong, 24);
// 玉琮神徽纹（四圈 gold 环）
for (let i = 0; i < 4; i++) {
  const g = box(2.9, .16, 2.9, MAT.gold, 0, -1.5 + i, 0, cong, false);
  g.material = MAT.gold;
}
const altarLight = new THREE.PointLight(0x6fe0b0, 2.2, 26, 2);
altarLight.position.set(0, 7, 0); altar.add(altarLight);

// 四面石柱
for (let i = 0; i < 4; i++) {
  const a = i / 4 * TAU + Math.PI / 4;
  cyl(.7, .85, 4.5, MAT.stoneDark, Math.cos(a) * 12, 2.25, Math.sin(a) * 12, altar, 8);
}

// ---------- 稻田（南部规整田格） ----------
const farm = new THREE.Group(); world.add(farm);
for (let gx = 0; gx < 7; gx++) for (let gz = 0; gz < 4; gz++) {
  const px = -21 + gx * 7, pz = 26 + gz * 6;
  if (Math.hypot(px, pz) > 44) continue;
  const pad = box(6.2, .18, 5.2, MAT.soil, px, .1, pz, farm, false);
  // 稻苗
  for (let r = 0; r < 3; r++) {
    const row = box(5.6, .5, .5, MAT.rice, px, .45, pz - 1.6 + r * 1.6, farm, false);
    row.rotation.y = rand(-.03, .03);
  }
}

// ---------- 房屋（聚落） ----------
function makeHouse(x, z, rot = 0, scale = 1) {
  const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = rot; h.scale.setScalar(scale);
  world.add(h);
  box(5, 3, 4.5, MAT.wall, 0, 1.5, 0, h);
  // 屋顶（四棱锥）
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.6, 4), MAT.roof);
  roof.position.y = 4.2; roof.rotation.y = Math.PI / 4;
  roof.castShadow = true; h.add(roof);
  box(1.2, 2, .15, MAT.wood, 0, 1, 2.3, h, false);
}
const houseSpots = [
  [-26, 8, .3], [-24, -6, -.2], [-18, -16, .5], [22, 10, -.4],
  [26, -4, .2], [18, -18, -.5], [-30, 20, .7], [30, 20, -.7],
  [-12, 34, .1], [14, 34, -.1]
];
houseSpots.forEach(s => makeHouse(...s));

// ---------- 树木 ----------
function makeTree(x, z, s = 1) {
  const t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); world.add(t);
  cyl(.35, .5, 3.2, MAT.trunk, 0, 1.6, 0, t);
  const c1 = new THREE.Mesh(new THREE.ConeGeometry(2.3, 4, 7), MAT.leaf);
  c1.position.y = 4.6; c1.castShadow = true; t.add(c1);
  const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.7, 3.2, 7), MAT.leaf2);
  c2.position.y = 6.6; c2.castShadow = true; t.add(c2);
}
let seed = 12345;
function srand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
for (let i = 0; i < 46; i++) {
  const a = srand() * TAU, r = 30 + srand() * 14;
  const x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (Math.hypot(x, z - 6) < 14) continue; // 避开祭坛
  makeTree(x, z, .7 + srand() * .6);
}

// ---------- 散石 ----------
for (let i = 0; i < 26; i++) {
  const a = srand() * TAU, r = 18 + srand() * 26;
  const s = .4 + srand() * .9;
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), srand() > .5 ? MAT.rock : MAT.stone);
  m.position.set(Math.cos(a) * r, s * .45, Math.sin(a) * r);
  m.rotation.set(srand(), srand(), srand()); m.castShadow = true; m.receiveShadow = true;
  world.add(m);
}

// ---------- 天空装饰：远山 ----------
for (let i = 0; i < 12; i++) {
  const a = i / 12 * TAU, r = 120;
  const m = new THREE.Mesh(new THREE.ConeGeometry(18 + srand() * 10, 26 + srand() * 18, 5),
    new THREE.MeshStandardMaterial({ color: 0x8a9888, roughness: 1 }));
  m.position.set(Math.cos(a) * r, 8, Math.sin(a) * r);
  world.add(m);
}

// 云
const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .75, roughness: 1 });
for (let i = 0; i < 7; i++) {
  const c = new THREE.Group();
  c.position.set(rand(-80, 80), rand(28, 42), rand(-80, 80));
  for (let j = 0; j < 3; j++) {
    const b = sph(rand(4, 7), cloudMat, j * 5 - 5, rand(-1, 1), rand(-2, 2), c);
    b.castShadow = false;
  }
  world.add(c);
}

// ============================================================
// 角色构建（低多边形人形，程序化）
// ============================================================
function makePerson(clothMat, scale = 1, withCrown = false) {
  const g = new THREE.Group(); g.scale.setScalar(scale);
  cyl(.42, .55, 1.3, clothMat, 0, .85, 0, g, 10);       // 身体
  sph(.36, MAT.skin, 0, 1.75, 0, g);                      // 头
  cyl(.42, .42, .18, clothMat, 0, 1.35, 0, g, 10);       // 领
  // 手臂
  const armL = cyl(.13, .13, 1.05, MAT.skin, -.55, 1.0, 0, g, 8); armL.rotation.z = -.18;
  const armR = cyl(.13, .13, 1.05, MAT.skin, .55, 1.0, 0, g, 8); armR.rotation.z = .18;
  // 腿
  cyl(.16, .16, .8, MAT.clothGuard, -.22, .32, 0, g, 8);
  cyl(.16, .16, .8, MAT.clothGuard, .22, .32, 0, g, 8);
  if (withCrown) {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(.34, .4, .28, 10, 1, true), MAT.gold);
    crown.position.y = 2.05; crown.castShadow = true; g.add(crown);
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * TAU;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(.07, .35, 5), MAT.gold);
      spike.position.set(Math.cos(a) * .34, 2.3, Math.sin(a) * .34); g.add(spike);
    }
  }
  g.userData.armL = armL; g.userData.armR = armR;
  return g;
}

// 玩家（王）
const player = makePerson(MAT.clothKing, 1.15, true);
player.position.set(0, 0, 18);
world.add(player);
// 王的玉圭
const gui = box(.14, 1.1, .06, MAT.jade, .6, 1.0, .1, player, false);

// NPC：长者、祭司、工匠、长老
const npcs = [
  { name: '长者', cloth: MAT.clothElder, pos: [-10, 10], crown: false },
  { name: '祭司', cloth: MAT.jade, pos: [8, 16], crown: false },
  { name: '工匠', cloth: MAT.wood, pos: [-20, -4], crown: false },
  { name: '农人', cloth: MAT.rice, pos: [16, 28], crown: false },
];
const npcObjs = [];
for (const n of npcs) {
  const g = makePerson(n.cloth, 1.05, n.crown);
  g.position.set(n.pos[0], 0, n.pos[1]); g.rotation.y = rand(0, TAU);
  g.userData.name = n.name; world.add(g); npcObjs.push(g);
}

// ---------- 岩石巨怪（西外环荒原） ----------
function makeGolem() {
  const g = new THREE.Group();
  // 躯干
  const body = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5, 0), MAT.rock);
  body.scale.set(1, 1.25, .85); body.position.y = 4.2; body.castShadow = true; g.add(body);
  // 头
  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 0), MAT.rockDark);
  head.position.y = 7.2; head.castShadow = true; g.add(head);
  // 眼（青玉发光）
  sph(.22, MAT.jadeGlow, -.5, 7.35, 1.0, g);
  sph(.22, MAT.jadeGlow, .5, 7.35, 1.0, g);
  // 手臂
  const armL = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 0), MAT.rock);
  armL.scale.set(.7, 1.5, .7); armL.position.set(-3.0, 4.3, 0); armL.castShadow = true; g.add(armL);
  const armR = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 0), MAT.rock);
  armR.scale.set(.7, 1.5, .7); armR.position.set(3.0, 4.3, 0); armR.castShadow = true; g.add(armR);
  // 拳
  sph(1.25, MAT.rockDark, -3.2, 2.6, 0, g);
  sph(1.25, MAT.rockDark, 3.2, 2.6, 0, g);
  // 腿
  const legL = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), MAT.rockDark);
  legL.scale.set(.8, 1.3, .8); legL.position.set(-1.1, 1.4, 0); legL.castShadow = true; g.add(legL);
  const legR = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), MAT.rockDark);
  legR.scale.set(.8, 1.3, .8); legR.position.set(1.1, 1.4, 0); legR.castShadow = true; g.add(legR);
  // 玉纹（身上镶嵌的青玉）
  sph(.45, MAT.jade, 0, 4.6, 2.0, g);
  g.userData = { body, head, armL, armR, hitFlash: 0 };
  return g;
}
const golem = makeGolem();
golem.position.set(-40, 0, 26);
golem.rotation.y = Math.PI * .75;
world.add(golem);
golem.visible = false; // 剧情触发后出现

// ---------- 武士（战斗时登场） ----------
const warriors = [];
for (let i = 0; i < 3; i++) {
  const w = makePerson(MAT.clothGuard, 1.05, false);
  w.visible = false; world.add(w); warriors.push(w);
  // 木盾 + 石斧
  const shield = cyl(.55, .55, .12, MAT.wood, -.6, 1.0, .35, w, 12);
  shield.rotation.x = Math.PI / 2;
  const axe = box(.1, 1.5, .1, MAT.wood, .6, 1.2, 0, w, false);
}

// ---------- 玉石（可拾取） ----------
const jades = [];
const jadeSpots = [[-8, 22], [12, 24], [-24, 14], [24, 6], [-6, -14]];
jadeSpots.forEach((p, i) => {
  const g = new THREE.Group(); g.position.set(p[0], 0, p[1]); world.add(g);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.7, 0), MAT.jadeGlow);
  gem.position.y = 1.2; gem.castShadow = true; g.add(gem);
  const halo = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.25, 24),
    new THREE.MeshBasicMaterial({ color: 0x8fe8c0, transparent: true, opacity: .5, side: THREE.DoubleSide }));
  halo.rotation.x = -Math.PI / 2; halo.position.y = .08; g.add(halo);
  const light = new THREE.PointLight(0x7fe0b8, 1.0, 8, 2); light.position.y = 1.5; g.add(light);
  g.userData = { gem, halo, baseY: 1.2, taken: false, index: i };
  jades.push(g);
});

// ============================================================
// 打击特效（扩散光环 + 碎片）
// ============================================================
const fxList = [];
function spawnHit(pos, color = 0xffd27a, big = false) {
  const g = new THREE.Group(); g.position.copy(pos); scene.add(g);
  // 光环
  const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .95, side: THREE.DoubleSide, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(.3, .5, 24), ringMat);
  ring.lookAt(camera.position); g.add(ring);
  // 星芒（十字细条）
  const barMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, depthWrite: false });
  for (let i = 0; i < 4; i++) {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(big ? 3.2 : 2.0, .12), barMat);
    bar.rotation.z = i * Math.PI / 4; bar.lookAt(camera.position);
    bar.rotateZ(i * Math.PI / 4); g.add(bar);
  }
  fxList.push({ g, t: 0, life: big ? .7 : .5, ring, mats: [ringMat, barMat] });
}
function updateFx(dt) {
  for (let i = fxList.length - 1; i >= 0; i--) {
    const f = fxList[i]; f.t += dt; const k = f.t / f.life;
    if (k >= 1) { scene.remove(f.g); fxList.splice(i, 1); continue; }
    const s = 1 + k * 5;
    f.g.scale.setScalar(s);
    f.mats.forEach(m => m.opacity = (1 - k) * .95);
  }
}

// ============================================================
// 游戏状态
// ============================================================
const G = {
  phase: 'menu',
  day: 1, time: 0.0,
  res: { jade: 0, food: 20, mat: 10, pop: 12 },
  jadeTaken: 0,
  quest: 0,
  golemAwake: false,
  golemHP: 120, golemMax: 120,
  party: [
    { name: '方士', hp: 40, max: 40 },
    { name: '武士甲', hp: 40, max: 40 },
    { name: '武士乙', hp: 40, max: 40 },
  ],
  round: 1,
  bPhase: 'idle', bTimer: 0, bPending: null,
};

// ---------- 输入 ----------
const keys = {};
let camYaw = 0, camPitch = .55, camDist = 16;
let dragging = false, lastX = 0, lastY = 0;
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyE' && G.phase === 'roam') tryInteract();
  if (e.code === 'Escape' && G.phase === 'dialogue') closeDialogue();
  if (e.code === 'KeyH') $('hud').classList.toggle('hidden');
  if (e.code === 'KeyM') toast('王城圈层：内城 → 水系 → 稻田 → 外环荒原');
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', e => keys[e.code] = false);
renderer.domElement.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
addEventListener('pointerup', () => dragging = false);
addEventListener('pointermove', e => {
  if (!dragging) return;
  camYaw -= (e.clientX - lastX) * .006;
  camPitch = clamp(camPitch + (e.clientY - lastY) * .004, .18, 1.1);
  lastX = e.clientX; lastY = e.clientY;
});
renderer.domElement.addEventListener('wheel', e => {
  camDist = clamp(camDist + e.deltaY * .012, 8, 28); e.preventDefault();
}, { passive: false });
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------- UI 辅助 ----------
let toastTimer = null;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
function updateHUD() {
  $('rJade').textContent = G.res.jade;
  $('rFood').textContent = G.res.food;
  $('rMat').textContent = G.res.mat;
  $('rPop').textContent = G.res.pop;
  const qs = ['寻访长者，了解洪水之事', '寻得祭祀玉石（' + G.jadeTaken + '/5）',
              '前往西外环讨伐岩石巨怪', '携玉登台，完成祭祀'];
  $('quest').querySelector('.txt').textContent = qs[G.quest];
  $('season').querySelector('.day').textContent = '第 ' + G.day + ' 日 · ' + (G.time < .5 ? '晨' : '午');
  $('season').querySelector('.bar i').style.width = (G.time * 100) + '%';
}

// ---------- 对话 ----------
const DIALOG = {
  '长者': [
    { t: '大王，洪水将至，良渚危矣。唯有集齐五枚通神之玉，登台献祭，方可平息水患。', o: ['洪水何时到来？', '通神之玉在何处？'] },
    { t: '天时不过数日。玉散于王城各处，泛着青光，靠近自可取之。', o: ['我明白了'] },
    { t: '此外，西外环荒原有一岩石巨怪作祟，扰我乡民。大王若能讨伐它，民心必安。', o: ['讨伐巨怪', '先去寻玉'] },
  ],
  '祭司': [
    { t: '祭坛的玉琮已静候千年。待五玉齐备，我便为您主持祭祀大典。', o: ['祭祀需要什么？', '告辞'] },
    { t: '需玉五枚、粮草充足、民心安定。三者具备，仪式方可圆满。', o: ['知道了'] },
  ],
  '工匠': [
    { t: '大王，我等已备好木盾石斧。若讨伐巨怪，可带三名武士同往。', o: ['多谢', '物资可还充足？'] },
    { t: '粮草尚足，木材略紧。讨伐路上还请珍惜。', o: ['告辞'] },
  ],
  '农人': [
    { t: '今年稻穗金黄，若不是那巨怪啸聚西边，本该是个好年景。', o: ['巨怪在何处？', '保重'] },
    { t: '出城往西，沿着稻田外的土路走，那片野花草丛便是。', o: ['多谢指点'] },
  ],
};
let dlgWho = '', dlgStep = 0;
function openDialogue(who) {
  dlgWho = who; dlgStep = 0;
  G.phase = 'dialogue';
  $('dialogue').classList.remove('hidden');
  $('hud').classList.add('hidden');
  renderDialogue();
}
function renderDialogue() {
  const tree = DIALOG[dlgWho];
  if (!tree || dlgStep >= tree.length) { closeDialogue(); return; }
  const node = tree[dlgStep];
  $('dWho').textContent = dlgWho;
  $('dText').textContent = node.t;
  const box = $('dOpts'); box.innerHTML = '';
  node.o.forEach((label, i) => {
    const b = document.createElement('div'); b.className = 'opt';
    b.textContent = (i + 1) + '. ' + label;
    b.onclick = () => chooseOption(i);
    box.appendChild(b);
  });
}
function chooseOption(i) {
  const tree = DIALOG[dlgWho];
  if (dlgWho === '长者' && dlgStep === 0) {
    dlgStep = i === 0 ? 1 : 2;
  } else if (dlgWho === '长者' && dlgStep === 2) {
    if (i === 0) { G.quest = 2; toast('使命更新：讨伐岩石巨怪'); }
    closeDialogue(); return;
  } else if (((dlgWho === '祭司' || dlgWho === '工匠' || dlgWho === '农人') && dlgStep === 0 && i === 0)) {
    dlgStep = 1;
  } else {
    closeDialogue(); return;
  }
  renderDialogue();
}
function closeDialogue() {
  $('dialogue').classList.add('hidden');
  $('hud').classList.remove('hidden');
  G.phase = 'roam';
}
addEventListener('keydown', e => {
  if (G.phase !== 'dialogue') return;
  const m = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 };
  if (e.code in m) chooseOption(m[e.code]);
});

// ---------- 交互检测 ----------
let nearTarget = null;
function tryInteract() {
  if (!nearTarget) return;
  if (nearTarget.kind === 'npc') { openDialogue(nearTarget.obj.userData.name); return; }
  if (nearTarget.kind === 'golem') { startBattle(); return; }
  if (nearTarget.kind === 'altar') {
    if (G.jadeTaken >= 5) winGame();
    else toast('还需 ' + (5 - G.jadeTaken) + ' 枚通神之玉');
    return;
  }
}
function updateNear() {
  if (G.phase !== 'roam') { $('prompt').classList.add('hidden'); return; }
  let best = null, bd = 4.2;
  for (const n of npcObjs) {
    const d = player.position.distanceTo(new THREE.Vector3(n.position.x, 0, n.position.z));
    if (d < bd) { bd = d; best = { kind: 'npc', obj: n, label: '与' + n.userData.name + '交谈' }; }
  }
  const gd = player.position.distanceTo(golem.position);
  if (golem.visible && gd < 8 && gd < bd + 5) {
    best = { kind: 'golem', obj: golem, label: '讨伐岩石巨怪' }; bd = gd;
  }
  const ad = player.position.distanceTo(new THREE.Vector3(0, 0, 6));
  if (ad < 9 && ad < bd) best = { kind: 'altar', obj: altar, label: '登台献祭' };
  nearTarget = best;
  const p = $('prompt');
  if (best) { p.textContent = 'E · ' + best.label; p.classList.remove('hidden'); }
  else p.classList.add('hidden');
}

// ============================================================
// 战斗系统
// ============================================================
function startBattle() {
  G.phase = 'battle';
  G.golemHP = G.golemMax;
  G.party.forEach(p => p.hp = p.max);
  G.round = 1;
  G.bPhase = 'intro'; G.bTimer = 0;
  G.bPending = null;
  $('hud').classList.add('hidden');
  $('prompt').classList.add('hidden');
  $('battle').classList.remove('hidden');
  // 武士登场，站在巨怪前
  warriors.forEach((w, i) => {
    w.visible = true;
    const a = (i - 1) * .5;
    w.position.set(golem.position.x + Math.sin(a) * 6, 0, golem.position.z + 8 + Math.cos(a) * 2);
    w.rotation.y = Math.atan2(golem.position.x - w.position.x, golem.position.z - w.position.z);
  });
  setBattleButtons(false);
  $('bLog').textContent = '岩石巨怪拦住去路！王啊，请下令。';
  updateBattleUI();
}
function updateBattleUI() {
  $('bBar').style.width = (G.golemHP / G.golemMax * 100) + '%';
  $('bNum').textContent = Math.max(0, G.golemHP) + ' / ' + G.golemMax;
  $('bStatus').textContent = G.party.map(p => p.name + ' ' + Math.max(0, p.hp) + '/' + p.max).join('　') + '　·　第 ' + G.round + ' 回合';
}
function setBattleButtons(on) {
  document.querySelectorAll('.b-cmds button').forEach(b => b.disabled = !on);
}
function logBattle(msg) { $('bLog').textContent = msg; }

document.querySelectorAll('.b-cmds button').forEach(btn => {
  btn.onclick = () => {
    if (G.bPhase !== 'choose') return;
    G.bPending = btn.dataset.cmd;
    G.bPhase = 'charge'; G.bTimer = 0;
    setBattleButtons(false);
    const labels = { charge: '众武士挺斧冲锋！', guard: '武士列盾坚守！', rest: '武士调息蓄势！', retreat: '号令撤退，保全队伍。' };
    logBattle(labels[G.bPending]);
    if (G.bPending === 'retreat') { G.bPhase = 'retreat'; G.bTimer = 0; }
  };
});

function resolveBattleAction() {
  const cmd = G.bPending;
  if (cmd === 'retreat') {
    endBattle(false, true); return;
  }
  const alive = G.party.filter(p => p.hp > 0);
  if (cmd === 'rest') {
    alive.forEach(p => p.hp = Math.min(p.max, p.hp + 10));
    logBattle('武士蓄势，恢复 10 点生命。');
    spawnHit(new THREE.Vector3(golem.position.x, 2, golem.position.z), 0x8fe8c0, false);
  } else {
    let dmg;
    if (cmd === 'charge') dmg = Math.floor(rand(16, 26)) * Math.max(1, alive.length);
    else dmg = Math.floor(rand(6, 12)) * Math.max(1, alive.length);
    G.golemHP = Math.max(0, G.golemHP - dmg);
    // 打击特效：巨怪胸前
    spawnHit(new THREE.Vector3(golem.position.x, 4.6, golem.position.z + 1.5), 0xffd27a, true);
    golem.userData.hitFlash = 0.35;
    logBattle((cmd === 'charge' ? '冲锋命中！' : '坚守出击！') + ' 造成 ' + dmg + ' 点伤害。');
  }
  updateBattleUI();
  if (G.golemHP <= 0) {
    G.bPhase = 'victory'; G.bTimer = 0;
    setTimeout(() => endBattle(true), 900);
    return;
  }
  // 巨怪反击
  G.bPhase = 'counter'; G.bTimer = 0;
}

function golemCounter() {
  const alive = G.party.filter(p => p.hp > 0);
  if (!alive.length) { endBattle(false); return; }
  const victim = alive[Math.floor(Math.random() * alive.length)];
  const dmg = G.bPending === 'charge' ? Math.floor(rand(6, 12)) : Math.floor(rand(2, 6));
  victim.hp = Math.max(0, victim.hp - dmg);
  const wi = warriors[G.party.indexOf(victim)];
  spawnHit(new THREE.Vector3(wi.position.x, 1.6, wi.position.z), 0xe07d5c, false);
  logBattle('巨怪反击，' + victim.name + ' 受到 ' + dmg + ' 点伤害。');
  updateBattleUI();
  if (G.party.every(p => p.hp <= 0)) { G.bPhase = 'defeat'; G.bTimer = 0; setTimeout(() => endBattle(false), 800); return; }
  G.round++;
  G.bPhase = 'choose'; G.bTimer = 0;
  setBattleButtons(true);
}

function endBattle(win, retreat = false) {
  $('battle').classList.add('hidden');
  warriors.forEach(w => w.visible = false);
  if (win) {
    G.golemAwake = true;
    golem.visible = false;
    G.res.mat += 20; G.res.jade++;
    if (G.quest === 2) { G.quest = 3; toast('使命更新：携玉登台，完成祭祀'); }
    G.phase = 'roam';
    $('hud').classList.remove('hidden');
    updateHUD();
    toast('讨伐成功！获得木材 +20、通神之玉 +1');
  } else if (retreat) {
    G.phase = 'roam'; $('hud').classList.remove('hidden');
    toast('已撤退，可重整队伍再来。');
  } else {
    G.phase = 'end';
    $('end').classList.add('hidden');
    $('end').classList.add('lose');
    $('endTitle').textContent = '大 势 已 去';
    $('endSub').textContent = '武士尽折，巨怪仍盘踞荒原。良渚的未来，尚有转机——再来一局，另谋良策。';
    $('end').classList.remove('hidden');
  }
}

function winGame() {
  G.phase = 'end';
  $('end').classList.remove('lose');
  $('endTitle').textContent = '祭 祀 已 成';
  $('endSub').textContent = '五玉齐备，玉琮生辉，洪水渐退。你以玉通神，护住了这座城，护住了良渚。';
  $('end').classList.remove('hidden');
}

// ---------- 战斗动画状态机 ----------
function updateBattle(dt) {
  G.bTimer += dt;
  // 巨怪待机轻微浮动
  golem.userData.body.rotation.y = Math.sin(G.bTimer * .8) * .04;
  if (golem.userData.hitFlash > 0) {
    golem.userData.hitFlash -= dt;
    const on = golem.userData.hitFlash > 0;
    golem.userData.body.material = on ? MAT.jadeGlow : MAT.rock;
  }
  if (G.bPhase === 'intro') {
    if (G.bTimer > .8) { G.bPhase = 'choose'; G.bTimer = 0; setBattleButtons(true); }
  } else if (G.bPhase === 'charge') {
    // 武士冲向巨怪再返回
    warriors.forEach((w, i) => {
      const home = new THREE.Vector3(golem.position.x + Math.sin((i-1)*.5)*6, 0, golem.position.z + 8 + Math.cos((i-1)*.5)*2);
      const k = clamp(G.bTimer / .7, 0, 1);
      const toward = Math.sin(k * Math.PI);
      const tx = golem.position.x + Math.sin((i-1)*.5)*4;
      const tz = golem.position.z + 5;
      w.position.lerpVectors(home, new THREE.Vector3(tx, 0, tz), toward);
      if (w.userData.armR) w.userData.armR.rotation.x = -toward * 1.8;
    });
    if (G.bTimer > .75) {
      resolveBattleAction();
      warriors.forEach(w => { if (w.userData.armR) w.userData.armR.rotation.x = 0; });
      if (G.bPhase === 'counter') {
        warriors.forEach((w, i) => {
          const home = new THREE.Vector3(golem.position.x + Math.sin((i-1)*.5)*6, 0, golem.position.z + 8 + Math.cos((i-1)*.5)*2);
          w.position.copy(home);
        });
      }
    }
  } else if (G.bPhase === 'counter') {
    if (G.bTimer > .7) golemCounter();
  } else if (G.bPhase === 'retreat') {
    if (G.bTimer > .8) endBattle(false, true);
  }
}

// ============================================================
// 玩家移动 & 相机
// ============================================================
let jumpV = 0, playerY = 0;
function updatePlayer(dt) {
  if (G.phase !== 'roam') return;
  let mx = 0, mz = 0;
  if (keys.KeyW) mz -= 1;
  if (keys.KeyS) mz += 1;
  if (keys.KeyA) mx -= 1;
  if (keys.KeyD) mx += 1;
  const moving = mx !== 0 || mz !== 0;
  if (moving) {
    const len = Math.hypot(mx, mz); mx /= len; mz /= len;
    const speed = keys.ShiftLeft || keys.ShiftRight ? 15 : 9;
    // 相对相机方向
    const fx = mx * Math.cos(camYaw) + mz * Math.sin(camYaw);
    const fz = -mx * Math.sin(camYaw) + mz * Math.cos(camYaw);
    player.position.x += fx * speed * dt;
    player.position.z += fz * speed * dt;
    // 限制在岛上
    const r = Math.hypot(player.position.x, player.position.z);
    if (r > 60) { player.position.x *= 60 / r; player.position.z *= 60 / r; }
    // 朝向
    const targetRot = Math.atan2(fx, fz);
    let diff = targetRot - player.rotation.y;
    while (diff > Math.PI) diff -= TAU;
    while (diff < -Math.PI) diff += TAU;
    player.rotation.y += diff * Math.min(1, dt * 10);
    // 走路摆动
    const sw = Math.sin(performance.now() * .012) * .4;
    if (player.userData.armL) player.userData.armL.rotation.x = sw;
    if (player.userData.armR) player.userData.armR.rotation.x = -sw;
  }
  // 跳跃
  if (keys.Space && playerY <= 0) jumpV = 8;
  if (jumpV !== 0 || playerY > 0) {
    jumpV -= 22 * dt; playerY += jumpV * dt;
    if (playerY <= 0) { playerY = 0; jumpV = 0; }
  }
  player.position.y = playerY;
  // 时间推进
  G.time += dt * .012;
  if (G.time >= 1) { G.time = 0; G.day++; G.res.food = Math.max(0, G.res.food - 2); }
}

function updateCamera(dt) {
  let cx, cy, cz, look;
  if (G.battleCamera || G.phase === 'battle') {
    // 战斗视角：侧后方看巨怪与武士
    cx = golem.position.x + 14; cy = 9; cz = golem.position.z + 16;
    look = new THREE.Vector3(golem.position.x, 3.6, golem.position.z);
  } else {
    cx = player.position.x + Math.sin(camYaw) * camDist * Math.cos(camPitch);
    cz = player.position.z + Math.cos(camYaw) * camDist * Math.cos(camPitch);
    cy = player.position.y + 2 + Math.sin(camPitch) * camDist;
    look = new THREE.Vector3(player.position.x, player.position.y + 1.2, player.position.z);
  }
  camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 6));
  camera.lookAt(look);
}

// ---------- 世界动画 ----------
function updateWorld(dt, t) {
  // 玉琮发光脉动
  const pulse = 1.2 + Math.sin(t * 2) * .4;
  MAT.jadeGlow.emissiveIntensity = pulse;
  altarLight.intensity = 2 + Math.sin(t * 2) * .5;
  cong.rotation.y += dt * .15;
  // 玉石旋转浮动 + 拾取
  jades.forEach(j => {
    if (j.userData.taken) return;
    j.userData.gem.rotation.y += dt * 1.2;
    j.userData.gem.position.y = j.userData.baseY + Math.sin(t * 2 + j.userData.index) * .18;
    j.userData.halo.material.opacity = .35 + Math.sin(t * 3 + j.userData.index) * .18;
    if (G.phase === 'roam' && player.position.distanceTo(new THREE.Vector3(j.position.x, 0, j.position.z)) < 2.2) {
      j.userData.taken = true;
      j.visible = false;
      G.jadeTaken++; G.res.jade++;
      spawnHit(new THREE.Vector3(j.position.x, 1.4, j.position.z), 0x8fe8c0, true);
      toast('拾得通神之玉（' + G.jadeTaken + '/5）');
      if (G.quest === 0 || G.quest === 1) { G.quest = 1; }
      if (G.jadeTaken === 5 && !G.golemAwake) {
        golem.visible = true;
        toast('五玉齐备！西外环的岩石巨怪已然苏醒');
        if (G.quest === 1) G.quest = 2;
      }
      updateHUD();
    }
  });
  // 水面微动
  scene.fog.color.setHSL(.47, .12, .68 + Math.sin(t * .3) * .01);
}

// ============================================================
// 主循环
// ============================================================
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .05);
  const t = clock.elapsedTime;
  updatePlayer(dt);
  updateNear();
  if (G.phase === 'battle') updateBattle(dt);
  updateWorld(dt, t);
  updateFx(dt);
  updateCamera(dt);
  if (G.phase === 'roam' || G.phase === 'battle') updateHUD();
  renderer.render(scene, camera);
}

// ---------- 启动 / 重开 ----------
function startGame() {
  $('start').classList.add('hidden');
  $('load').classList.add('hidden');
  $('hud').classList.remove('hidden');
  G.phase = 'roam';
  player.position.set(0, 0, 18);
  camYaw = 0; camPitch = .55; camDist = 16;
  updateHUD();
  toast('使命：先去寻访长者');
}
function restartGame() {
  $('end').classList.add('hidden');
  G.phase = 'roam'; G.quest = 0; G.day = 1; G.time = 0;
  G.jadeTaken = 0; G.golemAwake = false;
  G.res = { jade: 0, food: 20, mat: 10, pop: 12 };
  jades.forEach(j => { j.userData.taken = false; j.visible = true; });
  golem.visible = false;
  player.position.set(0, 0, 18);
  $('hud').classList.remove('hidden');
  updateHUD();
}
$('btnStart').onclick = startGame;
$('btnRestart').onclick = restartGame;

// 首帧渲染后显示开始界面
updateCamera(1);
renderer.render(scene, camera);
$('load').classList.add('hidden');
$('start').classList.remove('hidden');
animate();
