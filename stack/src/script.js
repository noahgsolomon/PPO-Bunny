import * as THREE from "three";
import GUI from "lil-gui";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const gui = new GUI();

const textureLoader = new THREE.TextureLoader();
const rubberColorTexture = textureLoader.load("rubberColor.jpg");
const rubberTexture = textureLoader.load("rubber.png");
const rubberDisplacementTexture = textureLoader.load("rubberDisplacement.jpg");
const rubberNormalTexture = textureLoader.load("rubberNormal.jpg");
const rubberRoughnessTexture = textureLoader.load("rubberRoughness.jpg");
rubberColorTexture.colorSpace = THREE.SRGBColorSpace;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

const base = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1, 2),
  new THREE.MeshStandardMaterial({
    map: rubberColorTexture,
    normalMap: rubberNormalTexture,
    roughnessMap: rubberRoughnessTexture,
    transparent: true,
  })
);
base.receiveShadow = true;

scene.add(base);

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 2, 4);
scene.add(camera);

const pointLight = new THREE.PointLight(0xff00ff, 20, 10);
pointLight.castShadow = true;
pointLight.position.set(0, 3, 0);
scene.add(pointLight);

// const spotLight = new THREE.SpotLight(0x0000ff, 10, 20, 0.1 * Math.PI);
// scene.add(spotLight);
// gui.add(spotLight.position, "x", 0, 10, 0.01).name("spotLight x");
// gui.add(spotLight.position, "y", 0, 10, 0.01).name("spotLight y");
// gui.add(spotLight.position, "z", 0, 10, 0.01).name("spotLight z");
// gui.add(spotLight, "intensity", 0, 100, 0.01).name("spotLight intensity");
// gui.addColor(spotLight, "color").name("spotLight color");

const directionalLight = new THREE.DirectionalLight(0xffffff, 10.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 4, 5);
scene.add(directionalLight);

// const directionalLightHelper = new THREE.CameraHelper(
//   directionalLight.shadow.camera
// );
// scene.add(directionalLightHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
scene.add(ambientLight);

gui.add(ambientLight, "intensity", 0, 50).name("ambient light intensity");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
});

renderer.shadowMap.enabled = true;
renderer.render(scene, camera);

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  renderer.render(scene, camera);

  controls.update();

  window.requestAnimationFrame(tick);
};

tick();
