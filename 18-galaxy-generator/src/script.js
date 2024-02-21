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

const parameters = {
  count: 10000,
  size: 0.02,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  insideColor: 0xff6030,
  outsideColor: 0x1b3984,
};

let geometry = null;
let positions = null;
let points = null;
let colors = null;

const generateGalaxy = () => {
  if (points !== null) {
    geometry.dispose();
    scene.remove(points);
  }
  geometry = new THREE.BufferGeometry();
  positions = new Float32Array(parameters.count * 3);
  colors = new Float32Array(parameters.count * 3);

  for (let i = 0; i < parameters.count; i++) {
    const j = i * 3;
    const branchAngle = (i % parameters.branches) / parameters.branches;
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    const randCol = Math.random();

    const randX =
      (Math.random() - 0.5) * parameters.randomness * 2 +
      (Math.min(Math.random(), 0.01) - 0.01) *
        ((Math.random() - 0.5) * 2) *
        radius +
      (randCol + 0.01) ** (10 * Math.random()) * (Math.random() - 0.5) * 2;
    const randY =
      (Math.random() - 0.5) * parameters.randomness * 2 +
      (randCol + 0.01) ** (10 * Math.random()) * (Math.random() - 0.5) * 2;
    const randZ =
      (Math.random() - 0.5) * parameters.randomness * 2 +
      (Math.min(Math.random(), 0.01) - 0.01) *
        ((Math.random() - 0.5) * 2) *
        radius +
      (randCol + 0.01) ** (10 * Math.random()) * (Math.random() - 0.5) * 2;

    positions[j] =
      Math.cos(branchAngle * 2 * Math.PI + spinAngle) * radius + randX;
    positions[j + 1] = randY;
    positions[j + 2] =
      Math.sin(branchAngle * 2 * Math.PI + spinAngle) * radius + randZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, (radius / parameters.radius) * 1.4);

    colors[j] = mixedColor.r;
    colors[j + 1] = mixedColor.g;
    colors[j + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    })
  );
  scene.add(points);
};

gui.add(parameters, "count", 100, 1000000, 100).onFinishChange(generateGalaxy);
gui.add(parameters, "size", 0.001, 0.2, 0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "radius", 0.01, 20, 0.01).onFinishChange(generateGalaxy);
gui.add(parameters, "branches", 2, 100, 1).onFinishChange(generateGalaxy);
gui.add(parameters, "spin", -5, 5, 0.01).onFinishChange(generateGalaxy);
gui.add(parameters, "randomness", 0, 2, 0.01).onFinishChange(generateGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);

generateGalaxy();

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
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  //   antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  if (geometry !== null) {
    points.rotateY(0.0005);
    points.rotateX(Math.sin(elapsedTime * 0.0001) * 0.01);
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
