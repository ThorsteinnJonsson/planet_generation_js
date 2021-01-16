import React, { Component } from 'react'
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";

import generateIcosphere from "./Geometry"

class Renderer extends Component {

  setupCamera = (width, height) => {
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 8;
    this.camera.position.y = 5;
  }

  setupControls = () => {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  setupLights = () => {
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

    const icosphere = generateIcosphere(4);
    const colors = [];
    for (let i = 0; i < icosphere.vertices.length / 3; i++) {
      colors.push(0.3);
      colors.push(0.7);
      colors.push(0.6);
    }

    console.log(icosphere.vertices.length);
    console.log(icosphere.vertices);

    console.log(icosphere.triangles.length);
    console.log(icosphere.triangles);

    const geometry = new THREE.BufferGeometry();
    const indexBuffer = new THREE.BufferAttribute(icosphere.triangles, 1);
    geometry.setIndex(indexBuffer);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(icosphere.vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(icosphere.vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      // vertexColors: true,
      color: 0x3214eb,
      flatShading: true
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);


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