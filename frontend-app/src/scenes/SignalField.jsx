import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

function FieldParticles({ threatRatio = 0, count = 140 }) {
  const meshRef = useRef();

  // Color dynamic based on threat ratio (0 = calm cyan/blue, 1 = red/purple alert)
  const particleColor = useMemo(() => {
    if (threatRatio > 0.4) return "#FF3B5C";
    if (threatRatio > 0.15) return "#FFB020";
    return "#00E5FF";
  }, [threatRatio]);

  const speed = useMemo(() => {
    return 0.15 + threatRatio * 0.25;
  }, [threatRatio]);

  return (
    <group ref={meshRef}>
      <Sparkles
        count={count}
        size={1.6}
        scale={22}
        speed={speed}
        color={particleColor}
        opacity={0.35}
      />
    </group>
  );
}

function AmbientGrid({ threatRatio = 0 }) {
  const gridRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (gridRef.current) {
      gridRef.current.position.z = (t * (0.2 + threatRatio * 0.2)) % 2;
    }
  });

  const gridColor = threatRatio > 0.35 ? "#FF3B5C" : "#00E5FF";

  return (
    <group position={[0, -4.2, -4]} rotation={[-Math.PI / 2.3, 0, 0]}>
      <mesh ref={gridRef}>
        <planeGeometry args={[50, 50, 30, 30]} />
        <meshBasicMaterial
          color={gridColor}
          wireframe
          transparent
          opacity={0.04 + threatRatio * 0.03}
        />
      </mesh>
    </group>
  );
}

export default function SignalField({ recentScans = [] }) {
  // Compute threat ratio in the last 20 scans
  const threatRatio = useMemo(() => {
    if (!recentScans || recentScans.length === 0) return 0;
    const sample = recentScans.slice(0, 20);
    const threats = sample.filter((s) => {
      const v = String(s.verdict || "").toUpperCase();
      return v.includes("PHISH") || v.includes("MALICIOUS") || (s.risk_score >= 60);
    }).length;
    return threats / sample.length;
  }, [recentScans]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#02040A"]} />
        <fog attach="fog" args={["#02040A", 6, 20]} />

        <ambientLight intensity={0.4} />
        <pointLight position={[6, 4, 3]} intensity={2} color="#00E5FF" />
        <pointLight position={[-6, -4, 2]} intensity={1.5} color="#7C3AED" />

        <AmbientGrid threatRatio={threatRatio} />
        <FieldParticles threatRatio={threatRatio} />
      </Canvas>
    </div>
  );
}
