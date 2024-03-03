import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import { useRef } from "react";

export default function Player() {
  const [subscribeKeys, getKeys] = useKeyboardControls();

  const body = useRef();

  useFrame((state, delta) => {
    const { forward, leftward, rightward, backward, jump } = getKeys();

    const impulseStrength = 1 * delta;
    const torqueStrength = 1 * delta;

    const impulse = { x: 0, y: jump ? 0.1 : 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    if (forward) {
      impulse.z += impulseStrength;
    }
    if (backward) {
      impulse.z -= impulseStrength;
    }
    if (rightward) {
      impulse.x -= impulseStrength;
    }
    if (leftward) {
      impulse.x += impulseStrength;
    }

    body.current.applyImpulse(impulse);
    body.current.applyTorqueImpulse(torque);
  });
  return (
    <>
      <RigidBody
        ref={body}
        canSleep={false}
        friction={1}
        restitution={0.2}
        position={[0, 1, 0]}
        colliders="hull"
      >
        <mesh>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial flatShading color={"blue"} />
        </mesh>
      </RigidBody>
    </>
  );
}
