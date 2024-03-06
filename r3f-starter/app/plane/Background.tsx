import { Environment, Sphere } from '@react-three/drei'
import { Gradient, LayerMaterial } from 'lamina'
import { BackSide, Vector2 } from 'three'

export default function Background() {
  return (
    <>
      <Environment preset='sunset' />
      <Sphere scale={100} rotation-y={Math.PI / 2}>
        <LayerMaterial lighting='physical' transmission={1} side={BackSide}>
          <Gradient colorA={'#357ca1'} colorB={'white'} axes='y' start={0} end={-0.5} />
        </LayerMaterial>
      </Sphere>
    </>
  )
}
