import { useRef, useEffect } from "react";
import { Renderer, Program, Triangle, Mesh } from "ogl";
import "../styles/LightRays.css";
import React from "react";
const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [
        parseInt(m[1], 16) / 255,
        parseInt(m[2], 16) / 255,
        parseInt(m[3], 16) / 255,
      ]
    : [1, 1, 1];
};

const LightRays = ({
  raysColor = "#00ffff",
  raysSpeed = 1.5,
  lightSpread = 0.8,
  rayLength = 1.2,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0.1,
  distortion = 0.05,
  className = "",
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const uniformsRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";

    const vert = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const frag = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec3 raysColor;
      uniform float raysSpeed;
      uniform float lightSpread;
      uniform float rayLength;
      uniform float noiseAmount;
      varying vec2 vUv;

      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = vUv;
        vec2 p = uv - 0.5;
        float r = length(p);
        float n = noise(p * 5.0 + iTime * 0.5);
        float intensity = pow(1.0 - r, lightSpread * 2.0);
        intensity += n * noiseAmount;
        vec3 color = raysColor * intensity;
        gl_FragColor = vec4(color, 1.0 - r * rayLength);
      }
    `;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [window.innerWidth, window.innerHeight] },
      raysColor: { value: hexToRgb(raysColor) },
      raysSpeed: { value: raysSpeed },
      lightSpread: { value: lightSpread },
      rayLength: { value: rayLength },
      noiseAmount: { value: noiseAmount },
    };
    uniformsRef.current = uniforms;

    const geometry = new Triangle(gl);
    const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      uniforms.iResolution.value = [container.clientWidth, container.clientHeight];
    };
    resize();
    window.addEventListener("resize", resize);

    const update = (t) => {
      uniforms.iTime.value = t * 0.001 * raysSpeed;
      renderer.render({ scene: mesh });
      animationRef.current = requestAnimationFrame(update);
    };
    animationRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
      container.removeChild(gl.canvas);
    };
  }, [raysColor, raysSpeed, lightSpread, rayLength, noiseAmount]);

  return <div ref={containerRef} className={`light-rays-container ${className}`} />;
};

export default LightRays;
