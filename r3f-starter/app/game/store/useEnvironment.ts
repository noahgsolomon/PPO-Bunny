import { create } from 'zustand'
import { EnvironmentState, Position, TileType } from '@/index.d'

const NUM_AGENTS = 5

const useEnvironment = create<EnvironmentState>()((set) => ({
  agentEnvironment: [...Array(NUM_AGENTS)].map((_, i) => ({
    position: { x: 0, y: 0 },
    tileMap: [],
    visionCapacity: 5,
    startingSteps: 20,
    coins: 0,
    index: i,
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
    setStartingSteps: (startingSteps: number, i: number) =>
      set((state) => ({
        agentEnvironment: state.agentEnvironment.map((agent, idx) => (idx === i ? { ...agent, startingSteps } : agent)),
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
  TILE_COUNT: 100,
}))

export default useEnvironment
