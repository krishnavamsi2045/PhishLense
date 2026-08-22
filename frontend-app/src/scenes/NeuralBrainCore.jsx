import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function NeuralNetworkCore({ active = true, threatLevel = "low" }) {
  const groupRef = useRef();
  const ringRef = useRef();

  // Generate synapsing 3D neural cluster nodes resembling brain hemispheres
  const { nodePoints, connections } = useMemo(() => {
    const pts = [];
    const conns = [];
    const count = 56;

    for (let i = 0; i < count; i++) {
      // Create bilateral hemisphere clusters
      const side = i % 2 === 0 ? 1 : -1;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 1.3;
      const sinPhi = Math.sin(phi);

      const x = r * sinPhi * Math.cos(theta) * 1.1 + side * 0.45;
      const y = r * sinPhi * Math.sin(theta) * 0.9 + 0.1;
      const z = r * Math.cos(phi) * 0.95;

      pts.push(new THREE.Vector3(x, y, z));
    }

    // Connect nearby nodes
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (pts[i].distanceTo(pts[j]) < 0.95) {
          conns.push(pts[i]);
          conns.push(pts[j]);
        }
      }
    }

    return { nodePoints: pts, connections: conns };
  }, []);

  const linesGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(connections);
    return geo;
  }, [connections]);

  const nodesGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(nodePoints);
    return geo;
  }, [nodePoints]);

  let coreColor = "#00e5ff";
  let synapseColor = "#7c3aed";
  if (threatLevel === "high") {
    coreColor = "#ff3b5c";
    synapseColor = "#ffb020";
  } else if (threatLevel === "medium") {
    coreColor = "#ffb020";
    synapseColor = "#00e5ff";
  }

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.25;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -pointer.y * 0.2,
        0.05
      );
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Neural Synapse Pathways */}
        <lineSegments geometry={linesGeo}>
          <lineBasicMaterial
            color={synapseColor}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>

        {/* Neural Firing Nodes */}
        <points geometry={nodesGeo}>
          <pointsMaterial
            size={0.06}
            color={coreColor}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Central Pulsating Quantum Core */}
        <mesh scale={0.5}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={coreColor}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Horizontal Processing Ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.7, 1.74, 32]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function NeuralBrainCore({
  height = 280,
  active = true,
  threatLevel = "low",
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
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 3]} intensity={2} color="#00e5ff" />
        <pointLight position={[-3, -2, 2]} intensity={1.5} color="#7c3aed" />

        <NeuralNetworkCore active={active} threatLevel={threatLevel} />
      </Canvas>
    </div>
  );
}
