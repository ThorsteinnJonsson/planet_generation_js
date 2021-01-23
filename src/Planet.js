import generateIcosphereMesh from "./Geometry"


class Planet {
  
  constructor() {
    this.radius = 12742; // Earth's radius

  }
  
  generate = (icoOrder = 5) => {
    this.icosphereMesh = generateIcosphereMesh(icoOrder, this.radius);
  };

  getMesh = () => {
    return this.icosphereMesh;
  };


}


export default Planet;