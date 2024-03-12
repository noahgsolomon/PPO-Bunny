import { GameState } from '@/index'
import { create } from 'zustand'

const useGameState = create<GameState>()((set) => ({
  state: 'INITIAL',
  setState: (state: string) => set(() => ({ state })),
}))

export default useGameState
