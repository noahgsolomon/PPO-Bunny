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
const doorColorTexture = textureLoader.load("/textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
  "/textures/door/ambientOcclusion.jpg"
);
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg");
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg");
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg");

const bricksColorTexture = textureLoader.load("/textures/bricks/color.jpg");
const bricksAmbientOcclusionTexture = textureLoader.load(
  "/textures/bricks/ambientOcclusion.jpg"
);
const bricksNormalTexture = textureLoader.load("/textures/bricks/normal.jpg");
const bricksRoughnessTexture = textureLoader.load(
  "/textures/bricks/roughness.jpg"
);
bricksColorTexture.colorSpace = THREE.SRGBColorSpace;
doorColorTexture.colorSpace = THREE.SRGBColorSpace;

const grassColorTexture = textureLoader.load("/textures/grass/color.jpg");
const grassAmbientOcclusionTexture = textureLoader.load(
  "/textures/grass/ambientOcclusion.jpg"
);
const grassNormalTexture = textureLoader.load("/textures/grass/normal.jpg");
const grassRoughnessTexture = textureLoader.load(
  "/textures/grass/roughness.jpg"
);
grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);
grassColorTexture.colorSpace = THREE.SRGBColorSpace;
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;
/**
 * House
 */
const house = new THREE.Group();
scene.add(house);

// Walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(8, 5, 8),
  new THREE.MeshStandardMaterial({
    map: bricksColorTexture,
    aoMap: bricksAmbientOcclusionTexture,
    normalMap: bricksNormalTexture,
    roughnessMap: bricksRoughnessTexture,
  })
);

walls.position.y = walls.geometry.parameters.height / 2;
house.add(walls);

// Roof
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(walls.geometry.parameters.width, 1, 4),
  new THREE.MeshStandardMaterial({ color: 0xb35f45 })
);
roof.position.y =
  walls.geometry.parameters.height + roof.geometry.parameters.height / 2;
roof.rotation.y = Math.PI * 0.25;
house.add(roof);

// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    transparent: true,
    alphaMap: doorAlphaTexture,
    aoMap: doorAmbientOcclusionTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.1,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture,
  })
);
door.position.z = walls.geometry.parameters.depth / 2 + 0.01;
door.position.y = door.geometry.parameters.height / 2;
house.add(door);

const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: "#89c854" });

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, walls.geometry.parameters.depth / 2 + 0.8);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, walls.geometry.parameters.depth / 2 + 0.6);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, walls.geometry.parameters.depth / 2 + 0.8);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, walls.geometry.parameters.depth / 2 + 0.3);

const doorLight = new THREE.PointLight("#ff7d46", 6, 7);
doorLight.position.set(
  0,
  walls.geometry.parameters.height * 0.75,
  walls.geometry.parameters.depth / 2 + 0.8
);
doorLight.castShadow = true;
house.add(doorLight);

house.add(bush1, bush2, bush3, bush4);
walls.castShadow = true;
roof.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;
house.castShadow = true;
// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    map: grassColorTexture,
    aoMap: grassAmbientOcclusionTexture,
    normalMap: grassNormalTexture,
    roughnessMap: grassRoughnessTexture,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

const graves = new THREE.Group();

for (let i = 0; i < 100; i++) {
  const greyValue = Math.floor(Math.random() * 50 + 100);
  const height = Math.random() * 0.2 + 1;
  const width = Math.random() * 0.2 + 0.5;
  const depth = Math.random() * 0.05 + 0.15;
  const grave = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color: `rgb(${greyValue}, ${greyValue}, ${greyValue})`,
    })
  );
  grave.position.y = grave.geometry.parameters.height / 2 - Math.random() * 0.1;
  grave.position.x =
    floor.geometry.parameters.width * 0.9 * (Math.random() - 0.5);
  grave.position.z =
    floor.geometry.parameters.height * 0.9 * (Math.random() - 0.5);
  while (
    Math.abs(grave.position.x) <= walls.geometry.parameters.height + 1 &&
    Math.abs(grave.position.z) <= walls.geometry.parameters.height + 1
  ) {
    grave.position.x =
      floor.geometry.parameters.width * 0.9 * (Math.random() - 0.5);
    grave.position.z =
      floor.geometry.parameters.height * 0.9 * (Math.random() - 0.5);
  }

  grave.rotation.z = (Math.random() - 0.5) * Math.PI * 0.1;
  grave.rotation.x = (Math.random() - 0.5) * Math.PI * 0.1;
  graves.add(grave);
  grave.castShadow = true;
}

scene.add(graves);
graves.castShadow = true;

const fog = new THREE.Fog("#262837", 1, 15);
scene.fog = fog;

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
// scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#ffffff", 1.5);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, "intensity").min(0).max(1).step(0.001);
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
// scene.add(moonLight);
moonLight.castShadow = true;
ambientLight.castShadow = true;

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight("#ff00ff", 6, 3);
scene.add(ghost1);

const ghost2 = new THREE.PointLight("#00ffff", 6, 3);
scene.add(ghost2);

const ghost3 = new THREE.PointLight("#ffff00", 6, 3);
scene.add(ghost3);

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

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

renderer.shadowMap.enabled = true;
renderer.setClearColor("#262837");
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  const ghost1Angle = elapsedTime * 0.5;
  ghost1.position.x = Math.cos(ghost1Angle) * 4;
  ghost1.position.z = Math.sin(ghost1Angle) * 4;
  ghost1.position.y = Math.sin(elapsedTime * 3);

  const ghost2Angle = -elapsedTime * 0.32;
  ghost2.position.x = Math.cos(ghost2Angle) * 5;
  ghost2.position.z = Math.sin(ghost2Angle) * 5;
  ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

  const ghost3Angle = -elapsedTime * 0.18;
  ghost3.position.x =
    Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
  ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
  ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
