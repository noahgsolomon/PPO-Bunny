import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import waterVertexShader from "./shaders/water/vertex.glsl";
import waterFragmentShader from "./shaders/water/fragment.glsl";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPixelatedPass } from "three/examples/jsm/postprocessing/RenderPixelatedPass.js";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
const debugObject = {
  depthColor: "#6bb1d6",
  surfaceColor: "#ffffff",
  pixelatedSize: 6,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(50, 50, 1000, 1000);

// Material
const waterMaterial = new THREE.ShaderMaterial({
  fragmentShader: waterFragmentShader,
  vertexShader: waterVertexShader,
  side: THREE.DoubleSide,
  uniforms: {
    uBigWavesElevation: { value: 0.05 },
    uTime: { value: 0 },
    uFrequency: { value: new THREE.Vector2(8, 10) },
    uSpeed: { value: 2.6 },
    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0 },
    uColorMultiplier: { value: 10 },
    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallWavesFrequency: { value: 3 },
    uSmallWavesIterations: { value: 4 },
  },
});

gui
  .add(waterMaterial.uniforms.uBigWavesElevation, "value", 0, 1, 0.01)
  .name("elevation");

gui
  .add(waterMaterial.uniforms.uFrequency.value, "x", 0, 25, 0.01)
  .name("x frequency");
gui
  .add(waterMaterial.uniforms.uFrequency.value, "y", 0, 25, 0.01)
  .name("z frequency");

gui.addColor(debugObject, "depthColor").onChange(() => {
  waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
});

gui.addColor(debugObject, "surfaceColor").onChange(() => {
  waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
});

gui.add(waterMaterial.uniforms.uSpeed, "value", 0, 10, 0.01).name("speed");
gui
  .add(waterMaterial.uniforms.uColorOffset, "value", 0, 1, 0.001)
  .name("u color offset");
gui
  .add(waterMaterial.uniforms.uColorMultiplier, "value", 0, 10, 0.001)
  .name("u color multiplier");

gui
  .add(waterMaterial.uniforms.uSmallWavesElevation, "value", 0, 1, 0.001)
  .name("u waves elevation");
gui
  .add(waterMaterial.uniforms.uSmallWavesSpeed, "value", 0, 4, 0.001)
  .name("u waves speed");
gui
  .add(waterMaterial.uniforms.uSmallWavesFrequency, "value", 1, 10, 0.001)
  .name("u waves frequency");
gui
  .add(waterMaterial.uniforms.uSmallWavesIterations, "value", 1, 10, 1)
  .name("u waves iterations");

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  effectComposer.setSize(sizes.width, sizes.height);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1, 1, 1);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#8196ab");

const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
  samples: renderer.getPixelRatio() === 1 ? 2 : 0,
});

const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

const renderPass = new RenderPixelatedPass(
  debugObject.pixelatedSize,
  scene,
  camera
);
effectComposer.addPass(renderPass);

gui
  .add(debugObject, "pixelatedSize", 1, 16, 1)
  .name("pixelated")
  .onChange(() => {
    renderPass.setPixelSize(debugObject.pixelatedSize);
  });

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  waterMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  effectComposer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
