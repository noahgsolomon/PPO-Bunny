import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { Physics, RigidBody } from "@react-three/rapier";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Euler, Quaternion } from "three";

export default function Experience() {
  const cube = useRef();

  const cubeJump = () => {
    cube.current.applyImpulse({ x: 0, y: 5, z: 0 }, true);
    // cube.current.applyTorqueImpulse(
    //   { x: Math.random(), y: Math.random(), z: Math.random() },
    //   true
    // );
  };

  const sphere = useRef();

  const sphereJump = () => {
    sphere.current.applyImpulse({ x: 0, y: 3, z: 0 }, true);
    sphere.current.applyTorqueImpulse(
      { x: Math.random(), y: Math.random(), z: Math.random() },
      true
    );
  };

  const twister = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const eulerRotation = new Euler(0, time, 0);
    const quaternionRotation = new Quaternion();
    quaternionRotation.setFromEuler(eulerRotation);
    twister.current.setNextKinematicRotation(quaternionRotation);

    const angle = time * 0.5;
    const x = Math.cos(angle) * 2;
    const z = Math.sin(angle) * 2;
    twister.current.setNextKinematicTranslation({ x, y: -0.8, z });
  });

  const twisterMesh = useRef();

  const [hitSound] = useState(() => new Audio("./hit.mp3"));

  return (
    <>
      <Perf position="top-left" />

      <OrbitControls makeDefault />

      <directionalLight castShadow position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />

      <Physics>
        <RigidBody mass={10000} ref={sphere} colliders={"ball"}>
          <mesh position-x={-2} onClick={sphereJump} castShadow position-y={2}>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
          </mesh>
        </RigidBody>

        <RigidBody ref={cube}>
          <mesh onClick={cubeJump} castShadow position-y={2} position-x={2}>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
          </mesh>
        </RigidBody>

        {/* <RigidBody colliders="trimesh">
          <mesh position-y={0} rotation-y={0.1} rotation-x={Math.PI * 0.5}>
            <torusGeometry />
            <meshStandardMaterial color={"mediumpurple"} />
          </mesh>
        </RigidBody> */}

        <RigidBody restitution={0.6} type="fixed">
          <mesh receiveShadow position-y={-1.25}>
            <boxGeometry args={[10, 0.5, 10]} />
            <meshStandardMaterial color="greenyellow" />
          </mesh>
        </RigidBody>

        <RigidBody
          onCollisionEnter={(e) => {
            hitSound.currentTime = 0;
            hitSound.volume = Math.random();
            hitSound.play();
            const hitColor = e.rigidBodyObject.children[0].material.color;
            twisterMesh.current.material.color.r = hitColor.r;
            twisterMesh.current.material.color.g = hitColor.g;
            twisterMesh.current.material.color.b = hitColor.b;
          }}
          onCollisionExit={() => {
            twisterMesh.current.material.color.set("red");
          }}
          ref={twister}
          type="kinematicPosition"
          position={[0, -0.8, 0]}
          friction={0}
        >
          <mesh ref={twisterMesh} castShadow scale={[0.4, 0.4, 3]}>
            <boxGeometry />
            <meshStandardMaterial color="red" />
          </mesh>
        </RigidBody>
      </Physics>
    </>
  );
}
