import * as THREE from "three";
import gsap from "gsap";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const axes = new THREE.AxesHelper(5);

scene.add(axes);

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
camera.position.y = 1;
camera.position.x = 1;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

const clock = new THREE.Clock();

gsap.to(mesh.position, { x: 2, duration: 1, delay: 1 });
gsap.to(mesh.position, { x: 0, duration: 1, delay: 1 });

// Animations
const tick = () => {
  //   const elapsedTime = clock.getElapsedTime();
  //   mesh.position.set(
  //     Math.sin(elapsedTime),
  //     Math.cos(elapsedTime),
  //     Math.cos(elapsedTime) * elapsedTime
  //   );
  renderer.render(scene, camera);
  //   camera.lookAt(mesh.position);
  window.requestAnimationFrame(tick);
};

tick();
