document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("bg-canvas-container");
  if (!container) return;

  // Get colors from config (passed via data attribute)
  const configColors = JSON.parse(
    container.dataset.colors || '["#b95ddd", "#e0e92b", "#2ce341", "#2196f3"]'
  );

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.set(0, 0, 1);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Uniforms
  const hexToRgb = (hex) => {
    const color = new THREE.Color(hex);
    return new THREE.Vector3(color.r, color.g, color.b);
  };

  const uniforms = {
    uTime: { value: 0 },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    uColor1: { value: hexToRgb(configColors[0]) },
    uColor2: { value: hexToRgb(configColors[1]) },
    uColor3: { value: hexToRgb(configColors[2]) },
    uColor4: { value: hexToRgb(configColors[3]) },
  };

  // Shader Material
  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform vec3 uColor3;
            uniform vec3 uColor4;
            varying vec2 vUv;

            // Simplex Noise 
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v){
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 uv = vUv;
                float time = uTime * 1.1;
                vec2 movement = vec2(
                    sin(uv.x * 6.0 + time) * 0.2 + sin(uv.y * 8.0 + time * 0.5) * 0.1,
                    cos(uv.y * 6.0 + time) * 0.2 + cos(uv.x * 10.0 + time * 0.5) * 0.1
                );
                float noiseVal = snoise(uv * 1.5 + movement + time * 0.2);
                vec2 distUV = uv + movement + vec2(noiseVal * 0.3);

                float xMix = smoothstep(0.0, 1.0, distUV.x);
                float yMix = smoothstep(0.0, 1.0, distUV.y);
                
                vec3 topColor = mix(uColor1, uColor2, xMix);
                vec3 botColor = mix(uColor3, uColor4, xMix);
                vec3 finalColor = mix(topColor, botColor, yMix);
                
                finalColor = finalColor * 1.1;
                float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
                finalColor += (grain - 0.5) * 0.01;

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
    depthTest: false,
    depthWrite: false,
  });

  // Mesh
  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Animation Loop
  const clock = new THREE.Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  };
  animate();

  // Resize Handler
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    uniforms.uResolution.value.set(width, height);
  });
});
