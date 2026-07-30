import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const CinematicShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignette: { value: 0.6 },
    uAberration: { value: 0.0026 },
    uLetterbox: { value: 0.0 }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    uniform float uAberration;
    uniform float uLetterbox;
    varying vec2 vUv;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      vec2 centered = uv - 0.5;
      float dist = length(centered);

      vec2 dir = normalize(centered + 1e-6);
      float shift = uAberration * dist;
      float r = texture2D(tDiffuse, uv - dir * shift).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv + dir * shift).b;
      vec3 color = vec3(r, g, b);

      color = mix(color, color * vec3(0.82, 1.0, 1.12), 0.28);

      float vig = smoothstep(0.95, 0.2, dist * (1.0 + uVignette));
      color *= mix(1.0, vig, uVignette);
      color += vec3(0.0, 0.05, 0.09) * (1.0 - vig) * 0.4;

      float grain = (noise(uv * vec2(1920.0, 1080.0) + fract(uTime) * 100.0) - 0.5) * 0.02;
      color += grain;

      float bar = uLetterbox * 0.12;
      float mask = step(bar, uv.y) * step(bar, 1.0 - uv.y);
      color *= mask;

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

export function createPostFX(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.85,
    0.55,
    0.72
  );
  composer.addPass(bloomPass);

  const cinematicPass = new ShaderPass(CinematicShader);
  composer.addPass(cinematicPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  window.addEventListener('resize', () => {
    composer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.setSize(window.innerWidth, window.innerHeight);
  });

  return {
    composer,
    bloomPass,
    cinematicPass,
    setLetterbox(active) {
      cinematicPass.uniforms.uLetterbox.value = active ? 1.0 : 0.0;
    },
    update(dt) {
      cinematicPass.uniforms.uTime.value += dt;
    }
  };
}
