import { animated, config, useSpring, useSprings } from '@react-spring/three'
import { Center, Grid, RoundedBox } from '@react-three/drei'
import { Player } from './Player'
import { Fragment, useMemo, useRef } from 'react'
import { Group } from 'three'
import { Clone } from './Clone'
import Bomb from './Bomb'
import HologramMaterial from './HologramMaterial'
import Gum from './Gum'
import Plum from './Plum'
import RadarField from './RadarField'

export default function Tiles() {
  const AnimatedGrid = animated(Grid)
  const tileCount = 100
  const [springs, _] = useSprings(tileCount, (i) => {
    const row = Math.floor(i / Math.sqrt(tileCount))
    const col = i % Math.sqrt(tileCount)
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
    from: { positionY: -3 },
    to: { positionY: -0.75 },
    config: config.gentle,
  })

  const player = useRef<Group>()

  const startingTile = useMemo(() => Math.round(Math.random() * tileCount - 1), [])

  return (
    <>
      <group>
        <Center top position-y={0.3}>
          {springs.map((props, i) => {
            const deathTile = Math.random() > 0.95 && i !== startingTile
            const clone = Math.random() > 0.98 && i !== startingTile && !deathTile
            const plum = i !== startingTile && !clone && !deathTile && Math.random() > 0.9
            const gum = plum && Math.random() > 0.8
            const spike = i !== startingTile && !deathTile && !plum && !gum && !clone && Math.random() < 0.1
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
                    {deathTile && <Bomb position-y={1.3} scale={0.3} />}
                    {i === startingTile && (
                      <>
                        <Player position-y={0.5} ref={player} />
                        {/* <RadarField /> */}
                      </>
                    )}
                    <RoundedBox castShadow receiveShadow args={[1, deathTile ? 2.1 : 0.1, 1]}>
                      {!spike ? (
                        <meshStandardMaterial color={deathTile ? '#FF3D33' : '#3A3D5E'} />
                      ) : (
                        <HologramMaterial />
                      )}
                    </RoundedBox>
                    {gum ? <Gum /> : plum ? <Plum /> : null}
                  </animated.mesh>
                ) : null}
              </Fragment>
            )
          })}
        </Center>
        <animated.mesh position-y={baseSpring.positionY} rotation-x={Math.PI * 0.5}>
          <RoundedBox receiveShadow args={[20, 20]}>
            <meshStandardMaterial color={'#212336'} />
          </RoundedBox>
        </animated.mesh>
        {/* <Html distanceFactor={15} className='flex flex-col gap-2' position-z={10} position-y={2}>
          <Button>Play</Button>
          <Button className='flex flex-row gap-2 ' variant='outline'>
            Info <Info className='w-4 h-4' />
          </Button>
        </Html> */}
      </group>
      <AnimatedGrid
        position-y={baseSpring.positionY}
        args={[10.5, 10.5]}
        cellSize={0.6}
        cellThickness={1}
        cellColor={'#6f6f6f'}
        sectionSize={3.3}
        sectionThickness={1.5}
        sectionColor={'#3A3D5E'}
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid
      />
    </>
  )
}
