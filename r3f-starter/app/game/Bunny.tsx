import React from 'react'
import { useGLTF } from '@react-three/drei'
import { Mesh } from 'three'
import { GroupProps } from '@react-three/fiber'

export default function Bunny(props: GroupProps) {
  const { nodes, materials } = useGLTF('/models/bunny.glb')
  return (
    <group scale={0.25} {...props} dispose={null}>
      <group position={[0, -0.5, 0]} scale={[1, 1.101, 0.738]}>
        <mesh geometry={(nodes.Cube as Mesh).geometry} material={materials.Hair} />
        <mesh geometry={(nodes.Cube_1 as Mesh).geometry} material={materials.InsideEar} />
        <mesh geometry={(nodes.Cube_2 as Mesh).geometry} material={materials.Eye} />
        <mesh geometry={(nodes.Cube_3 as Mesh).geometry} material={materials.Reflection} />
        <mesh geometry={(nodes.Cube_4 as Mesh).geometry} material={materials[' Nose']} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/bunny.glb')
