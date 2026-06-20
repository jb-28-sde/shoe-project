import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Preload, ContactShadows, Text, Image as DreiImage, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { products } from '../data';

const FloatingShapes = () => {
  return (
    <>
      <Float speed={1.5} rotationIntensity={2} floatIntensity={2} position={[-3, 1, -2]}>
        <mesh>
          <torusGeometry args={[0.5, 0.2, 16, 32]} />
          <MeshDistortMaterial color="#ff6b00" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} speed={5} distort={0.2} />
        </mesh>
      </Float>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5} position={[3, -1, -1]}>
        <mesh>
          <sphereGeometry args={[0.6, 64, 64]} />
          <meshPhysicalMaterial color="#ffffff" transmission={1} thickness={0.5} roughness={0} metalness={0.1} ior={1.5} envMapIntensity={1} />
        </mesh>
      </Float>
      <Float speed={1} rotationIntensity={1} floatIntensity={2} position={[-2, -2, -3]}>
        <mesh>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshPhysicalMaterial color="#5500ff" metalness={0.9} roughness={0.1} clearcoat={1} />
        </mesh>
      </Float>
    </>
  );
};

const CarouselItem = ({ item, index, activeIndex, total }: { item: any, index: number, activeIndex: number, total: number }) => {
  const mesh = useRef<THREE.Group>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 5;
  
  const targetX = Math.sin(angle) * radius;
  const targetZ = Math.cos(angle) * radius;
  
  useFrame((state) => {
    if (mesh.current) {
      // Calculate angular distance from active
      const activeAngle = (activeIndex / total) * Math.PI * 2;
      const currentAngle = angle - activeAngle;
      
      const px = Math.sin(currentAngle) * radius;
      const pz = Math.cos(currentAngle) * radius - radius; // Offset so active is at z=0
      
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, px, 0.05);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, pz, 0.05);
      
      const targetRotation = currentAngle;
      mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, targetRotation, 0.05);
      
      // Floating effect
      mesh.current.position.y = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;

      // Mouse Parallax
      mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, (state.mouse.x * Math.PI) / 16, 0.05);
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, (state.mouse.y * Math.PI) / 16, 0.05);
    }
  });

  return (
    <group ref={mesh}>
      <group position={[0, 0, 0]}>
        <DreiImage 
          url={item.image} 
          scale={[3.5, 2.5]} 
          position={[0, 0, 0.1]}
          radius={0.1}
          transparent
          opacity={0.9}
        />
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.8, 2.8, 0.2]} />
          <meshPhysicalMaterial 
            color="#0f0f0f" 
            metalness={0.9} 
            roughness={0.1} 
            clearcoat={1} 
            clearcoatRoughness={0.1} 
          />
        </mesh>

        <Text
          position={[0, 1.8, 0.5]}
          fontSize={0.4}
          color="#ff6b00"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          {item.name}
        </Text>

        <Text
          position={[1.5, -1.2, 0.3]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="right"
          anchorY="middle"
        >
          ₹{item.price}
        </Text>
      </group>
    </group>
  );
};

export function Hero3D() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const featuredProducts = products.slice(0, 5);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % featuredProducts.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);

  return (
    <div className="relative w-full h-[80vh] overflow-hidden rounded-3xl mx-auto my-6 z-0 group">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 to-transparent z-0 pointer-events-none"></div>
      
      {!loaded && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="text-white font-mono text-xs tracking-widest uppercase animate-pulse">Initializing...</div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-1000">
        <h1 className="text-[12vw] font-display font-black text-white/5 uppercase italic tracking-tighter whitespace-nowrap">
          JUTE LE LO
        </h1>
      </div>
      
      {/* Interaction Layer */}
      <div 
        className={`absolute inset-0 z-30 flex items-center justify-between px-4 lg:px-12 pointer-events-none transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="w-12 h-12 rounded-full border border-white/20 bg-black/50 text-white backdrop-blur flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 pointer-events-auto"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="w-12 h-12 rounded-full border border-white/20 bg-black/50 text-white backdrop-blur flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 pointer-events-auto"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="absolute top-1/2 left-6 transform -translate-y-1/2 z-20 pointer-events-none hidden lg:block">
        <div className="flex flex-col space-y-4">
          {featuredProducts.map((_, i) => (
            <div key={i} className={`w-1 transition-all duration-500 rounded-full ${i === activeIndex ? 'h-12 bg-orange-500' : 'h-4 bg-white/20'}`}></div>
          ))}
        </div>
      </div>
      
      <div className={`absolute bottom-10 right-10 z-20 pointer-events-none text-right transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-orange-500 font-mono text-sm tracking-widest uppercase mb-1">Swipe to explore</p>
        <p className="text-white/50 text-xs font-light max-w-xs">{featuredProducts[activeIndex].description.substring(0, 80)}...</p>
      </div>

      {/* Removed Touch UI layer */}

      <div className={`absolute inset-0 z-20 cursor-grab active:cursor-grabbing transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <Canvas 
          camera={{ position: [0, 0, 6], fov: 45 }}
          onCreated={() => setLoaded(true)}
          onPointerDown={(e) => {
            e.currentTarget.dataset.startX = e.clientX.toString();
          }}
          onPointerUp={(e) => {
            const startX = parseFloat(e.currentTarget.dataset.startX || '0');
            const endX = e.clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
              if (diff > 0) {
                handleNext();
              } else {
                handlePrev();
              }
            }
          }}
        >
          <fog attach="fog" args={['#050505', 4, 15]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <React.Suspense fallback={null}>
            <Environment preset="city" />
            {featuredProducts.map((item, i) => (
              <CarouselItem key={item.id} item={item} index={i} activeIndex={activeIndex} total={featuredProducts.length} />
            ))}

            <FloatingShapes />
          </React.Suspense>

          <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={2.5} far={4} />
          <Preload all />
        </Canvas>
      </div>
    </div>
  );
}
