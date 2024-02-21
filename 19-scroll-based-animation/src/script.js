import * as THREE from "three";
import GUI from "lil-gui";
import gsap from "gsap";

/**
 * Debug
 */
const gui = new GUI();

const parameters = {
  materialColor: "#004cff",
  materialColorCone: "#f00000",
  materialColorKnot: "#11ff00",
};

const textureLoader = new THREE.TextureLoader();

const gradientTexture = textureLoader.load("textures/gradients/5.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

const materialCone = new THREE.MeshToonMaterial({
  color: parameters.materialColorCone,
  gradientMap: gradientTexture,
});
const materialKnot = new THREE.MeshToonMaterial({
  color: parameters.materialColorKnot,
  gradientMap: gradientTexture,
});

gui
  .addColor(parameters, "materialColor")
  .onChange(() => material.color.set(parameters.materialColor));
gui
  .addColor(parameters, "materialColorCone")
  .onChange(() => materialCone.color.set(parameters.materialColorCone));
gui
  .addColor(parameters, "materialColorKnot")
  .onChange(() => materialKnot.color.set(parameters.materialColorKnot));

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const objectsDistance = 4;

const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
mesh1.position.y = -objectsDistance * 0;
mesh1.position.x = 2;

const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), materialCone);
mesh2.position.y = -objectsDistance * 1;
mesh2.position.x = -2;

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  materialKnot
);
mesh3.position.y = -objectsDistance * 2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3);

const sectionsMeshs = [mesh1, mesh2, mesh3];

const directionLight = new THREE.DirectionalLight(0xffffff, 3);
directionLight.position.set(1, 1, 0);
scene.add(directionLight);

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

const cameraGroup = new THREE.Group();

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

scene.add(cameraGroup);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const starColors = [
  new THREE.Color(0xffd2a1), // Warm white
  new THREE.Color(0xffffff), // Warm white
  new THREE.Color(0xffcc6f), // Yellowish
  new THREE.Color(0xffffff), // Pure white
  new THREE.Color(0x9db4ff), // Blueish
  new THREE.Color(0xff901f), // Orange
  new THREE.Color(0xffd2a1), // Pale yellow
];

const count = 10000;
const largeStarPercentage = 0.1;
const largeStarCount = count * largeStarPercentage;
const regularStarCount = count - largeStarCount;

// Regular stars
const regularParticleGeometry = new THREE.BufferGeometry();
const regularParticleMaterial = new THREE.PointsMaterial({
  size: 0.01, // Size for regular stars
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
});

// Large stars
const largeParticleGeometry = new THREE.BufferGeometry();
const largeParticleMaterial = new THREE.PointsMaterial({
  size: 0.05, // Larger size for prominent stars
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
});

let regularPositions = new Float32Array(regularStarCount * 3);
let largePositions = new Float32Array(largeStarCount * 3);
let regularColors = new Float32Array(regularStarCount * 3);
let largeColors = new Float32Array(largeStarCount * 3);

for (let i = 0; i < count; i++) {
  const color = starColors[Math.floor(Math.random() * starColors.length)];

  if (i < regularStarCount) {
    // Assign to regular stars
    let j = i * 3;
    regularPositions[j] = (Math.random() - 0.5) * 8;
    regularPositions[j + 1] = (Math.random() - 0.5) * 20;
    regularPositions[j + 2] = (Math.random() - 1) * 2;

    regularColors[j] = color.r;
    regularColors[j + 1] = color.g;
    regularColors[j + 2] = color.b;
  } else {
    // Assign to large stars
    let j = (i - regularStarCount) * 3;
    largePositions[j] = (Math.random() - 0.5) * 8;
    largePositions[j + 1] = (Math.random() - 0.5) * 20;
    largePositions[j + 2] = (Math.random() - 1) * 2 - 3;

    largeColors[j] = color.r;
    largeColors[j + 1] = color.g;
    largeColors[j + 2] = color.b;
  }
}

// Set attributes for regular stars
regularParticleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(regularPositions, 3)
);
regularParticleGeometry.setAttribute(
  "color",
  new THREE.BufferAttribute(regularColors, 3)
);

// Set attributes for large stars
largeParticleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(largePositions, 3)
);
largeParticleGeometry.setAttribute(
  "color",
  new THREE.BufferAttribute(largeColors, 3)
);

// Create the particle systems
const regularParticleSystem = new THREE.Points(
  regularParticleGeometry,
  regularParticleMaterial
);
const largeParticleSystem = new THREE.Points(
  largeParticleGeometry,
  largeParticleMaterial
);

// Add both systems to the scene
scene.add(regularParticleSystem);
scene.add(largeParticleSystem);

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  const newSection = Math.round(scrollY / sizes.height);
  if (newSection !== currentSection) {
    currentSection = newSection;
    gsap.to(sectionsMeshs[currentSection].rotation, {
      duration: 1.5,
      ease: "pow2.inOut",
      x: "+=6",
      y: "+=3",
    });
  }
});

const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  for (const mesh of sectionsMeshs) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = -cursor.x;
  const parallaxY = cursor.y;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 0.5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 0.5 * deltaTime;

  mesh1.position.x +=
    (parallaxX - mesh1.position.x) * 0.5 * deltaTime -
    cameraGroup.position.x * deltaTime;
  mesh1.position.y +=
    (parallaxY - mesh1.position.y) * 0.5 * deltaTime -
    cameraGroup.position.y * deltaTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
