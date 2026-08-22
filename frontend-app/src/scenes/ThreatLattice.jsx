import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function LatticeRing({ scans = [] }) {
  const groupRef = useRef();

  // Create node data mapped directly to real history records
  const nodes = useMemo(() => {
    const list = scans.slice(0, 16);
    const count = Math.max(list.length, 6);
    const radius = 2.8;

    return Array.from({ length: count }).map((_, i) => {
      const scan = list[i] || { verdict: "SAFE", risk_score: 10, url: "demo" };
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.7;
      const z = (Math.sin(angle * 2) * 0.4);

      const v = String(scan.verdict || "SAFE").toUpperCase();
      let color = "#00E676";
      if (v.includes("PHISH") || v.includes("MALICIOUS") || scan.risk_score >= 60) {
        color = "#FF3B5C";
      } else if (v.includes("SUSPICIOUS") || scan.risk_score >= 30) {
        color = "#FFB020";
      }

      const size = 0.06 + Math.min(scan.risk_score || 0, 100) * 0.0012;

      return {
        pos: new THREE.Vector3(x, y, z),
        color,
        size,
        scan,
      };
    });
  }, [scans]);

  // Construct interconnecting lattice line segments
  const lineGeometry = useMemo(() => {
    const points = [];
    for (let i = 0; i < nodes.length; i++) {
      const next = (i + 1) % nodes.length;
      points.push(nodes[i].pos, nodes[next].pos);
      if (i % 2 === 0 && nodes.length > 4) {
        const across = (i + 3) % nodes.length;
        points.push(nodes[i].pos, nodes[across].pos);
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [nodes]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.z = t * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Lattice Connections */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* History Telemetry Nodes */}
      {nodes.map((node, idx) => (
        <group key={idx} position={node.pos}>
          <mesh>
            <sphereGeometry args={[node.size, 12, 12]} />
            <meshBasicMaterial color={node.color} />
          </mesh>
          <mesh>
            <ringGeometry args={[node.size * 1.3, node.size * 1.6, 16]} />
            <meshBasicMaterial
              color={node.color}
              side={THREE.DoubleSide}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function ThreatLattice({ scans = [], height = 360 }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <LatticeRing scans={scans} />
      </Canvas>
    </div>
  );
}
