import generateIcosphereMesh from "./Geometry"
import * as SHADERS from "./Shaders"
import * as THREE from 'three';
import Noise from "noisejs"


class Planet {
  
  constructor(options) {
    this.pseudoSeed = options.seed;

    this.radius = options.radius;

    this.icosphereMesh = null;
    this.cloudSphere = null;


    this.noise = new Noise.Noise(Math.random());
    this.noiseParams = {
      numIter: 5,
      noiseScale: 2.0/this.radius,
      persistence: 0.4,
      minRad: 0.9,
      maxRad: 1.1,
    }

    this.planetColors = {
      ocean: options.oceanColor,
      land: options.landColor,
      ice: options.iceColor,
      beach: options.beachColor,
      mountain: options.mountainColor,
      forest: options.forestColor
    }

  }

  setSeed = (seed) => {
    this.pseudoSeed = seed;
  };

  getShaderMaterial = () => {

    let uniforms = {
      pseudoSeed: {type: 'float', value: this.pseudoSeed},
      oceanColor: {type: 'vec3', value: new THREE.Color(this.planetColors.ocean)},
      landColor: {type: 'vec3', value: new THREE.Color(this.planetColors.land)},
      iceColor: {type: 'vec3', value: new THREE.Color(this.planetColors.ice)},
      beachColor: {type: 'vec3', value: new THREE.Color(this.planetColors.beach)},
      mountainColor: {type: 'vec3', value: new THREE.Color(this.planetColors.mountain)},
      forestColor: {type: 'vec3', value: new THREE.Color(this.planetColors.forest)},
      planetRadius : {type: 'float', value: this.radius},
      numIter: {type: 'int', value: this.noiseParams.numIter},
      noiseScale: {type: 'float', value: this.noiseParams.noiseScale},
      persistence: {type: 'float', value: this.noiseParams.persistence},
      minRad: {type: 'float', value: this.noiseParams.minRad},
      maxRad: {type: 'float', value: this.noiseParams.maxRad},
    };

    let material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: SHADERS.planetVertexShader(),
      fragmentShader: SHADERS.planetFragmentShader(),
    });
    return material;
  };

  getCloudMaterial = () => {

    let uniforms = {
      pseudoSeed: {type: 'float', value: this.pseudoSeed},
      cloudColor: {type: 'vec3', value: new THREE.Color(0xffffff)},
      planetRadius : {type: 'float', value: this.radius},
      numIter: {type: 'int', value: this.noiseParams.numIter},
      noiseScale: {type: 'float', value: this.noiseParams.noiseScale},
      persistence: {type: 'float', value: this.noiseParams.persistence},
    };

    let material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: SHADERS.cloudVertexShader(),
      fragmentShader: SHADERS.cloudFragmentShader(),
      opacity: 0.5,
      transparent: true
    });
    return material;
  };

  generate = (icoOrder = 5) => {
    // Planet
    const geometry = generateIcosphereMesh(icoOrder, this.radius);
    const material = this.getShaderMaterial();
    this.icosphereMesh = new THREE.Mesh(geometry, material);

    // Clouds
    const cloudGeometry = new THREE.SphereGeometry( 1.1*this.radius, 32, 32 );
    const cloudMaterial = this.getCloudMaterial();
    this.cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
  };

  getMesh = () => {
    return this.icosphereMesh;
  };

  getCloudMesh = () => {
    return this.cloudSphere;
  };

  rotate = () => {
    if (this.icosphereMesh) {
      this.icosphereMesh.rotation.y += 0.0005;
    }
    if (this.cloudSphere){
      this.cloudSphere.rotation.y += 0.00025;
    }
  }


}


export default Planet;