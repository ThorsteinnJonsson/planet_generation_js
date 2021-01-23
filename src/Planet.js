import generateIcosphereMesh from "./Geometry"

import Noise from "noisejs"


class Planet {
  
  constructor() {
    this.radius = 12742; // Earth's radius

    this.icosphereMesh = null


    this.noise = new Noise.Noise(Math.random());

  }
  
  generate = (icoOrder = 5) => {
    this.icosphereMesh = generateIcosphereMesh(icoOrder, this.radius);

    // Generate ocean mask
    
    // Generate height
    const posBuffer = this.icosphereMesh.geometry.getAttribute('position');
    const lenghtBuffer = posBuffer.array.length;
    console.log(posBuffer);
    for (let i = 0; i < lenghtBuffer/3; i++) {
      // Get noise val
      const x = posBuffer.array[3*i]
      const y = posBuffer.array[3*i+1]
      const z = posBuffer.array[3*i+2]

      // Generate noise
      const noiseScale1 = 0.25 * this.radius;
      const noiseScale2 = 0.5 * this.radius;
      const noiseVal = this.noise.simplex3(x/noiseScale1, y/noiseScale1, z/noiseScale1) 
                     * this.noise.simplex3(x/noiseScale2, y/noiseScale2, z/noiseScale2);

      // To spherical
      const r = Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2));
      const theta = Math.acos(z/r);
      const phi = Math.atan2(y,x);

      // Add radius
      const heightScale = 0.75;
      const new_r = r * (1.0 + heightScale * noiseVal);

      // To cartesian
      posBuffer.array[3*i] = new_r * Math.sin(theta) * Math.cos(phi);
      posBuffer.array[3*i+1] = new_r * Math.sin(theta) * Math.sin(phi);
      posBuffer.array[3*i+2] = new_r * Math.cos(theta);
    }

    
  };

  getMesh = () => {
    return this.icosphereMesh;
  };


}


export default Planet;