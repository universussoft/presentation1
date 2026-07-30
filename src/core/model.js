import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = 'model/scene.gltf';

function buildPlaceholder() {
  const group = new THREE.Group();
  group.name = 'placeholder-showcase-model';

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x1c2230,
    metalness: 0.9,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.08
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.85, 2.1, 8, 24), bodyMat);
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.9;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x9fd8ff,
    metalness: 0,
    roughness: 0.05,
    transmission: 1,
    thickness: 0.3,
    transparent: true,
    opacity: 0.55
  });
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), glassMat);
  glass.position.set(0.35, 1.35, 0);
  glass.rotation.z = Math.PI;
  group.add(glass);

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x5fd0ff,
    transparent: true,
    opacity: 0.85
  });
  for (const side of [-1, 1]) {
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.14), glowMat);
    glow.position.set(-0.9, 0.35, side * 0.62);
    glow.rotation.y = Math.PI / 2;
    group.add(glow);
  }

  const finMat = new THREE.MeshStandardMaterial({ color: 0x33415c, metalness: 0.7, roughness: 0.4 });
  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 4), finMat);
  fin.position.set(-1.1, 0.9, 0);
  fin.rotation.z = -Math.PI / 2;
  fin.rotation.y = Math.PI / 4;
  fin.castShadow = true;
  group.add(fin);

  group.scale.setScalar(1.1);
  return group;
}

export function loadModel(scene, onProgress) {
  return new Promise((resolve) => {
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        const root = gltf.scene;
        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2.6 / maxDim;
        root.scale.setScalar(scale);
        root.position.sub(center.multiplyScalar(scale));
        root.position.y = size.y * scale * 0.5;
        scene.add(root);
        resolve({ root, isPlaceholder: false });
      },
      (evt) => {
        if (onProgress && evt.total) onProgress(evt.loaded / evt.total);
      },
      (err) => {
        console.warn('[model] GLTF failed to load (likely missing scene.bin), using placeholder showcase mesh instead.', err);
        const placeholder = buildPlaceholder();
        scene.add(placeholder);
        if (onProgress) onProgress(1);
        resolve({ root: placeholder, isPlaceholder: true });
      }
    );
  });
}
