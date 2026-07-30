import { playShutter } from './audio.js';

export class ScreenshotGallery {
  constructor({ renderer, composer, galleryEl, filmstripEl }) {
    this.renderer = renderer;
    this.composer = composer;
    this.galleryEl = galleryEl;
    this.filmstripEl = filmstripEl;
    this.shots = [];
  }

  capture(viewLabel) {
    this.composer.render();
    const source = this.renderer.domElement;
    const w = source.width;
    const h = source.height;

    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const ctx = out.getContext('2d');
    ctx.drawImage(source, 0, 0, w, h);

    const barH = h * 0.09;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, barH);
    ctx.fillRect(0, h - barH, w, barH);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `${Math.round(h * 0.022)}px Georgia, serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(viewLabel.toUpperCase(), w * 0.03, h - barH / 2);

    const stamp = new Date().toLocaleString();
    ctx.textAlign = 'right';
    ctx.fillText(stamp, w * 0.97, barH / 2);
    ctx.textAlign = 'left';

    const dataUrl = out.toDataURL('image/png');
    this.shots.unshift({ dataUrl, viewLabel, stamp });
    this._renderFilmstrip();
    playShutter();
    return dataUrl;
  }

  _renderFilmstrip() {
    this.filmstripEl.innerHTML = '';
    for (const shot of this.shots) {
      const frame = document.createElement('div');
      frame.className = 'film-frame';

      const img = document.createElement('img');
      img.src = shot.dataUrl;
      img.alt = `${shot.viewLabel} screenshot`;
      frame.appendChild(img);

      const dl = document.createElement('a');
      dl.className = 'film-download';
      dl.href = shot.dataUrl;
      dl.download = `presentation1-${shot.viewLabel.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      dl.textContent = '↓';
      dl.title = 'Download';
      frame.appendChild(dl);

      this.filmstripEl.appendChild(frame);
    }
    this.galleryEl.classList.toggle('has-shots', this.shots.length > 0);
  }
}
