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
  droneGain.gain.value = 0.07;

  const sub = c.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = 27.5;
  const subGain = c.createGain();
  subGain.gain.value = 0.18;

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
  noiseGain.gain.value = 0.02;

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

export function initAudio() {
  if (started) return;
  started = true;
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
  ambientNodes = buildAmbient();
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
