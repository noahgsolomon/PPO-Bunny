import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

const gui = new GUI();

const mixer = [];
const birbs = [];

loader.load("/models/Flamingo.glb", (v) => {
  const i = mixer.length;
  mixer.push(new THREE.AnimationMixer(v.scene));
  const action = mixer[i].clipAction(v.animations[0]);
  action.play();
  scene.add(v.scene);
  v.scene.position.set(-4, 0, 8);
  birbs.push(v.scene);
});

loader.load("/models/Parrot.glb", (v) => {
  const i = mixer.length;
  mixer.push(new THREE.AnimationMixer(v.scene));
  const action = mixer[i].clipAction(v.animations[0]);
  action.play();
  scene.add(v.scene);
  v.scene.position.set(4, 0, 5);
  birbs.push(v.scene);
});

loader.load("/models/Stork.glb", (v) => {
  const i = mixer.length;
  mixer.push(new THREE.AnimationMixer(v.scene));
  const action = mixer[i].clipAction(v.animations[0]);
  action.play();
  scene.add(v.scene);
  v.scene.position.set(0, 2, 10);
  birbs.push(v.scene);
});

loader.load("/models/Duck.gltf", (v) => {
  scene.add(v.scene);
  v.scene.position.set(0, 0.8, 0);
});

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  1000
);

camera.position.set(0, 20, -30);
scene.add(camera);

const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
directionalLight.castShadow = true;
directionalLight.position.set(7, 6, 4);

scene.add(directionalLight);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 200),
  new THREE.MeshStandardMaterial({
    metalness: 0.01,
    roughness: 0.7,
    color: 0x00ff00,
  })
);

plane.position.z = -100;

plane.rotation.x = -Math.PI * 0.5;

scene.add(plane);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);
renderer.setClearColor("skyblue");

const clock = new THREE.Clock();
let prevTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  controls.update();

  for (const mix of mixer) {
    mix.update(deltaTime);
  }

  for (const birb of birbs) {
    birb.position.z += 0.02;
    birb.position.y += 0.02;
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
