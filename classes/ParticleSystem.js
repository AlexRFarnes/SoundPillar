import * as THREE from "three";

class ParticleSystem {
  constructor() {
    this.bind();
    this.particleCount = 10000;
    this.boxSize = 50;
  }

  init(scene) {
    this.scene = scene;
    this.particleGeometry = new THREE.BufferGeometry();
    this.particlePosition = [];

    // Scatter the particles inside a box defined by the bozSize
    for (let p = 0; p < this.particleCount; p++) {
      let x = Math.random() * this.boxSize - this.boxSize / 2;
      let y = Math.random() * this.boxSize - this.boxSize / 2;
      let z = Math.random() * this.boxSize - this.boxSize / 2;

      // Create the vertext
      this.particlePosition.push(x, y, z);
    }

    this.particleGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.particlePosition, 3)
    );

    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.01,
    });

    this.particleSystem = new THREE.Points(
      this.particleGeometry,
      this.material
    );
    this.scene.add(this.particleSystem);
  }

  update() {
    let i = 0;
    while (i < this.particleCount) {
      // Increases the y position
      this.particleGeometry.attributes.position.array[i * 3 + 1] += 0.01;

      // If the y position is beyond the boxSize set the position to the bottom of the box
      if (
        this.particleGeometry.attributes.position.array[i * 3 + 1] >
        this.boxSize / 2
      ) {
        this.particleGeometry.attributes.position.array[i * 3 + 1] =
          -this.boxSize / 2;
      }
      i++;
    }

    this.particleGeometry.attributes.position.needsUpdate = true;
  }

  bind() {
    this.init = this.init.bind(this);
    this.update = this.update.bind(this);
  }
}

const _instance = new ParticleSystem();
export default _instance;
