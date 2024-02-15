import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

const gui = new GUI();

const debugObject = {
  color: "#ffffff",
  samples: 100,
  cubeColor: "#ff0000",
};

// Scene
const scene = new THREE.Scene();

let geometry = new THREE.BufferGeometry();
let geometryCube = new THREE.BufferGeometry();

// Object
// const geometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10);
const material = new THREE.MeshBasicMaterial({
  color: debugObject.color,
  wireframe: true,
});

const materialCube = new THREE.MeshBasicMaterial({
  color: debugObject.cubeColor,
  wireframe: true,
});

const mesh = new THREE.Mesh(geometry, material);
const meshCube = new THREE.Mesh(geometryCube, materialCube);
scene.add(mesh);
scene.add(meshCube);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const samplingCircle = () => {
  geometry.dispose();
  geometry = new THREE.BufferGeometry();
  const positionsArrayCircle = new Float32Array(debugObject.samples * 3 * 3);

  console.log(debugObject.samples);

  for (let i = 0; i < debugObject.samples; i++) {
    let u = Math.random();
    let v = Math.random();
    let theta = 2 * Math.PI * u;
    let phi = Math.acos(2 * v - 1);
    let x = Math.sin(phi) * Math.cos(theta);
    let y = Math.sin(phi) * Math.sin(theta);
    let z = Math.cos(phi);
    positionsArrayCircle[i * 3] = x;
    positionsArrayCircle[i * 3 + 1] = y;
    positionsArrayCircle[i * 3 + 2] = z;
  }

  const positionsAttributeCircle = new THREE.BufferAttribute(
    positionsArrayCircle,
    3
  );

  geometry.setAttribute("position", positionsAttributeCircle);
  mesh.geometry = geometry;
};

const samplingCube = () => {
  geometryCube.dispose();
  geometryCube = new THREE.BufferGeometry();
  const positionsArrayCube = new Float32Array(debugObject.samples * 3 * 3);
  for (let i = 0; i < debugObject.samples * 3 * 3; i++) {
    positionsArrayCube[i] = Math.random() - 0.5;
  }

  const positionsAttributeCube = new THREE.BufferAttribute(
    positionsArrayCube,
    3
  );

  geometryCube.setAttribute("position", positionsAttributeCube);
  meshCube.geometry = geometryCube;
};

samplingCircle();
samplingCube();

meshCube.position.set(0, 3, 0);

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

// Camera
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

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animate
const clock = new THREE.Clock();

gui.addColor(debugObject, "color").onChange(() => {
  mesh.material.color.set(debugObject.color);
});
gui.addColor(debugObject, "cubeColor").onChange(() => {
  meshCube.material.color.set(debugObject.cubeColor);
});

gui.add(debugObject, "samples", 1, 10000, 1).onChange(() => {
  samplingCircle();
  samplingCube();
});

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
