import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import LoadingManager from "./LoadingManager";

class Floor {
  constructor() {
    this.bind();
    this.loader = new GLTFLoader(LoadingManager);
  }

  init(scene) {
    this.scene = scene;
    this.floor;
    this.loader.load("../static/models/floor.glb", glb => {
      glb.scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          this.floor = child;
        }
      });
      this.floor.translateY(-4);
      this.floor.scale.multiplyScalar(1.5);
      this.scene.add(this.floor);
    });
  }

  update() {}

  bind() {}
}

const _instance = new Floor();
export default _instance;
