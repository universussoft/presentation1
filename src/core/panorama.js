import * as THREE from 'three';

function drawSkyCanvas() {
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0.0, '#000103');
  sky.addColorStop(0.3, '#020814');
  sky.addColorStop(0.55, '#03101f');
  sky.addColorStop(0.74, '#041a2c');
  sky.addColorStop(0.84, '#062338');
  sky.addColorStop(0.9, '#0a3548');
  sky.addColorStop(1.0, '#00050a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.88, 0, w * 0.5, h * 0.88, w * 0.3);
  glow.addColorStop(0, 'rgba(0, 230, 255, 0.55)');
  glow.addColorStop(0.4, 'rgba(0, 190, 255, 0.18)');
  glow.addColorStop(1, 'rgba(0, 190, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 900; i++) {
    const x = rand() * w;
    const y = rand() * h * 0.62;
    const r = rand() * 1.2 + 0.15;
    const a = rand() * 0.7 + 0.15;
    const cyan = rand() > 0.85;
    ctx.fillStyle = cyan ? `rgba(140,230,255,${a.toFixed(2)})` : `rgba(255,255,255,${a.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const horizonY = h * 0.82;
  ctx.fillStyle = '#010509';
  ctx.fillRect(0, horizonY, w, h - horizonY);

  ctx.strokeStyle = 'rgba(0, 225, 255, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(w, horizonY);
  ctx.stroke();

  const vanishX = w * 0.5;
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.22)';
  ctx.lineWidth = 1;
  for (let i = -10; i <= 10; i++) {
    const xBottom = vanishX + i * (w * 0.09);
    ctx.beginPath();
    ctx.moveTo(vanishX, horizonY);
    ctx.lineTo(xBottom, h);
    ctx.stroke();
  }
  for (let d = 0; d < 8; d++) {
    const t = d / 8;
    const y = horizonY + (h - horizonY) * t * t;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.strokeStyle = `rgba(0, 210, 255, ${0.28 * (1 - t)})`;
    ctx.stroke();
  }

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
