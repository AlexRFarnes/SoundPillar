import * as THREE from "three";

const _instance = new THREE.LoadingManager();
_instance.onProgress = function (url, itemsLoaded, itemsTotal) {};

export default _instance;
