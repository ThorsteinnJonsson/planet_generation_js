import React, { Component } from 'react'
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

import Planet from "./Planet"

class Renderer extends Component {

  setupCamera = (width, height) => {
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100000);
    this.camera.position.z = 25000;
    this.camera.position.y = 0;
  }

  setupControls = () => {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 20000;
    this.controls.maxDistance = 100000;
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
    const icoOrder = 5;
    this.planet = new Planet();
    this.planet.generate(icoOrder);


    this.scene.add(this.planet.getMesh());
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
    if (this.planet.getMesh()) {
      this.planet.getMesh().rotation.y += 0.001;
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