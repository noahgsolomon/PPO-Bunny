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

/**
 * House
 */
// Temporary sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({ roughness: 0.7 })
);
sphere.castShadow = true;
sphere.position.y = 1;
scene.add(sphere);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: "#a9c388" })
);
floor.receiveShadow = true;
floor.material.side = THREE.DoubleSide;
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#ffffff", 1.5);
moonLight.position.set(4, 10, -2);
scene.add(moonLight);

moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 1024;
moonLight.shadow.mapSize.height = 1024;

moonLight.shadow.camera.left = -10;
moonLight.shadow.camera.right = 10;
moonLight.shadow.camera.top = 10;
moonLight.shadow.camera.bottom = -10;
moonLight.shadow.camera.near = 1;
moonLight.shadow.camera.far = 100;

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
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

const guiThings = {
  rollingRadius: 4,
  floorYRotation: Math.PI / 8,
  floorZRotation: Math.PI,
  floorXRotation: Math.PI,
};

gui.add(guiThings, "rollingRadius", 1, 5, 0.01).name("rolling radius");
gui
  .add(guiThings, "floorYRotation", Math.PI / 24, Math.PI / 8, 0.01)
  .name("floorYRotation");
gui
  .add(guiThings, "floorZRotation", Math.PI / 8, Math.PI * 2, 0.01)
  .name("floorZRotation");
gui
  .add(guiThings, "floorXRotation", Math.PI, Math.PI * 2, 0.01)
  .name("floorXRotation");

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  floor.position.y = Math.sin(elapsedTime) * 5;

  floor.rotation.y = Math.sin(elapsedTime) * guiThings.floorYRotation;
  floor.rotation.z = Math.sin(elapsedTime) * guiThings.floorZRotation;
  floor.rotation.x =
    -0.5 * Math.PI + Math.sin(elapsedTime) * guiThings.floorXRotation;

  sphere.position.x = Math.sin(elapsedTime) * guiThings.rollingRadius;
  sphere.position.z = Math.cos(elapsedTime) * guiThings.rollingRadius;

  sphere.position.y =
    Math.abs(Math.cos(elapsedTime) * 10) +
    sphere.geometry.parameters.radius +
    floor.position.y +
    Math.sin(
      Math.min(
        Math.sin(elapsedTime) * guiThings.floorYRotation,
        -(Math.sin(elapsedTime) * guiThings.floorYRotation)
      )
    ) *
      guiThings.rollingRadius +
    Math.max(
      Math.sin(elapsedTime) * guiThings.floorXRotation,
      -Math.sin(elapsedTime) * guiThings.floorXRotation
    );

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
