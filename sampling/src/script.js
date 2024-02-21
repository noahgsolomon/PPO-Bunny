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

const particlesGeometry = new THREE.SphereGeometry(1, 32, 32);
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.02,
  sizeAttenuation: true,
});

// points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
// scene.add(particles);

const randCircle = new THREE.BufferGeometry();
const randMaterial = new THREE.PointsMaterial({
  size: 0.001,
  sizeAttenuation: true,
  color: 0xff44ff,
});
const positionsArrayCircle = new Float32Array(1000 * 3 * 3);
const positionsAttributeCircle = new THREE.BufferAttribute(
  positionsArrayCircle,
  3
);
randCircle.setAttribute("position", positionsAttributeCircle);

const randParticles = new THREE.Points(randCircle, randMaterial);
scene.add(randParticles);

const randCube = new THREE.BufferGeometry();
const randCubeMaterial = new THREE.PointsMaterial({
  size: 0.001,
  sizeAttenuation: true,
  color: 0xff0000,
});
const positionsArrayCube = new Float32Array(10000 * 3 * 3);
const positionsAttributeCube = new THREE.BufferAttribute(positionsArrayCube, 3);
randCube.setAttribute("position", positionsAttributeCube);

const randCubeParticles = new THREE.Points(randCube, randCubeMaterial);
scene.add(randCubeParticles);

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
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

let rate = 1.0001;
let i = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  if (rate < 100 && i % 100 === 0) {
    rate *= rate;
  }

  for (let j = 0; j < rate; j++) {
    let u = Math.random();
    let v = Math.random();
    let theta = 2 * Math.PI * u;
    let phi = Math.acos(2 * v - 1);
    let x = Math.sin(phi) * Math.cos(theta);
    let y = Math.sin(phi) * Math.sin(theta);
    let z = Math.cos(phi);
    const randomPos = Math.floor(
      Math.random() * (positionsArrayCircle.length / 3)
    );
    positionsArrayCircle[randomPos * 3] = x + u / 10;
    positionsArrayCircle[randomPos * 3 + 1] = y + u / 10;
    positionsArrayCircle[randomPos * 3 + 2] = z + u / 10;
  }

  for (let j = 0; j < rate; j++) {
    const randomPos = Math.floor(Math.random() * positionsArrayCube.length);
    positionsArrayCube[randomPos] = (Math.random() - 0.5) * 3;

    const positionsAttributeCube = new THREE.BufferAttribute(
      positionsArrayCube,
      3
    );

    randCube.setAttribute("position", positionsAttributeCube);
  }

  i++;
  const positionsAttributeCircle = new THREE.BufferAttribute(
    positionsArrayCircle,
    3
  );
  randCircle.setAttribute("position", positionsAttributeCircle);

  randCube.rotateX(Math.sin((elapsedTime * 1) / i));
  randCube.rotateY(Math.sin((elapsedTime * 4) / i));
  randCube.rotateZ(Math.sin((elapsedTime * 12) / i));

  randCircle.rotateX(Math.sin(elapsedTime / i));
  randCircle.rotateY(Math.sin((elapsedTime * 3) / i));

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
