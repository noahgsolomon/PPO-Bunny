import { useGLTF } from '@react-three/drei'
import { GroupProps, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Mesh } from 'three'

export default function Cloud({ opacity, ...props }: { opacity: number } & GroupProps) {
  const { nodes, materials } = useGLTF('/models/cloud.glb')

  return (
    <group {...props} dispose={null}>
      <mesh geometry={(nodes.Node as Mesh).geometry}>
        <meshStandardMaterial {...materials['lambert2SG.001']} transparent opacity={opacity} />
      </mesh>
    </group>
  )
}

useGLTF.preload('/models/cloud.glb')
