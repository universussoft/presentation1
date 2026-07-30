import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function buildHoloPadTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = size / 2;

  ctx.clearRect(0, 0, size, size);

  for (let r = size * 0.08; r < size * 0.49; r += size * 0.055) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 225, 255, ${0.5 - (r / size) * 0.6})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(0, 235, 255, 0.65)';
  ctx.lineWidth = 2;
  const spokes = 24;
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    const inner = size * 0.46;
    const outer = size * 0.49;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * inner, c + Math.sin(a) * inner);
    ctx.lineTo(c + Math.cos(a) * outer, c + Math.sin(a) * outer);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(0, 245, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(c - size * 0.49, c);
  ctx.lineTo(c + size * 0.49, c);
  ctx.moveTo(c, c - size * 0.49);
  ctx.lineTo(c, c + size * 0.49);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000103);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.05,
    500
  );
  camera.position.set(4.2, 2.1, 4.6);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 1.0;
  controls.maxDistance = 40;
  controls.target.set(0, 0.6, 0);
  controls.maxPolarAngle = Math.PI * 0.51;

  const keyLight = new THREE.DirectionalLight(0xbfe9ff, 2.2);
  keyLight.position.set(6, 8, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 40;
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -10;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xd83bff, 1.7);
  rimLight.position.set(-6, 3, -5);
  scene.add(rimLight);

  const fillLight = new THREE.HemisphereLight(0x2fd8ff, 0x02040a, 0.55);
  scene.add(fillLight);

  const groundGeo = new THREE.CircleGeometry(30, 64);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x03050a,
    roughness: 0.22,
    metalness: 0.85
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const holoPad = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 64),
    new THREE.MeshBasicMaterial({
      map: buildHoloPadTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  holoPad.rotation.x = -Math.PI / 2;
  holoPad.position.y = 0.01;
  scene.add(holoPad);

  const techRings = [0.9, 1.35, 1.85].map((radius, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.006, 8, 96),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00e5ff : 0xd83bff,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.015 + i * 0.002;
    scene.add(ring);
    return ring;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls, ground, holoPad, techRings };
}
