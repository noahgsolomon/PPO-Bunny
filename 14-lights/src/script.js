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
 * Lights
 */
// const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
// scene.add(ambientLight);
// gui.add(ambientLight, "intensity", 0, 3, 0.001);

// const directionalLight = new THREE.DirectionalLight(0x0000ff, 50);
// directionalLight.position.set(0, 2, 10);
// scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xeae0c8, 50);
pointLight.position.set(0, 0, 6);
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0x78ff00, 4.5, 10, Math.PI * 0.1, 1, 1);
scene.add(spotLight);

const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0xff0000, 3);
scene.add(hemisphereLight);

//Light Helphers

const hemisphereLightHelpher = new THREE.HemisphereLightHelper(
  hemisphereLight,
  0.2
);
scene.add(hemisphereLightHelpher);

const spotLightHelper = new THREE.SpotLightHelper(spotLight, 0xffffff);
scene.add(spotLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 1, 0xffffff);
scene.add(pointLightHelper);

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial();
material.side = THREE.DoubleSide;
material.roughness = 0.4;

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -1.5;

const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 32, 64),
  material
);
torus.position.x = 1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, cube, torus, plane);

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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
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

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  sphere.rotation.y += 0.001;
  cube.rotation.y += 0.001;
  torus.rotation.y += 0.001;

  sphere.rotation.x += 0.0015;
  cube.rotation.x += 0.0015;
  torus.rotation.x += 0.0015;

  pointLight.position.x = Math.sin(elapsedTime) * 5;
  pointLight.position.z = Math.cos(elapsedTime) * 5;

  console.log(Math.sin(elapsedTime));

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
