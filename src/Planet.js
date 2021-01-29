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
      persistence: 0.4,
      minRad: 0.9,
      maxRad: 1.1,
    }

    this.planetColors = {
      ocean: 0x005493,
      land: 0x7da27e,
      ice: 0xc5e0f5,
      beach: 0xffdc7f
    }

  }

  getShaderMaterial = () => {

    let uniforms = {
      oceanColor: {type: 'vec3', value: new THREE.Color(this.planetColors.ocean)},
      landColor: {type: 'vec3', value: new THREE.Color(this.planetColors.land)},
      iceColor: {type: 'vec3', value: new THREE.Color(this.planetColors.ice)},
      beachColor: {type: 'vec3', value: new THREE.Color(this.planetColors.beach)},
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

  rotate = () => {
    if (this.icosphereMesh) {
      this.icosphereMesh.rotation.y += 0.001;
    }
  }


}


export default Planet;