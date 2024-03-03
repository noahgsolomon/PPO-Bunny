import { RigidBody } from "@react-three/rapier";

export default function Walls({ length = 1 }) {
  return (
    <>
      <RigidBody type="fixed">
        <mesh position={[-2 - 0.5 * 0.2, 1.25, ((length - 1) / 2) * 4]}>
          <boxGeometry args={[0.2, 2.5 + 0.2 * 2, 4 * length]} />
          <meshStandardMaterial color={"mediumpurple"} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[2 + 0.5 * 0.2, 1.25, ((length - 1) / 2) * 4]}>
          <boxGeometry args={[0.2, 2.5 + 0.2 * 2, 4 * length]} />
          <meshStandardMaterial color={"mediumpurple"} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[0, 1.25, length * 4 - 2 + 0.1]}>
          <boxGeometry args={[4 + 0.2 * 2, 2.5 + 0.2 * 2, 0.2]} />
          <meshStandardMaterial color={"mediumpurple"} />
        </mesh>
      </RigidBody>
    </>
  );
}
