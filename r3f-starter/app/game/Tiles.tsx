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
import useEnvironment from './store/useEnvironment'
import { Position, TileType, BombTile, DefaultTile, PlumTile, GumTile, HologramTile, HoleTile } from '@/index.d'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Perf } from 'r3f-perf'

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
                  ? structuredClone(BombTile)
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
      const clonedTileMap = structuredClone(newTileMap)
      environment.agentEnvironment[i].setTileMap(clonedTileMap, i)
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

  const [movement, movementApi] = useSprings(NUM_AGENTS, (i) => ({
    positionX: environment.agentEnvironment[i].positionX,
    positionZ: environment.agentEnvironment[i].positionZ,
    rotation: environment.agentEnvironment[i].rotation,
    config: config.gentle,
  }))

  const move = (direction: 'left' | 'right' | 'up' | 'down') => {
    const currentAgentIdx = environment.currentAgentIdx
    const agent = environment.agentEnvironment[currentAgentIdx]
    const agentIdx = agent.index
    const TILE_COUNT = environment.TILE_COUNT

    let nextTileType, positionX, positionZ, rotation

    switch (direction) {
      case 'left':
        nextTileType = agent.tileMap[agent.position.x - 1 + Math.sqrt(TILE_COUNT) * agent.position.y]

        if (agent.position.x - 1 >= 0 && nextTileType.type.type !== 'HOLE') {
          agent.position.x -= 1
          positionX = agent.positionX - 1.1
          rotation = -Math.PI * 0.5

          if (nextTileType.type.type === 'BOMB' && nextTileType.type.enabled) {
            agent.setHearts(Math.max(agent.hearts + nextTileType.type.heartGain, 0), agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agentIdx)
            nextTileType.type.enabled = false
          } else if (nextTileType.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
          } else if (nextTileType.type.type === 'GUM' || nextTileType.type.type === 'PLUM') {
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agent.index)
            nextTileType.type = DefaultTile
          }

          movementApi.start((i) => {
            if (i === agentIdx) {
              return {
                positionX,
                rotation,
              }
            }
            return {}
          })
          agent.setRotation(rotation, agentIdx)
          agent.setPositionX(positionX, agentIdx)
        }
        break

      case 'right':
        nextTileType = agent.tileMap[agent.position.x + 1 + Math.sqrt(TILE_COUNT) * agent.position.y]

        if (agent.position.x + 1 <= Math.sqrt(TILE_COUNT) - 1 && nextTileType.type.type !== 'HOLE') {
          agent.position.x += 1
          positionX = agent.positionX + 1.1
          rotation = Math.PI * 0.5

          if (nextTileType.type.type === 'BOMB' && nextTileType.type.enabled) {
            agent.setHearts(Math.max(agent.hearts + nextTileType.type.heartGain, 0), agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agentIdx)
            nextTileType.type.enabled = false
          } else if (nextTileType.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
          } else if (nextTileType.type.type === 'GUM' || nextTileType.type.type === 'PLUM') {
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agent.index)
            nextTileType.type = DefaultTile
          }

          movementApi.start((i) => {
            if (i === agentIdx) {
              return {
                positionX,
                rotation,
              }
            }
            return {}
          })
          agent.setRotation(rotation, agentIdx)
          agent.setPositionX(positionX, agentIdx)
        }
        break

      case 'up':
        nextTileType = agent.tileMap[agent.position.x + Math.sqrt(TILE_COUNT) * (agent.position.y - 1)]

        if (agent.position.y - 1 >= 0 && nextTileType.type.type !== 'HOLE') {
          agent.position.y -= 1
          positionZ = agent.positionZ - 1.1
          rotation = Math.PI

          if (nextTileType.type.type === 'BOMB' && nextTileType.type.enabled) {
            agent.setHearts(Math.max(agent.hearts + nextTileType.type.heartGain, 0), agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agentIdx)
            nextTileType.type.enabled = false
          } else if (nextTileType.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
          } else if (nextTileType.type.type === 'GUM' || nextTileType.type.type === 'PLUM') {
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agent.index)
            nextTileType.type = DefaultTile
          }

          movementApi.start((i) => {
            if (i === agentIdx) {
              return {
                positionZ,
                rotation,
              }
            }
            return {}
          })
          agent.setRotation(rotation, agentIdx)
          agent.setPositionZ(positionZ, agentIdx)
        }
        break

      case 'down':
        nextTileType = agent.tileMap[agent.position.x + Math.sqrt(TILE_COUNT) * (agent.position.y + 1)]

        if (agent.position.y + 1 <= Math.sqrt(TILE_COUNT) - 1 && nextTileType.type.type !== 'HOLE') {
          agent.position.y += 1
          positionZ = agent.positionZ + 1.1
          rotation = 0

          if (nextTileType.type.type === 'BOMB' && nextTileType.type.enabled) {
            agent.setHearts(Math.max(agent.hearts + nextTileType.type.heartGain, 0), agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agentIdx)
            nextTileType.type.enabled = false
          } else if (nextTileType.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
          } else if (nextTileType.type.type === 'GUM' || nextTileType.type.type === 'PLUM') {
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agent.index)
            nextTileType.type = DefaultTile
          }

          movementApi.start((i) => {
            if (i === agentIdx) {
              return {
                positionZ,
                rotation,
              }
            }
            return {}
          })
          agent.setRotation(rotation, agentIdx)
          agent.setPositionZ(positionZ, agentIdx)
        }
        break
    }
  }

  return (
    <>
      <Perf />
      <Center top position-y={0.3}>
        {springs.map((props, i) => {
          const tile = environment?.agentEnvironment[environment.currentAgentIdx]?.tileMap[i]
          const tileType = tile?.type.type

          return (
            <Fragment key={i}>
              {tileType !== 'HOLE' ? (
                <animated.mesh
                  scale={props.scale}
                  key={i}
                  position={[
                    (i % Math.sqrt(TILE_COUNT)) * 1.1,
                    tileType === 'BOMB' ? 0 : 1,
                    Math.floor(i / Math.sqrt(TILE_COUNT)) * 1.1,
                  ]}
                >
                  {tileType === 'BOMB' && tile.type.enabled && <Bomb position-y={1.3} scale={0.3} />}
                  {agentTiles.includes(i) ? (
                    agentTiles[environment.currentAgentIdx] === i ? (
                      <>
                        <Player
                          rotation-y={movement[environment.currentAgentIdx].rotation}
                          position-x={movement[environment.currentAgentIdx].positionX}
                          position-z={movement[environment.currentAgentIdx].positionZ}
                          position-y={environment.agentEnvironment[environment.currentAgentIdx].positionY}
                          ref={player}
                        />
                        {/* <RadarField /> */}
                      </>
                    ) : (
                      <Clone movement={movement} i={i} />
                    )
                  ) : null}
                  <RoundedBox castShadow receiveShadow args={[1, tileType === 'BOMB' ? 2.1 : 0.1, 1]}>
                    {tileType !== 'HOLOGRAM' ? (
                      <meshStandardMaterial color={tileType === 'BOMB' ? '#FF3D33' : '#3A3D5E'} />
                    ) : (
                      <HologramMaterial />
                    )}
                  </RoundedBox>
                  {tileType === 'GUM' ? <Gum /> : tileType === 'PLUM' ? <Plum /> : null}
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
          onClick={() => move('left')}
          variant='none'
          className='z-10 absolute right-1/2 bottom-10 transform -translate-y-1/2'
        >
          <ArrowLeft className='w-10 h-10' />
        </Button>

        <Button
          onClick={() => move('right')}
          variant='none'
          className='z-10 absolute left-1/2 bottom-10 transform -translate-y-1/2'
        >
          <ArrowRight className='w-10 h-10' />
        </Button>

        <Button
          onClick={() => move('up')}
          variant='none'
          className='z-10 absolute left-1/2 bottom-24 transform -translate-x-1/2'
        >
          <ArrowUp className='w-10 h-10' />
        </Button>

        <Button
          onClick={() => move('down')}
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
