import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

function BackgroundGrid() {
  const gridRef = useRef();

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    if (gridRef.current) {
      gridRef.current.position.z = (t * 0.3) % 2;
      gridRef.current.rotation.z = THREE.MathUtils.lerp(
        gridRef.current.rotation.z,
        pointer.x * 0.05,
        0.05
      );
    }
  });

  return (
    <group position={[0, -4.5, -4]} rotation={[-Math.PI / 2.3, 0, 0]}>
      <mesh ref={gridRef}>
        <planeGeometry args={[60, 60, 40, 40]} />
        <meshBasicMaterial
          color="#00e5ff"
          wireframe
          transparent
          opacity={0.05}
        />
      </mesh>
    </group>
  );
}

function AmbientNodes({ count = 35 }) {
  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 22,
        y: (Math.random() - 0.5) * 14,
        z: (Math.random() - 0.5) * 8 - 4,
        size: 0.03 + Math.random() * 0.05,
        pulseSpeed: 0.8 + Math.random() * 2,
        color:
          i % 6 === 0
            ? "#ff3b5c"
            : i % 3 === 0
            ? "#7c3aed"
            : "#00e5ff",
      });
    }
    return arr;
  }, [count]);

  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const n = nodes[i];
      const s = 1 + Math.sin(t * n.pulseSpeed + i) * 0.35;
      child.scale.set(s, s, s);
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh key={i} position={[n.x, n.y, n.z]}>
          <sphereGeometry args={[n.size, 8, 8]} />
          <meshBasicMaterial
            color={n.color}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function CommandCenterScene() {
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
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <color attach="background" args={["#02040a"]} />
        <fog attach="fog" args={["#02040a", 6, 22]} />

        <ambientLight intensity={0.4} />
        <pointLight position={[6, 4, 3]} intensity={2} color="#00e5ff" />
        <pointLight position={[-6, -4, 2]} intensity={1.5} color="#7c3aed" />

        <BackgroundGrid />
        <AmbientNodes />

        <Sparkles
          count={180}
          size={1.6}
          scale={20}
          speed={0.15}
          color="#00e5ff"
          opacity={0.35}
        />
      </Canvas>
    </div>
  );
}
