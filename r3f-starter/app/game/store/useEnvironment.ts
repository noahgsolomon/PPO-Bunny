import { EnvironmentState } from '@/index'
import { create } from 'zustand'

const useEnvironmentStore = create<EnvironmentState>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set(() => ({ position })),
  tiles: [],
  setTiles: (tiles) => set(() => ({ tiles })),
  visionCapacity: 5,
  setVisionCapacity: (visionCapacity) => set(() => ({ visionCapacity })),
}))
