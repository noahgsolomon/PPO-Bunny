import { animated, config, useSpring, useSprings } from '@react-spring/three'
import { Center, Html, RoundedBox } from '@react-three/drei'
import { Player } from './Player'
import { Fragment, useMemo, useRef } from 'react'
import { Group } from 'three'
import { Button } from '@/components/ui/button'
import { Clone } from './Clone'
import { Skull } from './Skull'
import Bomb from './Bomb'

export default function Tiles() {
  const tileCount = 100
  const [springs, _] = useSprings(tileCount, (i) => {
    const row = Math.floor(i / 10)
    const col = i % 10
    const centerRow = 4.5
    const centerCol = 4.5
    const distance = Math.sqrt((row - centerRow) ** 2 + (col - centerCol) ** 2)

    return {
      from: { scale: 0 },
      to: { scale: 1 },
      delay: distance * 50,
      config: config.gentle,
    }
  })

  const baseSpring = useSpring({
    from: { positionY: -7 },
    to: { positionY: -1 },
    config: config.gentle,
  })

  const player = useRef<Group>()

  const startingTile = useMemo(() => Math.round(Math.random() * tileCount - 1), [])

  return (
    <>
      <group>
        <Center top position-y={0.3}>
          {springs.map((props, i) => {
            const deathTile = Math.random() > 0.98 && i !== startingTile
            const clone = Math.random() > 0.98 && i !== startingTile && !deathTile
            const plum = !deathTile && Math.random() > 0.9
            const gum = plum && Math.random() > 0.8
            const spike = !startingTile && !deathTile && !plum && !gum && !clone
            // && Math.random() > 0.75
            return (
              <Fragment key={i}>
                {Math.random() < 0.8 || i === startingTile ? (
                  <animated.mesh
                    scale={props.scale}
                    key={i}
                    position={[
                      (i % Math.sqrt(tileCount)) * 1.1,
                      deathTile ? 0 : 1,
                      Math.floor(i / Math.sqrt(tileCount)) * 1.1,
                    ]}
                  >
                    {clone && <Clone position-y={0.5} />}
                    {deathTile && <Bomb position-y={1.5} scale={0.3} />}
                    {i === startingTile && <Player position-y={0.5} ref={player} />}
                    <RoundedBox args={[1, deathTile ? 2.1 : 0.1, 1]}>
                      {true ? (
                        <meshStandardMaterial
                          metalness={0}
                          roughness={1}
                          color={deathTile ? 'maroon' : gum ? '#fc4bb3' : plum ? '#7c62ff' : '#3A3D5E'}
                        />
                      ) : null}
                    </RoundedBox>
                    {gum ? (
                      <mesh position-y={0.5}>
                        <icosahedronGeometry args={[0.1, 2]} />
                        <meshStandardMaterial flatShading color={'#fc4bb3'} />
                      </mesh>
                    ) : plum ? (
                      <mesh position-y={0.5}>
                        <icosahedronGeometry args={[0.1, 2]} />
                        <meshStandardMaterial flatShading color={'#7c62ff'} />
                      </mesh>
                    ) : null}
                  </animated.mesh>
                ) : null}
              </Fragment>
            )
          })}
        </Center>
        <animated.mesh position-y={baseSpring.positionY} rotation-x={Math.PI * 0.5}>
          <RoundedBox args={[20, 20]}>
            <meshStandardMaterial color={'#212336'} />
          </RoundedBox>
        </animated.mesh>
        <Html position-z={10} position-y={2}>
          <Button>PLAY</Button>
        </Html>
      </group>
    </>
  )
}
