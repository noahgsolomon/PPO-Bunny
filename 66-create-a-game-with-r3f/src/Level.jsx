import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";
import { useMemo, useRef } from "react";
import { BoxGeometry, Euler, MeshStandardMaterial, Quaternion } from "three";
import { BlockAxe, BlockLimbo, BlockSpinner } from "./Types";
import Walls from "./Walls";

const boxGeometry = new BoxGeometry(1, 1, 1);

const floor1Material = new MeshStandardMaterial({ color: "limegreen" });
const floor2Material = new MeshStandardMaterial({ color: "greenyellow" });
const obstacleMaterial = new MeshStandardMaterial({ color: "orangered" });
const wallMaterial = new MeshStandardMaterial({ color: "slategrey" });

function BlockStart({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh
        receiveShadow
        scale={[4, 0.2, 4]}
        geometry={boxGeometry}
        material={floor1Material}
        position-y={-0.1}
      ></mesh>
    </group>
  );
}

function BlockEnd({ position = [0, 0, 0] }) {
  const burger = useGLTF("./hamburger.glb");
  burger.scene.children.forEach((burg) => (burg.castShadow = true));
  return (
    <group position={position}>
      <mesh
        receiveShadow
        scale={[4, 0.2, 4]}
        geometry={boxGeometry}
        material={floor1Material}
      ></mesh>
      <RigidBody restitution={0.2} friction={0} colliders={"hull"} type="fixed">
        <primitive position-y={0.5} object={burger.scene} scale={0.15} />
      </RigidBody>
    </group>
  );
}

export default function Level({
  count = 5,
  types = [BlockSpinner, BlockAxe, BlockLimbo],
}) {
  const blocks = useMemo(() => {
    const blocks = [];
    for (let i = 0; i < count; i++) {
      blocks.push(
        types[parseInt(Math.round(Math.random() * (types.length - 1)))]
      );
    }
    return blocks;
  }, [count, types]);
  return (
    <>
      <Walls length={count + 2} />
      <BlockStart position={[0, 0, 0]} />
      {blocks.length > 1 &&
        blocks.map((Block, index) => (
          <Block key={index} position={[0, 0, (index + 1) * 4]} />
        ))}
      <BlockEnd position={[0, 0, (blocks.length + 1) * 4]} />
      <CuboidCollider
        restitution={0.2}
        friction={1}
        position={[0, -0.1, (count + 2 - 1) * 2]}
        args={[2, 0.1, 2 * (count + 2), 1]}
      />
    </>
  );
}
