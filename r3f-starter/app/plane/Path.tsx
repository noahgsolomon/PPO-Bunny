import { useMemo } from 'react'
import { CatmullRomCurve3, Shape, Vector3 } from 'three'
import { Line } from '@react-three/drei'

const NUM_LINE_POINTS = 2000

export default function Path() {
  const curve = useMemo(() => {
    return new CatmullRomCurve3(
      [
        new Vector3(0, 0, 0),
        new Vector3(0, 0, -10),
        new Vector3(-2, 0, -20),
        new Vector3(-3, 0, -30),
        new Vector3(0, 0, -40),
        new Vector3(5, 0, -50),
        new Vector3(7, 0, -60),
        new Vector3(5, 0, -70),
        new Vector3(0, 0, -80),
        new Vector3(0, 0, -90),
        new Vector3(0, 0, -100),
      ],
      false,
      'catmullrom',
      0.5,
    )
  }, [])

  const shape = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(0, -0.2)
    shape.lineTo(0, 0.2)
    return shape
  }, [curve])

  return (
    <group position-y={-2}>
      <mesh>
        <extrudeGeometry args={[shape, { steps: NUM_LINE_POINTS, bevelEnabled: false, extrudePath: curve }]} />
        <meshStandardMaterial color={'white'} opacity={0.7} transparent />
      </mesh>
    </group>
  )
}
