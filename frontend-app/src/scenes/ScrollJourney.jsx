import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo } from "react";

/* ─── Animated DNA-like double helix representing threat analysis pipeline ─── */
function AnalysisHelix({ count = 40 }) {
  const group = useRef();

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.15;
    group.current.children.forEach((child, i) => {
      const t = clock.elapsedTime * 0.8 + i * 0.15;
      child.scale.setScalar(0.6 + Math.sin(t) * 0.3);
      if (child.material) {
        child.material.opacity = 0.4 + Math.sin(t * 0.5) * 0.3;
      }
    });
  });

  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 4;
      const y = (i / count) * 6 - 3;
      arr.push(
        { x: Math.cos(t) * 1.2, y, z: Math.sin(t) * 1.2, strand: 0 },
        { x: Math.cos(t + Math.PI) * 1.2, y, z: Math.sin(t + Math.PI) * 1.2, strand: 1 }
      );
    }
    return arr;
  }, [count]);

  return (
    <group ref={group}>
      {nodes.map((n, i) => (
        <mesh key={i} position={[n.x, n.y, n.z]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial
            color={n.strand === 0 ? "#4ef2e0" : "#00ffff"}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Floating analysis nodes ─── */
function FloatingNodes() {
  const nodes = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        pos: [
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
        ],
        size: 0.08 + Math.random() * 0.12,
        speed: 0.5 + Math.random(),
      })),
    []
  );

  return (
    <>
      {nodes.map((n, i) => (
        <Float key={i} speed={n.speed} rotationIntensity={0.3} floatIntensity={0.6}>
          <mesh position={n.pos}>
            <octahedronGeometry args={[n.size, 0]} />
            <meshBasicMaterial color="#4ef2e0" wireframe />
          </mesh>
        </Float>
      ))}
    </>
  );
}

export default function ScrollJourney() {
  return (
    <div
      style={{
        width: "100%",
        height: "350px",
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#03161b"]} />
        <fog attach="fog" args={["#03161b", 6, 16]} />

        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={2} color="#4ef2e0" />

        <AnalysisHelix />
        <FloatingNodes />
        <Sparkles count={80} size={1.2} scale={8} speed={0.2} color="#4ef2e0" />

        <EffectComposer>
          <Bloom intensity={0.8} luminanceThreshold={0.35} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
