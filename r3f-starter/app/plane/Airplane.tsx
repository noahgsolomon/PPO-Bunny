import { useGLTF } from '@react-three/drei'
import { GroupProps, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Mesh } from 'three'

export default function Airplane(props: GroupProps) {
  const { nodes, materials } = useGLTF('/models/airplane.glb')

  const propeller = useRef<Mesh>()

  useFrame((_, delta) => {
    propeller.current.rotation.x += delta * 6
  })

  return (
    <group {...props} dispose={null}>
      <mesh geometry={(nodes.PUSHILIN_Plane_Circle000 as Mesh).geometry} material={materials.plane} />
      <mesh
        ref={propeller}
        geometry={(nodes.PUSHILIN_Plane_Helix as Mesh).geometry}
        material={materials.plane}
        position={[1.09, 0.23, 0]}
      />
    </group>
  )
}

useGLTF.preload('/models/airplane.glb')
