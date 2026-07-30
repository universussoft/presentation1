import * as THREE from 'three';
import { getBassEnergy, detectBeat } from './audio.js';

const WAYPOINTS = [
  new THREE.Vector3(2.7, 1.5, 3.0),
  new THREE.Vector3(0, 0.9, 3.4),
  new THREE.Vector3(3.5, 1.0, 0.15),
  new THREE.Vector3(4.2, 1.15, 1.6),
  new THREE.Vector3(-3.0, 1.3, 2.0),
  new THREE.Vector3(0, 1.3, 4.6)
];
const FIXED_FOV = 40;
const MIN_HOLD = 2.5;
const MAX_HOLD = 9;
const MOVE_DURATION = 1.8;

export class Director {
  constructor({ viewManager, postfx, camera }) {
    this.viewManager = viewManager;
    this.postfx = postfx;
    this.camera = camera;
    this.active = false;
    this.index = -1;
    this.elapsed = 0;
    this.baseBloom = postfx.bloomPass.strength;
    this.wasLetterboxOn = false;
    this._from = new THREE.Vector3();
    this._to = new THREE.Vector3();
    this._t = 1;
  }

  start(letterboxWasOn) {
    this.active = true;
    this.wasLetterboxOn = letterboxWasOn;
    this.viewManager.controls.enabled = false;
    this.viewManager.controls.autoRotate = false;
    this.postfx.setLetterbox(true);
    this.camera.fov = FIXED_FOV;
    this.camera.updateProjectionMatrix();
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
    this.index = (this.index + 1) % WAYPOINTS.length;
    this.elapsed = 0;
    this._from.copy(this.camera.position);
    this._to.copy(WAYPOINTS[this.index]);
    this._t = 0;
  }

  update(dt) {
    if (!this.active) return;
    this.elapsed += dt;
    const onBeat = detectBeat();

    if (this.elapsed >= MAX_HOLD || (this.elapsed >= MIN_HOLD && onBeat)) {
      this._advance();
    }

    if (this._t < 1) {
      this._t = Math.min(1, this._t + dt / MOVE_DURATION);
      const e = 1 - Math.pow(1 - this._t, 3);
      this.camera.position.lerpVectors(this._from, this._to, e);
    }
    this.camera.lookAt(this.viewManager.modelCenter);

    const bass = getBassEnergy();
    this.camera.fov = FIXED_FOV - bass * 1.8;
    this.camera.updateProjectionMatrix();
    this.postfx.bloomPass.strength = this.baseBloom + bass * 0.8;
  }
}
