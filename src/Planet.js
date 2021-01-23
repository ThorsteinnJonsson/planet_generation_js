import generateIcosphereMesh from "./Geometry"

import Noise from "noisejs"


class Planet {
  
  constructor() {
    this.radius = 12742; // Earth's radius

    this.icosphereMesh = null

    this.noise = new Noise.Noise(Math.random());
    this.noiseParams = {
      numIter: 16,
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

    this.groundColor = {
      r: 125 / 255,
      g: 162 / 255,
      b: 126 / 255,
    };

  }

  getRadiusScaling = (x, y, z, numIter, scale, persistence, low, high) => {
    let maxAmp = 0;
    let amp = 1;
    let freq = scale;
    let noise = 0;

    for (let iter = 0; iter < numIter; iter++) {
      noise += this.noise.simplex3(x * freq, y * freq, z * freq) * amp;
      maxAmp += amp;
      amp *= persistence;
      freq *= 2;
    }

    noise /= maxAmp;
    noise = noise * (high - low) / 2 + (high + low) / 2;
    return noise;
  };

  generateHeight = () => {
    const posBuffer = this.icosphereMesh.geometry.getAttribute('position');
    const lengthBuffer = posBuffer.array.length;
    for (let i = 0; i < lengthBuffer/3; i++) {
      // Get noise val
      const x = posBuffer.array[3*i];
      const y = posBuffer.array[3*i+1];
      const z = posBuffer.array[3*i+2];

      // Generate noise
      const radiusScalingFactor = this.getRadiusScaling(x, y, z, 
                                                        this.noiseParams.numIter, 
                                                        this.noiseParams.noiseScale, 
                                                        this.noiseParams.persistence, 
                                                        this.noiseParams.minRad, 
                                                        this.noiseParams.maxRad);

      // To spherical
      const r = Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2));
      const theta = Math.acos(z/r);
      const phi = Math.atan2(y,x);

      // Add radius. Height will be same as planet radius if lower because that is the ocean level
      const new_r = Math.max(this.radius, r * radiusScalingFactor)

      // Back to cartesian
      posBuffer.array[3*i] = new_r * Math.sin(theta) * Math.cos(phi);
      posBuffer.array[3*i+1] = new_r * Math.sin(theta) * Math.sin(phi);
      posBuffer.array[3*i+2] = new_r * Math.cos(theta);
    }
  };

  applyColor = () => {
    const posBuffer = this.icosphereMesh.geometry.getAttribute('position');
    const colorBuffer = this.icosphereMesh.geometry.getAttribute('color');
    const lengthBuffer = posBuffer.array.length;

    for (let i = 0; i < lengthBuffer/3; i++) {
      // Get noise val
      const x = posBuffer.array[3*i];
      const y = posBuffer.array[3*i+1];
      const z = posBuffer.array[3*i+2];
      const r = Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2));

      const color = (r <= this.radius+0.001)? this.oceanColor : this.groundColor;
      colorBuffer.array[3*i] = color.r;
      colorBuffer.array[3*i+1] = color.g;
      colorBuffer.array[3*i+2] = color.b;


    }


  };
  

  generate = (icoOrder = 5) => {
    this.icosphereMesh = generateIcosphereMesh(icoOrder, this.radius);

    this.generateHeight();

    this.applyColor();


  };

  getMesh = () => {
    return this.icosphereMesh;
  };


}


export default Planet;