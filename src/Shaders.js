

function planetVertexShader() {
  return `
    varying vec3 pos; 

    void main() {
      pos = position; 

      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
    }
  `;
}

function planetFragmentShader() {
  return `
    uniform vec3 oceanColor; 
    uniform vec3 landColor;
    uniform float planetRadius;
    varying vec3 pos;

    void main() {
      float radius = sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
      vec3 selectedColor = (radius <= planetRadius)? oceanColor : landColor;
      gl_FragColor = vec4( selectedColor, 1.0);
    }
  `;
}

export {
  planetVertexShader,
  planetFragmentShader
}