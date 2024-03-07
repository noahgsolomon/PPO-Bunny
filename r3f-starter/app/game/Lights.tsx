import { useHelper } from '@react-three/drei'
import { useRef } from 'react'
import { DirectionalLightHelper } from 'three'

export default function Lights() {
  return (
    <>
      <directionalLight intensity={2.5} position={[-10, 5, 0]} color={'#ffffff'} />
      <ambientLight intensity={1.5} />
    </>
  )
}
