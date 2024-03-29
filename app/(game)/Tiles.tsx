'use client'

import 'regenerator-runtime/runtime'
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

import { toast } from 'sonner'
import { createModelCpu, createModelGpu, runModel, warmupModel } from './runModel'

// SAVE POINT

export const NUM_AGENTS = 10

export default function Tiles() {
  const [policyNetwork, setPolicyNetwork] = useState(null)
  // const [valueNetwork, setValueNetwork] = useState<tf.LayersModel>(null)

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelFile = await fetch('/model/model.onnx')
        const modelBuffer = await modelFile.arrayBuffer()
        const policyNetwork = await createModelCpu(modelBuffer)
        warmupModel(policyNetwork)
        console.log('Model loaded successfully')
        setPolicyNetwork(policyNetwork)
      } catch (error) {
        console.error('Error loading the model:', error)
      }
    }

    loadModels()
  }, [])

  const AnimatedGrid = animated(Grid)
  const TILE_COUNT = 100
  const N_STEPS = 4
  const DISCOUNT_FACTOR = 0.9
  const OBSERVATION_RESERVOIR = 1000

  const TOTAL_STEPS = 100

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
    to: { positionY: -1.5 },
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
      while (
        randTiles.includes(rand) ||
        rand % Math.sqrt(TILE_COUNT) < 1 ||
        Math.floor(rand / Math.sqrt(TILE_COUNT)) < 1 ||
        rand % Math.sqrt(TILE_COUNT) >= Math.sqrt(TILE_COUNT) - 1 ||
        Math.floor(rand / Math.sqrt(TILE_COUNT)) >= Math.sqrt(TILE_COUNT) - 1
      ) {
        rand = Math.round(Math.random() * TILE_COUNT - 1)
      }
      randTiles.push(rand)
    }
    return randTiles
  }, [mapResetCount])

  const generateTileMap = () => {
    let holyTile = Math.round(Math.random() * TILE_COUNT - 1)
    while (
      holyTile % Math.sqrt(TILE_COUNT) < 1 ||
      Math.floor(holyTile / Math.sqrt(TILE_COUNT)) < 1 ||
      holyTile % Math.sqrt(TILE_COUNT) >= Math.sqrt(TILE_COUNT) - 1 ||
      Math.floor(holyTile / Math.sqrt(TILE_COUNT)) >= Math.sqrt(TILE_COUNT) - 1 ||
      agentTiles.includes(holyTile)
    ) {
      holyTile = Math.round(Math.random() * TILE_COUNT - 1)
    }

    environment.setTargetPosition({
      x: holyTile % Math.sqrt(TILE_COUNT),
      y: Math.floor(holyTile / Math.sqrt(TILE_COUNT)),
    })

    const newTileMap = springs.reduce(
      (acc, _, i) => {
        const { tile } = generateTiles(i, agentTiles)

        acc.push({
          type:
            holyTile === i
              ? GumTile
              : i % Math.sqrt(TILE_COUNT) < 1 ||
                  Math.floor(i / Math.sqrt(TILE_COUNT)) < 1 ||
                  i % Math.sqrt(TILE_COUNT) >= Math.sqrt(TILE_COUNT) - 1 ||
                  Math.floor(i / Math.sqrt(TILE_COUNT)) >= Math.sqrt(TILE_COUNT) - 1
                ? HologramTile
                : tile === 'HOLE'
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
  const [rewardArr, setRewardArr] = useState<number[]>([])

  const [movement, movementApi] = useSprings(NUM_AGENTS, (i) => ({
    positionX: environment.agentEnvironment[i].positionX,
    positionZ: environment.agentEnvironment[i].positionZ,
    rotation: environment.agentEnvironment[i].rotation,
    config: config.gentle,
  }))

  // RESETS AGENT METRICS BEFORE NEXT MAP CHANGE
  const resetAgentMetrics = () => {
    for (let i = 0; i < NUM_AGENTS; i++) {
      // environment.agentEnvironment[i].setSteps(TOTAL_STEPS, i)
      // environment.agentEnvironment[i].setHearts(TOTAL_HEARTS, i)
      environment.agentEnvironment[i].setCoins(0, i)
      environment.agentEnvironment[i].setFinished(false, i)
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

  // MOVE AGENT
  const move = (
    direction: 'left' | 'right' | 'up' | 'down',
    agentIdx: number,
    oldProb: number,
    // , state: number[][]
  ) => {
    const agent = environment.agentEnvironment[agentIdx]
    const TILE_COUNT = environment.TILE_COUNT

    if (agent.finished) return

    let nextTile, nextTileType, positionX, positionZ, rotation

    let observation = observations.filter((obs) => obs.agentIdx === agentIdx && !obs.complete)

    let newObservation: AgentObservation = {
      agentIdx,
      state: { posX: 0, posY: 0, targetPosX: 0, targetPosY: 0 },
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
        nextTile = agent.tileMap[agent.position.x - 1 + Math.sqrt(TILE_COUNT) * agent.position.y]
        nextTileType = nextTile?.type

        if (!nextTileType || !nextTileType?.type) return

        if (agent.position.x - 1 >= 0 && nextTileType.type !== 'HOLE') {
          agent.position.x -= 1
          positionX = agent.positionX - 1.1
          rotation = -Math.PI * 0.5
          if (nextTileType.type === 'BOMB' && nextTileType.enabled) {
            nextTileType.enabled = false
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
          } else if (nextTileType.type === 'HOLOGRAM') {
            agent.setPositionY(-0.9, agentIdx)
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
            agent.setFinished(true, agentIdx)
          } else if (nextTileType.type === 'GUM' || nextTileType.type === 'PLUM') {
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
            agent.setFinished(true, agentIdx)
            nextTile.type = DefaultTile
          } else {
            if (nextTileType.type === 'BOMB') {
              heartGain = 0
              coinGain = 0.2
            } else {
              heartGain = nextTileType.heartGain
              coinGain = nextTileType.coinGain
            }
          }

          agent.setSteps(agent.steps - 1, agentIdx)
          // agent.setHearts(Math.max(agent.hearts + heartGain, 0), agentIdx)
          agent.setCoins(agent.coins + coinGain, agentIdx)

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

          newObservation.state = {
            posX: agent.position.x,
            posY: agent.position.y,
            targetPosX: environment.targetPosition.x,
            targetPosY: environment.targetPosition.y,
          }

          observation.map((observation) => {
            if (Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum > N_STEPS) {
              observation.complete = true
            } else {
              // const surroundingRewards = stateState.tileState.reduce(
              //   (acc, tile) => acc + (tile.coinGain + tile.heartGain),
              //   0,
              // )
              observation.reward += coinGain
              Math.pow(DISCOUNT_FACTOR, Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum - 1)
            }
          })
          observation.push(newObservation)
          // console.log(newObservation)
          setObservations((observations) => [...observations, newObservation])
        }
        break

      case 'right':
        nextTile = agent.tileMap[agent.position.x + 1 + Math.sqrt(TILE_COUNT) * agent.position.y]
        nextTileType = nextTile?.type

        if (!nextTileType || !nextTileType?.type) return

        if (agent.position.x + 1 <= Math.sqrt(TILE_COUNT) - 1 && nextTileType.type !== 'HOLE') {
          agent.position.x += 1
          positionX = agent.positionX + 1.1
          rotation = Math.PI * 0.5
          if (nextTileType.type === 'BOMB' && nextTileType.enabled) {
            nextTileType.enabled = false
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
          } else if (nextTileType.type === 'HOLOGRAM') {
            agent.setPositionY(-0.9, agentIdx)
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
            agent.setFinished(true, agentIdx)
          } else if (nextTileType.type === 'GUM' || nextTileType.type === 'PLUM') {
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
            agent.setFinished(true, agentIdx)
            nextTile.type = DefaultTile
          } else {
            if (nextTileType.type === 'BOMB') {
              heartGain = 0
              coinGain = 0.2
            } else {
              heartGain = nextTileType.heartGain
              coinGain = nextTileType.coinGain
            }
          }

          agent.setSteps(agent.steps - 1, agentIdx)
          // agent.setHearts(Math.max(agent.hearts + heartGain, 0), agentIdx)
          agent.setCoins(agent.coins + coinGain, agentIdx)

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

          newObservation.state = {
            posX: agent.position.x,
            posY: agent.position.y,
            targetPosX: environment.targetPosition.x,
            targetPosY: environment.targetPosition.y,
          }

          observation.map((observation) => {
            if (Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum > N_STEPS) {
              observation.complete = true
            } else {
              observation.reward +=
                coinGain *
                Math.pow(DISCOUNT_FACTOR, Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum - 1)
            }
          })
          observation.push(newObservation)
          setObservations((observations) => [...observations, newObservation])
        }
        break

      case 'up':
        nextTile = agent.tileMap[agent.position.x + Math.sqrt(TILE_COUNT) * (agent.position.y - 1)]
        nextTileType = nextTile?.type

        if (!nextTileType || !nextTileType?.type) return

        if (agent.position.y - 1 >= 0 && nextTileType.type !== 'HOLE') {
          agent.position.y -= 1
          positionZ = agent.positionZ - 1.1
          rotation = Math.PI

          if (nextTileType.type === 'BOMB' && nextTileType.enabled) {
            nextTileType.enabled = false
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
          } else if (nextTileType.type === 'HOLOGRAM') {
            agent.setPositionY(-0.9, agentIdx)
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
            agent.setFinished(true, agentIdx)
          } else if (nextTileType.type === 'GUM' || nextTileType.type === 'PLUM') {
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
            agent.setFinished(true, agentIdx)
            nextTile.type = DefaultTile
          } else {
            if (nextTileType.type === 'BOMB') {
              heartGain = 0
              coinGain = 0.2
            } else {
              heartGain = nextTileType.heartGain
              coinGain = nextTileType.coinGain
            }
          }

          agent.setSteps(agent.steps - 1, agentIdx)
          // agent.setHearts(Math.max(agent.hearts + heartGain, 0), agentIdx)
          agent.setCoins(agent.coins + coinGain, agentIdx)

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

          newObservation.state = {
            posX: agent.position.x,
            posY: agent.position.y,
            targetPosX: environment.targetPosition.x,
            targetPosY: environment.targetPosition.y,
          }

          observation.map((observation) => {
            if (Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum > N_STEPS) {
              observation.complete = true
            } else {
              observation.reward +=
                coinGain *
                Math.pow(DISCOUNT_FACTOR, Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum - 1)
            }
          })
          observation.push(newObservation)
          setObservations((observations) => [...observations, newObservation])
        }
        break

      case 'down':
        nextTile = agent.tileMap[agent.position.x + Math.sqrt(TILE_COUNT) * (agent.position.y + 1)]
        nextTileType = nextTile?.type

        if (!nextTileType || !nextTileType?.type) return

        if (agent.position.y + 1 <= Math.sqrt(TILE_COUNT) - 1 && nextTileType.type !== 'HOLE') {
          agent.position.y += 1
          positionZ = agent.positionZ + 1.1
          rotation = 0

          if (nextTileType.type === 'BOMB' && nextTileType.enabled) {
            nextTileType.enabled = false
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
          } else if (nextTileType.type === 'HOLOGRAM') {
            agent.setPositionY(-0.9, agentIdx)
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
            agent.setFinished(true, agentIdx)
          } else if (nextTileType.type === 'GUM' || nextTileType.type === 'PLUM') {
            heartGain = nextTileType.heartGain
            coinGain = nextTileType.coinGain
            agent.setFinished(true, agentIdx)
            nextTile.type = DefaultTile
          } else {
            if (nextTileType.type === 'BOMB') {
              heartGain = 0
              coinGain = 0.2
            } else {
              heartGain = nextTileType.heartGain
              coinGain = nextTileType.coinGain
            }
          }

          agent.setSteps(agent.steps - 1, agentIdx)
          // agent.setHearts(Math.max(agent.hearts + heartGain, 0), agentIdx)
          agent.setCoins(agent.coins + coinGain, agentIdx)

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

          newObservation.state = {
            posX: agent.position.x,
            posY: agent.position.y,
            targetPosX: environment.targetPosition.x,
            targetPosY: environment.targetPosition.y,
          }

          newObservation.actionOldProbability = oldProb

          observation.map((observation) => {
            if (Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum > N_STEPS) {
              observation.complete = true
              // console.log(observation)
            } else {
              observation.reward +=
                coinGain *
                Math.pow(DISCOUNT_FACTOR, Math.abs(agent.steps - TOTAL_STEPS) - observation.startStepTrajectoryNum - 1)
            }
          })
          observation.push(newObservation)
          setObservations((observations) => [...observations, newObservation])
        }
        break
    }
  }

  // UPDATE MAP AND SET AGENT INITIAL POSITION
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
    if (gameState.state === 'LOADING') {
      gameState.setState('INITIAL')
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

        // const nearTiles: { type: TileType; position: Position }[] = []

        // for (let y = 0; y <= Math.sqrt(TILE_COUNT); y++) {
        //   for (let x = 0; x <= Math.sqrt(TILE_COUNT); x++) {
        //     // if (x === 0 && y === 0) continue

        //     // if (Math.abs(y) + Math.abs(x) > VISION_LENGTH) continue

        //     const tileX = agentPosition.x + x
        //     const tileY = agentPosition.y + y

        //     if (tileX < 0 || tileX >= Math.sqrt(TILE_COUNT) || tileY < 0 || tileY >= Math.sqrt(TILE_COUNT)) {
        //       nearTiles.push({
        //         type: {
        //           type: 'HOLE',
        //           heartGain: 0,
        //           coinGain: 0,
        //           stepGain: 0,
        //           index: 0,
        //         },
        //         position: {
        //           x: tileX,
        //           y: tileY,
        //         },
        //       })
        //     } else {
        //       const tile = agent.tileMap[tileX + Math.sqrt(TILE_COUNT) * tileY]
        //       if (tile.type.type === 'BOMB' && !tile.type.enabled) {
        //         nearTiles.push({
        //           type: {
        //             heartGain: 0,
        //             coinGain: 0.2,
        //             stepGain: -1,
        //             type: 'DEFAULT',
        //             index: 0,
        //           },
        //           position: {
        //             x: tileX,
        //             y: tileY,
        //           },
        //         })
        //       } else {
        //         nearTiles.push(tile)
        //       }
        //     }
        //   }
        // }

        // state.normalizedStepsRemaining = agent.steps / TOTAL_STEPS
        // state.normalizedHeartsRemaining = agent.hearts / TOTAL_HEARTS

        states.push({
          posX: agentPosition.x,
          posY: agentPosition.y,
          targetPosX: environment.targetPosition.x,
          targetPosY: environment.targetPosition.y,
        })
      }

      const inputData = states.map((state) => [state.posX - state.targetPosX, state.posY - state.targetPosY])

      // const input: number[][][] = states.map((agentObservation) => {
      //   const tileState = agentObservation.tileState as number[][]
      //   const reshapedTileState = []
      //   for (let i = 0; i < Math.sqrt(TILE_COUNT); i++) {
      //     reshapedTileState.push(tileState.slice(i * Math.sqrt(TILE_COUNT), (i + 1) * Math.sqrt(TILE_COUNT)))
      //   }
      //   return reshapedTileState
      // })

      // const input_array = tf.tensor(inputData)

      console.log(policyNetwork)
      // const logits = policyNetwork.predict(input_array) as tf.Tensor2D
      // const prob = tf.softmax(logits)
      // const idx = await tf.multinomial(prob, 1).array()
      // const probArr = await prob.array()

      for (let i = 0; i < NUM_AGENTS; i++) {
        if (environment.agentEnvironment[i].finished) {
          numFinished += 1
          setRewardArr((prev) => [...prev, environment.agentEnvironment[i].coins])
        } else {
          // move(directions[idx[i][0]], i, probArr[i][idx[i][0]])
        }
      }

      if (numFinished >= NUM_AGENTS) {
        resetAgentMetrics()
        setMapResetCount((prevCount) => prevCount + 1)
      }

      // const endTime = performance.now()
      // const executionTime = endTime - startTime
      // console.log(`moveAgents execution time: ${executionTime} ms`)
    }

    let intervalId

    if (gameState.state === 'COLLECTION') {
      intervalId = setInterval(moveAgents, 50)
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [environment.agentEnvironment, gameState.state])

  //POLICY & VALUE NETWORK OPTIMIZATION STEP
  useEffect(() => {
    // const optimize = async () => {
    //   console.log(`avg reward: ${rewardArr.reduce((a, b) => a + b, 0) / rewardArr.length}`)
    //   setRewardArr([])
    //   resetAgentMetrics()
    //   setMapResetCount((prevCount) => prevCount + 1)
    //   await new Promise((resolve) => setTimeout(resolve, 1000))
    //   const BATCH_SIZE = 16
    //   const EPOCHS = 3
    //   const EPSILON = 0.1
    //   const batch = observations
    //   setObservations([])
    //   const numBatches = Math.ceil(batch.length / BATCH_SIZE)
    //   valueNetwork.compile({ optimizer: new tf.AdamOptimizer(0.001, 0.9, 0.999), loss: 'meanSquaredError' })
    //   for (let epoch = 0; epoch < EPOCHS; epoch++) {
    //     let totalValueLoss = 0
    //     let totalPolicyLoss = 0
    //     for (let i = 0; i < numBatches; i++) {
    //       const startIdx = i * BATCH_SIZE
    //       const endIdx = Math.min((i + 1) * BATCH_SIZE, batch.length)
    //       const miniBatch = batch.slice(startIdx, endIdx)
    //       const state = miniBatch.map((b) => {
    //         const { posX, posY, targetPosX, targetPosY } = b.state
    //         return [posX - targetPosX, posY - targetPosY]
    //       })
    //       const discountedSumOfRewards = miniBatch.map((e) => e.reward)
    //       const actions = miniBatch.map((b) => b.action.index)
    //       const oldProb = miniBatch.map((b) => b.actionOldProbability)
    //       const xs = tf.tensor(state)
    //       const ys = tf.tensor(discountedSumOfRewards)
    //       // Train the value network
    //       const valueHistory = await valueNetwork.fit(xs, ys, {
    //         batchSize: miniBatch.length,
    //         epochs: 3,
    //         shuffle: true,
    //       })
    //       totalValueLoss += valueHistory.history.loss[0] as number
    //       // Calculate the advantage
    //       const valueOutput = valueNetwork.predict(xs) as tf.Tensor2D
    //       const advantage = ys.sub(valueOutput)
    //       policyNetwork.compile({ optimizer: new tf.AdamOptimizer(0.001, 0.9, 0.999), loss: ppoLoss })
    //       // Train the policy network
    //       const policyHistory = await policyNetwork.fit(xs, tf.ones([xs.shape[0], 4]), {
    //         batchSize: miniBatch.length,
    //         epochs: 3,
    //         shuffle: false,
    //       })
    //       totalPolicyLoss += policyHistory.history.loss[0] as number
    //       // Custom loss function for PPO
    //       function ppoLoss(yTrue, yPred) {
    //         return tf.tidy(() => {
    //           const actionsInt32 = tf.cast(actions, 'int32')
    //           const prob = (tf.softmax(yPred) as tf.Tensor2D).gather(actionsInt32, 1)
    //           const oldProbTensor = tf.tensor(oldProb)
    //           const ratio = prob.div(oldProbTensor.add(1e-10))
    //           const clippedRatio = ratio.clipByValue(1 - EPSILON, 1 + EPSILON)
    //           const loss = tf.minimum(ratio.mul(advantage), clippedRatio.mul(advantage)).neg()
    //           const entropy = -tf.sum(prob.mul(prob.log()), 1)
    //           const entropyLoss = tf.mean(entropy)
    //           // Add entropy to the loss (encourage exploration)
    //           const totalLoss = loss.mean()
    //           return totalLoss
    //         })
    //       }
    //       // Cleanup tensors
    //       xs.dispose()
    //       ys.dispose()
    //       valueOutput.dispose()
    //       advantage.dispose()
    //     }
    //     const avgValueLoss = totalValueLoss / numBatches
    //     const avgPolicyLoss = totalPolicyLoss / numBatches
    //     if (epoch === EPOCHS - 1 && avgValueLoss && avgPolicyLoss) {
    //       toast.success(
    //         `AVG VALUE_NET LOSS: ${avgValueLoss.toFixed(4)}\nAVG POLICY_NET LOSS: ${avgPolicyLoss.toFixed(4)}`,
    //       )
    //     }
    //   }
    //   gameState.setState('COLLECTION')
    // }
    // if (gameState.state === 'OPTIMIZATION') {
    //   optimize()
    // }
  }, [gameState.state])

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
                      </>
                    ) : (
                      <Clone movement={movement} i={i} />
                    )
                  ) : null}
                  {/*@ts-ignore */}
                  <RoundedBox castShadow receiveShadow args={[1, tileType === 'BOMB' ? 2.1 : 0.1, 1]}>
                    {tileType !== 'HOLOGRAM' ? (
                      <meshStandardMaterial
                        color={
                          // environment.agentEnvironment[environment.currentAgentIdx].steps > 0 &&
                          // environment.agentEnvironment[environment.currentAgentIdx].hearts > 0 &&
                          // Math.abs(
                          //   environment.agentEnvironment[environment.currentAgentIdx].position.x -
                          //     (i % Math.sqrt(TILE_COUNT)),
                          // ) <= VISION_LENGTH &&
                          // Math.abs(
                          //   environment.agentEnvironment[environment.currentAgentIdx].position.y -
                          //     Math.floor(i / Math.sqrt(TILE_COUNT)),
                          // ) <= VISION_LENGTH
                          //   ? '#00ff00'
                          //   : tileType === 'BOMB'
                          //     ? '#FF3D33'
                          //     :
                          '#3A3D5E'
                        }
                      />
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
      {/*@ts-ignore */}
      <animated.mesh position-y={baseSpring.positionY} rotation-x={Math.PI * 0.5}>
        {/*@ts-ignore */}
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
  // const deathTile = Math.random() > 0.95 && !agentTiles.includes(i)
  // const clone = Math.random() > 0.98 && !agentTiles.includes(i) && !deathTile
  // const plum = !agentTiles.includes(i) && !clone && !deathTile && Math.random() > 0.8
  // const gum = plum && Math.random() > 0.8
  // const hologram = !agentTiles.includes(i) && !deathTile && !plum && !gum && !clone && Math.random() < 0.1
  // const hole = Math.random() < 0.2

  const tile =
    // !agentTiles.includes(i) && hole
    //   ? 'HOLE' :
    // hologram ? 'HOLOGRAM' : deathTile ? 'BOMB' : gum ? 'GUM' : plum ? 'PLUM' :
    'DEFAULT'

  return {
    tile,
  }
}
