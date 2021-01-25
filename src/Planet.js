import generateIcosphereMesh from "./Geometry"
import * as SHADERS from "./Shaders"
import * as THREE from 'three';
import Noise from "noisejs"


class Planet {
  
  constructor() {
    this.radius = 12742; // Earth's radius

    this.icosphereMesh = null

    this.noise = new Noise.Noise(Math.random());
    this.noiseParams = {
      numIter: 4,
      noiseScale: 2.0/this.radius,
      persistence: 0.25,
      minRad: 0.9,
      maxRad: 1.1,
    }

    this.oceanColor = {
      r: 0 / 255,
      g: 84 / 255,
      b: 147 / 255,
    };

    this.landColor = {
      r: 125 / 255,
      g: 162 / 255,
      b: 126 / 255,
    };
  }

  getShaderMaterial = () => {

    let uniforms = {
      oceanColor: {type: 'vec3', value: new THREE.Color(0x005493)},
      landColor: {type: 'vec3', value: new THREE.Color(0x7da27e)},
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
      // wireframe:true,
      // wireframeLinewidth: 5
    });


    return material;
  };

  generate = (icoOrder = 5) => {
    let geometry = generateIcosphereMesh(icoOrder, this.radius);
    let material = this.getShaderMaterial();
    
    this.icosphereMesh = new THREE.Mesh(geometry, material);

  };

  getMesh = () => {
    return this.icosphereMesh;
  };


}


export default Planet;