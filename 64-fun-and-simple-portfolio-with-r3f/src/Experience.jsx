import {
  ContactShadows,
  Environment,
  Float,
  Html,
  PresentationControls,
  useGLTF,
  Text,
} from "@react-three/drei";

export default function Experience() {
  const macbook = useGLTF("./model.gltf");

  return (
    <>
      <ContactShadows opacity={0.4} scale={5} blur={2.4} position-y={-1.4} />
      <color attach="background" args={["#000a1a"]} />
      <Environment preset="city" />

      <PresentationControls
        polar={[-0.4, 0.2]}
        rotation={[0.13, 0.1, 0]}
        azimuth={[-1, 0.75]}
        global
        config={{ mass: 2, tension: 400 }}
        snap
      >
        <Float rotationIntensity={0.4}>
          <rectAreaLight
            width={2.5}
            height={1.6}
            intensity={65}
            color={"#000099"}
            position={[0, 0.55, -1.15]}
            rotation={[0.1, Math.PI, 0]}
          />
          <primitive position-y={-1.2} object={macbook.scene}>
            <Html
              position={[0, 1.53, -1.4]}
              distanceFactor={1.0}
              wrapperClass="htmlScreen"
              transform
              rotation-x={-0.256}
            >
              <iframe src="https://noahgsolomon.com"></iframe>
            </Html>
          </primitive>
          <Text
            position={[2, 0.75, 0.75]}
            font="./bangers-v20-latin-regular.woff"
            fontSize={0.7}
            rotation-y={-1.25}
            maxWidth={2}
            textAlign="center"
          >
            Noah Solomon
          </Text>
        </Float>
      </PresentationControls>
    </>
  );
}
