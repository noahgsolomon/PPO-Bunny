'use client'

import { Float, Text3D, useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import { a, animated, config, useSpring, useSpringValue } from '@react-spring/three'

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
  const { scene } = useGLTF('/models/duck.glb')
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
  const { scene } = useGLTF('/models/dog.glb')

  return <primitive object={scene} {...props} />
}

export const Cube = () => {
  const router = useRouter()
  const AnimatedText3D = a(Text3D)

  const scale = useSpringValue(0, {
    config: config.wobbly,
  })

  const [rotate, rotateApi] = useSpring(() => ({
    from: {
      y: 0,
    },
  }))

  const [hovered, setHovered] = useState(false)
  const [hoveredText, setHoveredText] = useState(false)

  useEffect(() => {
    scale.start(2)
  }, [])

  const cube = useRef<THREE.Mesh>()

  const handleRotate = () => {
    rotateApi.start({
      from: { y: cube.current.rotation.y },
      to: { y: cube.current.rotation.y + Math.PI * 0.5 },
      config: config.wobbly,
    })
  }

  const { textScale } = useSpring({
    textScale: hoveredText ? 1.2 : 1,
  })

  useFrame(() => {
    cube.current.rotation.x += 0.01
    cube.current.rotation.z += 0.01
  })

  const { color } = useSpring({
    color: hovered ? '#ff0000' : '#0000ff',
  })

  useCursor(hovered || hoveredText)

  const matcap = useTexture('./matcapblack.png')

  return (
    <group>
      <Float>
        <AnimatedText3D
          scale={textScale}
          position={[-0.75, -1, 2]}
          material={new THREE.MeshMatcapMaterial({ matcap })}
          onPointerEnter={(e) => {
            e.stopPropagation()
            setHoveredText(true)
          }}
          onPointerLeave={(e) => {
            e.stopPropagation()
            setHoveredText(false)
          }}
          onClick={(e) => {
            e.stopPropagation()
            router.push('/')
          }}
          font='./helvetiker_regular.typeface.json'
          size={0.5}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          HOME
        </AnimatedText3D>
      </Float>

      <animated.mesh
        onPointerEnter={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerLeave={(e) => {
          e.stopPropagation()
          setHovered(false)
        }}
        ref={cube}
        rotation-y={rotate.y}
        onClick={handleRotate}
        scale={scale}
      >
        <boxGeometry />
        <animated.meshStandardMaterial color={color} />
      </animated.mesh>
    </group>
  )
}
