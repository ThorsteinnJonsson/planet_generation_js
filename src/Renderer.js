import React, { Component } from 'react'
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";

class Renderer extends Component {

  componentDidMount() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();

    // Add renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor("#263238");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    // Add camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 8;
    this.camera.position.y = 5;

    // Camera controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Lights
    var lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);
    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);
    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);


    // Model
    const bufferCubegeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00afff,
      wireframe: false
    });
    this.model = new THREE.Mesh(bufferCubegeometry, material);
    this.scene.add(this.model);
    this.model.position.set(-5, 0, 0);

    // Load model
    var mtlLoader = new MTLLoader();
    mtlLoader.setPath("./public/"); // This doesn't seem to work?
    mtlLoader.load("r2-d2.mtl", materials => {
      materials.preload();
      console.log("Material loaded");

      // Load model
      var objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load("r2-d2.obj",
        object => {
          this.freedomMesh = object;
          this.freedomMesh.position.setY(0);
          this.freedomMesh.scale.set(0.02, 0.02, 0.02);
          this.scene.add(this.freedomMesh);
        },
        xhr => {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        error => {
          console.log("An error happened" + error)
        });
    });

    // Grid
    const size = 100;
    const divisions = 100;
    const centerLineColor = 0x888888;
    const lineColor = 0x888888;
    const gridHelper = new THREE.GridHelper(size, divisions, centerLineColor, lineColor);
    this.scene.add(gridHelper);

    this.renderScene();
    this.start();
  };

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  animate = () => {
    // this.model.rotation.x += 0.005;
    this.model.rotation.y += 0.01;

    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  renderScene = () => {
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  };


  render() {
    return (
      <div
        ref={ref => (this.mount = ref)} />
    )
  };
}

export default Renderer;