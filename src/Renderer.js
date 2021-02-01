import React, { Component } from 'react'
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import * as dat from 'dat.gui';

import Planet from "./Planet"

class Renderer extends Component {


  worldgenOptions = {
    seed: 0
  };

  setupCamera = (width, height) => {
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100000);
    this.camera.position.z = 25000;
    this.camera.position.y = 15000;
  }

  setupControls = () => {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 13500;
    this.controls.maxDistance = 100000;
    this.controls.enablePan = false;
  }

  setupLights = () => {
    // Sun
    const sunlight = new THREE.DirectionalLight(0xffffff, 1, 0);
    sunlight.position.set(-200000, 0, 200000);
    this.scene.add(sunlight);

    // Sun
    const tempsunlight = new THREE.DirectionalLight(0xffffff, 1, 0);
    tempsunlight.position.set(200000, 0, -200000);
    this.scene.add(tempsunlight);

    // Ambient
    const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
    this.scene.add(ambientLight);
  }

  addPlanet = () => {
    const icoOrder = 4;
    this.planet = new Planet(this.worldgenOptions);
    this.planet.generate(icoOrder);


    this.scene.add(this.planet.getMesh());
    this.scene.add(this.planet.getCloudMesh());
  };

  generatePlanet = () => {
    this.scene.clear();
    
    this.setupLights();

    this.addPlanet();
  };

  addGui = () => {
    this.gui = new dat.GUI();

    const worldGen = this.gui.addFolder('World Generation');
    
    worldGen.add(this.worldgenOptions, 'seed', 0.0, 10000.0).listen();

    // this.gui.addFolder('Colors');


    this.gui.add(this, "generatePlanet");
  };

  componentDidMount() {

    this.scene = new THREE.Scene();

    // Add renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor("#263238");
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.mount.appendChild(this.renderer.domElement);

    this.setupCamera(window.innerWidth, window.innerHeight);
    this.setupControls();

    this.generatePlanet();

    this.addGui();

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
    this.planet.rotate();

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