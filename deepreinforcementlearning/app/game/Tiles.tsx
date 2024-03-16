'use client'

import { animated, config, useSpring, useSprings } from '@react-spring/three'
import { Center, Grid, Html, RoundedBox, Text3D } from '@react-three/drei'
import { Player } from './Player'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Group } from 'three'
import { Clone } from './Models/Clone'
import Bomb from './Models/Bomb'
import HologramMaterial from './HologramMaterial'
import Gum from './Models/Gum'
import Plum from './Models/Plum'
import useEnvironment from './store/useEnvironment'
import {
  Position,
  TileType,
  BombTile,
  DefaultTile,
  PlumTile,
  GumTile,
  HologramTile,
  HoleTile,
  AgentObservation,
} from '@/index.d'
import { Perf } from 'r3f-perf'
import { GlassBucket } from './Models/GlassBucket'
import useGameState from './store/useGameState'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'

export default function Tiles() {
  const [policyNetwork, setPolicyNetwork] = useState<tf.LayersModel>(null)

  useEffect(() => {
    const loadModel = async () => {
      try {
        const policyNetwork = await tf.loadLayersModel(
          'https://raw.githubusercontent.com/noahgsolomon/bunnymodel/main/policy/model.json',
        )
        console.log('Model loaded successfully')
        setPolicyNetwork(policyNetwork)
      } catch (error) {
        console.error('Error loading the model:', error)
      }
    }

    loadModel()
  }, [])

  const AnimatedGrid = animated(Grid)
  const TILE_COUNT = 225
  const NUM_AGENTS = 10
  const N_STEPS = 6
  const TOTAL_STEPS = 50
  const TOTAL_HEARTS = 3
  const VISION_LENGTH = 2
  const DISCOUNT_FACTOR = 0.9
  const OBSERVATION_RESERVOIR = 500

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
  const gameState = useGameState()

  const [mapResetCount, setMapResetCount] = useState(0)

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
  }, [mapResetCount])

  const generateTileMap = () => {
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
    return newTileMap
  }

  const [observations, setObservations] = useState<AgentObservation[]>([])

  const [movement, movementApi] = useSprings(NUM_AGENTS, (i) => ({
    positionX: environment.agentEnvironment[i].positionX,
    positionZ: environment.agentEnvironment[i].positionZ,
    rotation: environment.agentEnvironment[i].rotation,
    config: config.gentle,
  }))

  const resetAgentMetrics = () => {
    for (let i = 0; i < NUM_AGENTS; i++) {
      environment.agentEnvironment[i].setSteps(TOTAL_STEPS, i)
      environment.agentEnvironment[i].setHearts(TOTAL_HEARTS, i)
      environment.agentEnvironment[i].setCoins(0, i)
      environment.agentEnvironment[i].setPositionY(0.5, i)
      environment.agentEnvironment[i].setPosition(
        {
          x: agentTiles[i] % Math.sqrt(TILE_COUNT),
          y: Math.floor(agentTiles[i] / Math.sqrt(TILE_COUNT)),
        },
        i,
      )
    }
  }

  const move = (direction: 'left' | 'right' | 'up' | 'down', agentIdx: number) => {
    const agent = environment.agentEnvironment[agentIdx]
    const TILE_COUNT = environment.TILE_COUNT

    if (agent.steps === 0 || agent.hearts === 0) return

    let nextTileType, positionX, positionZ, rotation

    let observation = observations.filter((obs) => obs.agentIdx === agentIdx && !obs.complete)

    let newObservation: AgentObservation = {
      agentIdx,
      state: { tileState: [], normalizedHeartsRemaining: 1, normalizedStepsRemaining: 1 },
      action: { index: 0, name: 'left' },
      actionOldProbability: 0,
      actionNewProbability: 0,
      reward: 0,
      complete: false,
      valueOutput: 0,
      startStepTrajectoryNum: Math.abs(agent.steps - TOTAL_STEPS),
    }

    let coinGain = 0
    let heartGain = 0

    switch (direction) {
      case 'left':
        nextTileType = agent.tileMap[agent.position.x - 1 + Math.sqrt(TILE_COUNT) * agent.position.y]

        if (agent.position.x - 1 >= 0 && nextTileType?.type?.type !== 'HOLE') {
          agent.position.x -= 1
          positionX = agent.positionX - 1.1
          rotation = -Math.PI * 0.5
          if (nextTileType.type.type === 'BOMB' && nextTileType.type.enabled) {
            agent.setHearts(Math.max(agent.hearts + nextTileType.type.heartGain, 0), agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agentIdx)
            nextTileType.type.enabled = false
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setSteps(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType.type.type === 'GUM' || nextTileType.type.type === 'PLUM') {
            agent.setSteps(agent.steps - 1, agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agent.index)

            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain

            nextTileType.type = DefaultTile
          } else {
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
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

          newObservation.action.index = 0
          newObservation.action.name = 'left'

          const agentPosition = agent.position

          const nearTiles = []

          for (let y = -VISION_LENGTH; y <= VISION_LENGTH; y++) {
            for (let x = -VISION_LENGTH; x <= VISION_LENGTH; x++) {
              if (x === 0 && y === 0) continue

              const tileX = agentPosition.x + x
              const tileY = agentPosition.y + y

              if (tileX < 0 || tileX >= Math.sqrt(TILE_COUNT) || tileY < 0 || tileY >= Math.sqrt(TILE_COUNT)) {
                nearTiles.push({
                  type: {
                    type: 'DEFAULT',
                    heartGain: 0,
                    coinGain: 0,
                    stepGain: 0,
                  },
                  position: {
                    x: tileX,
                    y: tileY,
                  },
                })
              } else {
                const tile = agent.tileMap[tileX + Math.sqrt(TILE_COUNT) * tileY]
                nearTiles.push(tile)
              }
            }
          }

          newObservation.state.tileState = nearTiles.map((tile) => {
            const xDiff = tile.position.x - agentPosition.x
            const yDiff = tile.position.y - agentPosition.y
            const distance = Math.max(Math.abs(xDiff), Math.abs(yDiff))
            const significanceFactor = VISION_LENGTH / (VISION_LENGTH - 1 + distance)

            return {
              heartGain: tile.type.heartGain * significanceFactor,
              coinGain: tile.type.coinGain * significanceFactor,
              stepGain: tile.type.stepGain * significanceFactor,
              dirX: xDiff === 0 ? 0 : xDiff > 0 ? 1 : -1,
              dirY: yDiff === 0 ? 0 : yDiff > 0 ? 1 : -1,
            }
          })

          newObservation.state.normalizedStepsRemaining = agent.steps / TOTAL_STEPS
          newObservation.state.normalizedHeartsRemaining = agent.hearts / TOTAL_HEARTS

          observation.map((observation) => {
            if (Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum > N_STEPS) {
              observation.complete = true
            } else {
              observation.reward +=
                ((heartGain / TOTAL_HEARTS) * 0.2 + coinGain * 0.8) *
                Math.pow(DISCOUNT_FACTOR, Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum - 1)
            }
          })
          observation.push(newObservation)
          console.log(newObservation)
          setObservations((observations) => [...observations, newObservation])
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
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setSteps(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType.type.type === 'GUM' || nextTileType.type.type === 'PLUM') {
            agent.setSteps(agent.steps - 1, agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agent.index)

            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain

            nextTileType.type = DefaultTile
          } else {
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
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

          newObservation.action.index = 1
          newObservation.action.name = 'right'

          const agentPosition = agent.position

          const nearTiles = []

          for (let y = -VISION_LENGTH; y <= VISION_LENGTH; y++) {
            for (let x = -VISION_LENGTH; x <= VISION_LENGTH; x++) {
              if (x === 0 && y === 0) continue

              const tileX = agentPosition.x + x
              const tileY = agentPosition.y + y

              if (tileX < 0 || tileX >= Math.sqrt(TILE_COUNT) || tileY < 0 || tileY >= Math.sqrt(TILE_COUNT)) {
                nearTiles.push({
                  type: {
                    type: 'DEFAULT',
                    heartGain: 0,
                    coinGain: 0,
                    stepGain: 0,
                  },
                  position: {
                    x: tileX,
                    y: tileY,
                  },
                })
              } else {
                const tile = agent.tileMap[tileX + Math.sqrt(TILE_COUNT) * tileY]
                nearTiles.push(tile)
              }
            }
          }

          newObservation.state.tileState = nearTiles.map((tile) => {
            const xDiff = tile.position.x - agentPosition.x
            const yDiff = tile.position.y - agentPosition.y
            const distance = Math.max(Math.abs(xDiff), Math.abs(yDiff))
            const significanceFactor = VISION_LENGTH / (VISION_LENGTH - 1 + distance)

            return {
              heartGain: tile.type.heartGain * significanceFactor,
              coinGain: tile.type.coinGain * significanceFactor,
              stepGain: tile.type.stepGain * significanceFactor,
              dirX: xDiff === 0 ? 0 : xDiff > 0 ? 1 : -1,
              dirY: yDiff === 0 ? 0 : yDiff > 0 ? 1 : -1,
            }
          })

          newObservation.state.normalizedStepsRemaining = agent.steps / TOTAL_STEPS
          newObservation.state.normalizedHeartsRemaining = agent.hearts / TOTAL_HEARTS

          observation.map((observation) => {
            if (Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum > N_STEPS) {
              observation.complete = true
            } else {
              observation.reward +=
                ((heartGain / TOTAL_HEARTS) * 0.2 + coinGain * 0.8) *
                Math.pow(DISCOUNT_FACTOR, Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum - 1)
            }
          })
          observation.push(newObservation)
          setObservations((observations) => [...observations, newObservation])
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
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setSteps(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType.type.type === 'GUM' || nextTileType.type.type === 'PLUM') {
            agent.setSteps(agent.steps - 1, agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agent.index)

            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain

            nextTileType.type = DefaultTile
          } else {
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
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

          newObservation.action.index = 2
          newObservation.action.name = 'up'

          const agentPosition = agent.position

          const nearTiles = []

          for (let y = -VISION_LENGTH; y <= VISION_LENGTH; y++) {
            for (let x = -VISION_LENGTH; x <= VISION_LENGTH; x++) {
              if (x === 0 && y === 0) continue

              const tileX = agentPosition.x + x
              const tileY = agentPosition.y + y

              if (tileX < 0 || tileX >= Math.sqrt(TILE_COUNT) || tileY < 0 || tileY >= Math.sqrt(TILE_COUNT)) {
                nearTiles.push({
                  type: {
                    type: 'DEFAULT',
                    heartGain: 0,
                    coinGain: 0,
                    stepGain: 0,
                  },
                  position: {
                    x: tileX,
                    y: tileY,
                  },
                })
              } else {
                const tile = agent.tileMap[tileX + Math.sqrt(TILE_COUNT) * tileY]
                nearTiles.push(tile)
              }
            }
          }

          newObservation.state.tileState = nearTiles.map((tile) => {
            const xDiff = tile.position.x - agentPosition.x
            const yDiff = tile.position.y - agentPosition.y
            const distance = Math.max(Math.abs(xDiff), Math.abs(yDiff))
            const significanceFactor = VISION_LENGTH / (VISION_LENGTH - 1 + distance)

            return {
              heartGain: tile.type.heartGain * significanceFactor,
              coinGain: tile.type.coinGain * significanceFactor,
              stepGain: tile.type.stepGain * significanceFactor,
              dirX: xDiff === 0 ? 0 : xDiff > 0 ? 1 : -1,
              dirY: yDiff === 0 ? 0 : yDiff > 0 ? 1 : -1,
            }
          })

          newObservation.state.normalizedStepsRemaining = agent.steps / TOTAL_STEPS
          newObservation.state.normalizedHeartsRemaining = agent.hearts / TOTAL_HEARTS

          observation.map((observation) => {
            if (Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum > N_STEPS) {
              observation.complete = true
            } else {
              observation.reward +=
                ((heartGain / TOTAL_HEARTS) * 0.2 + coinGain * 0.8) *
                Math.pow(DISCOUNT_FACTOR, Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum - 1)
            }
          })
          observation.push(newObservation)
          setObservations((observations) => [...observations, newObservation])
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
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setSteps(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType.type.type === 'GUM' || nextTileType.type.type === 'PLUM') {
            agent.setSteps(agent.steps - 1, agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agent.index)

            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain

            nextTileType.type = DefaultTile
          } else {
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
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

          newObservation.action.index = 3
          newObservation.action.name = 'down'

          const agentPosition = agent.position

          const nearTiles = []

          for (let y = -VISION_LENGTH; y <= VISION_LENGTH; y++) {
            for (let x = -VISION_LENGTH; x <= VISION_LENGTH; x++) {
              if (x === 0 && y === 0) continue

              const tileX = agentPosition.x + x
              const tileY = agentPosition.y + y

              if (tileX < 0 || tileX >= Math.sqrt(TILE_COUNT) || tileY < 0 || tileY >= Math.sqrt(TILE_COUNT)) {
                nearTiles.push({
                  type: {
                    type: 'DEFAULT',
                    heartGain: 0,
                    coinGain: 0,
                    stepGain: 0,
                  },
                  position: {
                    x: tileX,
                    y: tileY,
                  },
                })
              } else {
                const tile = agent.tileMap[tileX + Math.sqrt(TILE_COUNT) * tileY]
                nearTiles.push(tile)
              }
            }
          }

          newObservation.state.tileState = nearTiles.map((tile) => {
            const xDiff = tile.position.x - agentPosition.x
            const yDiff = tile.position.y - agentPosition.y
            const distance = Math.max(Math.abs(xDiff), Math.abs(yDiff))
            const significanceFactor = VISION_LENGTH / (VISION_LENGTH - 1 + distance)

            return {
              heartGain: tile.type.heartGain * significanceFactor,
              coinGain: tile.type.coinGain * significanceFactor,
              stepGain: tile.type.stepGain * significanceFactor,
              dirX: xDiff === 0 ? 0 : xDiff > 0 ? 1 : -1,
              dirY: yDiff === 0 ? 0 : yDiff > 0 ? 1 : -1,
            }
          })

          newObservation.state.normalizedStepsRemaining = agent.steps / TOTAL_STEPS
          newObservation.state.normalizedHeartsRemaining = agent.hearts / TOTAL_HEARTS

          observation.map((observation) => {
            if (Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum > N_STEPS) {
              observation.complete = true
            } else {
              observation.reward +=
                ((heartGain / TOTAL_HEARTS) * 0.2 + coinGain * 0.8) *
                Math.pow(DISCOUNT_FACTOR, Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum - 1)
            }
          })
          observation.push(newObservation)
          setObservations((observations) => [...observations, newObservation])
        }
        break
    }
  }

  useEffect(() => {
    movementApi.start(() => {
      return {
        positionX: 0,
        positionZ: 0,
        rotation: 0,
      }
    })

    const newTileMap = generateTileMap()

    for (let i = 0; i < NUM_AGENTS; i++) {
      environment.agentEnvironment[i].setPositionX(0, i)
      environment.agentEnvironment[i].setPositionZ(0, i)
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
  }, [agentTiles])

  const arr = [...Array(122).fill(1)]

  useEffect(() => {
    const moveAgents = async () => {
      const directions: ('left' | 'right' | 'up' | 'down')[] = ['left', 'right', 'up', 'down']

      if (observations.length / OBSERVATION_RESERVOIR >= 1) {
        gameState.setState('OPTIMIZATION')
        return
      }

      let numFinished = 0

      const arrTensor = tf.tensor2d([arr], [1, arr.length])
      const inputTensor = tf.tile(arrTensor, [NUM_AGENTS, 1])
      const logits = policyNetwork.predict(inputTensor) as tf.Tensor2D
      const prob = tf.softmax(logits)
      const idx = await tf.multinomial(prob, 1).array()

      for (let i = 0; i < NUM_AGENTS; i++) {
        if (environment.agentEnvironment[i].steps <= 0 || environment.agentEnvironment[i].hearts <= 0) {
          numFinished += 1
        } else {
          move(directions[idx[i][0]], i)
        }
      }

      if (numFinished > NUM_AGENTS / 2) {
        resetAgentMetrics()
        setMapResetCount((prevCount) => prevCount + 1)
      }
    }

    if (gameState.state === 'COLLECTION') {
      const intervalId = setInterval(moveAgents, 100)

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [environment.agentEnvironment, gameState.state])
  return (
    <>
      {/* <Perf /> */}
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
        <RoundedBox receiveShadow args={[30, 30]}>
          <meshStandardMaterial color={'#212336'} />
        </RoundedBox>
      </animated.mesh>
      <group position-x={10} position-z={-10} position-y={-1.5}>
        <Text3D position-y={5} position-x={-0.35} size={0.4} font={'/roboto.json'}>
          {Math.round((observations.length / OBSERVATION_RESERVOIR) * 100)}%
        </Text3D>
        <Text3D position-y={4.25} position-x={-0.8} size={0.4} font={'/roboto.json'}>
          {observations.length}/{OBSERVATION_RESERVOIR}
        </Text3D>
        <mesh position={[0, (observations.length / OBSERVATION_RESERVOIR) * 0.7 + 0.01, 0]}>
          <cylinderGeometry args={[1.2, 1.2, (observations.length / OBSERVATION_RESERVOIR) * 4]} />
          <meshStandardMaterial transparent color={'green'} />
        </mesh>
        <GlassBucket scale={4} />
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
      {/* <Html scale={0.5} position-z={8}>
        <Button
          onClick={() => move('left', 1)}
          variant='none'
          className='z-10 absolute right-1/2 bottom-10 transform -translate-y-1/2'
        >
          <ArrowLeft className='w-10 h-10' />
        </Button>

        <Button
          onClick={() => move('right', 1)}
          variant='none'
          className='z-10 absolute left-1/2 bottom-10 transform -translate-y-1/2'
        >
          <ArrowRight className='w-10 h-10' />
        </Button>

        <Button
          onClick={() => move('up', 1)}
          variant='none'
          className='z-10 absolute left-1/2 bottom-24 transform -translate-x-1/2'
        >
          <ArrowUp className='w-10 h-10' />
        </Button>

        <Button
          onClick={() => move('down', 1)}
          variant='none'
          className='z-10 absolute left-1/2 bottom-6 transform -translate-x-1/2'
        >
          <ArrowDown className='w-10 h-10' />
        </Button>
      </Html> */}
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
