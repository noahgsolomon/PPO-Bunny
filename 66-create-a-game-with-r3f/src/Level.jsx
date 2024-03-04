import { Float, useGLTF, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import {
  BoxGeometry,
  Color,
  Euler,
  MeshStandardMaterial,
  Quaternion,
} from "three";
import { BlockAxe, BlockLimbo, BlockSpinner } from "./Types";
import Walls from "./Walls";

const boxGeometry = new BoxGeometry(1, 1, 1);

const floor1Material = new MeshStandardMaterial({ color: "limegreen" });

function BlockStart({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <Float>
        <Text
          font="./bebas-neue-v9-latin-regular.woff"
          scale={0.4}
          maxWidth={0.25}
          lineHeight={0.75}
          textAlign="right"
          position={[0.75, 0.95, 1.9]}
          rotation-y={Math.PI}
        >
          Marble Race
          <meshBasicMaterial toneMapped={false} />
        </Text>
      </Float>
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

  const burgerRef = useRef();

  useFrame((_, delta) => {
    burgerRef.current.rotation.y += delta * 0.4;
  });

  return (
    <group position={position}>
      <mesh
        receiveShadow
        scale={[4, 0.2, 4]}
        geometry={boxGeometry}
        material={floor1Material}
      ></mesh>
      <RigidBody restitution={0.2} friction={0} colliders={"hull"} type="fixed">
        <primitive
          ref={burgerRef}
          position-y={0.5}
          object={burger.scene}
          scale={0.15}
        />
      </RigidBody>
    </group>
  );
}

export default function Level({
  count = 5,
  types = [BlockSpinner, BlockAxe, BlockLimbo],
  seed = 0,
}) {
  const blocks = useMemo(() => {
    const blocks = [];
    for (let i = 0; i < count; i++) {
      blocks.push(
        types[parseInt(Math.round(Math.random() * (types.length - 1)))]
      );
    }
    return blocks;
  }, [count, types, seed]);
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
