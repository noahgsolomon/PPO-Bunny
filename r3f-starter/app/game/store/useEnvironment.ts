import { create } from 'zustand'
import { EnvironmentState } from '@/index.d'

const useEnvironment = create<EnvironmentState>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set(() => ({ position })),
  tileMap: [],
  setTileMap: (tileMap) => set(() => ({ tileMap })),
  visionCapacity: 5,
  setVisionCapacity: (visionCapacity) => set(() => ({ visionCapacity })),
  startingSteps: 20,
  setStartingSteps: (startingSteps) => set(() => ({ startingSteps })),
  coins: 0,
  setCoins: (coins) => set(() => ({ coins })),
}))

export default useEnvironment
