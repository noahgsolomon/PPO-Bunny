import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

const gui = new GUI();

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

const doorColorTexture = textureLoader.load("textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
  "textures/door/ambientOcclusion.jpg"
);
const doorHeightTexture = textureLoader.load("textures/door/height.jpg");
const doorMetalnessTexture = textureLoader.load("textures/door/metalness.jpg");
const doorNormalTexture = textureLoader.load("textures/door/normal.jpg");
const doorRoughnessTexture = textureLoader.load("textures/door/roughness.jpg");
const matcap1Texture = textureLoader.load("textures/matcaps/8.png");
const gradientTexture = textureLoader.load("textures/gradients/5.jpg");

doorColorTexture.colorSpace = THREE.SRGBColorSpace;
matcap1Texture.colorSpace = THREE.SRGBColorSpace;

//environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load("textures/environmentMap/2k.hdr", (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = environmentMap;
  scene.environment = environmentMap;
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// const material = new THREE.MeshBasicMaterial();

// material.map = doorColorTexture;
// material.transparent = true;
// material.opacity = 0.3;
// material.color = new THREE.Color(0xff0000);
// material.alphaMap = doorAlphaTexture;
// material.side = THREE.DoubleSide;

//Mesh Normal Material
// const material = new THREE.MeshNormalMaterial();
// material.side = THREE.DoubleSide;
// material.wireframe = true;

//Mesh Matcap Material
// const material = new THREE.MeshMatcapMaterial({ matcap: matcap1Texture });
// material.side = THREE.DoubleSide;

//Mesh Depth Material
// const material = new THREE.MeshDepthMaterial();

//Mesh Lambert Material
// const material = new THREE.MeshLambertMaterial();

//Mesh Phong Material
// const material = new THREE.MeshPhongMaterial();
// material.shininess = 1000;
// material.specular = new THREE.Color(0x1188ff);

//Mest Toon Material
// const material = new THREE.MeshToonMaterial();
// gradientTexture.magFilter = THREE.NearestFilter;
// material.gradientMap = gradientTexture;

// Mesh Standard Material
// const material = new THREE.MeshStandardMaterial();
// material.roughness = 1;
// material.metalness = 1;
// material.map = doorColorTexture;
// material.aoMap = doorAmbientOcclusionTexture;
// material.displacementMap = doorHeightTexture;
// material.displacementScale = 0.1;
// material.metalnessMap = doorMetalnessTexture;
// material.roughnessMap = doorRoughnessTexture;
// material.side = THREE.DoubleSide;
// material.normalMap = doorNormalTexture;
// material.transparent = true;
// material.alphaMap = doorAlphaTexture;

// Mesh Physical Material
const material = new THREE.MeshPhysicalMaterial();
material.roughness = 1;
material.metalness = 1;
material.map = doorColorTexture;
material.aoMap = doorAmbientOcclusionTexture;
material.displacementMap = doorHeightTexture;
material.displacementScale = 0.1;
material.metalnessMap = doorMetalnessTexture;
material.roughnessMap = doorRoughnessTexture;
material.side = THREE.DoubleSide;
material.normalMap = doorNormalTexture;
material.transparent = true;
// material.alphaMap = doorAlphaTexture;

material.clearcoat = 1;
material.clearcoatRoughness = 0;
material.sheen = 1;
material.sheenRoughness = 0.25;
material.sheenColor = new THREE.Color("blue");

// Iridescence
material.iridescence = 1;
material.iridescenceIOR = 1;
material.iridescenceThicknessRange = [100, 800];
material.transmission = 1;

gui.add(material, "metalness", 0, 1, 0.0001);
gui.add(material, "roughness", 0, 1, 0.0001);
gui.add(material, "clearcoat", 0, 1, 0.0001);
gui.add(material, "clearcoatRoughness", 0, 1, 0.0001);
gui.add(material, "sheen", 0, 1, 0.0001);
gui.add(material, "sheenRoughness", 0, 1, 0.0001);
gui.addColor(material, "sheenColor");
gui.add(material, "iridescence", 0, 1, 0.0001);
gui.add(material, "iridescenceIOR", 1, 2.3333, 0.0001);
gui.add(material, "thickness", 0, 1, 0.0001);

const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material);
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 1000, 100),
  material
);
const torus = new THREE.Mesh(new THREE.TorusGeometry(1, 1, 64, 128), material);

sphere.position.x = -4;
torus.position.x = 4;

torus.rotation.x = 3.141592653589 / 4;
plane.rotation.y = 3.141592653589 / 8;
plane.rotation.x = 3.141592653589 / 5;

scene.add(sphere, plane, torus);

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
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 10;
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

  // Update controls
  controls.update();

  torus.rotation.x -= 0.001;
  torus.rotation.y -= 0.002;
  torus.rotation.z -= 0.0005;

  plane.rotation.x -= 0.001;
  plane.rotation.y -= 0.0005;

  sphere.rotation.x -= 0.001;
  sphere.rotation.y -= 0.0005;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
