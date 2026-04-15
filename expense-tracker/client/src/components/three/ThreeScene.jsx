import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Torus, Box, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Animated floating coin
const FloatingCoin = ({ position, color, speed = 1, scale = 1 }) => {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02 * speed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.2;
    }
  });
  return (
    <Float speed={speed * 1.5} rotationIntensity={0.5} floatIntensity={1}>
      <Torus
        ref={meshRef}
        position={position}
        args={[0.3 * scale, 0.08 * scale, 16, 32]}
      >
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
      </Torus>
    </Float>
  );
};

// Animated distorted sphere (main orb)
const MainOrb = () => {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.4}
          speed={3}
          roughness={0}
          metalness={0.3}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </Float>
  );
};

// Floating particles
const Particles = ({ count = 60 }) => {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return positions;
  }, [count]);

  const geoRef = useRef();
  useFrame((state) => {
    if (geoRef.current) {
      geoRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={geoRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a5b4fc"
        size={0.04}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
};

// Orbiting ring
const OrbitRing = ({ radius = 2, color = '#06b6d4', speed = 0.5 }) => {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * speed;
      meshRef.current.rotation.x = Math.PI / 3;
    }
  });
  return (
    <Torus ref={meshRef} args={[radius, 0.02, 8, 80]}>
      <meshStandardMaterial color={color} metalness={1} roughness={0.1} transparent opacity={0.6} />
    </Torus>
  );
};

const ThreeScene = ({ className = '' }) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#6366f1" />
        <pointLight position={[-5, -3, 3]} intensity={0.8} color="#06b6d4" />
        <pointLight position={[0, -5, 2]} intensity={0.6} color="#10b981" />

        <Particles count={80} />
        <MainOrb />
        <OrbitRing radius={1.8} color="#06b6d4" speed={0.4} />
        <OrbitRing radius={2.4} color="#10b981" speed={-0.3} />
        <FloatingCoin position={[-2.5, 1.5, -1]} color="#f59e0b" speed={0.8} scale={1.2} />
        <FloatingCoin position={[2.5, -1, -1]} color="#6366f1" speed={1.1} scale={0.9} />
        <FloatingCoin position={[1.5, 2, -2]} color="#10b981" speed={0.6} scale={0.7} />
        <FloatingCoin position={[-2, -1.5, -0.5]} color="#06b6d4" speed={1.3} scale={0.8} />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
