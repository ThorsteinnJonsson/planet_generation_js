

const simplex3dDeclaration = `
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){

    // Simple hack to get something similar to a random seed
    v += pseudoSeed;

    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //  x0 = x0 - 0. + 0.0 * C 
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

    // Permutations
    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients
    // ( N*N points uniformly over a square, mapped onto an octahedron.)
    float n_ = 1.0/7.0; // N=7
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }
`;

const radiusScalingFunc = `
  float getRadiusScaling(vec3 pos) {
    float maxAmp = 0.0;
    float amp = 1.0;
    float freq = noiseScale;
    float noise = 0.0;
    
    for (int iter = 0; iter < numIter; iter++) {
      noise += snoise(pos * freq) * amp;
      maxAmp += amp;
      amp *= persistence;
      freq *= 2.0;
    }

    noise /= maxAmp;
    noise = noise * (maxRad - minRad) / 2.0 + (maxRad + minRad) / 2.0;
    return noise;
  }
`;

const planetGeometryUniforms = `
  uniform float pseudoSeed;
  uniform float planetRadius;
  uniform int numIter;
  uniform float noiseScale;
  uniform float persistence;
  uniform float minRad;
  uniform float maxRad;
`;

const planetColorUniforms = `
  uniform vec3 oceanColor; 
  uniform vec3 landColor;
  uniform vec3 iceColor;
  uniform vec3 beachColor;
  uniform vec3 mountainColor;
  uniform vec3 forestColor;
`;

function planetVertexShader() {
  return `
    varying vec3 pos;

    ${planetGeometryUniforms}

    ${simplex3dDeclaration}

    ${radiusScalingFunc}

    void main() {
      pos = position;
      
      // Generate height of each vertex
      // Get radius scaling using simplex noise
      float radiusScaling = getRadiusScaling(pos);

      // Convert to spherical coords
      float r = sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
      float theta = acos(pos.y/r);
      float phi = atan(pos.z, pos.x);

      // Add radius. Height will be same as planet radius if lower because that is the ocean level
      float new_r = max(planetRadius, r * radiusScaling);

      // Convert back to cartesian coords
      pos.x = new_r * sin(theta) * cos(phi);
      pos.z = new_r * sin(theta) * sin(phi);
      pos.y = new_r * cos(theta);

      vec4 modelViewPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
    }
  `;
}

function planetFragmentShader() {
  return `
    varying vec3 pos;  
  
    ${planetGeometryUniforms}
    ${planetColorUniforms}

    ${simplex3dDeclaration}

    ${radiusScalingFunc}

    void main() {
      float radius = sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
      
      // Get radius scaling using simplex noise
      float radiusScaling = getRadiusScaling(pos);
  
      // Convert to spherical coords
      float r = sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
      float theta = acos(pos.y/r);
      float phi = atan(pos.z, pos.x);
  
      // Add radius. Height will be same as planet radius if lower because that is the ocean level
      float height = max(planetRadius, r * radiusScaling);
      
      // Land vs Ocean discrimination
      bool isOcean = (height <= planetRadius);
      vec3 selectedColor = isOcean ? oceanColor : landColor;
      
      // Add beaches
      float noBeachLat = 0.75; // To not generate beaches close to poles. 0.0 means no limitation so beaches can be anywhere. In radians.
      if ((height > planetRadius  && height <= planetRadius + 50.0) &&
          (theta > noBeachLat && theta < (3.1415-noBeachLat))) {
        float beachNoise = snoise(pos * 4.0 / planetRadius);
        if (beachNoise < 0.0) {
          selectedColor = beachColor;
        }
      }

      // Add forests      
      if (height > planetRadius + 100.0) {
        float forestNoise = snoise(pos * 6.0 / planetRadius) + snoise(pos * 2.0 / planetRadius) + snoise(pos * 1.5 / planetRadius);
        if (forestNoise > 0.5) {
          selectedColor = forestColor;
        }
      }

      // Add mountains with ice peaks
      if (height > planetRadius * 1.075) {
        selectedColor = mountainColor;
      }
      if (height > planetRadius * 1.105) {
        selectedColor = iceColor;
      }

      // Apply ice caps
      // Ice cap is theta angle plus some noise to make it look more natural
      float iceCapLatitudeNorth = 0.3 + 0.02 * cos(phi * 5.0) * sin(phi * 8.0) * sin(phi * 9.0);
      float iceCapLatitudeSouth = 0.3 + 0.02 * cos(phi * 7.0) * sin(phi * 5.0) * cos(phi * 12.0);
      bool isPolar = theta < iceCapLatitudeNorth || theta > 3.14159 - iceCapLatitudeSouth;
      selectedColor = (isPolar) ? iceColor : selectedColor;

      float polarChillFactor = 1.25; // How far ice extends on land from the ice caps. 1.0 means no extent.
      bool isPolarExtension = (theta < (iceCapLatitudeNorth*polarChillFactor) || theta > (3.14159 - iceCapLatitudeSouth * polarChillFactor));
      if (!isOcean && isPolarExtension) {
        selectedColor = iceColor;
      }

      gl_FragColor = vec4( selectedColor, 1.0);
    }
  `;
}


function cloudVertexShader() {
  
  return `
    varying vec3 pos;

    void main() {
      pos = position;
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
    }
  `;
}


function cloudFragmentShader() {
  return `
    varying vec3 pos;  
  
    ${planetGeometryUniforms}

    ${simplex3dDeclaration}

    void main() {
      float alphaNoise = snoise(pos * 2.5 / planetRadius) + snoise(pos *2.0/ planetRadius);
      float alphaVal = (alphaNoise > 0.75) ? 0.75 : 0.0; 
      gl_FragColor = vec4( 1.0, 1.0, 1.0, alphaVal);
    }
  `;
}


export {
  planetVertexShader,
  planetFragmentShader,
  cloudVertexShader,
  cloudFragmentShader,
}