import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = () => {
  const ref = useRef<THREE.Points>(null);
  
  // Generating random sphere points
  const sphere = React.useMemo(() => {
    const coords = new Float32Array(3000);
    for (let i = 0; i < 3000; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 8; // Radius scale
      coords[i] = r * Math.sin(phi) * Math.cos(theta);
      coords[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      coords[i + 2] = r * Math.cos(phi);
    }
    return coords;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 30;
      ref.current.rotation.y -= delta / 40;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#ea580c" size={0.02} sizeAttenuation={true} depthWrite={false} opacity={0.6} blending={THREE.AdditiveBlending} />
      </Points>
    </group>
  );
};

const ParallaxShapes = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const targetY = window.scrollY * 0.005; 
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1} position={[-4, -2, -5]}>
        <mesh>
          <torusKnotGeometry args={[1, 0.2, 128, 32]} />
          <meshPhysicalMaterial color="#ff6b00" wireframe opacity={0.15} transparent />
        </mesh>
      </Float>
      
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5} position={[5, -6, -8]}>
        <mesh>
          <icosahedronGeometry args={[2, 0]} />
          <meshPhysicalMaterial color="#ffffff" transmission={1} thickness={0.5} roughness={0.1} metalness={0.1} ior={1.5} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
      </Float>

      <Float speed={1} rotationIntensity={2} floatIntensity={2} position={[-5, -12, -6]}>
        <mesh>
          <torusGeometry args={[1.5, 0.4, 16, 32]} />
          <meshPhysicalMaterial color="#5500ff" metalness={0.9} roughness={0.2} transparent opacity={0.3} wireframe />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={2} floatIntensity={2} position={[6, -18, -5]}>
        <mesh>
          <octahedronGeometry args={[1.5, 0]} />
          <meshPhysicalMaterial color="#ff6b00" wireframe opacity={0.15} transparent />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={1.5} floatIntensity={2} position={[-3, -24, -7]}>
        <mesh>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshPhysicalMaterial color="#ea580c" transmission={0.9} thickness={1} roughness={0.2} ior={1.3} envMapIntensity={1} />
        </mesh>
      </Float>
      
      <Float speed={1} rotationIntensity={2} floatIntensity={1} position={[4, -30, -6]}>
        <mesh>
           <torusKnotGeometry args={[1.2, 0.3, 100, 16]} />
           <meshPhysicalMaterial color="#ffffff" transmission={1} thickness={1} roughness={0} metalness={0.2} ior={1.2} />
        </mesh>
      </Float>
    </group>
  );
};

export function ParticleBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <ParticleField />
        <ParallaxShapes />
      </Canvas>
    </div>
  );
}
