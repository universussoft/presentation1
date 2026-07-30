import { ViewManager } from './views.js';
import { initAudio, toggleMute, playClick, playViewSwitch } from './audio.js';

export function setupUI({ viewManager, postfx, gallery }) {
  const viewNav = document.getElementById('view-nav');
  const btnMute = document.getElementById('btn-mute');
  const btnLetterbox = document.getElementById('btn-letterbox');
  const btnShot = document.getElementById('btn-shot');
  const hint = document.getElementById('hint');

  let letterboxOn = false;
  let audioStarted = false;

  const ensureAudio = () => {
    if (!audioStarted) {
      audioStarted = true;
      initAudio();
    }
  };

  for (const view of ViewManager.list) {
    const btn = document.createElement('button');
    btn.className = 'view-btn' + (view.key === 'orbit' ? ' active' : '');
    btn.textContent = view.label;
    btn.dataset.key = view.key;
    btn.addEventListener('click', () => {
      ensureAudio();
      playViewSwitch();
      viewManager.goTo(view.key);
      for (const b of viewNav.querySelectorAll('.view-btn')) b.classList.remove('active');
      btn.classList.add('active');
      hint.textContent = view.key === 'panoramic'
        ? 'Drag to look around the 360° environment'
        : 'Drag to orbit · Scroll to zoom';
    });
    viewNav.appendChild(btn);
  }

  btnMute.addEventListener('click', () => {
    ensureAudio();
    const muted = toggleMute();
    btnMute.textContent = muted ? '🔇' : '🔊';
    btnMute.classList.toggle('active', muted);
  });

  btnLetterbox.addEventListener('click', () => {
    ensureAudio();
    playClick();
    letterboxOn = !letterboxOn;
    postfx.setLetterbox(letterboxOn);
    btnLetterbox.classList.toggle('active', letterboxOn);
  });

  btnShot.addEventListener('click', () => {
    ensureAudio();
    gallery.capture(viewManager.current.label);
  });

  window.addEventListener('pointerdown', ensureAudio, { once: true });
}
