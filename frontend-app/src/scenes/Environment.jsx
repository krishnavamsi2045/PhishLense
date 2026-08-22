import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import * as THREE from "three";
import { useSceneDirector } from "./scene-director/useSceneDirector";
import { usePerfTier } from "../hooks/usePerfTier";

/**
 * Camera Director: Smoothly transitions camera to active view directives
 */
function CameraDirector() {
  const { currentDirective } = useSceneDirector();
  const { camera } = useThree();
  const targetVec = useMemo(() => new THREE.Vector3(), []);
  const lookAtVec = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ pointer }) => {
    if (!currentDirective) return;
    const [x, y, z] = currentDirective.cameraPos;
    const [tx, ty, tz] = currentDirective.cameraTarget;

    // Subtle pointer parallax
    const px = pointer.x * 0.15;
    const py = pointer.y * 0.1;

    targetVec.set(x + px, y + py, z);
    lookAtVec.set(tx, ty, tz);

    camera.position.lerp(targetVec, 0.05);
    camera.lookAt(lookAtVec);
  });

  return null;
}

/**
 * Cyber Grid Floor with dynamic distance fog and emissive pulse
 */
function CyberGridFloor({ threatRatio = 0, gridDensity = 1.0 }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.position.z = (t * (0.2 + threatRatio * 0.2)) % 2;
    }
  });

  const gridColor = threatRatio > 0.35 ? "#FF3B5C" : "#00E5FF";

  return (
    <group position={[0, -3.8, -3]} rotation={[-Math.PI / 2.3, 0, 0]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[60, 60, 36, 36]} />
        <meshBasicMaterial
          color={gridColor}
          wireframe
          transparent
          opacity={(0.04 + threatRatio * 0.04) * gridDensity}
        />
      </mesh>
    </group>
  );
}

/**
 * Data Stream / Matrix glyph columns
 */
function MatrixStreamPlanes({ count = 24 }) {
  const groupRef = useRef();

  const streams = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 12,
      z: -4 - Math.random() * 8,
      speed: 0.5 + Math.random() * 1.5,
      height: 2 + Math.random() * 4,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const s = streams[i];
        child.position.y = ((s.y - t * s.speed) % 14) + 7;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {streams.map((s, idx) => (
        <mesh key={idx} position={[s.x, s.y, s.z]}>
          <planeGeometry args={[0.08, s.height]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Ambient Signal Field Particles (Dynamic density and hue based on threat ratio)
 */
function AmbientSignalField({ threatRatio = 0, tier = "Standard" }) {
  const count = tier === "Ultra" ? 180 : tier === "Mobile" ? 50 : 120;

  const color = useMemo(() => {
    if (threatRatio > 0.4) return "#FF3B5C";
    if (threatRatio > 0.15) return "#FFB020";
    return "#00E5FF";
  }, [threatRatio]);

  const speed = useMemo(() => 0.15 + threatRatio * 0.25, [threatRatio]);

  return (
    <Sparkles
      count={count}
      size={tier === "Mobile" ? 1.2 : 1.6}
      scale={24}
      speed={speed}
      color={color}
      opacity={0.35}
    />
  );
}

export default function Environment({ recentScans = [] }) {
  const { currentDirective, activeView } = useSceneDirector();
  const { tier, webGLSupported } = usePerfTier();

  // Threat ratio calculation across recent scans
  const threatRatio = useMemo(() => {
    if (!recentScans || recentScans.length === 0) return 0;
    const sample = recentScans.slice(0, 20);
    const threats = sample.filter((s) => {
      const v = String(s.verdict || "").toUpperCase();
      return v.includes("PHISH") || v.includes("MALICIOUS") || (s.risk_score >= 60);
    }).length;
    return threats / sample.length;
  }, [recentScans]);

  // WebGL unavailable fallback
  if (!webGLSupported) {
    return (
      <div className="webgl-fallback-environment">
        <div className="svg-ring-ambient" />
      </div>
    );
  }

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
        camera={{ position: [0, 0, 6], fov: 48 }}
        dpr={tier === "Ultra" ? [1, 1.5] : [1, 1.2]}
        gl={{
          antialias: tier !== "Mobile",
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <color attach="background" args={["#02040A"]} />
        <fog attach="fog" args={["#02040A", 5, 22]} />

        <ambientLight intensity={currentDirective?.lightIntensity * 0.5 || 0.5} />
        <pointLight position={[6, 5, 4]} intensity={2.0} color="#00E5FF" />
        <pointLight position={[-6, -4, 3]} intensity={1.6} color="#7C3AED" />

        <CameraDirector />
        <CyberGridFloor
          threatRatio={threatRatio}
          gridDensity={currentDirective?.gridDensity || 1.0}
        />
        {tier !== "Mobile" && <MatrixStreamPlanes count={tier === "Ultra" ? 36 : 20} />}
        <AmbientSignalField threatRatio={threatRatio} tier={tier} />
      </Canvas>
    </div>
  );
}
