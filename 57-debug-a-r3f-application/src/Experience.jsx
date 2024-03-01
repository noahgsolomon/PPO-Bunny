import { OrbitControls } from "@react-three/drei";
import { useControls, button } from "leva";
import { Perf } from "r3f-perf";

export default function Experience() {
  const { position, color, visible } = useControls("sphere", {
    position: {
      value: { x: -2, y: 0 },
      min: -10,
      max: 10,
      step: 0.01,
      joystick: "invertY",
    },
    color: "#ff0000",
    visible: true,
    clickMe: button(() => 1),
    choice: { options: [1, 2, 3] },
  });

  const {
    position: positionCube,
    color: colorCube,
    visible: visibleCube,
    scale: scaleCube,
  } = useControls("cube", {
    position: {
      value: { x: 2, y: 0 },
      min: -10,
      max: 10,
      step: 0.01,
      joystick: "invertY",
    },
    scale: { value: 1, min: 0.1, max: 10, step: 0.01 },
    color: "#ff0000",
    visible: true,
    clickMe: button(() => 1),
    choice: { options: [1, 2, 3] },
  });

  const { perfVisible } = useControls({
    perfVisible: true,
  });

  return (
    <>
      {perfVisible && <Perf position={"top-left"} />}
      <OrbitControls makeDefault />

      <directionalLight position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />

      <mesh visible={visible} position={[position.x, position.y, 0]}>
        <sphereGeometry />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh
        visible={visibleCube}
        position={[positionCube.x, positionCube.y, 0]}
        scale={scaleCube}
      >
        <boxGeometry />
        <meshStandardMaterial color={colorCube} />
      </mesh>

      <mesh position-y={-1} rotation-x={-Math.PI * 0.5} scale={10}>
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh>
    </>
  );
}
