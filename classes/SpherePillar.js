import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import SoundReactor from "./SoundReactor.js";
import MyGui from "../utils/MyGui.js";
import LoadingManager from "./LoadingManager";

class SpherePillar {
  constructor() {
    this.bind();
    this.loader = new GLTFLoader(LoadingManager);
    this.textureLoader = new THREE.TextureLoader(LoadingManager);
    this.params = {
      waveSpeed: 5,
      subDiv: 4,
      pillarSize: 0.15,
    };
  }

  init(scene) {
    this.scene = scene;
    // Define a vector going upwards because by default the pillars are facing upwards
    this.upVec = new THREE.Vector3(0, 1, 0);
    this.basesAndPillars = new THREE.Group();
    this.baseAndPillar;

    const grayMetalTexture = this.textureLoader.load(
      "../static/textures/matcaps/grayMetal.png"
    );
    const blackMetalTexture = this.textureLoader.load(
      "../static/textures/matcaps/blackMetal.png"
    );

    this.grayMatcapMaterial = new THREE.MeshMatcapMaterial({
      matcap: grayMetalTexture,
    });
    this.blackMatcapMaterial = new THREE.MeshMatcapMaterial({
      matcap: blackMetalTexture,
    });

    this.loader.load("../static/models/pillar.glb", glb => {
      glb.scene.traverse(child => {
        if (child.name == "Base") {
          this.baseAndPillar = child;
          child.material = this.blackMatcapMaterial;
        }
        if (child.name == "Cylinder") {
          child.material = this.grayMatcapMaterial;
        }
      });
      this.computePosition();
    });

    // GUI
    const spherePillarsFolder = MyGui.addFolder("Sphere Pillars");
    spherePillarsFolder.open();
    spherePillarsFolder
      .add(this.params, "waveSpeed")
      .min(1)
      .max(10)
      .step(0.01)
      .name("Wave Speed");
    spherePillarsFolder
      .add(this.params, "subDiv")
      .min(1)
      .max(5)
      .step(1)
      .name("Ico Subdivisions")
      .onChange(this.computePosition);
    spherePillarsFolder
      .add(this.params, "pillarSize")
      .min(0.01)
      .max(1)
      .step(0.001)
      .name("Pillars Size")
      .onChange(this.computePosition);
  }

  computePosition() {
    let ico;
    this.scene.traverse(child => {
      if (child.name == "ico") {
        ico = child;
      }
    });

    if (ico) {
      this.scene.remove(ico);
    }

    const geometry = new THREE.IcosahedronGeometry(2, this.params.subDiv);
    const matcapMaterial = this.grayMatcapMaterial;
    const sphere = new THREE.Mesh(geometry, matcapMaterial);
    sphere.name = "ico";

    this.scene.add(sphere);
    this.basesAndPillars.clear();

    // Create an array with all the vertex positions of the sphere geometry
    let vertexArray = [];
    for (let i = 0; i < geometry.attributes.position.array.length; i += 3) {
      const x = geometry.attributes.position.array[i + 0];
      const y = geometry.attributes.position.array[i + 1];
      const z = geometry.attributes.position.array[i + 2];
      vertexArray.push({
        x,
        y,
        z,
      });
    }

    // Filter the vertext positions because they are repeated. Multiple triangel share vertex positions.

    // Array to store non-repeated vertex positions
    let pillarsPositions = [];
    // Loop through the vertex array of positions (includes repeated)
    for (let i = 0; i < vertexArray.length; i++) {
      let existsFlag = false; // If the current vertex exists in the pillars position then it will not be added as a position

      // Loop through the pillars array of positions
      for (let j = 0; j < pillarsPositions.length; j++) {
        // If the vertex position exists in both arrays set the flag to true
        if (
          pillarsPositions[j].x == vertexArray[i].x &&
          pillarsPositions[j].y == vertexArray[i].y &&
          pillarsPositions[j].z == vertexArray[i].z
        ) {
          existsFlag = true;
        }
      }

      // If it does not exist in the pillar positions array then add the vertex x,y,z coordinates
      if (!existsFlag) {
        pillarsPositions.push({
          x: vertexArray[i].x,
          y: vertexArray[i].y,
          z: vertexArray[i].z,
        });
        // Clone the pillar for each pillar position
        const pillarClone = this.baseAndPillar.clone();

        const posVec = new THREE.Vector3(
          vertexArray[i].x,
          vertexArray[i].y,
          vertexArray[i].z
        );

        // Set the position based on the pillar position
        pillarClone.scale.multiplyScalar(this.params.pillarSize);
        pillarClone.position.copy(posVec);
        pillarClone.quaternion.setFromUnitVectors(
          this.upVec.normalize(), // from
          posVec.normalize() // to
        );
        this.basesAndPillars.add(pillarClone);
      }

      this.scene.add(this.basesAndPillars);
    }
  }

  update(elapsedTime) {
    if (SoundReactor.playFlag) {
      let i = 0;
      // While loops are optimized in requestAnimatrion function
      while (i < this.basesAndPillars.children.length) {
        this.basesAndPillars.children[i].children[0].position.y =
          (SoundReactor.fdata[i] / 255) * 3.5; // Increase the range of movement
        i++;
      }
    } else {
      let i = 0;
      // While loops are optimized in requestAnimatrion function
      while (i < this.basesAndPillars.children.length) {
        this.basesAndPillars.children[i].children[0].position.y =
          (Math.sin(
            elapsedTime * this.params.waveSpeed +
              this.basesAndPillars.children[i].position.x // offset the pillar's movement by its base's x position
          ) +
            1.2) * // Increase the position by one to move the pillar further outside
          1.2; // Increase the range of movement
        i++;
      }
    }
  }

  bind() {
    this.computePosition = this.computePosition.bind(this);
  }
}

const _instance = new SpherePillar();
export default _instance;

// Alternative with toon material
//   child.material = new THREE.MeshToonMaterial({
//     gradientMap: texture,
//     color: 0x79f2f2,
//   });
//   texture.minFilter = THREE.NearestFilter;
//   texture.magFilter = THREE.NearestFilter;
//   texture.generateMipmaps = false;
