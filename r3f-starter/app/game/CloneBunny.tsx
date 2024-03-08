import React from 'react'
import { useGLTF } from '@react-three/drei'
import { AdditiveBlending, Color, DoubleSide, Mesh, ShaderMaterial, Uniform } from 'three'
import { GroupProps, useFrame } from '@react-three/fiber'
import { vertex as HologramVertexShader } from './hologram/vertex'
import { fragment as HologramFragmentShader } from './hologram/fragment'

export default function CloneBunny(props: GroupProps) {
  const { nodes } = useGLTF('/models/clonebunny.glb')
  // const material = new MeshPhysicalMaterial({
  //   color: '#C5CDD8',
  //   transmission: 0.8,
  //   opacity: 0.8,
  //   transparent: true,
  //   roughness: 0.2,
  //   metalness: 0.1,
  //   side: 2,
  // })

  const material = new ShaderMaterial({
    vertexShader: HologramVertexShader,
    fragmentShader: HologramFragmentShader,
    uniforms: {
      uTime: new Uniform(0),
      uColor: new Uniform(new Color('#70c1ff')),
    },
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
    blending: AdditiveBlending,
  })

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta
  })

  return (
    <group scale={0.25} {...props} dispose={null}>
      <mesh
        geometry={(nodes.Bunny as Mesh).geometry}
        material={material}
        position={[0, -0.5, 0]}
        scale={[1, 1.101, 0.738]}
      />
    </group>
  )
}

useGLTF.preload('/models/clonebunny.glb')
