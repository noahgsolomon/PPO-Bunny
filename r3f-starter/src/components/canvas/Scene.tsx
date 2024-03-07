'use client'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { r3f } from '@/helpers/global'
import { ACESFilmicToneMapping } from 'three'
import { Perf } from 'r3f-perf'

export default function Scene({ ...props }) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas {...props} shadows onCreated={(state) => (state.gl.toneMapping = ACESFilmicToneMapping)}>
      <Perf />
      <r3f.Out />
      <Preload all />
    </Canvas>
  )
}
