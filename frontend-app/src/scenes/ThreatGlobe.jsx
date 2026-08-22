import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Convert latitude and longitude to 3D Cartesian coordinates on sphere radius R
function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate quadratic Bezier curve points connecting two spherical coordinates with an elevated midpoint
function createArcPoints(v1, v2, elevation = 0.5, segments = 32) {
  const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
  const distance = v1.distanceTo(v2);
  mid.normalize().multiplyScalar(v1.length() + distance * elevation);
  const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
  return curve.getPoints(segments);
}

function AttackArc({ start, end, color = "#ff3b5c", speed = 1 }) {
  const points = useMemo(() => {
    return createArcPoints(start, end, 0.4, 40);
  }, [start, end]);

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  const pulseRef = useRef();

  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const t = (clock.elapsedTime * speed) % 1;
      const index = Math.floor(t * (points.length - 1));
      const pos = points[index] || points[0];
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      <line geometry={lineGeo}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </line>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial
          color={color}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function GlobeInner({ radius = 2.2 }) {
  const globeGroupRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();
  const scanBeamRef = useRef();

  // Cyber threat locations
  const locations = useMemo(() => [
    { name: "US-East", lat: 37.77, lon: -122.41, type: "phishing", color: "#ff3b5c" },
    { name: "EU-West", lat: 51.50, lon: -0.12, type: "suspicious", color: "#ffb020" },
    { name: "AP-East", lat: 35.67, lon: 139.65, type: "phishing", color: "#ff3b5c" },
    { name: "SA-East", lat: -23.55, lon: -46.63, type: "safe", color: "#00e676" },
    { name: "AP-South", lat: 1.35, lon: 103.81, type: "suspicious", color: "#ffb020" },
    { name: "EU-Central", lat: 50.11, lon: 8.68, type: "safe", color: "#00e5ff" },
    { name: "US-West", lat: 40.71, lon: -74.00, type: "phishing", color: "#ff3b5c" },
    { name: "AP-SE", lat: -33.86, lon: 151.20, type: "safe", color: "#00e676" },
  ], []);

  const nodes = useMemo(() => {
    return locations.map((loc) => ({
      ...loc,
      pos: latLongToVector3(loc.lat, loc.lon, radius),
    }));
  }, [locations, radius]);

  // Attack routes
  const routes = useMemo(() => [
    { from: nodes[0].pos, to: nodes[1].pos, color: "#ff3b5c", speed: 0.8 },
    { from: nodes[2].pos, to: nodes[5].pos, color: "#ff3b5c", speed: 0.6 },
    { from: nodes[6].pos, to: nodes[4].pos, color: "#ffb020", speed: 0.7 },
    { from: nodes[1].pos, to: nodes[3].pos, color: "#00e5ff", speed: 0.5 },
  ], [nodes]);

  // Point cloud for globe surface
  const surfacePoints = useMemo(() => {
    const pts = [];
    const count = 480;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [radius]);

  const pointsGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(surfacePoints);
  }, [surfacePoints]);

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;

    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y = t * 0.12;
      globeGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        globeGroupRef.current.rotation.x,
        -pointer.y * 0.25,
        0.05
      );
    }

    if (ringRef1.current) {
      ringRef1.current.rotation.z = t * 0.15;
      ringRef1.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.2) * 0.1;
    }

    if (ringRef2.current) {
      ringRef2.current.rotation.z = -t * 0.2;
    }

    if (scanBeamRef.current) {
      scanBeamRef.current.position.y = Math.sin(t * 1.2) * (radius * 0.95);
    }
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <group ref={globeGroupRef}>
          {/* Inner Dark Holographic Sphere */}
          <mesh>
            <sphereGeometry args={[radius * 0.98, 32, 32]} />
            <meshBasicMaterial
              color="#041226"
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Wireframe Matrix Globe */}
          <mesh>
            <sphereGeometry args={[radius, 24, 18]} />
            <meshBasicMaterial
              color="#00e5ff"
              wireframe
              transparent
              opacity={0.18}
            />
          </mesh>

          {/* Surface Coordinate Point Cloud */}
          <points geometry={pointsGeo}>
            <pointsMaterial
              size={0.035}
              color="#4ef2e0"
              transparent
              opacity={0.65}
              blending={THREE.AdditiveBlending}
            />
          </points>

          {/* Scanning Latitude Slice */}
          <mesh ref={scanBeamRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, radius * 1.02, 32]} />
            <meshBasicMaterial
              color="#00e5ff"
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Threat Nodes */}
          {nodes.map((n, i) => (
            <group key={i} position={n.pos}>
              <mesh>
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshBasicMaterial color={n.color} />
              </mesh>
              <mesh>
                <ringGeometry args={[0.09, 0.12, 16]} />
                <meshBasicMaterial
                  color={n.color}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            </group>
          ))}

          {/* Cyber Attack Trajectory Arcs */}
          {routes.map((r, i) => (
            <AttackArc
              key={i}
              start={r.from}
              end={r.to}
              color={r.color}
              speed={r.speed}
            />
          ))}
        </group>

        {/* Outer Orbital Telemetry Rings */}
        <mesh ref={ringRef1}>
          <ringGeometry args={[radius * 1.25, radius * 1.27, 48]} />
          <meshBasicMaterial
            color="#7c3aed"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh ref={ringRef2} rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[radius * 1.35, radius * 1.37, 6]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function ThreatGlobeCanvas({ height = 360, interactive = true }) {
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
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[4, 3, 4]} intensity={2.5} color="#00e5ff" />
        <pointLight position={[-4, -3, 3]} intensity={1.8} color="#7c3aed" />

        <GlobeInner radius={2.0} />
      </Canvas>
    </div>
  );
}