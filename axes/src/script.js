import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("textures/particles/1.png");

// const particlesGeometry = new THREE.SphereGeometry(1, 32, 32);
// const particlesMaterial = new THREE.PointsMaterial({
//   size: 0.02,
//   sizeAttenuation: true,
// });

// const particles = new THREE.Points(particlesGeometry, particlesMaterial);
// scene.add(particles);

const particlesGeometry = new THREE.BufferGeometry();
const count = 500000;

const positions = new Float32Array(count * 3);

const colors = new Float32Array(count * 3);

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.1,
  sizeAttenuation: true,
  vertexColors: true,
  //   transparent: true,
  //   alphaMap: particleTexture,
  //   alphaTest: 0.1,
  //   depthTest: false,
});

const points = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(points);

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
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  10000
);
camera.position.z = 100;
camera.position.y = 70;
camera.position.x = 30;
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
// renderer.setClearColor(0xffffff);
/**
 * Animate
 */
const clock = new THREE.Clock();

let i = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  for (let j = 0; j < 100; j++) {
    let idx = Math.floor((Math.random() * positions.length) / 3);
    idx += (3 - idx) % 3;
    positions[idx] =
      (Math.random() - 0.5) * 10 +
      Math.abs(Math.min(Math.random(), 0.02) - 0.02) *
        100000 *
        (Math.random() - 0.5);
    positions[idx + 1] =
      (Math.random() - 0.5) * 10 +
      Math.abs(Math.min(Math.random(), 0.02) - 0.02) *
        100000 *
        (Math.random() - 0.5);
    positions[idx + 2] =
      (Math.random() - 0.5) * 10 +
      Math.abs(Math.min(Math.random(), 0.02) - 0.02) *
        100000 *
        (Math.random() - 0.5);

    colors[idx] =
      positions[idx] >= 5 ? 1 : positions[idx] <= -5 ? 1 : Math.random();
    colors[idx + 1] =
      positions[idx + 1] >= 5
        ? 1
        : positions[idx + 1] <= -5
        ? 1
        : Math.random();
    colors[idx + 2] =
      positions[idx + 2] >= 5
        ? 1
        : positions[idx + 2] <= -5
        ? 1
        : Math.random();

    if (
      positions[idx] <= 5 &&
      positions[idx] >= -5 &&
      positions[idx + 1] <= 5 &&
      positions[idx + 1] >= -5 &&
      positions[idx + 2] <= 5 &&
      positions[idx + 2] >= -5
    ) {
      colors[idx] = 1;
      colors[idx + 1] = 1;
      colors[idx + 2] = 1;
    }
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  i += 3;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  points.rotateX(0.001);
  points.rotateY(0.001);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
