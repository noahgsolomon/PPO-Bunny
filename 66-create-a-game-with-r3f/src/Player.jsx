import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier } from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import useGame from "./stores/useGame";

export default function Player() {
  const [subscribeKeys, getKeys] = useKeyboardControls();

  const { rapier, world } = useRapier();

  const body = useRef();

  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const blockCount = useGame((state) => state.blockCount);
  const restart = useGame((state) => state.restart);

  const reset = () => {
    body.current.setTranslation({ x: 0, y: 1, z: 0 });
    body.current.setLinvel({ x: 0, y: 0, z: 0 });
    body.current.setAngvel({ x: 0, y: 0, z: 0 });
  };

  const [smoothCameraPosition] = useState(() => new Vector3(0, 10, -10));
  const [smoothCameraTarget] = useState(() => new Vector3());

  const jump = () => {
    const origin = body.current.translation();
    origin.y -= 0.31;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);
    if (hit.toi < 0.15) {
      body.current.applyImpulse({ x: 0, y: 0.5, z: 0 });
    }
  };

  useEffect(() => {
    const unsubscribeJump = subscribeKeys(
      (state) => state.jump,
      (value) => value && jump()
    );
    const unsubscribeAny = subscribeKeys(() => {
      start();
    });
    const unsubscribePhase = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === "ready") {
          reset();
        }
      }
    );
    return () => {
      unsubscribeJump();
      unsubscribeAny();
      unsubscribePhase();
    };
  }, []);

  useFrame((state, delta) => {
    const { forward, leftward, rightward, backward, jump } = getKeys();

    const impulseStrength = 0.5 * delta;
    const torqueStrength = 0.1 * delta;

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    if (forward) {
      impulse.z += impulseStrength;
      torque.x += torqueStrength;
    }
    if (backward) {
      impulse.z -= impulseStrength;
      torque.x -= torqueStrength;
    }
    if (leftward) {
      impulse.x += impulseStrength;
      torque.z -= torqueStrength;
    }
    if (rightward) {
      impulse.x -= impulseStrength;
      torque.z += torqueStrength;
    }

    body.current.applyImpulse(impulse);
    body.current.applyTorqueImpulse(torque);

    const bodyPosition = body.current.translation();

    const cameraPosition = new Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.z -= 2.25;
    cameraPosition.y += 0.65;

    const cameraTarget = new Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.25;

    smoothCameraPosition.lerp(cameraPosition, 5 * delta);
    smoothCameraTarget.lerp(cameraTarget, 5 * delta);

    state.camera.position.copy(smoothCameraPosition);
    state.camera.lookAt(smoothCameraTarget);

    if (bodyPosition.z >= blockCount * 4 + 2) {
      end();
    }
    if (bodyPosition.y < -4) {
      restart("falling");
    }
  });
  return (
    <>
      <RigidBody
        ref={body}
        canSleep={false}
        friction={1}
        restitution={0.2}
        linearDamping={0.5}
        angularDamping={0.5}
        position={[0, 1, 0]}
        colliders="ball"
      >
        <mesh castShadow>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial flatShading color={"blue"} />
        </mesh>
      </RigidBody>
    </>
  );
}
