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
import { button, useControls } from 'leva'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Tiles() {
  const AnimatedGrid = animated(Grid)
  const AnimatedHtml = animated(Html)
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
      let rand = Math.round(Math.random() * TILE_COUNT - 1)
      while (randTiles.includes(rand)) {
        rand = Math.round(Math.random() * TILE_COUNT - 1)
      }
      randTiles.push(rand)
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
      environment.agentEnvironment[i].setStartingTile(agentTiles[i])
    }
  }, [])

  const move = () => {
    environment.agentEnvironment.map((agent) => {
      const positionX = agent.positionX - 1.1
      const rotation = -Math.PI * 0.5
      movementApi.start((i) => {
        if (i === agent.index) {
          return {
            positionX,
            rotation,
            positionY: 0.5,
          }
        }
        return {}
      })
      agent.setRotation(rotation, agent.index)
      agent.setPositionX(positionX, agent.index)
    })
  }

  // useEffect(() => {
  //   setTimeout(() => {
  //     environment.setCurrentAgentIdx(3)
  //   }, 5000)
  // }, [])

  const [movement, movementApi] = useSprings(NUM_AGENTS, (i) => ({
    positionX: environment.agentEnvironment[i].positionX,
    positionZ: environment.agentEnvironment[i].positionZ,
    positionY: 0.5,
    rotation: environment.agentEnvironment[i].rotation,
    config: config.gentle,
  }))

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
                        <AnimatedHtml
                          position-x={movement[environment.currentAgentIdx].positionX}
                          position-z={movement[environment.currentAgentIdx].positionZ}
                          position-y={1}
                        >
                          {`[${environment.agentEnvironment[environment.currentAgentIdx].position.x}, ${environment.agentEnvironment[environment.currentAgentIdx].position.y}]`}
                        </AnimatedHtml>
                        <Player
                          rotation-y={movement[environment.currentAgentIdx].rotation}
                          position-x={movement[environment.currentAgentIdx].positionX}
                          position-z={movement[environment.currentAgentIdx].positionZ}
                          position-y={0.5}
                          ref={player}
                        />
                        {/* <RadarField /> */}
                      </>
                    ) : (
                      <Clone movement={movement} i={i} position-y={0.5} />
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
      <Html scale={0.5} position-z={8}>
        <Button
          onClick={() => {
            const currentAgentIdx = environment.currentAgentIdx
            const agent = environment.agentEnvironment[currentAgentIdx]
            const newPosition = agent.position

            if (newPosition.x - 1 >= 0) {
              newPosition.x -= 1
              const positionX = agent.positionX - 1.1
              const rotation = -Math.PI * 0.5
              movementApi.start((i) => {
                if (i === currentAgentIdx) {
                  return {
                    positionX,
                    rotation,
                    positionY: 0.5,
                  }
                }
                return {}
              })
              agent.setRotation(rotation, currentAgentIdx)
              agent.setPositionX(positionX, currentAgentIdx)
              agent.setPosition(newPosition, currentAgentIdx)
            }
          }}
          variant='none'
          className='z-10 absolute right-1/2 bottom-10 transform -translate-y-1/2'
        >
          <ArrowLeft className='w-10 h-10' />
        </Button>

        <Button
          onClick={() => {
            const currentAgentIdx = environment.currentAgentIdx
            const agent = environment.agentEnvironment[currentAgentIdx]
            const newPosition = agent.position

            if (newPosition.x + 1 <= Math.sqrt(TILE_COUNT) - 1) {
              newPosition.x += 1
              const positionX = agent.positionX + 1.1
              const rotation = Math.PI * 0.5
              movementApi.start((i) => {
                if (i === currentAgentIdx) {
                  return {
                    positionX,
                    rotation,
                    positionY: 0.5,
                  }
                }
                return {}
              })
              agent.setRotation(rotation, currentAgentIdx)
              agent.setPositionX(positionX, currentAgentIdx)
            }
          }}
          variant='none'
          className='z-10 absolute left-1/2 bottom-10 transform -translate-y-1/2'
        >
          <ArrowRight className='w-10 h-10' />
        </Button>

        <Button
          onClick={() => {
            const currentAgentIdx = environment.currentAgentIdx
            const agent = environment.agentEnvironment[currentAgentIdx]
            const newPosition = agent.position

            if (newPosition.y - 1 >= 0) {
              newPosition.y -= 1
              const positionZ = agent.positionZ - 1.1
              const rotation = Math.PI
              movementApi.start((i) => {
                if (i === currentAgentIdx) {
                  return {
                    positionZ,
                    rotation,
                    positionY: 0.5,
                  }
                }
                return {}
              })
              agent.setRotation(rotation, currentAgentIdx)
              agent.setPositionZ(positionZ, currentAgentIdx)
            }
          }}
          variant='none'
          className='z-10 absolute left-1/2 bottom-24 transform -translate-x-1/2'
        >
          <ArrowUp className='w-10 h-10' />
        </Button>

        <Button
          onClick={() => {
            const currentAgentIdx = environment.currentAgentIdx
            const agent = environment.agentEnvironment[currentAgentIdx]
            const newPosition = agent.position

            if (newPosition.y + 1 <= Math.sqrt(TILE_COUNT) - 1) {
              newPosition.y += 1
              const positionZ = agent.positionZ + 1.1
              const rotation = 0
              movementApi.start((i) => {
                if (i === currentAgentIdx) {
                  return {
                    positionZ,
                    rotation,
                    positionY: 0.5,
                  }
                }
                return {}
              })
              agent.setRotation(rotation, currentAgentIdx)
              agent.setPositionZ(positionZ, currentAgentIdx)
            }
          }}
          variant='none'
          className='z-10 absolute left-1/2 bottom-6 transform -translate-x-1/2'
        >
          <ArrowDown className='w-10 h-10' />
        </Button>
        {/* <Button onClick={move}>begin</Button> */}
      </Html>
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
