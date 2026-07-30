let ctx = null;
let masterGain = null;
let ambientNodes = null;
let started = false;
let muted = false;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.55;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

function buildAmbient() {
  const c = getCtx();

  const drone = c.createOscillator();
  drone.type = 'sawtooth';
  drone.frequency.value = 55;

  const droneFilter = c.createBiquadFilter();
  droneFilter.type = 'lowpass';
  droneFilter.frequency.value = 320;
  droneFilter.Q.value = 0.7;

  const droneGain = c.createGain();
  droneGain.gain.value = 0.025;

  const sub = c.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = 27.5;
  const subGain = c.createGain();
  subGain.gain.value = 0.05;

  const lfo = c.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 60;
  lfo.connect(lfoGain);
  lfoGain.connect(droneFilter.frequency);

  const noiseBuffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 700;
  noiseFilter.Q.value = 0.5;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.008;

  drone.connect(droneFilter);
  droneFilter.connect(droneGain);
  droneGain.connect(masterGain);

  sub.connect(subGain);
  subGain.connect(masterGain);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);

  drone.start();
  sub.start();
  lfo.start();
  noise.start();

  return { drone, sub, lfo, noise, droneGain, subGain, noiseGain };
}

const MUSIC_URL = 'audio/theme.mp3';
const MUSIC_TITLE = 'BalloonPlanet — From Memory to Destiny (No Backing Vocals)';
let musicEl = null;
let musicGain = null;

function buildMusic() {
  const c = getCtx();
  musicEl = new Audio(encodeURI(MUSIC_URL));
  musicEl.loop = true;
  musicEl.crossOrigin = 'anonymous';

  const source = c.createMediaElementSource(musicEl);
  musicGain = c.createGain();
  musicGain.gain.value = 0.7;
  source.connect(musicGain);
  musicGain.connect(masterGain);

  analyser = c.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.75;
  freqData = new Uint8Array(analyser.frequencyBinCount);
  musicGain.connect(analyser);

  musicEl.play().catch(() => {
    // Autoplay can still be blocked on some browsers even after a user gesture;
    // the next click on any HUD control retries via the pointerdown fallback in ui.js.
  });
}

let analyser = null;
let freqData = null;

export function getBassEnergy() {
  if (!analyser) return 0;
  analyser.getByteFrequencyData(freqData);
  let sum = 0;
  const bins = 10;
  for (let i = 1; i <= bins; i++) sum += freqData[i];
  return sum / bins / 255;
}

const beatHistory = [];
let lastBeatTime = -Infinity;

export function detectBeat() {
  if (!analyser) return false;
  const bass = getBassEnergy();
  beatHistory.push(bass);
  if (beatHistory.length > 40) beatHistory.shift();
  const avg = beatHistory.reduce((a, b) => a + b, 0) / beatHistory.length;

  const now = ctx.currentTime;
  const isBeat = bass > avg * 1.35 && bass > 0.16 && now - lastBeatTime > 0.28;
  if (isBeat) lastBeatTime = now;
  return isBeat;
}

export function initAudio() {
  if (started) return;
  started = true;
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
  ambientNodes = buildAmbient();
  buildMusic();
}

export function getMusicTitle() {
  return MUSIC_TITLE;
}

export function retryMusicPlayback() {
  if (musicEl && musicEl.paused) musicEl.play().catch(() => {});
}

export function toggleMute() {
  muted = !muted;
  if (masterGain) {
    masterGain.gain.setTargetAtTime(muted ? 0 : 0.55, getCtx().currentTime, 0.15);
  }
  return muted;
}

export function isMuted() {
  return muted;
}

export function playClick() {
  if (!started) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, c.currentTime + 0.08);
  gain.gain.setValueAtTime(0.18, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + 0.14);
}

export function playShutter() {
  if (!started) return;
  const c = getCtx();
  const noiseBuffer = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const noise = c.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1200;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.5, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  noise.start();
}

export function playViewSwitch() {
  if (!started) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(340, c.currentTime);
  osc.frequency.linearRampToValueAtTime(560, c.currentTime + 0.25);
  gain.gain.setValueAtTime(0.001, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + 0.45);
}
