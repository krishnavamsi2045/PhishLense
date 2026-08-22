import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/**
 * Sentinel Core (Central Defense Orb / Shield)
 * Color, pulse frequency, and turbulence bound to real backend telemetry.
 */
function CoreMesh({ verdict = "safe", avgRisk = 0, isScanning = false }) {
  const groupRef = useRef();
  const innerOrbRef = useRef();
  const hexRing1Ref = useRef();
  const hexRing2Ref = useRef();
  const quantumCoreRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Derive theme colors directly from backend scan verdict
  const theme = useMemo(() => {
    const v = String(verdict).toLowerCase();
    if (v.includes("phish") || v.includes("malicious") || avgRisk >= 60) {
      return {
        primary: "#FF3B5C",
        secondary: "#991B1B",
        glow: "#FF3B5C",
        pulseSpeed: 3.5,
        turbulence: 0.12,
      };
    }
    if (v.includes("suspicious") || avgRisk >= 30) {
      return {
        primary: "#FFB020",
        secondary: "#B45309",
        glow: "#FFB020",
        pulseSpeed: 2.2,
        turbulence: 0.08,
      };
    }
    return {
      primary: "#00E676",
      secondary: "#00E5FF",
      glow: "#00E676",
      pulseSpeed: 1.2,
      turbulence: 0.04,
    };
  }, [verdict, avgRisk]);

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    const rotSpeed = hovered ? 0 : 0.05; // Pauses auto-rotation on hover

    if (groupRef.current) {
      // Gentle parallax tilt (max ~4 degrees)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.x * 0.08,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -pointer.y * 0.06,
        0.05
      );
    }

    if (innerOrbRef.current) {
      innerOrbRef.current.rotation.y += rotSpeed;
      // Pulse frequency bound to danger level
      const pulse = 1 + Math.sin(t * theme.pulseSpeed) * (theme.turbulence * 0.5);
      innerOrbRef.current.scale.set(pulse, pulse, pulse);
    }

    if (hexRing1Ref.current) {
      hexRing1Ref.current.rotation.z = t * 0.2;
    }

    if (hexRing2Ref.current) {
      hexRing2Ref.current.rotation.z = -t * 0.15;
    }

    if (quantumCoreRef.current) {
      quantumCoreRef.current.rotation.x = t * 0.4;
      quantumCoreRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.25}>
        {/* Outer Hexagonal Shield Enclosure */}
        <mesh ref={innerOrbRef}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial
            color={theme.primary}
            emissive={theme.primary}
            emissiveIntensity={isScanning ? 2.5 : 1.4}
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Solid Quantum Core */}
        <mesh ref={quantumCoreRef} scale={0.7}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#040C1A"
            emissive={theme.secondary}
            emissiveIntensity={1.0}
            roughness={0.2}
            metalness={0.85}
          />
        </mesh>

        {/* Dynamic Hex Defense Rings */}
        <mesh ref={hexRing1Ref}>
          <ringGeometry args={[1.9, 1.96, 6]} />
          <meshBasicMaterial
            color={theme.primary}
            side={THREE.DoubleSide}
            transparent
            opacity={0.65}
          />
        </mesh>

        <mesh ref={hexRing2Ref}>
          <ringGeometry args={[2.3, 2.35, 32]} />
          <meshBasicMaterial
            color={theme.secondary}
            side={THREE.DoubleSide}
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* 4 Corner Sentinel Nodes */}
        {[-1.6, 1.6].map((x, i) =>
          [-1.6, 1.6].map((y, j) => (
            <mesh key={`${i}-${j}`} position={[x, y, 0]}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshBasicMaterial color={theme.primary} wireframe />
            </mesh>
          ))
        )}

        {/* Interactive hover indicator aura */}
        {hovered && (
          <mesh>
            <sphereGeometry args={[2.5, 16, 16]} />
            <meshBasicMaterial
              color={theme.primary}
              wireframe
              transparent
              opacity={0.1}
            />
          </mesh>
        )}
      </Float>
    </group>
  );
}

export default function SentinelCore({
  verdict = "safe",
  avgRisk = 0,
  isScanning = false,
  height = 360,
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
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 4, 4]} intensity={2.2} color="#00E5FF" />
        <pointLight position={[-3, -4, 3]} intensity={1.8} color="#7C3AED" />

        <CoreMesh
          verdict={verdict}
          avgRisk={avgRisk}
          isScanning={isScanning}
        />

        <Sparkles
          count={60}
          size={1.5}
          scale={7}
          speed={0.2}
          color="#00E5FF"
          opacity={0.4}
        />
      </Canvas>
    </div>
  );
}
