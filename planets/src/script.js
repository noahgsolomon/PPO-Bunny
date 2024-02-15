import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("canvas.webgl");

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const scene = new THREE.Scene();

const normalizingRadiusFactor = 1;

const jupiterRadius = 43441 / normalizingRadiusFactor;
const saturnRadius = 36184 / normalizingRadiusFactor;
const earthRadius = 3959 / normalizingRadiusFactor;
const moonRadius = 1080 / normalizingRadiusFactor;
const mercuryRadius = 1516 / normalizingRadiusFactor;
const sunRadius = 432690 / normalizingRadiusFactor;
const venusRadius = 6052 / normalizingRadiusFactor;
const marsRadius = 2106 / normalizingRadiusFactor;
const jupiterMoon1Radius = 16350 / normalizingRadiusFactor;

const normalizingSunDistFactor = 100;
const earthSunDist = 92_000_000 / normalizingSunDistFactor;
const mercurySunDist = 41_400_000 / normalizingSunDistFactor;
const jupiterSunDist = 464_000_000 / normalizingSunDistFactor;
const saturnSunDist = 903_106_000 / normalizingSunDistFactor;
const venusSunDist = 67_500_000 / normalizingSunDistFactor;
const marsSunDist = 133_500_000 / normalizingSunDistFactor;

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(sunRadius),
  new THREE.MeshBasicMaterial({
    color: 0xfdb813,
    wireframe: true,
  })
);

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(earthRadius),
  new THREE.MeshBasicMaterial({
    color: 0x064273,
    wireframe: true,
  })
);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(moonRadius),
  new THREE.MeshBasicMaterial({
    color: 0xf6f1d5,
    wireframe: true,
  })
);

const earthRing = new THREE.Mesh(
  new THREE.RingGeometry(earthSunDist, earthSunDist + 100),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);

earthRing.material.side = THREE.DoubleSide;

earthRing.rotation.x = Math.PI / 2;

earth.position.set(earthSunDist, 0, 0);
moon.position.set(earthSunDist - 0.1 * earthSunDist, 0, 0);

const moonRing = new THREE.Mesh(
  new THREE.RingGeometry(0.1 * earthSunDist, 0.1 * earthSunDist + 10)
);
moonRing.position.set(earthSunDist, 0, 0);
moonRing.rotation.x = Math.PI / 2;
moonRing.material.side = THREE.DoubleSide;

const mercury = new THREE.Mesh(
  new THREE.SphereGeometry(mercuryRadius),
  new THREE.MeshBasicMaterial({
    color: 0x964b00,
    wireframe: true,
  })
);

const mercuryRing = new THREE.Mesh(
  new THREE.RingGeometry(mercurySunDist, mercurySunDist + 100),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);

const jupiterMoon1 = new THREE.Mesh(
  new THREE.SphereGeometry(jupiterMoon1Radius),
  new THREE.MeshBasicMaterial({ color: 0xbc9e82 })
);

jupiterMoon1.position.set(jupiterSunDist - 0.1 * jupiterSunDist, 0, 0);

const jupiterMoon1Ring = new THREE.Mesh(
  new THREE.RingGeometry(0.1 * jupiterSunDist, 0.1 * jupiterSunDist + 100)
);
jupiterMoon1Ring.position.set(jupiterSunDist, 0, 0);
jupiterMoon1Ring.rotation.x = Math.PI / 2;
jupiterMoon1Ring.material.side = THREE.DoubleSide;

mercuryRing.material.side = THREE.DoubleSide;

mercuryRing.rotation.x = Math.PI / 2;

mercury.position.set(mercurySunDist, 0, 0);

const venus = new THREE.Mesh(
  new THREE.SphereGeometry(venusRadius),
  new THREE.MeshBasicMaterial({
    color: 0xa57c1b,
    wireframe: true,
  })
);

const venusRing = new THREE.Mesh(
  new THREE.RingGeometry(venusSunDist, venusSunDist + 100),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);

venusRing.material.side = THREE.DoubleSide;

venusRing.rotation.x = Math.PI / 2;

venus.position.set(venusSunDist, 0, 0);

const mars = new THREE.Mesh(
  new THREE.SphereGeometry(marsRadius),
  new THREE.MeshBasicMaterial({
    color: 0xc1440e,
    wireframe: true,
  })
);

const marsRing = new THREE.Mesh(
  new THREE.RingGeometry(marsSunDist, marsSunDist + 100),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);

marsRing.material.side = THREE.DoubleSide;

marsRing.rotation.x = Math.PI / 2;

mars.position.set(marsSunDist, 0, 0);

const jupiter = new THREE.Mesh(
  new THREE.SphereGeometry(jupiterRadius),
  new THREE.MeshBasicMaterial({
    color: 0xffd700,
    wireframe: true,
  })
);

const jupiterRing = new THREE.Mesh(
  new THREE.RingGeometry(jupiterSunDist, jupiterSunDist + 100),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);

jupiterRing.material.side = THREE.DoubleSide;

jupiterRing.rotation.x = Math.PI / 2;

jupiter.position.set(jupiterSunDist, 0, 0);

const saturn = new THREE.Mesh(
  new THREE.SphereGeometry(saturnRadius),
  new THREE.MeshBasicMaterial({
    color: 0xffd700,
    wireframe: true,
  })
);

const saturnRing = new THREE.Mesh(
  new THREE.RingGeometry(saturnSunDist, saturnSunDist + 100),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);

saturnRing.material.side = THREE.DoubleSide;

saturnRing.rotation.x = Math.PI / 2;

saturn.position.set(saturnSunDist, 0, 0);

const solarSystem = new THREE.Group();
solarSystem.add(sun);
solarSystem.add(earth);
solarSystem.add(moon);
solarSystem.add(mercury);
solarSystem.add(mercuryRing);
solarSystem.add(earthRing);
solarSystem.add(moonRing);
solarSystem.add(venusRing);
solarSystem.add(venus);
solarSystem.add(marsRing);
solarSystem.add(mars);
solarSystem.add(jupiterRing);
solarSystem.add(jupiter);
solarSystem.add(jupiterMoon1Ring);
solarSystem.add(jupiterMoon1);
solarSystem.add(saturn);
solarSystem.add(saturnRing);

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  10000000000
);

camera.position.z = 50;
camera.position.y = 20;
camera.position.x = 20;

scene.add(solarSystem);
scene.add(camera);

const axes = new THREE.AxesHelper(5);

scene.add(axes);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas,
});

renderer.setSize(sizes.width, sizes.height);

renderer.render(scene, camera);

const rotate = (planet, speed) => {
  planet.rotation.y += speed;
};

const earthYear = 365;
const marsYear = 687;
const venusYear = 243;
const mercuryYear = 88;
const moonYear = 27;
const jupiterYear = 4333;
const jupiterMoon1Year = 7;
const saturnYear = 10755;

const revolve = (
  planet,
  orbitRadius,
  elapsedTime,
  orbitingPlanetCenterPos,
  planetYear
) => {
  planet.position.x =
    orbitRadius * Math.sin((elapsedTime / planetYear) * earthYear) +
    orbitingPlanetCenterPos.x;
  planet.position.z =
    orbitRadius * Math.cos((elapsedTime / planetYear) * earthYear) +
    orbitingPlanetCenterPos.z;
};

const clock = new THREE.Clock();

const moonOrbit = moon.position.distanceTo(earth.position);
const jupiterMoon1Orbit = jupiterMoon1.position.distanceTo(jupiter.position);
const earthOrbit = earth.position.distanceTo(sun.position);
const mercuryOrbit = mercury.position.distanceTo(sun.position);
const venusOrbit = venus.position.distanceTo(sun.position);
const marsOrbit = mars.position.distanceTo(sun.position);
const jupiterOrbit = jupiter.position.distanceTo(sun.position);
const saturnOrbit = saturn.position.distanceTo(sun.position);

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  controls.update();

  rotate(sun, 0.01 / 27);
  rotate(earth, 0.01);
  rotate(moon, 0.01 / 27);
  rotate(mercury, 0.01 / 60);
  rotate(venus, 0.01 / 243);
  rotate(mars, 0.01);
  rotate(jupiter, 0.01);
  rotate(jupiterMoon1, 0.01 / 7);
  rotate(saturn, 0.01 / 0.4);

  revolve(earth, earthOrbit, elapsedTime, sun.position, earthYear);
  revolve(moon, moonOrbit, elapsedTime, earth.position, moonYear);
  revolve(mercury, mercuryOrbit, elapsedTime, sun.position, mercuryYear);
  revolve(venus, venusOrbit, elapsedTime, sun.position, venusYear);
  revolve(mars, marsOrbit, elapsedTime, sun.position, marsYear);
  revolve(jupiter, jupiterOrbit, elapsedTime, sun.position, jupiterYear);
  revolve(
    jupiterMoon1,
    jupiterMoon1Orbit,
    elapsedTime,
    jupiter.position,
    jupiterMoon1Year
  );
  revolve(saturn, saturnOrbit, elapsedTime, sun.position, saturnYear);

  moonRing.position.set(earth.position.x, earth.position.y, earth.position.z);
  jupiterMoon1Ring.position.set(
    jupiter.position.x,
    jupiter.position.y,
    jupiter.position.z
  );

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
