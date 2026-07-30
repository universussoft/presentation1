import { getBassEnergy, detectBeat } from './audio.js';

const SEQUENCE = [
  { key: 'cinematic', minHold: 3.0, maxHold: 9 },
  { key: 'front', minHold: 2.2, maxHold: 7 },
  { key: 'detail', minHold: 2.2, maxHold: 7 },
  { key: 'side', minHold: 2.2, maxHold: 7 },
  { key: 'top', minHold: 2.2, maxHold: 7 },
  { key: 'panoramic', minHold: 3.0, maxHold: 8 },
  { key: 'orbit', minHold: 3.0, maxHold: 9 }
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
    const onBeat = detectBeat();

    if (this.elapsed >= shot.maxHold || (this.elapsed >= shot.minHold && onBeat)) {
      this._advance();
    }

    // Nudge (not reset) whatever fov/bloom the view tween already set this
    // frame, so beat pulses ride on top of the camera transition instead of
    // fighting it.
    const bass = getBassEnergy();
    this.camera.fov -= bass * 1.8;
    this.camera.updateProjectionMatrix();
    this.postfx.bloomPass.strength = this.baseBloom + bass * 0.8;
  }
}
