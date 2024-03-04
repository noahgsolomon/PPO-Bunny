import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { Euler, Quaternion } from "three";
import { BoxGeometry, MeshStandardMaterial } from "three";

const boxGeometry = new BoxGeometry(1, 1, 1);

const floor2Material = new MeshStandardMaterial({ color: "greenyellow" });
const obstacleMaterial = new MeshStandardMaterial({ color: "orangered" });
const wallMaterial = new MeshStandardMaterial({ color: "slategrey" });

export function BlockSpinner({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const randomVal = (Math.random() - 0.5) * 2;
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const rotation = new Quaternion();
    rotation.setFromEuler(new Euler(0, time * randomVal, 0));
    obstacle.current.setNextKinematicRotation(rotation);
  });
  return (
    <group position={position}>
      <mesh
        receiveShadow
        scale={[4, 0.2, 4]}
        geometry={boxGeometry}
        material={floor2Material}
        position-y={-0.1}
      ></mesh>
      <RigidBody
        ref={obstacle}
        restitution={0.2}
        friction={0}
        type="kinematicPosition"
      >
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          scale={[3.5, 0.3, 0.3]}
          position={[0, 0.3, 0]}
          castShadow
          receiveShadow
        ></mesh>
      </RigidBody>
    </group>
  );
}

export function BlockLimbo({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const randomVal = (Math.random() - 0.5) * 10;
  const initial = Math.sin(Math.random() * 2 * Math.PI);
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    obstacle.current.setNextKinematicTranslation({
      x: position[0],
      y: position[1] + (Math.sin((time + initial) * randomVal) + 0.9) * 1.2,
      z: position[2],
    });
  });
  return (
    <group position={position}>
      <mesh
        receiveShadow
        scale={[4, 0.2, 4]}
        geometry={boxGeometry}
        material={floor2Material}
        position-y={-0.1}
      ></mesh>
      <RigidBody
        ref={obstacle}
        restitution={0.2}
        friction={0}
        type="kinematicPosition"
      >
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          scale={[3.5, 0.3, 0.3]}
          position={[0, 0.3, 0]}
          castShadow
          receiveShadow
        ></mesh>
      </RigidBody>
    </group>
  );
}

export function BlockAxe({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const randomVal = (Math.random() - 0.5) * 10;
  const initial = Math.sin(Math.random() * 2 * Math.PI);
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    obstacle.current.setNextKinematicTranslation({
      x: position[0] + Math.sin((time + initial) * randomVal) * 1.15,
      y: position[1] + 0.775,
      z: position[2],
    });
  });
  return (
    <group position={position}>
      <mesh
        receiveShadow
        scale={[4, 0.2, 4]}
        geometry={boxGeometry}
        material={floor2Material}
        position-y={-0.1}
      ></mesh>
      <RigidBody
        ref={obstacle}
        restitution={0.2}
        friction={0}
        type="kinematicPosition"
      >
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          scale={[1.5, 1.5, 0.3]}
          position={[0, 0.0, 0]}
          castShadow
          receiveShadow
        ></mesh>
      </RigidBody>
    </group>
  );
}
