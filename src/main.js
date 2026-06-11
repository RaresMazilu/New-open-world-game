import { WorldStreamer } from './worldstreamer.js';
import { StoryManager } from './storyManager.js';
import { Vehicle } from './vehicle.js';

let camera, scene, renderer, clock;
let vehicle;

init();
animate();

function init() {
  // signal that the app JS has started (helpful for diagnosing broken module loads)
  try { window.__appStarted = true; } catch (e) {}
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.set(0, 5, -12);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xfff7e6, 0x444444, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1c4, 1.2);
  sun.position.set(50, 80, -30);
  sun.castShadow = true;
  scene.add(sun);

  // large warm ground
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x88b04b });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  scene.add(ground);

  // road - raised solid asphalt with painted boundaries to prevent flicker
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x252525, roughness: 0.78, metalness: 0.02 });
  const road = new THREE.Mesh(new THREE.BoxGeometry(4000, 0.4, 40), roadMat);
  road.position.set(0, 0.2, 0);
  road.receiveShadow = true;
  scene.add(road);

  const curbMat = new THREE.MeshStandardMaterial({ color: 0x3a3a44, roughness: 1 });
  const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(4000, 0.24, 0.6), curbMat);
  const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(4000, 0.24, 0.6), curbMat);
  leftCurb.position.set(0, 0.12, 20.3);
  rightCurb.position.set(0, 0.12, -20.3);
  scene.add(leftCurb, rightCurb);

  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf7f7f7, emissive: 0x444444, emissiveIntensity: 0.12 });
  for (let i = 0; i < 40; i++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(8, 0.06, 1.5), stripeMat);
    stripe.position.set(0, 0.16, -190 + i * 100);
    scene.add(stripe);
  }

  // scatter simple trees for summer vibe
  const treeTrunk = new THREE.CylinderGeometry(0.2, 0.2, 2);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
  for (let i = 0; i < 400; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    if (Math.abs(z) < 100) continue; // keep near road clear
    const trunk = new THREE.Mesh(treeTrunk, trunkMat);
    trunk.position.set(x, 1, z);
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 8), leafMat);
    leaves.position.set(x, 3.2, z);
    scene.add(trunk);
    scene.add(leaves);
  }

  // houses
  const housePositions = [];
  function createHouse(x, z, scale = 1) {
    const house = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf2d6ba });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b2f0e });
    const body = new THREE.Mesh(new THREE.BoxGeometry(4 * scale, 2.5 * scale, 3 * scale), wallMat);
    body.position.set(0, 1.25 * scale, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5 * scale, 1.5 * scale, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 3.25 * scale, 0);
    house.add(body);
    house.add(roof);
    house.position.set(x, 0, z);
    scene.add(house);
    housePositions.push({ x, z });
  }

  for (let i = 0; i < 24; i++) {
    const z = -300 + i * 120;
    const x1 = -180 + ((i % 2) * 360);
    const x2 = x1 + ((i % 2) ? -100 : 100);
    createHouse(x1, z, 1.2);
    createHouse(x2, z + 40, 1.0);
  }

  // large mansions along the road
  for (let i = 0; i < 10; i++) {
    const z = -250 + i * 220;
    const scale = 2.8 + Math.random() * 1.2;
    createHouse(-280, z + (Math.random() - 0.5) * 40, scale);
    createHouse(280, z + (Math.random() - 0.5) * 40, scale * 0.9);
  }

  // vehicle
  vehicle = new Vehicle();
  vehicle.setPosition(0, 0.5, 0);
  scene.add(vehicle.mesh);

  // shop display car and building
  const shopBuilding = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x3c6aa6, roughness: 0.35, metalness: 0.1 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x243862, roughness: 0.4 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x93d2ff, opacity: 0.35, transparent: true });
  const buildingBase = new THREE.Mesh(new THREE.BoxGeometry(18, 6, 12), wallMat);
  buildingBase.position.set(0, 3, 0);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(10, 4, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, 7, 0);
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 0.3), new THREE.MeshStandardMaterial({ color: 0xffd15c, emissive: 0xffd15c, emissiveIntensity: 0.2 }));
  signBoard.position.set(0, 5.5, 6.5);
  const glassWall = new THREE.Mesh(new THREE.BoxGeometry(16, 3, 0.3), glassMat);
  glassWall.position.set(0, 3.2, 5.9);
  shopBuilding.add(buildingBase, roof, signBoard, glassWall);
  shopBuilding.position.set(-20, 0, -45);
  scene.add(shopBuilding);

  const shopCar = new Vehicle();
  shopCar.setPosition(-20, 0.55, -35);
  shopCar.mesh.rotation.y = Math.PI * 0.4;
  shopCar.mesh.scale.set(1.05, 1.05, 1.05);
  shopCar.setPaint(0x6ac8ff);
  scene.add(shopCar.mesh);

  const shopCarPad = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.1, 6),
    new THREE.MeshStandardMaterial({ color: 0x1f2c44, roughness: 0.9, metalness: 0.02 })
  );
  shopCarPad.position.set(-20, 0.05, -35);
  scene.add(shopCarPad);

  const shopSign = new THREE.Mesh(
    new THREE.BoxGeometry(8, 2, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xffd15c, emissive: 0xffd15c, emissiveIntensity: 0.3 })
  );
  shopSign.position.set(-20, 4.8, -38.5);
  shopSign.rotation.y = Math.PI * 0.4;
  scene.add(shopSign);

  const signText = new THREE.Mesh(
    new THREE.PlaneGeometry(6.5, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x0a1220, transparent: true, opacity: 0.95 })
  );
  signText.position.set(-20, 4.8, -38.1);
  signText.rotation.y = Math.PI * 0.4;
  scene.add(signText);

  // simple camera follow parameters and mouse orbit control
  const cameraFollow = {
    radius: 14,
    yaw: Math.PI,
    pitch: 0.25,
    minPitch: 0.12,
    maxPitch: 1.2,
    lerp: 0.08,
    dragging: false,
    lastX: 0,
    lastY: 0
  };

  let credits = 120;
  const shopState = {
    engine: false,
    tires: false,
    paint: false
  };

  function updateShopUI() {
    const creditLabel = document.getElementById('shopCredits');
    creditLabel.textContent = credits;
    document.getElementById('buy-engine').disabled = credits < 50 || shopState.engine;
    document.getElementById('buy-tires').disabled = credits < 40 || shopState.tires;
    document.getElementById('buy-paint').disabled = credits < 25 || shopState.paint;
    document.getElementById('item-engine').style.opacity = shopState.engine ? '0.6' : '1';
    document.getElementById('item-tires').style.opacity = shopState.tires ? '0.6' : '1';
    document.getElementById('item-paint').style.opacity = shopState.paint ? '0.6' : '1';
  }

  function applyUpgrade(id) {
    if (id === 'engine' && !shopState.engine && credits >= 50) {
      credits -= 50;
      shopState.engine = true;
      vehicle.maxSpeed += 12;
    }
    if (id === 'tires' && !shopState.tires && credits >= 40) {
      credits -= 40;
      shopState.tires = true;
      vehicle.turnSensitivity += 0.25;
    }
    if (id === 'paint' && !shopState.paint && credits >= 25) {
      credits -= 25;
      shopState.paint = true;
      const color = shopState.engine ? 0xfff1a4 : 0x4ac1ff;
      vehicle.setPaint(color);
    }
    updateShopUI();
  }

  // input
  const keys = {};
  window.addEventListener('keydown', (e) => {
    if (e.code.startsWith('Arrow')) e.preventDefault();
    keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.addEventListener('pointerdown', (e) => {
    cameraFollow.dragging = true;
    cameraFollow.lastX = e.clientX;
    cameraFollow.lastY = e.clientY;
  });
  window.addEventListener('pointerup', () => {
    cameraFollow.dragging = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (!cameraFollow.dragging) return;
    const dx = e.clientX - cameraFollow.lastX;
    const dy = e.clientY - cameraFollow.lastY;
    cameraFollow.lastX = e.clientX;
    cameraFollow.lastY = e.clientY;
    cameraFollow.yaw -= dx * 0.004;
    cameraFollow.pitch = Math.min(cameraFollow.maxPitch, Math.max(cameraFollow.minPitch, cameraFollow.pitch + dy * 0.003));
  });

  // world systems
  const loader = (typeof THREE !== 'undefined' && THREE.GLTFLoader) ? new THREE.GLTFLoader() : null;
  window.worldStreamer = new WorldStreamer(scene, loader, camera);
  window.story = new StoryManager();

  document.getElementById('buy-engine').addEventListener('click', () => applyUpgrade('engine'));
  document.getElementById('buy-tires').addEventListener('click', () => applyUpgrade('tires'));
  document.getElementById('buy-paint').addEventListener('click', () => applyUpgrade('paint'));

  const shop = document.getElementById('shop');
  const showShopButton = document.getElementById('showShopButton');
  const shopClose = document.getElementById('shopClose');
  const bigShopButton = document.getElementById('openBigShop');
  const shopModal = document.getElementById('shopModal');
  const shopModalClose = document.getElementById('shopModalClose');

  function openShopPanel() {
    shop.style.display = 'block';
    showShopButton.style.display = 'none';
  }

  function closeShopPanel() {
    shop.style.display = 'none';
    showShopButton.style.display = 'block';
  }

  function openBigShop() {
    shopModal.style.display = 'flex';
    shopModal.classList.add('active');
  }
  function closeBigShop() {
    shopModal.style.display = 'none';
    shopModal.classList.remove('active');
  }

  showShopButton.addEventListener('click', openShopPanel);
  shopClose.addEventListener('click', closeShopPanel);
  bigShopButton.addEventListener('click', openBigShop);
  shopModalClose.addEventListener('click', closeBigShop);
  shopModal.addEventListener('click', (event) => {
    if (event.target === shopModal) closeBigShop();
  });

  updateShopUI();

  const speedValueLabel = document.getElementById('speedValue');
  const gearValueLabel = document.getElementById('gearValue');

  function getGear(value) {
    if (Math.abs(value) < 1) return 'N';
    if (value < 0) return 'R';
    const percent = Math.abs(value) / vehicle.maxSpeed;
    const gear = Math.min(5, Math.max(1, Math.ceil(percent * 5)));
    return gear.toString();
  }

  function updateSpeedometer() {
    const kmh = Math.round(Math.abs(vehicle.velocity) * 3.6);
    speedValueLabel.textContent = `${kmh} km/h`;
    gearValueLabel.textContent = getGear(vehicle.velocity);
  }

  // example regions could be added via worldStreamer.addRegion

  window.addEventListener('resize', onWindowResize);

  const minimapCanvas = document.getElementById('minimap');
  const minimapCtx = minimapCanvas.getContext('2d');
  const minimapScale = 0.04; // 1 unit -> 0.04 pixels
  const minimapCenter = { x: minimapCanvas.width / 2, y: minimapCanvas.height / 2 };

  function drawMinimap() {
    const ctx = minimapCtx;
    ctx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    ctx.fillStyle = '#14212d';
    ctx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    ctx.strokeStyle = '#4ab5ff';
    ctx.lineWidth = 2;
    // road representation
    ctx.beginPath();
    ctx.moveTo(minimapCenter.x, 0);
    ctx.lineTo(minimapCenter.x, minimapCanvas.height);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(minimapCenter.x, 0);
    ctx.lineTo(minimapCenter.x, minimapCanvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    // houses
    ctx.fillStyle = '#f7d6a9';
    for (const p of housePositions) {
      const dx = (p.x - vehicle.position.x) * minimapScale;
      const dz = (p.z - vehicle.position.z) * minimapScale;
      const px = minimapCenter.x + dx;
      const py = minimapCenter.y + dz;
      ctx.fillRect(px - 3, py - 3, 6, 6);
    }
    // vehicle marker
    ctx.fillStyle = '#ff524d';
    ctx.beginPath();
    ctx.arc(minimapCenter.x, minimapCenter.y, 5, 0, Math.PI * 2);
    ctx.fill();
    // heading arrow
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const heading = Math.sin(vehicle.rotation) * 12;
    const headingY = Math.cos(vehicle.rotation) * 12;
    ctx.moveTo(minimapCenter.x, minimapCenter.y);
    ctx.lineTo(minimapCenter.x + heading, minimapCenter.y + headingY);
    ctx.stroke();
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // update hook
  animate.update = function(delta) {
    // compute input
    const input = { forward: 0, steer: 0 };
    if (keys['KeyW'] || keys['ArrowUp']) input.forward = 1;
    if (keys['KeyS'] || keys['ArrowDown']) input.forward = -0.6;
    if (keys['KeyA'] || keys['ArrowLeft']) input.steer = -1;
    if (keys['KeyD'] || keys['ArrowRight']) input.steer = 1;
    vehicle.update(delta, input);
    updateSpeedometer();

    // camera follow with mouse orbit around vehicle
    const offsetX = Math.sin(cameraFollow.yaw) * Math.cos(cameraFollow.pitch) * cameraFollow.radius;
    const offsetY = Math.sin(cameraFollow.pitch) * cameraFollow.radius;
    const offsetZ = Math.cos(cameraFollow.yaw) * Math.cos(cameraFollow.pitch) * cameraFollow.radius;
    const desired = new THREE.Vector3().copy(vehicle.position).add(new THREE.Vector3(offsetX, offsetY + 2, offsetZ));
    camera.position.lerp(desired, cameraFollow.lerp);
    const lookAt = new THREE.Vector3().copy(vehicle.position).add(new THREE.Vector3(0, 1.5, 0));
    camera.lookAt(lookAt);
    drawMinimap();
  };
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (animate.update) animate.update(delta);
  if (window.worldStreamer) window.worldStreamer.update();
  renderer.render(scene, camera);
}

