import generateIcosphereMesh from "./Geometry"

import Noise from "noisejs"


class Planet {
  
  constructor() {
    this.radius = 12742; // Earth's radius

    this.icosphereMesh = null


    this.noise = new Noise.Noise(Math.random());

  }

  getNoise = (noiseGenerator, x, y, z, numIter, scale, persistence, low, high) => {
    let maxAmp = 0;
    let amp = 1;
    let freq = scale;
    let noise = 0;

    for (let iter = 0; iter < numIter; iter++) {
      noise += noiseGenerator.simplex3(x * freq, y * freq, z * freq) * amp;
      maxAmp += amp;
      amp *= persistence;
      freq *= 2;
    }

    noise /= maxAmp;
    noise = noise * (high - low) / 2 + (high + low) / 2;
    return noise;
  };

  generateHeight = () => {
    const numIter = 3;
    const noiseScale = 2.0/this.radius;
    const persistence = 0.25;
    const minRad = 0.9;
    const maxRad = 1.1;

    const posBuffer = this.icosphereMesh.geometry.getAttribute('position');
    const lenghtBuffer = posBuffer.array.length;
    for (let i = 0; i < lenghtBuffer/3; i++) {
      // Get noise val
      const x = posBuffer.array[3*i]
      const y = posBuffer.array[3*i+1]
      const z = posBuffer.array[3*i+2]

      // Generate noise
      const radiusScalingFactor = this.getNoise(this.noise, x, y, z, numIter, noiseScale, persistence, minRad, maxRad);

      // To spherical
      const r = Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2));
      const theta = Math.acos(z/r);
      const phi = Math.atan2(y,x);

      // Add radius
      const heightScale = 1.0;
      const new_r = r * (0.0 + heightScale * radiusScalingFactor);

      // Back to cartesian
      posBuffer.array[3*i] = new_r * Math.sin(theta) * Math.cos(phi);
      posBuffer.array[3*i+1] = new_r * Math.sin(theta) * Math.sin(phi);
      posBuffer.array[3*i+2] = new_r * Math.cos(theta);
    }

  };
  

  generate = (icoOrder = 5) => {
    this.icosphereMesh = generateIcosphereMesh(icoOrder, this.radius);

    // Generate ocean mask
    
    // Generate height
    this.generateHeight();


    
  };

  getMesh = () => {
    return this.icosphereMesh;
  };


}


export default Planet;