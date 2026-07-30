import { getBassEnergy } from './audio.js';

const SEQUENCE = [
  { key: 'cinematic', hold: 7 },
  { key: 'front', hold: 5 },
  { key: 'detail', hold: 5 },
  { key: 'side', hold: 5 },
  { key: 'top', hold: 5 },
  { key: 'panoramic', hold: 6 },
  { key: 'orbit', hold: 7 }
];

export class Director {
  constructor({ viewManager, postfx, camera, onShotChange }) {
    this.viewManager = viewManager;
    this.postfx = postfx;
    this.camera = camera;
    this.onShotChange = onShotChange;
    this.active = false;
    this.index = -1;
    this.elapsed = 0;
    this.baseBloom = postfx.bloomPass.strength;
    this.wasLetterboxOn = false;
  }

  start(letterboxWasOn) {
    this.active = true;
    this.wasLetterboxOn = letterboxWasOn;
    this.viewManager.controls.enabled = false;
    this.postfx.setLetterbox(true);
    this.index = -1;
    this._advance();
  }

  stop() {
    this.active = false;
    this.viewManager.controls.enabled = true;
    this.postfx.setLetterbox(this.wasLetterboxOn);
    this.camera.fov = this.viewManager.current.fov;
    this.camera.updateProjectionMatrix();
    this.postfx.bloomPass.strength = this.baseBloom;
  }

  _advance() {
    this.index = (this.index + 1) % SEQUENCE.length;
    this.elapsed = 0;
    const shot = SEQUENCE[this.index];
    this.viewManager.goTo(shot.key);
    if (this.onShotChange) this.onShotChange(shot);
  }

  update(dt) {
    if (!this.active) return;
    this.elapsed += dt;
    const shot = SEQUENCE[this.index];
    if (this.elapsed >= shot.hold) this._advance();

    const bass = getBassEnergy();
    const baseFov = this.viewManager.current.fov;
    this.camera.fov = baseFov - bass * 5;
    this.camera.updateProjectionMatrix();
    this.postfx.bloomPass.strength = this.baseBloom + bass * 1.3;
  }
}
