import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useRef } from "react";

export default function Shield3D() {
  const group = useRef();
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * .13 + state.pointer.x * .16;
    group.current.rotation.x = state.pointer.y * .07;
  });
  return <group ref={group} position={[2.15, .05, 0]} rotation={[0, -.3, 0]}><Float speed={1.15} rotationIntensity={.2} floatIntensity={.35}><mesh scale={[1.05, 1.27, .38]}><icosahedronGeometry args={[1, 3]} /><MeshDistortMaterial color="#42d9d1" emissive="#0d7476" emissiveIntensity={1.55} roughness={.16} metalness={.85} distort={.1} speed={1.2} transparent opacity={.91} /></mesh><mesh scale={[1.2, 1.43, .46]}><icosahedronGeometry args={[1, 2]} /><meshBasicMaterial color="#71fff4" wireframe transparent opacity={.22} /></mesh><mesh position={[0, 0, .43]} scale={[.46, .58, .16]}><icosahedronGeometry args={[1, 2]} /><meshBasicMaterial color="#f2ffff" wireframe transparent opacity={.8} /></mesh></Float><Sparkles count={130} scale={[4.2, 4.2, 2.5]} size={1.8} speed={.3} color="#75fff5" /></group>;
}
