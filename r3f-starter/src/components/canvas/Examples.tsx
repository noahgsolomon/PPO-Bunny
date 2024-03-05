'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'
import { useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import { a, animated, useSpring } from '@react-spring/three'

export const Blob = ({ route = '/', ...props }) => {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const AnimatedMeshDistortMaterial = a(MeshDistortMaterial)

  const { position } = useSpring({
    from: { position: [0, -2, 0] },
    to: { position: [0, 0, 0] },
    config: { tension: 120, friction: 14 },
  })

  const { color } = useSpring({
    color: hovered ? 'hotpink' : '#1fb2f5',
  })

  return (
    <animated.mesh
      //@ts-ignore
      position={position}
      onClick={() => router.push(route)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      {...props}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <AnimatedMeshDistortMaterial roughness={0.5} color={color} />
    </animated.mesh>
  )
}

export const Logo = ({ route = '/blob', ...props }) => {
  const mesh = useRef(null)
  const router = useRouter()

  const [hovered, setHovered] = useState(false)
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100), [])

  useCursor(hovered)
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.y = Math.sin(t) * (Math.PI / 8)
    mesh.current.rotation.x = Math.cos(t) * (Math.PI / 8)
    mesh.current.rotation.z -= delta / 4
  })

  const { scale, color } = useSpring<{ scale: number; color: string }>({
    scale: hovered ? 1.2 : 1,
    color: hovered ? 'hotpink' : '#1fb2f5',
    from: { scale: 0 },
    config: { tension: 300, friction: 15 },
  })

  return (
    <group ref={mesh} {...props}>
      <animated.mesh
        scale={scale}
        onClick={() => router.push(route)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.55, 64, 64]} />
        <animated.meshStandardMaterial roughness={0.5} color={color} />
      </animated.mesh>
    </group>
  )
}

export function Duck(props) {
  const { scene } = useGLTF('/duck.glb')
  const [hovered, setHovered] = useState(false)

  const router = useRouter()

  useCursor(hovered)

  useFrame((state, delta) => (scene.rotation.y += delta * (hovered ? 5 : 1)))

  return (
    <primitive
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => {
        router.push(props.route)
      }}
      object={scene}
      {...props}
    />
  )
}
export function Dog(props) {
  const { scene } = useGLTF('/dog.glb')

  return <primitive object={scene} {...props} />
}
