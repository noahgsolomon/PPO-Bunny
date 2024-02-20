import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

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

const matcapTexture = textureLoader.load("8.png");
const matcapTexture2 = textureLoader.load("textures/matcaps/1.png");
const matcapTexture3 = textureLoader.load("textures/matcaps/2.png");
const matcapTexture4 = textureLoader.load("textures/matcaps/3.png");
const matcapTexture5 = textureLoader.load("textures/matcaps/4.png");
const matcapTexture6 = textureLoader.load("textures/matcaps/5.png");
const matcapTexture7 = textureLoader.load("textures/matcaps/6.png");
const matcapTexture8 = textureLoader.load("textures/matcaps/7.png");
matcapTexture.colorSpace = THREE.SRGBColorSpace;
const gradientTexture = textureLoader.load("5.jpg");

//Font Loader
const fontLoader = new FontLoader();
fontLoader.load("fonts/roboto.json", (font) => {
  const textGeometry = new TextGeometry("@Noah Solomon", {
    font,
    size: 0.5,
    height: 0.2,
    curveSegments: 10,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  });
  //   textGeometry.computeBoundingBox();
  //   textGeometry.translate(
  //     -(textGeometry.boundingBox.max.x - 0.02) * 0.5,
  //     -(textGeometry.boundingBox.max.y - 0.02) * 0.5,
  //     -(textGeometry.boundingBox.max.z - 0.03) * 0.5
  //   );
  textGeometry.center();
  const textMaterial = new THREE.MeshMatcapMaterial({
    matcap: matcapTexture,
  });
  //   gradientTexture.magFilter = THREE.NearestFilter;
  //   textMaterial.gradientMap = gradientTexture;
  const text = new THREE.Mesh(textGeometry, textMaterial);
  scene.add(text);
});
/**
 * Object
 */
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial()
);

// const axes = new THREE.AxesHelper(1);
// scene.add(axes);

// const ambientLight = new THREE.AmbientLight(0xffffff, 1);

// const pointLight = new THREE.PointLight(0xffffff, 30);
// pointLight.position.z = 3;
// pointLight.position.y = 3;
// pointLight.position.x = 3;

// scene.add(ambientLight, pointLight);
const donutArr = [];

console.time("donuts");

for (let i = 0; i < 10000; i++) {
  const randomMat = Math.random();
  const donutShape = Math.random();
  const donut = new THREE.Mesh(
    new THREE.TorusGeometry(donutShape * 0.3, donutShape * 0.15),
    new THREE.MeshMatcapMaterial({
      matcap:
        randomMat < 1 / 8
          ? matcapTexture
          : randomMat < 2 / 8
          ? matcapTexture2
          : randomMat < 3 / 8
          ? matcapTexture3
          : randomMat < 4 / 8
          ? matcapTexture4
          : randomMat < 5 / 8
          ? matcapTexture5
          : randomMat < 6 / 8
          ? matcapTexture6
          : randomMat < 7 / 8
          ? matcapTexture7
          : matcapTexture8,
    })
  );
  donut.position.set(
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.2) * 100,
    (Math.random() - 0.5) * 100
  );

  donutArr.push({
    donut,
    rotation: {
      x: Math.random() * 0.1,
      y: Math.random() * 0.1,
    },
  });
  scene.add(donut);
}

console.timeEnd("donuts");

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
camera.position.set(3, -4, 4);
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

  for (const donut of donutArr) {
    donut.donut.position.y -= 0.01;
    donut.donut.rotation.x -= donut.rotation.x;
    donut.donut.rotation.y -= donut.rotation.y;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
