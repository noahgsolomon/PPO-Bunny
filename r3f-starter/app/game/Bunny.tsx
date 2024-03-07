import { useGLTF } from '@react-three/drei'
import { PrimitiveProps } from '@react-three/fiber'

export default function Bunny() {
  const { scene } = useGLTF('./models/bunny.glb')

  return <primitive castShadow scale={0.25} object={scene} />
}

useGLTF.preload('./models/bunny.glb')
