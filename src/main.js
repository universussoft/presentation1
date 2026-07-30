import * as THREE from 'three';
import { createScene } from './core/scene.js';
import { loadModel } from './core/model.js';
import { createPanoramicSky } from './core/panorama.js';
import { ViewManager } from './core/views.js';
import { createPostFX } from './core/postfx.js';
import { ScreenshotGallery } from './core/screenshot.js';
import { Director } from './core/director.js';
import { setupUI } from './core/ui.js';
import { initAudio, playClick } from './core/audio.js';

const canvas = document.getElementById('scene-canvas');
const loadingScreen = document.getElementById('loading-screen');
const loadingFill = document.getElementById('loading-fill');
const loadingText = document.getElementById('loading-text');
const uiRoot = document.getElementById('ui-root');
const enterOverlay = document.getElementById('enter-overlay');
const galleryEl = document.getElementById('gallery');
const filmstripEl = document.getElementById('filmstrip');

const { scene, camera, renderer, controls, holoPad, techRings } = createScene(canvas);

const sky = createPanoramicSky();
scene.background = sky;
scene.environment = sky;

const postfx = createPostFX(renderer, scene, camera);

const viewManager = new ViewManager({ camera, controls });

const gallery = new ScreenshotGallery({
  renderer,
  composer: postfx.composer,
  galleryEl,
  filmstripEl
});

const director = new Director({ viewManager, postfx, camera });

setupUI({ viewManager, postfx, gallery, director });

loadingText.textContent = 'Loading model…';
loadModel(scene, (p) => {
  loadingFill.style.width = `${Math.round(p * 100)}%`;
}).then(({ root, isPlaceholder }) => {
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  viewManager.setModelCenter(center.y);
  viewManager.goTo('orbit');

  if (isPlaceholder) {
    loadingText.textContent = 'Model asset incomplete — showing placeholder showcase mesh';
  }
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    uiRoot.classList.remove('hidden');
    enterOverlay.classList.remove('hidden');
  }, 350);
});

enterOverlay.addEventListener('click', () => {
  initAudio();
  playClick();
  enterOverlay.classList.add('hidden');
}, { once: true });

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  viewManager.update(dt);
  director.update(dt);
  postfx.update(dt);

  holoPad.rotation.z += dt * 0.05;
  techRings.forEach((ring, i) => {
    ring.rotation.z += dt * (i % 2 === 0 ? 0.18 : -0.14) * (i + 1);
  });

  postfx.composer.render();
}

animate();
