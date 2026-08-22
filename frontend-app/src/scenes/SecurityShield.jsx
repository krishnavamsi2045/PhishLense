import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function ShieldModel({ verdict = "IDLE", score = 0 }) {
  const groupRef = useRef();
  const hexRingRef = useRef();
  const outerRingRef = useRef();
  const coreRef = useRef();
  const scanLineRef = useRef();

  // Determine dynamic theme color based on real verdict / score
  let primaryColor = "#00e5ff";
  let emissiveColor = "#00b4d8";
  let auraIntensity = 1.6;

  const upperVerdict = String(verdict).toUpperCase();

  if (
    upperVerdict.includes("PHISH") ||
    upperVerdict.includes("MALICIOUS") ||
    upperVerdict.includes("HIGH_RISK") ||
    score >= 60
  ) {
    primaryColor = "#ff3b5c";
    emissiveColor = "#b91c1c";
    auraIntensity = 2.5;
  } else if (
    upperVerdict.includes("SUSPICIOUS") ||
    upperVerdict.includes("MEDIUM") ||
    score >= 30
  ) {
    primaryColor = "#ffb020";
    emissiveColor = "#d97706";
    auraIntensity = 2.0;
  } else if (
    upperVerdict.includes("SAFE") ||
    upperVerdict.includes("CLEAN") ||
    upperVerdict.includes("SECURE")
  ) {
    primaryColor = "#00e676";
    emissiveColor = "#059669";
    auraIntensity = 1.8;
  }

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.x * 0.4,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -pointer.y * 0.3,
        0.05
      );
    }

    if (hexRingRef.current) {
      hexRingRef.current.rotation.z = -t * 0.25;
      const s = 1 + Math.sin(t * 3) * 0.05;
      hexRingRef.current.scale.set(s, s, 1);
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.2;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.4;
      coreRef.current.rotation.x = t * 0.2;
    }

    if (scanLineRef.current) {
      scanLineRef.current.position.y = Math.sin(t * 2) * 1.3;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
        {/* Holographic Shield Octahedron Shell */}
        <mesh>
          <octahedronGeometry args={[1.4, 0]} />
          <meshStandardMaterial
            color={primaryColor}
            emissive={emissiveColor}
            emissiveIntensity={auraIntensity}
            wireframe
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Inner Solid Quantum Core */}
        <mesh ref={coreRef} scale={0.65}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#06182c"
            emissive={primaryColor}
            emissiveIntensity={1.2}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Hexagonal Target Shield Ring */}
        <mesh ref={hexRingRef}>
          <ringGeometry args={[1.8, 1.88, 6]} />
          <meshBasicMaterial
            color={primaryColor}
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Secondary High-Tech Outer Ring with Dashes */}
        <mesh ref={outerRingRef}>
          <ringGeometry args={[2.3, 2.36, 32]} />
          <meshBasicMaterial
            color={primaryColor}
            side={THREE.DoubleSide}
            transparent
            opacity={0.45}
          />
        </mesh>

        {/* Scanning Laser Beam */}
        <group ref={scanLineRef}>
          <mesh>
            <planeGeometry args={[3.2, 0.04]} />
            <meshBasicMaterial
              color={primaryColor}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* 4 Corner Defense Nodes */}
        {[-1.6, 1.6].map((x, i) =>
          [-1.6, 1.6].map((y, j) => (
            <group key={`${i}-${j}`} position={[x, y, 0]}>
              <mesh>
                <boxGeometry args={[0.14, 0.14, 0.14]} />
                <meshBasicMaterial color={primaryColor} wireframe />
              </mesh>
            </group>
          ))
        )}
      </Float>
    </group>
  );
}

export default function SecurityShield({
  verdict = "IDLE",
  score = 0,
  height = 320,
}) {
  return (
    <div
      style={{
        width: "100%",
        height: `${height}px`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 4]} intensity={2.5} color="#00e5ff" />
        <pointLight position={[-3, -3, 3]} intensity={2.0} color="#7c3aed" />

        <ShieldModel verdict={verdict} score={score} />
      </Canvas>
    </div>
  );
}
