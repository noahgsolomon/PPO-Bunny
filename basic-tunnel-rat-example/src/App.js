import * as THREE from 'three'
import { forwardRef, useEffect, useReducer, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, useCursor } from '@react-three/drei'
import { Canvas } from './Canvas'
import tunnel from 'tunnel-rat'

const webgl = tunnel()
const html = tunnel()

export default function App() {
  const ref = useRef()
  useEffect(() => {
    console.log(ref)
  }, [])
  return (
    <>
      <Canvas dpr={[1, 2]} orthographic camera={{ zoom: 100 }}>
        {/* This is a THREEJS React root */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <webgl.Out />
      </Canvas>
      {/* This is a DOM React root */}
      <div className="overlay">
        <webgl.In>
          {/* Renders THREEJS native elements */}
          <Box ref={ref} />
          <OrbitControls />
        </webgl.In>
        <html.Out />
      </div>
    </>
  )
}

const Box = forwardRef((props, ref) => {
  const [count, up] = useReducer((state) => state + 1, 0)
  const [color, set] = useState('#ff2040')
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  useEffect(() => {
    const interval = setInterval(() => set('#' + new THREE.Color(Math.random(), Math.random(), Math.random()).getHexString()), 1000)
    return () => clearInterval(interval)
  }, [])
  useFrame(() => (ref.current.rotation.x = ref.current.rotation.y += 0.01))
  return (
    <>
      <mesh ref={ref} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)} onClick={up}>
        <boxGeometry />
        <meshStandardMaterial color={color} />
      </mesh>
      <html.In>
        {/* Renders DOM native elements */}
        <h1>
          {count}/{color}
        </h1>
      </html.In>
    </>
  )
})
