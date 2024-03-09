import { animated, config, useSpring, useSprings } from '@react-spring/three'
import { Center, Grid, RoundedBox } from '@react-three/drei'
import { Player } from './Player'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Group } from 'three'
import { Clone } from './Models/Clone'
import Bomb from './Models/Bomb'
import HologramMaterial from './HologramMaterial'
import Gum from './Models/Gum'
import Plum from './Models/Plum'
import { Perf } from 'r3f-perf'
import useEnvironment from './store/useEnvironment'
import { Position, TileType, BombTile, DefaultTile, PlumTile, GumTile, HologramTile, HoleTile } from '@/index.d'
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

  const environment = useEnvironment()

  useEffect(() => {
    const newTileMap = springs.reduce(
      (acc, _, i) => {
        const { tile } = generateTiles(i, startingTile)
        acc.push({
          type:
            tile === 'HOLE'
              ? HoleTile
              : tile === 'HOLOGRAM'
                ? HologramTile
                : tile === 'BOMB'
                  ? BombTile
                  : tile === 'GUM'
                    ? GumTile
                    : tile === 'PLUM'
                      ? PlumTile
                      : DefaultTile,
          position: { x: 0, y: 0 },
        })
        return acc
      },
      [] as { type: TileType; position: Position }[],
    )
    environment.setTileMap(newTileMap)
  }, [])

  useEffect(() => {
    console.log(environment.tileMap)
  }, [environment])

  return (
    <>
      <Perf />
      <Center top position-y={0.3}>
        {springs.map((props, i) => {
          const tile = environment.tileMap[i]?.type.type

          return (
            <Fragment key={i}>
              {tile !== 'HOLE' ? (
                <animated.mesh
                  scale={props.scale}
                  key={i}
                  position={[
                    (i % Math.sqrt(tileCount)) * 1.1,
                    tile === 'BOMB' ? 0 : 1,
                    Math.floor(i / Math.sqrt(tileCount)) * 1.1,
                  ]}
                >
                  {tile === 'CLONE' && <Clone position-y={0.5} />}
                  {tile === 'BOMB' && <Bomb position-y={1.3} scale={0.3} />}
                  {i === startingTile && (
                    <>
                      <Player position-y={0.5} ref={player} />
                      {/* <RadarField /> */}
                    </>
                  )}
                  <RoundedBox castShadow receiveShadow args={[1, tile === 'BOMB' ? 2.1 : 0.1, 1]}>
                    {tile !== 'HOLOGRAM' ? (
                      <meshStandardMaterial color={tile === 'BOMB' ? '#FF3D33' : '#3A3D5E'} />
                    ) : (
                      <HologramMaterial />
                    )}
                  </RoundedBox>
                  {tile === 'GUM' ? <Gum /> : tile === 'PLUM' ? <Plum /> : null}
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

const generateTiles = (i: number, startingTile: number) => {
  const deathTile = Math.random() > 0.95 && i !== startingTile
  const clone = Math.random() > 0.98 && i !== startingTile && !deathTile
  const plum = i !== startingTile && !clone && !deathTile && Math.random() > 0.9
  const gum = plum && Math.random() > 0.8
  const hologram = i !== startingTile && !deathTile && !plum && !gum && !clone && Math.random() < 0.1
  const hole = Math.random() < 0.2

  const tile =
    i !== startingTile && hole
      ? 'HOLE'
      : clone
        ? 'CLONE'
        : hologram
          ? 'HOLOGRAM'
          : deathTile
            ? 'BOMB'
            : gum
              ? 'GUM'
              : plum
                ? 'PLUM'
                : 'DEFAULT'

  return {
    tile,
  }
}
