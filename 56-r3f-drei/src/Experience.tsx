import { useThree } from "@react-three/fiber";
import React, { useRef } from "react";
import {
  OrbitControls,
  Float,
  PivotControls,
  Html,
  Text,
  MeshReflectorMaterial,
} from "@react-three/drei";

export default function Experience() {
  const { camera, gl } = useThree();

  return (
    <>
      <OrbitControls makeDefault args={[camera, gl.domElement]} />

      <directionalLight position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />

      <PivotControls depthTest={false} anchor={[0, 0, 0]}>
        <mesh position-x={-2}>
          <sphereGeometry />
          <meshStandardMaterial color="orange" />
          <Html
            distanceFactor={8}
            center
            position={[1, 2, 2]}
            wrapperClass="label"
          >
            si
          </Html>
        </mesh>
      </PivotControls>

      <Float>
        <mesh position-x={2} scale={1.5}>
          <boxGeometry />
          <meshStandardMaterial color="mediumpurple" />
        </mesh>
      </Float>

      <mesh position-y={-1} rotation-x={-Math.PI * 0.5} scale={10}>
        <planeGeometry />
        <MeshReflectorMaterial
          resolution={1024}
          blur={[1000, 1000]}
          mixBlur={0.8}
          mirror={0.2}
        />
      </mesh>
      <Text color="black" font="krypton.otf">
        sup
      </Text>
    </>
  );
}
