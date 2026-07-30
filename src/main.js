import * as THREE from 'three';
import { createScene } from './core/scene.js';
import { loadModel } from './core/model.js';
import { createPanoramicSky } from './core/panorama.js';
import { ViewManager } from './core/views.js';
import { createPostFX } from './core/postfx.js';
import { ScreenshotGallery } from './core/screenshot.js';
import { setupUI } from './core/ui.js';

const canvas = document.getElementById('scene-canvas');
const loadingScreen = document.getElementById('loading-screen');
const loadingFill = document.getElementById('loading-fill');
const loadingText = document.getElementById('loading-text');
const uiRoot = document.getElementById('ui-root');
const galleryEl = document.getElementById('gallery');
const filmstripEl = document.getElementById('filmstrip');

const { scene, camera, renderer, controls } = createScene(canvas);

const sky = createPanoramicSky();
scene.background = sky;
scene.environment = sky;

const groundMesh = scene.children.find((c) => c.geometry && c.geometry.type === 'CircleGeometry');
const gridMesh = scene.children.find((c) => c.isGridHelper);

const postfx = createPostFX(renderer, scene, camera);

const viewManager = new ViewManager({
  camera,
  controls,
  sceneObjects: { model: null, ground: groundMesh, grid: gridMesh }
});

const gallery = new ScreenshotGallery({
  renderer,
  composer: postfx.composer,
  galleryEl,
  filmstripEl
});

setupUI({ viewManager, postfx, gallery });

loadingText.textContent = 'Loading model…';
loadModel(scene, (p) => {
  loadingFill.style.width = `${Math.round(p * 100)}%`;
}).then(({ root, isPlaceholder }) => {
  viewManager.sceneObjects.model = root;
  if (isPlaceholder) {
    loadingText.textContent = 'Model asset incomplete — showing placeholder showcase mesh';
  }
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    uiRoot.classList.remove('hidden');
  }, 350);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  viewManager.update(dt);
  postfx.update(dt);
  postfx.composer.render();
}

animate();
