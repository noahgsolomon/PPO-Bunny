import { OrbitControls, Float } from "@react-three/drei";
import { Perf } from "r3f-perf";
import React from "react";

export default function Experience() {
  return (
    <>
      <Perf position="top-left" />
      {/* <BakeShadows /> */}
      {/* <SoftShadows size={25} samples={10} focus={10} /> */}
      <OrbitControls makeDefault />

      <mesh position-x={-2}>
        <sphereGeometry />
        <meshNormalMaterial />
      </mesh>

      <Float>
        <mesh position-x={2} scale={1.5}>
          <boxGeometry />
          <meshNormalMaterial />
        </mesh>
      </Float>

      <mesh
        receiveShadow
        position-y={-1}
        rotation-x={-Math.PI * 0.5}
        scale={10}
      >
        <planeGeometry />
        <meshNormalMaterial />
      </mesh>
    </>
  );
}
