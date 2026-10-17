"use client";
import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function NeuralOrbMesh({ isStreaming }: { isStreaming: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef1 = useRef<THREE.Mesh>(null!);
  const ringRef2 = useRef<THREE.Mesh>(null!);
  const particlesRef = useRef<THREE.Points>(null!);

  // Ambient floating particles around orb
  const [positions, colors] = useMemo(() => {
    const count = 90;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color("#8B5CF6"); // Violet
    const c2 = new THREE.Color("#FF9500"); // Warm sunset amber
    const c3 = new THREE.Color("#38BDF8"); // Sky blue

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.6 + Math.random() * 0.7;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const mixed = Math.random() > 0.5 ? c1.clone().lerp(c2, Math.random()) : c2.clone().lerp(c3, Math.random());
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return [pos, col];
  }, []);

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    const speed = isStreaming ? 2.5 : 1.0;

    if (meshRef.current) {
      // Gentle rotation & pointer tracking
      meshRef.current.rotation.y = t * 0.25 * speed + pointer.x * 0.3;
      meshRef.current.rotation.x = Math.sin(t * 0.3 * speed) * 0.2 - pointer.y * 0.2;
      const scale = 1 + Math.sin(t * (isStreaming ? 4 : 1.5)) * 0.04;
      meshRef.current.scale.set(scale, scale, scale);
    }

    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 0.35 * speed;
      ringRef1.current.rotation.y = t * 0.25 * speed;
    }

    if (ringRef2.current) {
      ringRef2.current.rotation.x = -t * 0.3 * speed;
      ringRef2.current.rotation.z = t * 0.4 * speed;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.12 * speed;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Core Mesh */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.05, 64, 64]} />
        <MeshDistortMaterial
          color="#1E2230"
          emissive="#2A1B4E"
          emissiveIntensity={isStreaming ? 0.7 : 0.3}
          roughness={0.12}
          metalness={0.92}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          distort={isStreaming ? 0.38 : 0.22}
          speed={isStreaming ? 3.5 : 1.6}
        />
      </mesh>

      {/* Concentric Orbital Ring 1 */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.45, 0.022, 16, 64]} />
        <meshStandardMaterial
          color="#FF9500"
          emissive="#FF7A00"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Concentric Orbital Ring 2 */}
      <mesh ref={ringRef2}>
        <torusGeometry args={[1.7, 0.018, 16, 64]} />
        <meshStandardMaterial
          color="#8B5CF6"
          emissive="#7C3AED"
          emissiveIntensity={0.7}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Swirling Spark Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function Scene({ isStreaming }: { isStreaming: boolean }) {
  return (
    <>
      <ambientLight intensity={0.6} />

      {/* Warm Golden Sunset Light */}
      <directionalLight position={[4, -2, 3]} intensity={3.2} color="#FFA500" />
      <pointLight position={[3, -1.5, 2]} intensity={2.5} color="#FF7A00" />

      {/* Cool Sky Blue Light */}
      <directionalLight position={[-4, 3, 3]} intensity={3.0} color="#7DD3FC" />
      <pointLight position={[-2, 3, 2]} intensity={2.2} color="#38BDF8" />

      {/* Front Specular Fill */}
      <pointLight position={[0, 1, 4]} intensity={1.8} color="#FFFFFF" />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.35}>
        <NeuralOrbMesh isStreaming={isStreaming} />
      </Float>
    </>
  );
}

export function ViberCoreOrb({ isStreaming = false }: { isStreaming?: boolean }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center bg-slate-100 animate-pulse">
        <span className="material-symbols-outlined text-slate-400 text-5xl">all_inclusive</span>
      </div>
    );
  }

  return (
    <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
      {/* Ambient Atmospheric Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-400/20 via-violet-400/15 to-sky-300/15 blur-3xl pointer-events-none" />

      <Canvas camera={{ position: [0, 0, 4.2], fov: 42 }} gl={{ alpha: true, antialias: true }}>
        <Scene isStreaming={isStreaming} />
      </Canvas>
    </div>
  );
}
