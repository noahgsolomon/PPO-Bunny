'use client'

import { animated, config, useSpring, useSprings } from '@react-spring/three'
import { Center, Grid, Html, RoundedBox } from '@react-three/drei'
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

export default function Tiles() {
  const AnimatedGrid = animated(Grid)
  const TILE_COUNT = 100
  const NUM_AGENTS = 5

  const [springs, _] = useSprings(TILE_COUNT, (i) => {
    const row = Math.floor(i / Math.sqrt(TILE_COUNT))
    const col = i % Math.sqrt(TILE_COUNT)
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
    to: { positionY: -2 },
    config: config.gentle,
  })

  const player = useRef<Group>()

  const environment = useEnvironment()

  const agentTiles = useMemo(() => {
    const randTiles = []
    for (let i = 0; i < NUM_AGENTS; i++) {
      randTiles.push(Math.round(Math.random() * TILE_COUNT - 1))
    }
    return randTiles
  }, [])

  useEffect(() => {
    // const tileMaps = []
    // for (let i = 0; i < NUM_AGENTS; i++) {
    const newTileMap = springs.reduce(
      (acc, _, i) => {
        const { tile } = generateTiles(i, agentTiles)
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
          position: { x: i % Math.sqrt(TILE_COUNT), y: Math.floor(i / Math.sqrt(TILE_COUNT)) },
        })
        return acc
      },
      [] as { type: TileType; position: Position }[],
    )
    // tileMaps.push(newTileMap)
    // }

    environment.setCurrentAgentIdx(0)
    for (let i = 0; i < NUM_AGENTS; i++) {
      environment.agentEnvironment[i].setTileMap(newTileMap, i)
      environment.agentEnvironment[i].setPosition(
        {
          x: agentTiles[i] % Math.sqrt(TILE_COUNT),
          y: Math.floor(agentTiles[i] / Math.sqrt(TILE_COUNT)),
        },
        i,
      )
    }
  }, [])

  // useEffect(() => {
  //   setTimeout(() => {
  //     environment.setCurrentAgentIdx(3)
  //   }, 5000)
  // }, [])

  return (
    <>
      {/* <Perf /> */}
      <Center top position-y={0.3}>
        {springs.map((props, i) => {
          const tile = environment?.agentEnvironment[environment.currentAgentIdx]?.tileMap[i]?.type.type

          return (
            <Fragment key={i}>
              {tile !== 'HOLE' ? (
                <animated.mesh
                  scale={props.scale}
                  key={i}
                  position={[
                    (i % Math.sqrt(TILE_COUNT)) * 1.1,
                    tile === 'BOMB' ? 0 : 1,
                    Math.floor(i / Math.sqrt(TILE_COUNT)) * 1.1,
                  ]}
                >
                  {/* <Html>{`[${environment.tileMap[i]?.position.x}, ${environment.tileMap[i]?.position.y}, ${i}]`}</Html> */}
                  {tile === 'BOMB' && <Bomb position-y={1.3} scale={0.3} />}
                  {agentTiles.includes(i) ? (
                    agentTiles[environment.currentAgentIdx] === i ? (
                      <>
                        <Player position-y={0.5} ref={player} />
                        {/* <RadarField /> */}
                      </>
                    ) : (
                      <Clone i={i} position-y={0.5} />
                    )
                  ) : null}
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

const generateTiles = (i: number, agentTiles: number[]) => {
  const deathTile = Math.random() > 0.95 && !agentTiles.includes(i)
  const clone = Math.random() > 0.98 && !agentTiles.includes(i) && !deathTile
  const plum = !agentTiles.includes(i) && !clone && !deathTile && Math.random() > 0.8
  const gum = plum && Math.random() > 0.8
  const hologram = !agentTiles.includes(i) && !deathTile && !plum && !gum && !clone && Math.random() < 0.1
  const hole = Math.random() < 0.2

  const tile =
    !agentTiles.includes(i) && hole
      ? 'HOLE'
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
