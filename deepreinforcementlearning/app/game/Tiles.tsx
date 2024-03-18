'use client'

import { animated, config, useSpring, useSprings } from '@react-spring/three'
import { Center, Grid, RoundedBox, Text3D } from '@react-three/drei'
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
  State,
} from '@/index.d'
import { Perf } from 'r3f-perf'
import { GlassBucket } from './Models/GlassBucket'
import useGameState from './store/useGameState'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import RadarField from './RadarField'

export default function Tiles() {
  const [policyNetwork, setPolicyNetwork] = useState<tf.LayersModel>(null)
  const [valueNetwork, setValueNetwork] = useState<tf.LayersModel>(null)

  useEffect(() => {
    const loadModels = async () => {
      try {
        const [policyNetwork, valueNetwork] = await Promise.all([
          tf.loadLayersModel('https://raw.githubusercontent.com/noahgsolomon/bunnymodel/main/policy/model.json'),
          tf.loadLayersModel('https://raw.githubusercontent.com/noahgsolomon/bunnymodel/main/value/model.json'),
        ])
        console.log('Models loaded successfully')
        setPolicyNetwork(policyNetwork)
        setValueNetwork(valueNetwork)
      } catch (error) {
        console.error('Error loading the model:', error)
      }
    }

    loadModels()
  }, [])

  const AnimatedGrid = animated(Grid)
  const TILE_COUNT = 225
  const NUM_AGENTS = 10
  const N_STEPS = 6
  const TOTAL_STEPS = 50
  const TOTAL_HEARTS = 3
  const VISION_LENGTH = 4
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

  const move = (direction: 'left' | 'right' | 'up' | 'down', agentIdx: number, oldProb: number, state: number[]) => {
    const agent = environment.agentEnvironment[agentIdx]
    const TILE_COUNT = environment.TILE_COUNT

    if (agent.steps === 0 || agent.hearts === 0) return

    let nextTileType, positionX, positionZ, rotation

    let observation = observations.filter((obs) => obs.agentIdx === agentIdx && !obs.complete)

    let newObservation: AgentObservation = {
      agentIdx,
      state: [],
      action: { index: 0, name: 'left' },
      actionOldProbability: oldProb,
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
          if (nextTileType?.type.type === 'BOMB' && nextTileType.type.enabled) {
            agent.setHearts(Math.max(agent.hearts + nextTileType.type.heartGain, 0), agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agentIdx)
            nextTileType.type.enabled = false
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType?.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setSteps(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType?.type.type === 'GUM' || nextTileType?.type.type === 'PLUM') {
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

          newObservation.state = state

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
          // console.log(newObservation)
          setObservations((observations) => [...observations, newObservation])
        }
        break

      case 'right':
        nextTileType = agent.tileMap[agent.position.x + 1 + Math.sqrt(TILE_COUNT) * agent.position.y]

        if (agent.position.x + 1 <= Math.sqrt(TILE_COUNT) - 1 && nextTileType?.type.type !== 'HOLE') {
          agent.position.x += 1
          positionX = agent.positionX + 1.1
          rotation = Math.PI * 0.5
          if (nextTileType?.type.type === 'BOMB' && nextTileType.type.enabled) {
            agent.setHearts(Math.max(agent.hearts + nextTileType.type.heartGain, 0), agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agentIdx)
            nextTileType.type.enabled = false
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType?.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setSteps(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType?.type.type === 'GUM' || nextTileType?.type.type === 'PLUM') {
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

          newObservation.state = state

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

        if (agent.position.y - 1 >= 0 && nextTileType?.type.type !== 'HOLE') {
          agent.position.y -= 1
          positionZ = agent.positionZ - 1.1
          rotation = Math.PI

          if (nextTileType?.type.type === 'BOMB' && nextTileType.type.enabled) {
            agent.setHearts(Math.max(agent.hearts + nextTileType.type.heartGain, 0), agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agentIdx)
            nextTileType.type.enabled = false
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType?.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setSteps(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType?.type.type === 'GUM' || nextTileType?.type.type === 'PLUM') {
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

          newObservation.state = state

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

        if (agent.position.y + 1 <= Math.sqrt(TILE_COUNT) - 1 && nextTileType?.type.type !== 'HOLE') {
          agent.position.y += 1
          positionZ = agent.positionZ + 1.1
          rotation = 0

          if (nextTileType?.type.type === 'BOMB' && nextTileType.type.enabled) {
            agent.setHearts(Math.max(agent.hearts + nextTileType.type.heartGain, 0), agentIdx)
            agent.setCoins(agent.coins + nextTileType.type.coinGain, agentIdx)
            nextTileType.type.enabled = false
            agent.setSteps(agent.steps - 1, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType?.type.type === 'HOLOGRAM') {
            agent.setHearts(0, agentIdx)
            agent.setSteps(0, agentIdx)
            agent.setPositionY(-1.4, agentIdx)
            heartGain = nextTileType.type.heartGain
            coinGain = nextTileType.type.coinGain
          } else if (nextTileType?.type.type === 'GUM' || nextTileType?.type.type === 'PLUM') {
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

          newObservation.state = state
          newObservation.actionOldProbability = oldProb

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

  // DATA COLLECTION INTERVAL
  useEffect(() => {
    const moveAgents = async () => {
      // const startTime = performance.now()
      const directions: ('left' | 'right' | 'up' | 'down')[] = ['left', 'right', 'up', 'down']

      if (observations.length / OBSERVATION_RESERVOIR >= 1) {
        gameState.setState('OPTIMIZATION')
        return
      }

      let numFinished = 0

      const states: State[] = []

      for (const agent of environment.agentEnvironment) {
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

        let state: State = {
          tileState: [],
          normalizedHeartsRemaining: 1,
          normalizedStepsRemaining: 1,
        }

        state.normalizedStepsRemaining = agent.steps / TOTAL_STEPS
        state.normalizedHeartsRemaining = agent.hearts / TOTAL_HEARTS
        state.tileState = nearTiles.map((tile) => {
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

        states.push(state)
      }

      const input: number[][] = states.map((agentObservation) => {
        return [
          agentObservation.normalizedHeartsRemaining,
          agentObservation.normalizedStepsRemaining,
          ...agentObservation.tileState.flatMap((tile: any) => [
            tile.coinGain,
            tile.dirX,
            tile.dirY,
            tile.heartGain,
            tile.stepGain,
          ]),
        ]
      })

      const logits = policyNetwork.predict(tf.tensor(input)) as tf.Tensor2D
      const prob = tf.softmax(logits)
      const idx = await tf.multinomial(prob, 1).array()
      const probArr = await prob.array()

      for (let i = 0; i < NUM_AGENTS; i++) {
        if (environment.agentEnvironment[i].steps <= 0 || environment.agentEnvironment[i].hearts <= 0) {
          numFinished += 1
        } else {
          move(directions[idx[i][0]], i, probArr[i][idx[i][0]], input[i])
        }
      }

      if (numFinished >= NUM_AGENTS * 0.75) {
        resetAgentMetrics()
        setMapResetCount((prevCount) => prevCount + 1)
      }

      // const endTime = performance.now()
      // const executionTime = endTime - startTime
      // console.log(`moveAgents execution time: ${executionTime} ms`)
    }

    if (gameState.state === 'COLLECTION') {
      const intervalId = setInterval(moveAgents, 100)

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [environment.agentEnvironment, gameState.state])

  //POLICY & VALUE NETWORK OPTIMIZATION STEP
  useEffect(() => {
    if (gameState.state === 'OPTIMIZATION') {
      const optimize = async () => {
        const BATCH_SIZE = 32
        const EPOCHS = 3
        const EPSILON = 0.2

        const batch = observations.filter((obs) => obs.complete)
        const numBatches = Math.ceil(batch.length / BATCH_SIZE)

        for (let epoch = 0; epoch < EPOCHS; epoch++) {
          for (let i = 0; i < numBatches; i++) {
            const startIdx = i * BATCH_SIZE
            const endIdx = Math.min((i + 1) * BATCH_SIZE, batch.length)
            const miniBatch = batch.slice(startIdx, endIdx)

            const state = miniBatch.map((b) => b.state) as number[][]
            const discountedSumOfRewards = miniBatch.map((e) => e.reward)
            const actions = miniBatch.map((b) => b.action.index)
            const oldProb = miniBatch.map((b) => b.actionOldProbability)

            const xs = tf.tensor(state)
            const ys = tf.tensor(discountedSumOfRewards)

            valueNetwork.compile({ optimizer: 'adam', loss: 'meanSquaredError' })

            // Train the value network
            const valueHistory = await valueNetwork.fit(xs, ys, {
              batchSize: miniBatch.length,
              epochs: 1,
              shuffle: false,
            })

            console.log(`Value network loss (epoch ${epoch + 1}, batch ${i + 1}):`, valueHistory.history.loss)

            // Calculate the advantage
            const valueOutput = valueNetwork.predict(xs) as tf.Tensor2D
            const advantage = ys.sub(valueOutput).square()

            policyNetwork.compile({ optimizer: 'adam', loss: ppoLoss })

            // Train the policy network
            const policyHistory = await policyNetwork.fit(xs, tf.ones([xs.shape[0], 4]), {
              batchSize: miniBatch.length,
              epochs: 1,
              shuffle: false,
            })

            console.log(`Policy network loss (epoch ${epoch + 1}, batch ${i + 1}):`, policyHistory.history.loss)

            // Custom loss function for PPO
            function ppoLoss(yTrue, yPred) {
              const actionsInt32 = tf.cast(actions, 'int32')
              const prob = (tf.softmax(yPred) as tf.Tensor2D).gather(actionsInt32, 1)
              const oldProbTensor = tf.tensor(oldProb)
              const ratio = prob.div(oldProbTensor.add(1e-10))
              const clippedRatio = ratio.clipByValue(1 - EPSILON, 1 + EPSILON)
              const loss = tf.minimum(ratio.mul(advantage), clippedRatio.mul(advantage)).neg()
              return loss.mean()
            }
            // Cleanup tensors
            xs.dispose()
            ys.dispose()
            valueOutput.dispose()
            advantage.dispose()
          }
        }
        setObservations([])
        gameState.setState('COLLECTION')
      }

      optimize()
    }
  }, [gameState.state, observations])

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
                        <RadarField
                          position-x={movement[environment.currentAgentIdx].positionX}
                          position-z={movement[environment.currentAgentIdx].positionZ}
                          viewDistance={VISION_LENGTH * 2 + 1}
                        />
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
