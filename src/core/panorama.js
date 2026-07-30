import * as THREE from 'three';

function drawSkyCanvas() {
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0.0, '#01030a');
  sky.addColorStop(0.35, '#050b1c');
  sky.addColorStop(0.55, '#0d1c3a');
  sky.addColorStop(0.72, '#1c3f6b');
  sky.addColorStop(0.82, '#4a7fb0');
  sky.addColorStop(0.9, '#e8b073');
  sky.addColorStop(1.0, '#100b08');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.83, 0, w * 0.5, h * 0.83, w * 0.22);
  glow.addColorStop(0, 'rgba(255, 210, 150, 0.9)');
  glow.addColorStop(0.4, 'rgba(255, 170, 110, 0.35)');
  glow.addColorStop(1, 'rgba(255, 170, 110, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 1400; i++) {
    const x = rand() * w;
    const y = rand() * h * 0.65;
    const r = rand() * 1.3 + 0.15;
    const a = rand() * 0.8 + 0.2;
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(6,10,18,0.9)';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.86);
  for (let x = 0; x <= w; x += w / 24) {
    const y = h * 0.86 + Math.sin(x * 0.01) * 10 + Math.sin(x * 0.003) * 22;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  return canvas;
}

export function createPanoramicSky() {
  const canvas = drawSkyCanvas();
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
