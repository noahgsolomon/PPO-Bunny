import React from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Stats, OrbitControls } from "@react-three/drei";
import Custom from "./Custom";

export default function Experience() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta;
    }
  });

  return (
    <>
      <OrbitControls enableDamping />
      <directionalLight position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.2} />
      <Custom />
      <group ref={groupRef}>
        <mesh scale={0.2} position-x={1}>
          <sphereGeometry />
          <meshStandardMaterial color={0xff0000} />
        </mesh>
        <mesh scale={0.2} position-x={0}>
          <torusKnotGeometry />
          <meshStandardMaterial color={0x0000ff} />
        </mesh>
      </group>

      <mesh position-y={-0.5} rotation-x={-Math.PI * 0.5} scale={10}>
        <planeGeometry />
        <meshStandardMaterial />
      </mesh>
    </>
  );
}
