import React, { Component } from 'react'
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import * as dat from 'dat.gui';

import Planet from "./Planet"

class Renderer extends Component {

  defaultSeed = 42;
  defaultRadius = 12742; // Earth's radius
  defaultOceanColor = 0x005493;
  defaultLandColor = 0x7da27e;
  defaultIceColor = 0xc5e0f5;
  defaultBeachColor = 0xffdc7f;
  defaultMountainColor = 0x6b778a;
  defaultForestColor = 0x2e593c;

  worldgenOptions = {
    seed: this.defaultSeed,
    radius: this.defaultRadius,
    oceanColor: this.defaultOceanColor,
    landColor: this.defaultLandColor,
    iceColor: this.defaultIceColor,
    beachColor: this.defaultBeachColor,
    mountainColor: this.defaultMountainColor,
    forestColor: this.defaultForestColor,
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

  reset = () => {
    this.worldgenOptions.seed = this.defaultSeed;
    this.worldgenOptions.radius = this.defaultRadius;

    this.worldgenOptions.oceanColor = this.defaultOceanColor;
    this.worldgenOptions.landColor = this.defaultLandColor;
    this.worldgenOptions.iceColor = this.defaultIceColor;
    this.worldgenOptions.beachColor = this.defaultBeachColor;
    this.worldgenOptions.mountainColor = this.defaultMountainColor;
    this.worldgenOptions.forestColor = this.defaultForestColor;

    this.generatePlanet();
  };

  addGui = () => {
    this.gui = new dat.GUI();

    const worldGen = this.gui.addFolder('World Generation');
    
    worldGen.add(this.worldgenOptions, 'seed', 0.0, 10000.0).listen();
    worldGen.add(this.worldgenOptions, 'radius', 5000.0, 20000.0).listen();

    const colors = this.gui.addFolder('Colors');
    colors.addColor(this.worldgenOptions, "oceanColor").listen();
    colors.addColor(this.worldgenOptions, "landColor").listen();
    colors.addColor(this.worldgenOptions, "iceColor").listen();
    colors.addColor(this.worldgenOptions, "beachColor").listen();
    colors.addColor(this.worldgenOptions, "mountainColor").listen();
    colors.addColor(this.worldgenOptions, "forestColor").listen();


    this.gui.add(this, "generatePlanet");
    this.gui.add(this, "reset");

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