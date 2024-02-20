import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const gui = new GUI();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.5),
  new THREE.MeshStandardMaterial({ metalness: 0.7, roughness: 0.4 })
);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ metalness: 0.2, roughness: 0.7 })
);
cube.position.z = 3;

cube.castShadow = true;

scene.add(cube);

sphere.position.y +=
  sphere.geometry.parameters.radius * -Math.cos(Math.PI * 0.75);
sphere.position.z +=
  sphere.geometry.parameters.radius * Math.sin(Math.PI * 0.75);
sphere.castShadow = true;
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ metalness: 0.1, roughness: 1 })
);
plane.rotation.x = Math.PI * 0.75;
plane.material.side = THREE.DoubleSide;
plane.receiveShadow = true;
scene.add(sphere, plane);

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 1;
camera.position.y = 3;
camera.position.z = 5;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
// directionalLight.position.set(2, 7, 6);
// const directionalLightCameraHelper = new THREE.CameraHelper(
//   directionalLight.shadow.camera
// );
// directionalLightCameraHelper.visible = false;
// directionalLight.castShadow = true;
// directionalLight.shadow.mapSize.width = 2048;
// directionalLight.shadow.mapSize.height = 2048;
// scene.add(directionalLight, directionalLightCameraHelper);

const spotLight = new THREE.SpotLight(0xffffff, 200, 50, 20);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
const spotLightHelper = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(spotLight, spotLightHelper);

spotLight.position.set(2, 6, 8);

// gui.add(ambientLight, "intensity", 0, 100, 0.01).name("ambientLight intensity");
// gui.add(plane.material, "metalness", 0, 10, 0.01).name("plane metal");
// gui.add(plane.material, "roughness", 0, 10, 0.01).name("plane rough");
// gui.add(sphere.material, "metalness", 0, 10, 0.01).name("sphere metal");
// gui.add(sphere.material, "roughness", 0, 10, 0.01).name("sphere rough");
// gui
//   .add(directionalLight, "intensity", 0, 10, 0.01)
//   .name("directionalLight intensity");

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
});

renderer.render(scene, camera);
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;

const clock = new THREE.Clock();
let amount = 0.01;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // sphere.position.z += 0.01;
  // sphere.position.y =
  //   Math.abs(Math.cos(elapsedTime)) -
  //   amount +
  //   sphere.geometry.parameters.radius * -Math.cos(Math.PI * 0.75);
  // amount += 0.01;

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
