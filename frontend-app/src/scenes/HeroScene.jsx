import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/* ─── Cyber Hexagonal Defense Shield ─── */
function CyberShield() {
  const meshRef = useRef();
  const outerRingRef = useRef();
  const innerHexRef = useRef();
  const radarRef = useRef();

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    
    // Gentle floating tilt tracking mouse subtly
    if (meshRef.current) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, pointer.x * 0.35, 0.05);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -pointer.y * 0.25, 0.05);
    }

    // Outer cyber defense ring rotation
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.2;
    }

    // Inner hex shield pulsation
    if (innerHexRef.current) {
      innerHexRef.current.rotation.z = -t * 0.15;
      const s = 1 + Math.sin(t * 2) * 0.04;
      innerHexRef.current.scale.set(s, s, s);
    }

    // Radar laser sweep
    if (radarRef.current) {
      radarRef.current.rotation.z = t * 1.5;
    }
  });

  return (
    <group ref={meshRef} position={[2.2, 0, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        
        {/* Central Glowing Cyber Crystal/Shield */}
        <mesh>
          <octahedronGeometry args={[1.3, 0]} />
          <meshStandardMaterial
            color="#00ffe7"
            emissive="#00ffe7"
            emissiveIntensity={1.8}
            wireframe
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Inner Solid Core */}
        <mesh scale={0.65}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#09353e"
            emissive="#00b4d8"
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Hexagonal Target Shield Ring */}
        <mesh ref={innerHexRef}>
          <ringGeometry args={[1.8, 1.88, 6]} />
          <meshBasicMaterial color="#4ef2e0" side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>

        {/* Secondary High-Tech Outer Ring with Dashes */}
        <mesh ref={outerRingRef}>
          <ringGeometry args={[2.3, 2.36, 32]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>

        {/* Radar Scanner Line */}
        <group ref={radarRef}>
          <mesh position={[0, 1.15, 0.05]}>
            <planeGeometry args={[0.04, 2.3]} />
            <meshBasicMaterial
              color="#00ffe7"
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* 4 Corner Defense Nodes */}
        {[-1.8, 1.8].map((x, i) =>
          [-1.8, 1.8].map((y, j) => (
            <group key={`${i}-${j}`} position={[x, y, 0]}>
              <mesh>
                <boxGeometry args={[0.15, 0.15, 0.15]} />
                <meshBasicMaterial color="#4ef2e0" wireframe />
              </mesh>
            </group>
          ))
        )}

      </Float>
    </group>
  );
}

/* ─── Neural Cyber Nodes Grid ─── */
function CyberNodes({ count = 28 }) {
  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 6 - 2,
        size: 0.04 + Math.random() * 0.06,
        pulseSpeed: 1 + Math.random() * 2,
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
      const s = 1 + Math.sin(t * n.pulseSpeed) * 0.3;
      child.scale.set(s, s, s);
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh key={i} position={[n.x, n.y, n.z]}>
          <sphereGeometry args={[n.size, 8, 8]} />
          <meshBasicMaterial
            color={i % 4 === 0 ? "#ff5252" : i % 2 === 0 ? "#00ffe7" : "#4ef2e0"}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Holographic Matrix Floor ─── */
function MatrixGridFloor() {
  const gridRef = useRef();

  useFrame(({ clock }) => {
    if (gridRef.current) {
      gridRef.current.position.z = (clock.elapsedTime * 0.4) % 2;
    }
  });

  return (
    <group position={[0, -3.2, 0]} rotation={[-Math.PI / 2.3, 0, 0]}>
      <mesh ref={gridRef}>
        <planeGeometry args={[30, 30, 24, 24]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.07} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 50 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.6 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#03161b"]} />
        <fog attach="fog" args={["#03161b", 5, 18]} />

        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 4]} intensity={3} color="#00ffe7" />
        <pointLight position={[-4, -2, 2]} intensity={2} color="#0077b6" />

        {/* Clean, high-tech cyber defense elements */}
        <CyberShield />
        <CyberNodes />
        <MatrixGridFloor />

        {/* Lightweight cyber particles */}
        <Sparkles
          count={250}
          size={1.8}
          scale={16}
          speed={0.2}
          color="#00ffe7"
        />
      </Canvas>
    </div>
  );
}