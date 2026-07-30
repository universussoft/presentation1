import * as THREE from 'three';

const VIEW_DEFS = [
  {
    key: 'orbit',
    label: 'Orbit',
    position: new THREE.Vector3(2.7, 1.5, 3.0),
    target: new THREE.Vector3(0, 0.65, 0),
    fov: 42,
    autoRotate: false
  },
  {
    key: 'front',
    label: 'Front',
    position: new THREE.Vector3(0, 0.9, 3.4),
    target: new THREE.Vector3(0, 0.7, 0),
    fov: 36,
    autoRotate: false
  },
  {
    key: 'side',
    label: 'Side',
    position: new THREE.Vector3(3.5, 1.0, 0.15),
    target: new THREE.Vector3(0, 0.7, 0),
    fov: 36,
    autoRotate: false
  },
  {
    key: 'top',
    label: 'Top',
    position: new THREE.Vector3(0.15, 4.2, 0.3),
    target: new THREE.Vector3(0, 0.5, 0),
    fov: 38,
    autoRotate: false
  },
  {
    key: 'detail',
    label: 'Detail',
    position: new THREE.Vector3(1.1, 1.25, 1.4),
    target: new THREE.Vector3(0.2, 0.95, 0.1),
    fov: 32,
    autoRotate: false
  },
  {
    key: 'cinematic',
    label: 'Cinematic',
    position: new THREE.Vector3(4.2, 1.15, 1.6),
    target: new THREE.Vector3(0, 0.65, 0),
    fov: 34,
    autoRotate: true
  },
  {
    key: 'panoramic',
    label: 'Panoramic 360',
    position: new THREE.Vector3(0, 1.65, 0.001),
    target: new THREE.Vector3(0, 1.65, -1),
    fov: 70,
    autoRotate: false,
    panoramic: true
  }
];

export class ViewManager {
  constructor({ camera, controls, sceneObjects }) {
    this.camera = camera;
    this.controls = controls;
    this.sceneObjects = sceneObjects;
    this.current = VIEW_DEFS[0];
    this._from = { position: camera.position.clone(), target: controls.target.clone(), fov: camera.fov };
    this._to = { position: camera.position.clone(), target: controls.target.clone(), fov: camera.fov };
    this._t = 1;
    this._duration = 1.4;
  }

  static get list() {
    return VIEW_DEFS.map((v) => ({ key: v.key, label: v.label }));
  }

  goTo(key) {
    const def = VIEW_DEFS.find((v) => v.key === key);
    if (!def) return;
    this.current = def;

    this._from.position.copy(this.camera.position);
    this._from.target.copy(this.controls.target);
    this._from.fov = this.camera.fov;
    this._to.position.copy(def.position);
    this._to.target.copy(def.target);
    this._to.fov = def.fov;
    this._t = 0;

    const { model, ground, extras } = this.sceneObjects;
    const showWorld = !def.panoramic;
    if (model) model.visible = showWorld;
    if (ground) ground.visible = showWorld;
    if (extras) for (const obj of extras) obj.visible = showWorld;

    this.controls.autoRotate = !!def.autoRotate;
    this.controls.autoRotateSpeed = 0.6;
    this.controls.enablePan = !def.panoramic;
    this.controls.enableZoom = !def.panoramic;
    this.controls.minDistance = def.panoramic ? 0.001 : 1.0;
    this.controls.maxDistance = def.panoramic ? 0.05 : 40;
  }

  update(dt) {
    if (this._t < 1) {
      this._t = Math.min(1, this._t + dt / this._duration);
      const e = 1 - Math.pow(1 - this._t, 3);
      this.camera.position.lerpVectors(this._from.position, this._to.position, e);
      this.controls.target.lerpVectors(this._from.target, this._to.target, e);
      this.camera.fov = THREE.MathUtils.lerp(this._from.fov, this._to.fov, e);
      this.camera.updateProjectionMatrix();
    }
    this.controls.update();
  }
}
