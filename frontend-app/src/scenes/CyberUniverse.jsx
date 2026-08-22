import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/* ─── High-Tech Cyber Radar Scanner ─── */
function CyberRadar() {
  const radarSweep = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (radarSweep.current) radarSweep.current.rotation.z = -t * 1.8;
    if (ring1.current) ring1.current.rotation.z = t * 0.1;
    if (ring2.current) ring2.current.rotation.z = -t * 0.15;
    if (ring3.current) ring3.current.rotation.z = t * 0.08;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Concentric Radar Target Rings */}
      <mesh ref={ring1}>
        <ringGeometry args={[1.2, 1.23, 48]} />
        <meshBasicMaterial color="#00ffe7" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2}>
        <ringGeometry args={[2.2, 2.24, 64]} />
        <meshBasicMaterial color="#00b4d8" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring3}>
        <ringGeometry args={[3.1, 3.15, 6]} />
        <meshBasicMaterial color="#4ef2e0" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Crosshairs */}
      <mesh>
        <planeGeometry args={[6.6, 0.02]} />
        <meshBasicMaterial color="#00ffe7" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[6.6, 0.02]} />
        <meshBasicMaterial color="#00ffe7" transparent opacity={0.3} />
      </mesh>

      {/* Radar Rotating Beam */}
      <group ref={radarSweep}>
        <mesh position={[1.5, 0, 0.02]}>
          <planeGeometry args={[3, 0.06]} />
          <meshBasicMaterial color="#00ffe7" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1.5, -0.4, 0.01]} rotation={[0, 0, -0.3]}>
          <planeGeometry args={[2.8, 0.8]} />
          <meshBasicMaterial color="#00ffe7" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Central Core */}
      <mesh>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#00ffe7" />
      </mesh>
    </group>
  );
}

/* ─── Active Threat Targets ─── */
function ThreatTargets() {
  const targets = useMemo(() => [
    { x: 1.6, y: 1.2, label: "Trojan", danger: true },
    { x: -1.9, y: 0.8, label: "Credential Trap", danger: true },
    { x: 1.2, y: -1.8, label: "Spoofed DNS", danger: true },
    { x: -1.1, y: -1.4, label: "Clean Node", danger: false },
    { x: 2.2, y: -0.5, label: "Zero-Day Exploit", danger: true },
    { x: -2.3, y: -1.8, label: "Benign Host", danger: false },
  ], []);

  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const pulse = 1 + Math.sin(t * 3 + i) * 0.25;
        child.scale.set(pulse, pulse, 1);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {targets.map((tgt, i) => (
        <group key={i} position={[tgt.x, tgt.y, 0.05]}>
          {/* Target Ring */}
          <mesh>
            <ringGeometry args={[0.12, 0.16, 16]} />
            <meshBasicMaterial color={tgt.danger ? "#ff5252" : "#00ff88"} />
          </mesh>
          {/* Target Center */}
          <mesh>
            <circleGeometry args={[0.06, 16]} />
            <meshBasicMaterial color={tgt.danger ? "#ff1744" : "#00e676"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function CyberUniverse() {
  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#03161b"]} />

        <CyberRadar />
        <ThreatTargets />

        <Sparkles count={80} size={1.5} scale={8} speed={0.2} color="#00ffe7" />
      </Canvas>
    </div>
  );
}
