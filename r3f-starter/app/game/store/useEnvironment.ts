import { create } from 'zustand'
import { EnvironmentState, Position, TileType } from '@/index.d'

const NUM_AGENTS = 5

const useEnvironment = create<EnvironmentState>()((set) => ({
  TILE_COUNT: 100,
  agentEnvironment: [...Array(NUM_AGENTS)].map((_, i) => ({
    position: { x: 0, y: 0 },
    tileMap: [],
    visionCapacity: 5,
    steps: 20,
    coins: 0,
    index: i,
    hearts: 3,
    positionX: 0,
    positionZ: 0,
    rotation: 0,
    setPositionX: (positionX: number, i: number) =>
      set((state) => ({
        agentEnvironment: state.agentEnvironment.map((agent, idx) => (idx === i ? { ...agent, positionX } : agent)),
      })),
    setPositionZ: (positionZ: number, i: number) =>
      set((state) => ({
        agentEnvironment: state.agentEnvironment.map((agent, idx) => (idx === i ? { ...agent, positionZ } : agent)),
      })),
    setRotation: (rotation: number, i: number) =>
      set((state) => ({
        agentEnvironment: state.agentEnvironment.map((agent, idx) => (idx === i ? { ...agent, rotation } : agent)),
      })),
    setHearts: (hearts: number, i: number) =>
      set((state) => ({
        agentEnvironment: state.agentEnvironment.map((agent, idx) => (idx === i ? { ...agent, hearts } : agent)),
      })),
    setPosition: (position: Position, i: number) =>
      set((state) => ({
        agentEnvironment: state.agentEnvironment.map((agent, idx) => (idx === i ? { ...agent, position } : agent)),
      })),
    setTileMap: (tileMap: { type: TileType; position: Position }[], i: number) =>
      set((state) => ({
        agentEnvironment: state.agentEnvironment.map((agent, idx) => (idx === i ? { ...agent, tileMap } : agent)),
      })),
    setVisionCapacity: (visionCapacity: number, i: number) =>
      set((state) => ({
        agentEnvironment: state.agentEnvironment.map((agent, idx) =>
          idx === i ? { ...agent, visionCapacity } : agent,
        ),
      })),
    setSteps: (steps: number, i: number) =>
      set((state) => ({
        agentEnvironment: state.agentEnvironment.map((agent, idx) => (idx === i ? { ...agent, steps } : agent)),
      })),
    setCoins: (coins: number, i: number) =>
      set((state) => ({
        agentEnvironment: state.agentEnvironment.map((agent, idx) => (idx === i ? { ...agent, coins } : agent)),
      })),
  })),
  setAgentEnvironment: (agentEnvironment, i) =>
    set((state) => ({
      agentEnvironment: state.agentEnvironment.map((agent, idx) => (idx === i ? agentEnvironment : agent)),
    })),
  currentAgentIdx: 0,
  setCurrentAgentIdx: (currentAgentIdx) => set(() => ({ currentAgentIdx })),
}))

export default useEnvironment
