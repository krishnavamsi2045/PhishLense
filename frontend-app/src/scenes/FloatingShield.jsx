import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function FloatingShield() {
  const shield = useRef();

  useFrame((state) => {
    shield.current.rotation.y += 0.005;
    shield.current.position.y =
      Math.sin(state.clock.elapsedTime) * 0.2;
  });

  return (
    <mesh ref={shield}>
      <octahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial
        color="#00ffff"
        emissive="#00ffff"
        emissiveIntensity={2}
      />
    </mesh>
  );
}