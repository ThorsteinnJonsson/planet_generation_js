import React, { Component } from 'react'
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";

import generateIcosphere from "./Geometry"

class Renderer extends Component {

  setupCamera = (width, height) => {
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100000);
    this.camera.position.z = 20000;
    this.camera.position.y = 5;
  }

  setupControls = () => {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  setupLights = () => {
    // Sun
    const sunlight = new THREE.DirectionalLight(0xffffff, 1, 0);
    sunlight.position.set(-200000, 0, 200000);
    this.scene.add(sunlight);


    // Ambient
    const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
    this.scene.add(ambientLight);
  }

  loadPlaceholderModel = () => {
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
  }

  addModels = () => {
    // Add cube
    const bufferCubegeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00afff,
      wireframe: false
    });
    this.model = new THREE.Mesh(bufferCubegeometry, material);
    this.scene.add(this.model);
    this.model.position.set(-5, 0, 0);

    // Add placeholder model
    this.loadPlaceholderModel();
  }

  addGrid = () => {
    const size = 100;
    const divisions = 100;
    const centerLineColor = 0x888888;
    const lineColor = 0x888888;
    const gridHelper = new THREE.GridHelper(size, divisions, centerLineColor, lineColor);
    this.scene.add(gridHelper);
  }

  addPlanet = () => {
    const icoOrder = 5;
    const icoRadius = 12742; // Earth's radius
    this.icosphere = generateIcosphere(icoOrder, icoRadius);
    this.scene.add(this.icosphere);
  }

  componentDidMount() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();

    // Add renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor("#263238");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    this.setupCamera(width, height);
    this.setupControls();
    this.setupLights();

    // this.addModels();
    this.addGrid();

    this.addPlanet();

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
    if (this.model) {
      this.model.rotation.y += 0.01;
    }

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