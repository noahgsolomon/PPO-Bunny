import {
  useGLTF,
  OrbitControls,
  useTexture,
  Sparkles,
  shaderMaterial,
} from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import portalVertexShader from "./shaders/portal/vertex.glsl";
import portalFragmentShader from "./shaders/portal/fragment.glsl";
import { Color } from "three";
import { useRef } from "react";

const PortalMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new Color("#ffffff"),
    uColorEnd: new Color("#000000"),
  },
  portalVertexShader,
  portalFragmentShader
);

extend({ PortalMaterial });

export default function Experience() {
  const portalRef = useRef();

  const { nodes } = useGLTF("./model/portalmerged.glb");

  const bakedTexture = useTexture("./model/baked.jpg");

  useFrame((state, delta) => {
    portalRef.current.uTime += delta;
  });

  return (
    <>
      <color args={["#030202"]} attach={"background"} />
      <OrbitControls makeDefault />

      <mesh geometry={nodes.baked.geometry}>
        <meshBasicMaterial map={bakedTexture} map-flipY={false} />
      </mesh>
      <mesh
        position={nodes.poleLightA.position}
        geometry={nodes.poleLightA.geometry}
      ></mesh>
      <mesh
        position={nodes.poleLightB.position}
        rotation={nodes.poleLightB.rotation}
        geometry={nodes.poleLightB.geometry}
      ></mesh>
      <mesh
        position={nodes.portalLight.position}
        rotation={nodes.portalLight.rotation}
        geometry={nodes.portalLight.geometry}
      >
        <portalMaterial ref={portalRef} />
      </mesh>

      <Sparkles
        count={40}
        size={6}
        scale={[4, 2, 4]}
        speed={0.2}
        position-y={1.4}
      />
    </>
  );
}
