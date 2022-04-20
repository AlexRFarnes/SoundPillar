import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import SpherePillar from "./classes/SpherePillar.js";
import Floor from "./classes/Floor.js";
import Spectrum from "./classes/Spectrum.js";
import SoundReactor from "./classes/SoundReactor.js";
import ParticleSystem from "./classes/ParticleSystem.js";
import CamParallax from "./classes/CamParallax.js";
import MyGui from "./utils/MyGui.js";
import LoadingManager from "./classes/LoadingManager.js";

/**
 * Loading Screen
 */
const overlay = document.querySelector(".loading-screen");
const progressBar = overlay.querySelector(".progress-bar");
MyGui.hide();
LoadingManager.onProgress = function (url, loadedItems, totalItems) {
  progressBar.style.width = `${(loadedItems / totalItems) * 100}%`;
};
LoadingManager.onLoad = function () {
  setTimeout(() => {
    overlay.classList.add("fade");
  }, 1000);
  setTimeout(() => {
    overlay.style.display = "none";
    MyGui.show();
  }, 1500);
};

/**
 * Button
 */
const btn = document.querySelector(".btn");
btn.addEventListener("click", e => {
  if (!SoundReactor.initFlag) {
    SoundReactor.init();
    SoundReactor.initFlag = true;
  }

  if (!SoundReactor.playFlag) {
    SoundReactor.play();
    e.target.textContent = "Pause";
  } else {
    SoundReactor.pause();
    e.target.textContent = "Play";
  }
});

/**
 * Base
 */
//GUI
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const bgColor = new THREE.Color(0x151515);
const fog = new THREE.Fog(bgColor, 15, 30);
const scene = new THREE.Scene();
scene.background = bgColor;
scene.fog = fog;

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(2, 3, 4);
scene.add(ambientLight, pointLight);

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
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 10;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 40;
controls.minDistance = 3;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2 + 0.3;
controls.enabled = false;
CamParallax.init(camera);

const cameraFolder = MyGui.addFolder("Camera");
cameraFolder
  .add(controls, "enabled")
  .name("Orbit Controls")
  .onChange(() => {
    CamParallax.active = !controls.enabled;
  })
  .listen();
cameraFolder
  .add(CamParallax, "active")
  .name("Costume Controls")
  .onChange(() => {
    controls.enabled = !CamParallax.active;
  })
  .listen();
cameraFolder
  .add(CamParallax.params, "intensity")
  .min(0.001)
  .max(0.01)
  .step(0.0001)
  .name("Parallax intensity");
cameraFolder
  .add(CamParallax.params, "ease")
  .min(0.01)
  .max(0.1)
  .step(0.001)
  .name("Parallax ease");

/**
 * Objects
 */
SpherePillar.init(scene);
Floor.init(scene);
Spectrum.init(scene);
ParticleSystem.init(scene);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.outputEncoding = THREE.sRGBEncoding;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  SpherePillar.update(elapsedTime);
  Spectrum.update(elapsedTime);
  ParticleSystem.update();
  CamParallax.update();

  if (SoundReactor.playFlag) {
    SoundReactor.update();
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
