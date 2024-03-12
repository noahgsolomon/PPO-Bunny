import { RoundedBox } from '@react-three/drei'

export default function RadarField({ viewDistance = 5 }) {
  const view = viewDistance * (5.5 / 5)
  return (
    <mesh position-y={0.02} rotation-x={Math.PI * -0.5}>
      <RoundedBox args={[view, view, 0.1]}>
        <meshStandardMaterial transparent opacity={0.2} color='#00ff00' />
      </RoundedBox>
    </mesh>
  )
}
