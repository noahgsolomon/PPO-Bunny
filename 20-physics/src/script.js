import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

const FPS = 60;

/**
 * Debug
 */
const gui = new GUI();

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Physics
 */
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

// const concreteMaterial = new CANNON.Material("concrete");
// const plasticMaterial = new CANNON.Material("plastic");

// const concretePlasticContactMaterial = new CANNON.ContactMaterial(
//   concreteMaterial,
//   plasticMaterial,
//   { friction: 0.1, restitution: 0.7 }
// );

// world.addContactMaterial(concretePlasticContactMaterial);

const defaultMaterial = new CANNON.Material("default");

const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  { friction: 0.2, restitution: 0.8 }
);

world.addContactMaterial(defaultContactMaterial);

// const sphereShape = new CANNON.Sphere(0.5);
// const sphereBody = new CANNON.Body({
//   mass: 1,
//   position: new CANNON.Vec3(0, 3, 0),
//   shape: sphereShape,
//   material: defaultMaterial,
// });
// sphereBody.applyLocalForce(
//   new CANNON.Vec3(150, 0, 0),
//   new CANNON.Vec3(0, 0, 0)
// );
// world.addBody(sphereBody);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
]);

/**
 * Sounds
 */
const clock = new THREE.Clock();
let prevSoundTime = 0;

const hitSound = new Audio("/sounds/hit.mp3");

const playHitSound = (collision) => {
  const elapsedTime = clock.getElapsedTime();
  const impactStrength = collision.contact.getImpactVelocityAlongNormal();
  if (
    elapsedTime - prevSoundTime >= Math.random() * 0.25 &&
    impactStrength > 1.5
  ) {
    prevSoundTime = elapsedTime;
    hitSound.volume = Math.min(impactStrength / 15, 1);
    hitSound.currentTime = 0;
    hitSound.play();
  }
};

const spheres = [];

const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);

const createSphere = (radius, position) => {
  //THREE
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.position.copy(position);
  sphereMesh.castShadow = true;
  sphereMesh.scale.set(radius, radius, radius);
  scene.add(sphereMesh);

  //CANNON
  const sphereBody = new CANNON.Body({
    mass: 1,
    position,
    shape: new CANNON.Sphere(radius),
    material: defaultMaterial,
  });
  sphereBody.addEventListener("collide", playHitSound);
  world.addBody(sphereBody);

  spheres.push({ mesh: sphereMesh, body: sphereBody });
};

const cubes = [];

const cubeMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

const createCube = (size, position) => {
  //THREE
  const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cubeMesh.position.copy(position);
  cubeMesh.castShadow = true;
  cubeMesh.scale.set(size * 2, size * 2, size * 2);
  scene.add(cubeMesh);

  //CANNON
  const cubeBody = new CANNON.Body({
    mass: 1,
    position,
    shape: new CANNON.Box(new CANNON.Vec3(size, size, size)),
    material: defaultMaterial,
  });
  cubeBody.addEventListener("collide", playHitSound);
  world.addBody(cubeBody);

  cubes.push({ mesh: cubeMesh, body: cubeBody });
};

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  mass: 0,
  shape: floorShape,
  material: defaultMaterial,
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI * 0.5);
world.addBody(floorBody);

const cannonDebugger = new CannonDebugger(scene, world, {
  color: 0xff0000,
  autoUpdate: true,
});

const debugObject = {
  createSphere: () =>
    createSphere(
      Math.random(),
      new CANNON.Vec3(
        (Math.random() - 0.5) * floor.geometry.parameters.width,
        Math.random() * 6,
        (Math.random() - 0.5) * floor.geometry.parameters.width
      )
    ),

  createCube: () =>
    createCube(
      Math.random(),
      new CANNON.Vec3(
        (Math.random() - 0.5) * floor.geometry.parameters.width,
        Math.random() * 6,
        (Math.random() - 0.5) * floor.geometry.parameters.width
      )
    ),
  reset: () => {
    for (const obj of [...cubes, ...spheres]) {
      obj.body.removeEventListener("collide", playHitSound);
      world.removeBody(obj.body);
      scene.remove(obj.mesh);
    }
    cubes = [];
    spheres = [];
  },
};

gui.add(debugObject, "createSphere");
gui.add(debugObject, "createCube");
gui.add(debugObject, "reset");

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);

floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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
camera.position.set(-3, 3, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

let prevTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  world.step(1 / FPS, deltaTime, 3);

  cannonDebugger.update();

  //   createCube(
  //     Math.random(),
  //     new CANNON.Vec3(
  //       (Math.random() - 0.5) * floor.geometry.parameters.width,
  //       Math.random() * 50,
  //       (Math.random() - 0.5) * floor.geometry.parameters.width
  //     )
  //   );
  //   createSphere(
  //     Math.random(),
  //     new CANNON.Vec3(
  //       (Math.random() - 0.5) * floor.geometry.parameters.width,
  //       Math.random() * 50,
  //       (Math.random() - 0.5) * floor.geometry.parameters.width
  //     )
  //   );

  for (const sphere of spheres) {
    sphere.mesh.position.copy(sphere.body.position);
  }

  for (const cube of cubes) {
    cube.mesh.position.copy(cube.body.position);
    cube.mesh.quaternion.copy(cube.body.quaternion);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
