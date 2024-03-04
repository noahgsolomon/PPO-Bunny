import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";

export default function Experience() {
  const cube = useRef();

  useFrame((state, delta) => {
    cube.current.rotation.y += delta * 0.2;
  });

  return (
    <>
      <OrbitControls makeDefault />

      <directionalLight position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />

      <mesh
        onClick={(e) => {
          document.body.style.cursor = "pointer";
          e.stopPropagation();
        }}
        onPointerEnter={(e) => {
          document.body.style.cursor = "pointer";
          e.stopPropagation();
        }}
        onPointerLeave={(e) => {
          document.body.style.cursor = "default";
          e.stopPropagation();
        }}
        position-x={-2}
      >
        <sphereGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh
        onPointerEnter={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          cube.current.material.color.set(
            cube.current.material.color.set(
              cube.current.material.color.r * 0.9,
              cube.current.material.color.g * 0.9,
              cube.current.material.color.b * 0.9
            )
          );
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "default";
          cube.current.material.color.set(
            cube.current.material.color.set(
              cube.current.material.color.r * 1.1111,
              cube.current.material.color.g * 1.1111,
              cube.current.material.color.b * 1.1111
            )
          );
        }}
        onClick={(e) => {
          e.stopPropagation();
          cube.current.material.color.set(
            `hsl(${Math.random() * 360}, 100%, 75%)`
          );
        }}
        ref={cube}
        position-x={2}
        scale={1.5}
      >
        <boxGeometry />
        <meshStandardMaterial color="mediumpurple" />
      </mesh>

      <mesh position-y={-1} rotation-x={-Math.PI * 0.5} scale={10}>
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh>
    </>
  );
}
