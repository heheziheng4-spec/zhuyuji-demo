import * as THREE from 'three';

// ============================================================
// 逐玉记 · Three.js 网页版  (内容同步自 v0.23 扩展版 demo)
// 程序化生成良渚王城：水环 / 祭坛 / 稻田 / 建筑 / 树林 / 角色
// 系统：第三人称漫游 · 数据驱动多轮对话+好感度 · 玉石拾取
//       · 岩石巨怪讨伐战 · 观星北斗夜色 · 玉琮蓝色方圆 · 祭祀
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
const SKY_DAY = new THREE.Color(0x9fb9b4);
const SKY_NIGHT = new THREE.Color(0x0a1024);
scene.background = SKY_DAY.clone();
scene.fog = new THREE.Fog(SKY_DAY.clone(), 70, 190);

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
  clothPriest: new THREE.MeshStandardMaterial({ color: 0x7c86b8, roughness: 1 }),
  clothNoble: new THREE.MeshStandardMaterial({ color: 0x6d5a8c, roughness: 1 }),
  white: new THREE.MeshStandardMaterial({ color: 0xeae6da, roughness: .9 }),
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

disk(GROUND_R + 40, MAT.grass, 0, -.05, 0, world);
disk(GROUND_R, MAT.grass2, 0, 0, 0, world);
function ring(ri, ro, mat, y) {
  const g = new THREE.RingGeometry(ri, ro, 64);
  const m = new THREE.Mesh(g, mat);
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true;
  world.add(m); return m;
}
ring(46, 56, MAT.water, .06);
ring(44, 46, MAT.soil, .04);
ring(56, 58, MAT.soil, .04);
disk(16, MAT.soil, 0, .02, 0, world);

// ---------- 祭坛（中心） ----------
const altar = new THREE.Group();
altar.position.set(0, 0, 6);
world.add(altar);
cyl(9, 10, 1.2, MAT.stone, 0, .6, 0, altar, 32);
cyl(7, 7.6, 1, MAT.stone, 0, 1.7, 0, altar, 32);
cyl(5, 5.4, .9, MAT.stoneDark, 0, 2.6, 0, altar, 32);
const cong = new THREE.Group();
cong.position.y = 5.4; altar.add(cong);
box(2.6, 4.2, 2.6, MAT.jade, 0, 0, 0, cong);
cyl(.85, .85, 4.4, MAT.jadeGlow, 0, 0, 0, cong, 24);
for (let i = 0; i < 4; i++) {
  const g = box(2.9, .16, 2.9, MAT.gold, 0, -1.5 + i, 0, cong, false);
  g.material = MAT.gold;
}
const altarLight = new THREE.PointLight(0x6fe0b0, 2.2, 26, 2);
altarLight.position.set(0, 7, 0); altar.add(altarLight);
for (let i = 0; i < 4; i++) {
  const a = i / 4 * TAU + Math.PI / 4;
  cyl(.7, .85, 4.5, MAT.stoneDark, Math.cos(a) * 12, 2.25, Math.sin(a) * 12, altar, 8);
}

// 玉琮蓝色方圆特效（祭坛交互 / B 键触发）—— 圆与方的共鸣
const altarFX = new THREE.Group();
altarFX.position.set(0, 3.1, 6); world.add(altarFX);
const fxBlueMat = new THREE.MeshBasicMaterial({ color: 0x5aa8ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
const fxBlueRing = new THREE.Mesh(new THREE.RingGeometry(6.4, 6.9, 64), fxBlueMat);
fxBlueRing.rotation.x = -Math.PI / 2; altarFX.add(fxBlueRing);
const fxBlueSquare = new THREE.Mesh(new THREE.PlaneGeometry(11.4, 11.4), fxBlueMat.clone());
fxBlueSquare.rotation.x = -Math.PI / 2; fxBlueSquare.position.y = .05; altarFX.add(fxBlueSquare);
const fxBlueRing2 = new THREE.Mesh(new THREE.RingGeometry(3.0, 3.3, 48), fxBlueMat.clone());
fxBlueRing2.rotation.x = -Math.PI / 2; fxBlueRing2.position.y = .1; altarFX.add(fxBlueRing2);
altarFX.userData = { mats: [fxBlueMat, fxBlueSquare.material, fxBlueRing2.material], until: 0 };

// ---------- 稻田 ----------
const farm = new THREE.Group(); world.add(farm);
for (let gx = 0; gx < 7; gx++) for (let gz = 0; gz < 4; gz++) {
  const px = -21 + gx * 7, pz = 26 + gz * 6;
  if (Math.hypot(px, pz) > 44) continue;
  box(6.2, .18, 5.2, MAT.soil, px, .1, pz, farm, false);
  for (let r = 0; r < 3; r++) {
    const row = box(5.6, .5, .5, MAT.rice, px, .45, pz - 1.6 + r * 1.6, farm, false);
    row.rotation.y = rand(-.03, .03);
  }
}

// ---------- 房屋 ----------
function makeHouse(x, z, rot = 0, scale = 1) {
  const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = rot; h.scale.setScalar(scale);
  world.add(h);
  box(5, 3, 4.5, MAT.wall, 0, 1.5, 0, h);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.6, 4), MAT.roof);
  roof.position.y = 4.2; roof.rotation.y = Math.PI / 4;
  roof.castShadow = true; h.add(roof);
  box(1.2, 2, .15, MAT.wood, 0, 1, 2.3, h, false);
}
[[-26,8,.3],[-24,-6,-.2],[-18,-16,.5],[22,10,-.4],[26,-4,.2],[18,-18,-.5],[-30,20,.7],[30,20,-.7],[-12,34,.1],[14,34,-.1]]
  .forEach(s => makeHouse(...s));

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
  if (Math.hypot(x, z - 6) < 14) continue;
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

// ---------- 远山 / 云 ----------
for (let i = 0; i < 12; i++) {
  const a = i / 12 * TAU, r = 120;
  const m = new THREE.Mesh(new THREE.ConeGeometry(18 + srand() * 10, 26 + srand() * 18, 5),
    new THREE.MeshStandardMaterial({ color: 0x8a9888, roughness: 1 }));
  m.position.set(Math.cos(a) * r, 8, Math.sin(a) * r);
  world.add(m);
}
const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .75, roughness: 1 });
for (let i = 0; i < 7; i++) {
  const c = new THREE.Group();
  c.position.set(rand(-80, 80), rand(28, 42), rand(-80, 80));
  for (let j = 0; j < 3; j++) sph(rand(4, 7), cloudMat, j * 5 - 5, rand(-1, 1), rand(-2, 2), c).castShadow = false;
  world.add(c);
}

// ---------- 观星石环 + 北斗七星（东南观星祭岛） ----------
const starRing = new THREE.Group();
starRing.position.set(34, 0, -6); world.add(starRing);
const starStone = new THREE.MeshStandardMaterial({ color: 0x9a9480, roughness: 1 });
const ringHoop = new THREE.Mesh(new THREE.TorusGeometry(4.2, .55, 12, 40), starStone);
ringHoop.position.y = 4.4; ringHoop.castShadow = true; starRing.add(ringHoop);
for (let i = 0; i < 8; i++) {
  const a = i / 8 * TAU;
  cyl(.45, .6, 2.2, starStone, Math.cos(a) * 4.2, 1.1, Math.sin(a) * 4.2, starRing, 8);
}
const starDisc = new THREE.Mesh(new THREE.CircleGeometry(3.4, 40),
  new THREE.MeshBasicMaterial({ color: 0x2fd488, transparent: true, opacity: .28, side: THREE.DoubleSide, depthWrite: false }));
starDisc.rotation.x = -Math.PI / 2; starDisc.position.y = .05; starRing.add(starDisc);

const bigDipper = new THREE.Group(); scene.add(bigDipper);
const dipperCenter = new THREE.Vector3(34, 46, -14);
// 勺形相对坐标 (x, y)
const dipperPts = [[-4.5,3.2],[-4.0,1.6],[-2.2,1.3],[-1.8,2.9],[0,3.0],[1.9,2.4],[3.7,1.4]];
const dipperEdges = [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]];
const starMat = new THREE.MeshBasicMaterial({ color: 0xeaf3ff, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
dipperPts.forEach(([sx, sy]) => {
  const s = new THREE.Mesh(new THREE.SphereGeometry(.95, 12, 10), starMat);
  s.position.set(dipperCenter.x + sx * 2.4, dipperCenter.y + sy * 2.4, dipperCenter.z);
  s.renderOrder = 5; bigDipper.add(s);
});
const dipperLineMat = new THREE.LineBasicMaterial({ color: 0x8fc8ff, transparent: true, opacity: 0, depthTest: false });
const lineGeom = new THREE.BufferGeometry().setFromPoints(dipperEdges.map(([a, b]) => {
  const pa = dipperPts[a], pb = dipperPts[b];
  return [
    new THREE.Vector3(dipperCenter.x + pa[0]*2.4, dipperCenter.y + pa[1]*2.4, dipperCenter.z),
    new THREE.Vector3(dipperCenter.x + pb[0]*2.4, dipperCenter.y + pb[1]*2.4, dipperCenter.z),
  ];
}).flat());
bigDipper.add(new THREE.LineSegments(lineGeom, dipperLineMat));

// ============================================================
// 角色构建（低多边形人形，程序化）
// ============================================================
function makePerson(clothMat, scale = 1, withCrown = false) {
  const g = new THREE.Group(); g.scale.setScalar(scale);
  cyl(.42, .55, 1.3, clothMat, 0, .85, 0, g, 10);
  sph(.36, MAT.skin, 0, 1.75, 0, g);
  cyl(.42, .42, .18, clothMat, 0, 1.35, 0, g, 10);
  const armL = cyl(.13, .13, 1.05, MAT.skin, -.55, 1.0, 0, g, 8); armL.rotation.z = -.18;
  const armR = cyl(.13, .13, 1.05, MAT.skin, .55, 1.0, 0, g, 8); armR.rotation.z = .18;
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
// 神鹿：四足白色灵兽
function makeDeer() {
  const g = new THREE.Group();
  const body = sph(.85, MAT.white, 0, 1.5, 0, g); body.scale.set(1.5, .8, .8);
  const neck = cyl(.2, .28, 1.1, MAT.white, 0, 2.2, .8, g, 8); neck.rotation.x = -.4;
  sph(.42, MAT.white, 0, 2.7, 1.2, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(.12, .12, 1.2, MAT.white, sx*.5, .6, sz*.5, g, 6);
  const antlerMat = MAT.gold;
  for (const sx of [-1, 1]) {
    const a = cyl(.05, .08, .9, antlerMat, sx*.28, 3.2, 1.15, g, 6); a.rotation.z = sx*.4;
    const b = cyl(.04, .06, .6, antlerMat, sx*.5, 3.55, 1.15, g, 6); b.rotation.z = sx*.7;
  }
  sph(.07, MAT.jadeGlow, -.2, 2.72, 1.55, g); sph(.07, MAT.jadeGlow, .2, 2.72, 1.55, g);
  return g;
}
// 玉灵：图腾小怪物（小巧青玉色）
function makeTotem() {
  const g = new THREE.Group(); g.scale.setScalar(.62);
  const body = sph(.6, MAT.jade, 0, 1.0, 0, g); body.scale.set(1, .9, .8);
  sph(.42, MAT.jadeGlow, 0, 1.75, 0, g);
  for (const sx of [-1, 1]) {
    sph(.11, MAT.jadeGlow, sx*.18, 1.8, .34, g);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(.12, .5, 5), MAT.gold);
    horn.position.set(sx*.35, 2.2, 0); horn.rotation.z = sx*.3; g.add(horn);
    sph(.16, MAT.jade, sx*.55, .9, 0, g);
  }
  return g;
}

// 玩家（王）
const player = makePerson(MAT.clothKing, 1.15, true);
player.position.set(0, 0, 18);
world.add(player);
const gui = box(.14, 1.1, .06, MAT.jade, .6, 1.0, .1, player, false);

// NPC：8 位角色，与最新 demo 的角色档案一致
// key 供对话系统使用；name 为显示名
const npcs = [
  { key: 'elder',   name: '长者 · 耄',   build: () => makePerson(MAT.clothElder, 1.08),      pos: [-10, 10] },
  { key: 'farmer',  name: '农夫 · 阿禾', build: () => makePerson(MAT.rice, 1.02),            pos: [16, 28] },
  { key: 'artisan', name: '工匠 · 石乙', build: () => makePerson(MAT.wood, 1.04),            pos: [-20, -4] },
  { key: 'priest',  name: '巫祝 · 云巫', build: () => makePerson(MAT.clothPriest, 1.06),     pos: [8, 16] },
  { key: 'warrior', name: '武士 · 戈',   build: () => makePerson(MAT.clothGuard, 1.1),       pos: [6, -24] },
  { key: 'totem',   name: '玉灵',        build: () => makeTotem(),                           pos: [-26, -16] },
  { key: 'deer',    name: '神鹿 · 白蹄', build: () => makeDeer(),                            pos: [30, 30] },
  { key: 'noble',   name: '玉君',        build: () => makePerson(MAT.clothNoble, 1.12, true),pos: [0, -22] },
];
const npcObjs = [];
for (const n of npcs) {
  const g = n.build();
  g.position.set(n.pos[0], 0, n.pos[1]); g.rotation.y = rand(0, TAU);
  g.userData.name = n.name; g.userData.key = n.key; world.add(g); npcObjs.push(g);
}

// ---------- 岩石巨怪（西外环荒原） ----------
function makeGolem() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5, 0), MAT.rock);
  body.scale.set(1, 1.25, .85); body.position.y = 4.2; body.castShadow = true; g.add(body);
  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 0), MAT.rockDark);
  head.position.y = 7.2; head.castShadow = true; g.add(head);
  sph(.22, MAT.jadeGlow, -.5, 7.35, 1.0, g); sph(.22, MAT.jadeGlow, .5, 7.35, 1.0, g);
  const armL = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 0), MAT.rock);
  armL.scale.set(.7, 1.5, .7); armL.position.set(-3.0, 4.3, 0); armL.castShadow = true; g.add(armL);
  const armR = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 0), MAT.rock);
  armR.scale.set(.7, 1.5, .7); armR.position.set(3.0, 4.3, 0); armR.castShadow = true; g.add(armR);
  sph(1.25, MAT.rockDark, -3.2, 2.6, 0, g); sph(1.25, MAT.rockDark, 3.2, 2.6, 0, g);
  const legL = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), MAT.rockDark);
  legL.scale.set(.8, 1.3, .8); legL.position.set(-1.1, 1.4, 0); legL.castShadow = true; g.add(legL);
  const legR = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), MAT.rockDark);
  legR.scale.set(.8, 1.3, .8); legR.position.set(1.1, 1.4, 0); legR.castShadow = true; g.add(legR);
  sph(.45, MAT.jade, 0, 4.6, 2.0, g);
  g.userData = { body, head, armL, armR, hitFlash: 0 };
  return g;
}
const golem = makeGolem();
golem.position.set(-40, 0, 26);
golem.rotation.y = Math.PI * .75;
world.add(golem);
golem.visible = false;

// ---------- 武士（战斗时登场） ----------
const warriors = [];
for (let i = 0; i < 3; i++) {
  const w = makePerson(MAT.clothGuard, 1.05, false);
  w.visible = false; world.add(w); warriors.push(w);
  const shield = cyl(.55, .55, .12, MAT.wood, -.6, 1.0, .35, w, 12); shield.rotation.x = Math.PI / 2;
  box(.1, 1.5, .1, MAT.wood, .6, 1.2, 0, w, false);
}

// ---------- 玉石（可拾取，三种：发光玉石 / 玉琮 / 玉石旋环） ----------
const jades = [];
const jadeSpots = [
  [-8, 22, '发光玉石'], [12, 24, '玉琮'], [-24, 14, '玉石旋环'],
  [24, 6, '发光玉石'], [-6, -14, '玉琮'],
];
jadeSpots.forEach((p, i) => {
  const g = new THREE.Group(); g.position.set(p[0], 0, p[1]); world.add(g);
  let gem;
  if (p[2] === '玉琮') {
    gem = box(.9, 1.25, .9, MAT.jadeGlow, 0, 1.2, 0, g);
    cyl(.32, .32, 1.3, MAT.gold, 0, 1.2, 0, g, 16);
  } else if (p[2] === '玉石旋环') {
    gem = new THREE.Mesh(new THREE.TorusGeometry(.7, .18, 10, 24), MAT.jadeGlow);
    gem.position.y = 1.2; gem.castShadow = true; g.add(gem);
  } else {
    gem = new THREE.Mesh(new THREE.OctahedronGeometry(.7, 0), MAT.jadeGlow);
    gem.position.y = 1.2; gem.castShadow = true; g.add(gem);
  }
  const halo = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.25, 24),
    new THREE.MeshBasicMaterial({ color: 0x8fe8c0, transparent: true, opacity: .5, side: THREE.DoubleSide }));
  halo.rotation.x = -Math.PI / 2; halo.position.y = .08; g.add(halo);
  const light = new THREE.PointLight(0x7fe0b8, 1.0, 8, 2); light.position.y = 1.5; g.add(light);
  g.userData = { gem, halo, baseY: 1.2, taken: false, index: i, kind: p[2] };
  jades.push(g);
});

// ============================================================
// 打击特效（扩散光环 + 星芒 + 碎片）
// ============================================================
const fxList = [];
function spawnHit(pos, color = 0xffd27a, big = false) {
  const g = new THREE.Group(); g.position.copy(pos); scene.add(g);
  const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .95, side: THREE.DoubleSide, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(.3, .5, 24), ringMat);
  ring.lookAt(camera.position); g.add(ring);
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
    f.g.scale.setScalar(1 + k * 5);
    f.mats.forEach(m => m.opacity = (1 - k) * .95);
  }
}

// ============================================================
// 对话系统（数据驱动，移植自最新 demo 的 dialogue.py）
// ============================================================
const CHAR = {
  elder:   { name: '长者 · 耄',   affLabel: v => v>=80?'知己':v>=50?'信任':v>=25?'友好':v>=10?'认识':'陌生' },
  farmer:  { name: '农夫 · 阿禾', affLabel: v => v>=80?'知己':v>=50?'信任':v>=25?'友好':v>=10?'认识':'陌生' },
  artisan: { name: '工匠 · 石乙', affLabel: v => v>=80?'知己':v>=50?'信任':v>=25?'友好':v>=10?'认识':'陌生' },
  priest:  { name: '巫祝 · 云巫', affLabel: v => v>=80?'知己':v>=50?'信任':v>=25?'友好':v>=10?'认识':'陌生' },
  warrior: { name: '武士 · 戈',   affLabel: v => v>=80?'知己':v>=50?'信任':v>=25?'友好':v>=10?'认识':'陌生' },
  totem:   { name: '玉灵',        affLabel: v => v>=80?'知己':v>=50?'信任':v>=25?'友好':v>=10?'认识':'陌生' },
  deer:    { name: '神鹿 · 白蹄', affLabel: v => v>=80?'知己':v>=50?'信任':v>=25?'友好':v>=10?'认识':'陌生' },
  noble:   { name: '玉君',        affLabel: v => v>=80?'知己':v>=50?'信任':v>=25?'友好':v>=10?'认识':'陌生' },
};
// 情境闲聊台词（探索时玉石感应等）
const CONTEXT = {
  elder:  { explore: '河滩的玉，只在雨后现身。切莫空手而归。' },
  farmer: { explore: '那边石头堆里好像有东西，你去瞧瞧？' },
  artisan:{ explore: '祭坛那块缺了角，你去寻块好石料来。' },
  priest: { explore: '石环的方向错了，它会记得天空的。玉琮在地底沉睡了千年，轻些唤醒它。' },
  warrior:{ explore: '北边安静得反常。跟紧我。神树那边有动静。' },
  totem:  { explore: '神树在那边！小心脚下！别碰那块玉！' },
  deer:   { explore: '跟着我。林间的小家伙们，认得玉的光。' },
  noble:  { explore: '玉旋环指向天心，你可知为何？去吧，试玉之人。玉光响应。' },
};
// 对话树：node = { s: 说话者key, t: 文本, o: [ {t,next,aff,flag,req,reqAff,reply} ] }
const NODES = {
  elder_root: { s:'elder', t:'你且看这营火，将熄未熄。孩子，你为何而来？', o:[
    { t:'我为治水与礼制而来，愿听您指点。', next:'elder_wise', aff:8, flag:'learned_purpose', reply:'长者缓缓点头：水路即礼路。你懂这个，便已入门。' },
    { t:'我只是想帮聚落渡过洪水。', next:'elder_kind', aff:5, flag:'kind_heart', reply:'长者：心存聚落，便已是寻玉之人。' },
    { t:'玉到底有什么用？能换粮吗？', next:'elder_blunt', aff:-3, reply:'长者眉头微皱：玉不换粮。玉，换的是人心。' },
    { t:'（沉默，递上一份材料）', next:'elder_gift', aff:12, flag:'elder_gifted', reply:'长者接过材料，眼中闪过一丝暖意：……有心了。' },
  ]},
  elder_wise: { s:'elder', t:'水记得每一道渠。你若疏通了它，田便会活。祭坛那边……你且先别急。', o:[
    { t:'祭坛的刻纹，藏着什么？', next:'elder_lore', reqAff:8, reply:'长者压低声音：刻纹记着每一位执玉者的名字。' },
    { t:'我明白了，这就去疏通水渠。', aff:3, reply:'长者：去吧，我守着火。' },
  ]},
  elder_kind: { s:'elder', t:'慢些，孩子。先与阿禾他们聊聊，聚落不只是一个人的事。', o:[
    { t:'好，我先去认识大家。', aff:4, reply:'长者：嗯，得民心者，方得玉光。' },
  ]},
  elder_blunt: { s:'elder', t:'哼……也罢。你自会明白。先去水渠看看吧。', o:[
    { t:'（告辞）', reply:'长者不再言语，只望着营火。' },
  ]},
  elder_gift: { s:'elder', t:'玉不自鸣，待人而光。你这份心意，老朽记下了。', o:[
    { t:'您说的古礼，能再讲讲吗？', next:'elder_lore', req:'elder_gifted', reply:'长者：祭祀之礼，贵在诚，不在多。' },
    { t:'我去干活了。', reply:'长者：去吧，火我看着。' },
  ]},
  elder_lore: { s:'elder', t:'古礼有三：治水以养民，筑台以通天，献玉以明志。三者缺一，玉光不醒。', o:[
    { t:'我记住了：治水、筑台、献玉。', aff:6, flag:'knows_rite', reply:'长者：记住便好。礼，终究要有人传承。' },
  ]},
  farmer_root: { s:'farmer', t:'嘿！你就是长者说的新来的寻玉者？', o:[
    { t:'是的，我来帮大家。', next:'farmer_friend', aff:6, reply:'阿禾：太好了！多个人多份力！' },
    { t:'稻田现在怎么样？', next:'farmer_field', reply:'阿禾：水渠一通，我这苗儿就能喝饱咯！' },
    { t:'（不理他，转身走开）', aff:-5, reply:'阿禾嘟囔：哼，傲气……' },
  ]},
  farmer_friend: { s:'farmer', t:'管够，管够！等我稻子收了，第一个给你送粮去！', o:[
    { t:'多谢，你先忙。', aff:3, reply:'阿禾：好嘞！要看天色嘞！' },
  ]},
  farmer_field: { s:'farmer', t:'你看这苗，绿油油的。可水渠堵了，再这么下去……哎呀呀。', o:[
    { t:'我去疏通水渠。', aff:4, flag:'promised_canal', reply:'阿禾：真的？嘿，这可太好了！' },
  ]},
  artisan_root: { s:'artisan', t:'哼，站那么远做什么？又不是老虎。', o:[
    { t:'听说你手艺最好，祭坛就靠你了。', next:'artisan_pride', aff:7, reply:'石乙：算你有眼力！' },
    { t:'我需要材料，你能帮吗？', next:'artisan_mat', reply:'石乙：材料拿来，活儿我包了。' },
    { t:'你脾气可真冲。', aff:-4, reply:'石乙：啧，爱要不要！' },
  ]},
  artisan_pride: { s:'artisan', t:'那祭坛的石构，我盯了三年了。缺的那块角，我迟早补上。', o:[
    { t:'需要我找石料吗？', aff:5, flag:'artisan_helped', reply:'石乙：哼……算你识相。北边采石场有好料。' },
  ]},
  artisan_mat: { s:'artisan', t:'休整的时候，我就能把材料打成器物。你多攒点料来。', o:[
    { t:'明白，我去收集。', aff:2, reply:'石乙：嗯，快去。' },
  ]},
  priest_root: { s:'priest', t:'听……风里有旧人在低语。你，也听见了吗？', o:[
    { t:'我听见了，它们在说玉。', next:'priest_resonance', aff:9, flag:'priest_bond', reply:'云巫眼中一亮：你果然……听得见。' },
    { t:'没有，我只听见风。', next:'priest_calm', aff:2, reply:'云巫：无妨。听不见的人，也能感应。' },
  ]},
  priest_resonance: { s:'priest', t:'玉在呼吸。河滩的玉，石环的方向，玉琮的低鸣——它们本是一体。', o:[
    { t:'我要如何感应它们？', next:'priest_hint', req:'priest_bond', reply:'云巫：靠近时，静心。光会告诉你答案。' },
  ]},
  priest_calm: { s:'priest', t:'那就静下心。玉不自鸣，待人而光。', o:[
    { t:'我会试试。', aff:2, reply:'云巫：……嗯，风会带你来。' },
  ]},
  priest_hint: { s:'priest', t:'石环要朝天，玉琮要归位，旋环要转动。三者各安其位，玉光方能圆满。', o:[
    { t:'我记下了，多谢。', aff:5, flag:'knows_jade_trio', reply:'云巫：去吧，风会护着你。' },
  ]},
  warrior_root: { s:'warrior', t:'站住。什么人。', o:[
    { t:'我是寻玉者，来助聚落。', next:'warrior_check', aff:4, reply:'武士：（点头）……知道了。' },
    { t:'让开，我有要事。', aff:-6, reply:'武士：……（握紧石矛）' },
  ]},
  warrior_check: { s:'warrior', t:'北境最近不太平。神树那边的小怪物躁动不安。', o:[
    { t:'我会留意。有你在，我安心。', aff:8, flag:'warrior_trust', reply:'武士：（别过脸）……有我在。' },
  ]},
  totem_root: { s:'totem', t:'吱！玉！我们的玉！你、你是谁？朋友？', o:[
    { t:'我是朋友，来守护玉石的。', next:'totem_friend', aff:10, flag:'totem_friend', reply:'小怪物们吱吱叫着围上来：朋友！真的是朋友！' },
    { t:'我只是路过。', aff:-2, reply:'小怪物：哼！盯、盯着你！' },
  ]},
  totem_friend: { s:'totem', t:'朋友好！玉玉玉，亮晶晶！谁抢玉，我们就打谁！', o:[
    { t:'你们做得很好，我去看看神树。', aff:5, reply:'小怪物：吱吱——慢走！' },
  ]},
  deer_root: { s:'deer', t:'……（白蹄轻轻踏地，鹿角微光一闪，望向神树方向）', o:[
    { t:'你要为我引路吗？', next:'deer_lead', aff:8, flag:'deer_guide', reply:'神鹿（点头，缓步向前）：跟着我。' },
    { t:'（静静陪伴，摸了摸它）', aff:12, reply:'神鹿（轻蹭你的手，鹿角泛起柔光）' },
  ]},
  deer_lead: { s:'deer', t:'跟着我。林间的小家伙们，认得玉的光。', o:[
    { t:'好，我跟着你。', aff:4, reply:'神鹿（鹿角微亮，缓步引路）' },
  ]},
  noble_root: { s:'noble', t:'你来了。本君正想问问：你为何执玉？', o:[
    { t:'为守护聚落，重续礼制。', next:'noble_worthy', aff:10, flag:'noble_test_pass', reply:'玉君（颔首）：善。玉者，国之重器，非为私藏。' },
    { t:'为了力量。', next:'noble_power', aff:-5, reply:'玉君（目光一冷）：……那你不配。' },
  ]},
  noble_worthy: { s:'noble', t:'环有环的规矩。你看这玉旋环——它总会回到天心。人心亦当如此。', o:[
    { t:'我明白了，守序方能守护。', aff:6, flag:'jade_worthy', reply:'玉君：去吧，执玉之人。玉光会认得你。' },
  ]},
  noble_power: { s:'noble', t:'哼。器物若只为私欲，便只是一块石头。', o:[
    { t:'……我会重新想想。', aff:3, reply:'玉君：去吧。想清楚了再来。' },
  ]},
};

const DLG = {
  affinity: Object.fromEntries(Object.keys(CHAR).map(k => [k, 0])),
  flags: {}, current: null, speaker: null, history: [],
  reset() { this.affinity = Object.fromEntries(Object.keys(CHAR).map(k => [k, 0]));
            this.flags = {}; this.current = null; this.speaker = null; this.history = []; },
  visible(n) { return n.o.filter(o => (!o.req || this.flags[o.req]) && (o.reqAff == null || (this.affinity[n.s]||0) >= o.reqAff)); },
};

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
  party: [ { name:'方士',hp:40,max:40 }, { name:'武士甲',hp:40,max:40 }, { name:'武士乙',hp:40,max:40 } ],
  round: 1,
  bPhase: 'idle', bTimer: 0, bPending: null,
  nightUntil: 0, nightFactor: 0,   // 观星夜色
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
  if (e.code === 'KeyN' && G.phase === 'roam') startStargaze();
  if (e.code === 'KeyB' && G.phase === 'roam') triggerAltarFX();
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
  // 好感度：显示最高的两位（同步 demo 的 sync_ui）
  const top = Object.entries(DLG.affinity).sort((a,b) => b[1]-a[1]).slice(0,2).filter(x => x[1] > 0);
  $('aff').textContent = top.length ? ('羁绊 · ' + top.map(([k,v]) => CHAR[k].name.split(' · ').pop() + ' ' + DLG.affinity[k] + '(' + CHAR[k].affLabel(v) + ')').join('　')) : '';
}

// ---------- 对话 ----------
function openDialogue(key) {
  if (key === 'elder' && G.quest === 0) { G.quest = 1; updateHUD(); toast('使命更新：寻得五枚通神之玉'); }
  const node = NODES[key + '_root'];
  G.phase = 'dialogue';
  $('dialogue').classList.remove('hidden');
  $('hud').classList.add('hidden');
  if (node) { DLG.current = key + '_root'; DLG.speaker = key; }
  else { DLG.current = null; DLG.speaker = key; }
  renderDialogue(node ? node : { s:key, t:(CONTEXT[key]?.explore || '……'), o:[{t:'（告辞）',reply:''}] });
}
let lastReply = '';
function renderDialogue(node) {
  $('dWho').textContent = CHAR[node.s]?.name || node.s;
  $('dText').textContent = node.t;
  $('dReply').textContent = lastReply;
  $('dReply').style.display = lastReply ? 'block' : 'none';
  const box = $('dOpts'); box.innerHTML = '';
  const opts = DLG.current ? DLG.visible(node) : node.o;
  opts.forEach((o, i) => {
    const b = document.createElement('div'); b.className = 'opt';
    b.textContent = (i + 1) + '. ' + o.t;
    b.onclick = () => chooseOption(i);
    box.appendChild(b);
  });
}
function chooseOption(i) {
  const node = DLG.current ? NODES[DLG.current] : null;
  const opts = node ? DLG.visible(node) : [];
  if (!node || i >= opts.length) { closeDialogue(); return; }
  const o = opts[i], who = node.s;
  if (o.aff) {
    DLG.affinity[who] = clamp((DLG.affinity[who]||0) + o.aff, 0, 100);
  }
  if (o.flag) DLG.flags[o.flag] = true;
  DLG.history.push({ who, choice: o.t, aff: o.aff, reply: o.reply });
  lastReply = o.reply || '';
  if (o.next && NODES[o.next]) {
    DLG.current = o.next;
    const nn = NODES[o.next]; DLG.speaker = nn.s;
    renderDialogue(nn);
    updateHUD();
  } else {
    closeDialogue();
  }
}
function closeDialogue() {
  $('dialogue').classList.add('hidden');
  $('hud').classList.remove('hidden');
  G.phase = 'roam';
  lastReply = '';
  updateHUD();
}
addEventListener('keydown', e => {
  if (G.phase !== 'dialogue') return;
  const m = { Digit1:0, Digit2:1, Digit3:2, Digit4:3 };
  if (e.code in m) chooseOption(m[e.code]);
});

// ---------- 观星 / 祭坛特效 ----------
function startStargaze() {
  G.nightUntil = performance.now() / 1000 + 12;
  toast('石环指向天心。夜色降临，北斗七星在环上苏醒。');
}
function triggerAltarFX() {
  altarFX.userData.until = performance.now() / 1000 + 8;
  toast('玉琮共鸣，方与圆的蓝光在祭坛上苏醒。');
}
function updateAmbient(dt, now) {
  // 观星夜色：目标 1 / 0，淡入快、淡出慢
  const stargazing = now < G.nightUntil;
  const target = stargazing ? 1 : 0;
  const rate = stargazing ? 2.2 : 0.9;
  G.nightFactor += (target - G.nightFactor) * Math.min(1, dt * rate);
  const nf = G.nightFactor;
  scene.background.copy(SKY_DAY).lerp(SKY_NIGHT, nf);
  scene.fog.color.copy(scene.background);
  scene.fog.density = .006 + .004 * nf;
  sun.intensity = 2.0 - 1.85 * nf;
  hemi.intensity = 1.05 - .75 * nf;
  fill.intensity = .5 - .35 * nf;
  // 北斗七星显现 + 闪烁
  const twinkle = .78 + .22 * Math.sin(now * 2.2);
  starMat.opacity = nf * twinkle;
  dipperLineMat.opacity = nf * .8;
  bigDipper.children.forEach((s, idx) => { if (idx < dipperPts.length) s.scale.setScalar(.8 + .2*twinkle); });
  // 玉琮蓝色方圆特效
  const fxActive = now < altarFX.userData.until;
  const k = fxActive ? .55 + .35 * Math.sin(now * 3) : 0;
  altarFX.userData.mats.forEach(m => m.opacity = k);
  fxBlueRing.rotation.z += dt * .5;
  fxBlueRing2.rotation.z -= dt * .8;
}

// ---------- 交互检测 ----------
let nearTarget = null;
function tryInteract() {
  if (!nearTarget) return;
  if (nearTarget.kind === 'npc') { openDialogue(nearTarget.key); return; }
  if (nearTarget.kind === 'golem') { startBattle(); return; }
  if (nearTarget.kind === 'starRing') { startStargaze(); return; }
  if (nearTarget.kind === 'altar') {
    triggerAltarFX();
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
    if (d < bd) { bd = d; best = { kind:'npc', key:n.userData.key, label:'与' + n.userData.name + '交谈' }; }
  }
  const gd = player.position.distanceTo(golem.position);
  if (golem.visible && gd < 8 && gd < bd + 5) { best = { kind:'golem', label:'讨伐岩石巨怪' }; bd = gd; }
  const sd = player.position.distanceTo(new THREE.Vector3(34, 0, -6));
  if (sd < 6.5 && sd < bd) { best = { kind:'starRing', label:'观星 · 北斗夜色' }; bd = sd; }
  const ad = player.position.distanceTo(new THREE.Vector3(0, 0, 6));
  if (ad < 9 && ad < bd) best = { kind:'altar', label:'登台献祭 / 玉琮共鸣' };
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
  G.bPhase = 'intro'; G.bTimer = 0; G.bPending = null;
  $('hud').classList.add('hidden');
  $('prompt').classList.add('hidden');
  $('battle').classList.remove('hidden');
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
function setBattleButtons(on) { document.querySelectorAll('.b-cmds button').forEach(b => b.disabled = !on); }
function logBattle(msg) { $('bLog').textContent = msg; }

document.querySelectorAll('.b-cmds button').forEach(btn => {
  btn.onclick = () => {
    if (G.bPhase !== 'choose') return;
    G.bPending = btn.dataset.cmd;
    G.bPhase = 'charge'; G.bTimer = 0;
    setBattleButtons(false);
    const labels = { charge:'众武士挺斧冲锋！', guard:'武士列盾坚守！', rest:'武士调息蓄势！', retreat:'号令撤退，保全队伍。' };
    logBattle(labels[G.bPending]);
    if (G.bPending === 'retreat') { G.bPhase = 'retreat'; G.bTimer = 0; }
  };
});
function resolveBattleAction() {
  const cmd = G.bPending;
  if (cmd === 'retreat') { endBattle(false, true); return; }
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
    spawnHit(new THREE.Vector3(golem.position.x, 4.6, golem.position.z + 1.5), 0xffd27a, true);
    golem.userData.hitFlash = 0.35;
    logBattle((cmd === 'charge' ? '冲锋命中！' : '坚守出击！') + ' 造成 ' + dmg + ' 点伤害。');
  }
  updateBattleUI();
  if (G.golemHP <= 0) { G.bPhase = 'victory'; G.bTimer = 0; setTimeout(() => endBattle(true), 900); return; }
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
  G.round++; G.bPhase = 'choose'; G.bTimer = 0;
  setBattleButtons(true);
}
function endBattle(win, retreat = false) {
  $('battle').classList.add('hidden');
  warriors.forEach(w => w.visible = false);
  if (win) {
    G.golemAwake = true; golem.visible = false;
    G.res.mat += 20; G.res.jade++;
    if (G.quest === 2) { G.quest = 3; toast('使命更新：携玉登台，完成祭祀'); }
    G.phase = 'roam'; $('hud').classList.remove('hidden'); updateHUD();
    toast('讨伐成功！获得材料 +20、通神之玉 +1');
  } else if (retreat) {
    G.phase = 'roam'; $('hud').classList.remove('hidden');
    toast('已撤退，可重整队伍再来。');
  } else {
    G.phase = 'end';
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
  triggerAltarFX();
}
function updateBattle(dt) {
  G.bTimer += dt;
  golem.userData.body.rotation.y = Math.sin(G.bTimer * .8) * .04;
  if (golem.userData.hitFlash > 0) {
    golem.userData.hitFlash -= dt;
    golem.userData.body.material = golem.userData.hitFlash > 0 ? MAT.jadeGlow : MAT.rock;
  }
  if (G.bPhase === 'intro') {
    if (G.bTimer > .8) { G.bPhase = 'choose'; G.bTimer = 0; setBattleButtons(true); }
  } else if (G.bPhase === 'charge') {
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
    const fx = mx * Math.cos(camYaw) + mz * Math.sin(camYaw);
    const fz = -mx * Math.sin(camYaw) + mz * Math.cos(camYaw);
    player.position.x += fx * speed * dt;
    player.position.z += fz * speed * dt;
    const r = Math.hypot(player.position.x, player.position.z);
    if (r > 60) { player.position.x *= 60 / r; player.position.z *= 60 / r; }
    const targetRot = Math.atan2(fx, fz);
    let diff = targetRot - player.rotation.y;
    while (diff > Math.PI) diff -= TAU;
    while (diff < -Math.PI) diff += TAU;
    player.rotation.y += diff * Math.min(1, dt * 10);
    const sw = Math.sin(performance.now() * .012) * .4;
    if (player.userData.armL) player.userData.armL.rotation.x = sw;
    if (player.userData.armR) player.userData.armR.rotation.x = -sw;
  }
  if (keys.Space && playerY <= 0) jumpV = 8;
  if (jumpV !== 0 || playerY > 0) {
    jumpV -= 22 * dt; playerY += jumpV * dt;
    if (playerY <= 0) { playerY = 0; jumpV = 0; }
  }
  player.position.y = playerY;
  G.time += dt * .012;
  if (G.time >= 1) { G.time = 0; G.day++; G.res.food = Math.max(0, G.res.food - 2); }
}
function updateCamera(dt) {
  let cx, cy, cz, look;
  if (G.phase === 'battle') {
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
  const pulse = 1.2 + Math.sin(t * 2) * .4;
  MAT.jadeGlow.emissiveIntensity = pulse;
  altarLight.intensity = 2 + Math.sin(t * 2) * .5;
  cong.rotation.y += dt * .15;
  // 玉石：旋转浮动 + 感应拾取（玉石靠近给出玉君情境台词）
  jades.forEach(j => {
    if (j.userData.taken) return;
    j.userData.gem.rotation.y += dt * 1.2;
    j.userData.gem.position.y = j.userData.baseY + Math.sin(t * 2 + j.userData.index) * .18;
    j.userData.halo.material.opacity = .35 + Math.sin(t * 3 + j.userData.index) * .18;
    if (G.phase === 'roam' && player.position.distanceTo(new THREE.Vector3(j.position.x, 0, j.position.z)) < 2.2) {
      j.userData.taken = true; j.visible = false;
      G.jadeTaken++; G.res.jade++;
      spawnHit(new THREE.Vector3(j.position.x, 1.4, j.position.z), 0x8fe8c0, true);
      toast('感应到' + j.userData.kind + '，拾得通神之玉（' + G.jadeTaken + '/5）' + ' — ' + (CONTEXT.noble.explore.split('。')[0]) + '。');
      if (G.quest === 0 || G.quest === 1) G.quest = 1;
      if (G.jadeTaken === 5 && !G.golemAwake) {
        golem.visible = true;
        toast('五玉齐备！西外环的岩石巨怪已然苏醒');
        if (G.quest === 1) G.quest = 2;
      }
      updateHUD();
    }
  });
}

// ============================================================
// 主循环
// ============================================================
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .05);
  const t = clock.elapsedTime;
  const now = performance.now() / 1000;
  updatePlayer(dt);
  updateNear();
  if (G.phase === 'battle') updateBattle(dt);
  updateWorld(dt, t);
  updateAmbient(dt, now);
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
  G.nightUntil = 0; G.nightFactor = 0;
  altarFX.userData.until = 0;
  G.res = { jade:0, food:20, mat:10, pop:12 };
  DLG.reset();
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
