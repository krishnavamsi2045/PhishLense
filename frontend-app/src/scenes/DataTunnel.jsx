import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/* ─── Animated tunnel rings that pulse outward ─── */
function TunnelRings({ count = 16 }) {
  const group = useRef();

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.children.forEach((ring, i) => {
      const t = (clock.elapsedTime * 0.4 + i * 0.3) % (count * 0.3);
      const scale = 0.3 + t * 0.6;
      ring.scale.set(scale, scale, scale);
      ring.material.opacity = Math.max(0, 0.6 - t * 0.15);
      ring.position.z = -t * 3;
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / count]}>
          <torusGeometry args={[2, 0.02, 8, 64]} />
          <meshBasicMaterial
            color="#4ef2e0"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Streaming data particles flying through tunnel ─── */
function StreamParticles({ count = 200 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.3 + Math.random() * 1.5;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = Math.sin(angle) * r;
      arr[i * 3 + 2] = Math.random() * -20;
    }
    return arr;
  }, [count]);

  const speeds = useMemo(
    () => Array.from({ length: count }, () => 2 + Math.random() * 4),
    [count]
  );

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 2] += speeds[i] * delta;
      if (pos.array[i * 3 + 2] > 2) {
        pos.array[i * 3 + 2] = -20;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#00ffff" size={0.05} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export default function DataTunnel() {
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
        camera={{ position: [0, 0, 4], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#03161b"]} />
        <fog attach="fog" args={["#03161b", 5, 22]} />

        <TunnelRings />
        <StreamParticles />
        <Sparkles count={100} size={1.5} scale={8} speed={0.3} color="#4ef2e0" />

        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.3} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
