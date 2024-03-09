import { create } from 'zustand'
import { EnvironmentState, Position, TileType } from '@/index.d'

const useEnvironment = create<EnvironmentState>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set(() => ({ position })),
  tileMap: [],
  setTileMap: (tileMap) => set(() => ({ tileMap })),
  visionCapacity: 5,
  setVisionCapacity: (visionCapacity) => set(() => ({ visionCapacity })),
}))

export default useEnvironment
