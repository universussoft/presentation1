import { ViewManager } from './views.js';
import { initAudio, toggleMute, playClick, playViewSwitch, getMusicTitle, retryMusicPlayback } from './audio.js';

export function setupUI({ viewManager, postfx, gallery, director }) {
  const viewNav = document.getElementById('view-nav');
  const btnPlay = document.getElementById('btn-play');
  const btnMute = document.getElementById('btn-mute');
  const btnLetterbox = document.getElementById('btn-letterbox');
  const btnShot = document.getElementById('btn-shot');
  const hint = document.getElementById('hint');

  let letterboxOn = false;
  let audioStarted = false;

  btnMute.title = `Mute / Unmute — now playing: ${getMusicTitle()}`;

  const ensureAudio = () => {
    if (!audioStarted) {
      audioStarted = true;
      initAudio();
    } else {
      retryMusicPlayback();
    }
  };

  const setActiveViewButton = (key) => {
    for (const b of viewNav.querySelectorAll('.view-btn')) {
      b.classList.toggle('active', b.dataset.key === key);
    }
  };

  const stopPresentation = () => {
    if (!director.active) return;
    director.stop();
    btnPlay.textContent = '▶';
    btnPlay.classList.remove('active');
    btnLetterbox.classList.toggle('active', letterboxOn);
  };

  for (const view of ViewManager.list) {
    const btn = document.createElement('button');
    btn.className = 'view-btn' + (view.key === 'orbit' ? ' active' : '');
    btn.textContent = view.label;
    btn.dataset.key = view.key;
    btn.addEventListener('click', () => {
      ensureAudio();
      stopPresentation();
      playViewSwitch();
      viewManager.goTo(view.key);
      setActiveViewButton(view.key);
      hint.textContent = 'Drag to orbit · Scroll to zoom';
    });
    viewNav.appendChild(btn);
  }

  btnPlay.addEventListener('click', () => {
    ensureAudio();
    playClick();
    if (director.active) {
      stopPresentation();
      hint.textContent = 'Drag to orbit · Scroll to zoom';
    } else {
      director.start(letterboxOn);
      setActiveViewButton(null);
      btnPlay.textContent = '⏸';
      btnPlay.classList.add('active');
      btnLetterbox.classList.add('active');
      hint.textContent = 'Auto presentation playing — click any view to take over';
    }
  });

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
