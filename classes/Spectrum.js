import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import vertexShader from "../shaders/spectrumVertex.glsl";
import fragmentShader from "../shaders/spectrumFragment.glsl";
import MyGui from "../utils/MyGui.js";
import LoadingManager from "./LoadingManager";

class Spectrum {
  constructor() {
    this.bind();
    this.loader = new GLTFLoader(LoadingManager);
    this.textureLoader = new THREE.TextureLoader(LoadingManager);
    this.paramsObj = {
      color: 0x45c4b0,
    };
  }

  init(scene) {
    this.scene = scene;

    this.uniforms = {
      uMatCap: {
        value: this.textureLoader.load(
          "../static/textures/matcaps/blackMetal.png"
        ),
      },
      uSpecterSize: {
        value: 0.6,
      },
      uWaveBorder: {
        value: 0.1,
      },
      uBorderColor: {
        value: new THREE.Color(this.paramsObj.color),
      },
      uWaveSpeed: {
        value: 10,
      },
      uTime: {
        value: 0,
      },
    };

    const shaderFolder = MyGui.addFolder("Spectrum");
    shaderFolder
      .add(this.uniforms.uSpecterSize, "value")
      .min(-1)
      .max(1)
      .step(0.01)
      .name("Specter Size");
    shaderFolder
      .add(this.uniforms.uWaveBorder, "value")
      .min(0.01)
      .max(1)
      .step(0.001)
      .name("Wave Border");
    shaderFolder
      .add(this.uniforms.uWaveSpeed, "value")
      .min(1)
      .max(20)
      .step(0.1)
      .name("Wave Speed");
    shaderFolder.addColor(this.paramsObj, "color").onChange(() => {
      this.shaderMaterial.uniforms.uBorderColor.value.set(this.paramsObj.color);
    });

    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      uniforms: this.uniforms,
    });
    this.loader.load("../static/models/spectrum.glb", glb => {
      glb.scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = this.shaderMaterial;
          child.scale.multiplyScalar(2.5);
          child.position.y = -2.5;
        }
      });
      this.scene.add(glb.scene);
    });
  }

  update(elapsedTime) {
    this.uniforms.uTime.value = elapsedTime;
  }

  bind() {}
}

const _instance = new Spectrum();
export default _instance;
