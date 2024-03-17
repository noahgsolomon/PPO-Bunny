import { animated } from '@react-spring/three'
import { RoundedBox } from '@react-three/drei'
import { MeshProps } from '@react-three/fiber'

export default function RadarField(props: MeshProps & { viewDistance: number }) {
  const view = props.viewDistance * (5.5 / 5)
  return (
    <animated.mesh {...props} position-y={0.02} rotation-x={Math.PI * -0.5}>
      <RoundedBox args={[view, view, 0.1]}>
        <meshStandardMaterial transparent opacity={0.2} color='#00ff00' />
      </RoundedBox>
    </animated.mesh>
  )
}
