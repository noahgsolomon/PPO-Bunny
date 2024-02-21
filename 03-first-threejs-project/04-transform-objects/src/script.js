import * as THREE from "three";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const group = new THREE.Group();
scene.add(group);

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
);
const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
);
const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
);
const cube4 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
);
const cube5 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
);
const cube6 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
);
const cube7 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x7fffd4, wireframe: true })
);
const cube8 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x7fffd4, wireframe: true })
);
const cube9 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x7fffd4, wireframe: true })
);

cube1.position.set(0, 0, 0);
cube2.position.set(0, 0, 2);
cube3.position.set(0, 0, 4);
cube4.position.set(0, 2, 0);
cube5.position.set(0, 2, 2);
cube6.position.set(0, 2, 4);
cube7.position.set(0, 4, 0);
cube8.position.set(0, 4, 2);
cube9.position.set(0, 4, 4);

group.add(cube1, cube2, cube3, cube4, cube5, cube6, cube7, cube8, cube9);

// Axes helper
const axesHelper = new THREE.AxesHelper(5);

scene.add(axesHelper);

/**
 * Sizes
 */
const sizes = {
  width: 800,
  height: 600,
};

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  10
);
camera.position.z = 4;
camera.position.y = 1;
camera.position.x = 1;
scene.add(camera);

camera.lookAt(group.position);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

for (let i = 0; i < 1000; i++) {
  group.position.set(
    group.position.x + 0.01,
    group.position.y + 0.01,
    group.position.z + 0.01
  );
  group.rotation.set(
    group.rotation.x + 0.01,
    group.rotation.y + 0.01,
    group.rotation.z + 0.01
  );
  camera.lookAt(group.position);
  renderer.render(scene, camera);

  await new Promise((resolve) => setTimeout(resolve, 10));
}

for (let i = 0; i < 1000; i++) {
  group.position.set(
    group.position.x - 0.01,
    group.position.y - 0.01,
    group.position.z - 0.01
  );
  group.rotation.set(
    group.rotation.x - 0.01,
    group.rotation.y - 0.01,
    group.rotation.z - 0.01
  );
  camera.lookAt(group.position);
  renderer.render(scene, camera);

  await new Promise((resolve) => setTimeout(resolve, 10));
}
