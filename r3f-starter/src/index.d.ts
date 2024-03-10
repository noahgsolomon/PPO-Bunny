export const DefaultTile = { heartGain: 0, coinGain: 0, stepsGain: -1, type: 'DEFAULT' }
export const BombTile = { heartGain: -2, coinGain: -3, stepsGain: -1, type: 'BOMB' }
export const HologramTile = { heartGain: 0, coinGain: 0, stepsGain: -100, type: 'HOLOGRAM' }
export const GumTile = { heartGain: 0, coinGain: 3, stepGain: -1, type: 'GUM' }
export const PlumTile = { heartGain: 0, coinGain: 1, stepGain: -1, type: 'PLUM' }
export const HoleTile = { heartGain: 0, coinGain: 0, stepGain: 0, type: 'HOLE' }
export const CloneTile = { heartGain: 0, coinGain: 0, stepGain: 0, type: 'CLONE' }

export type TileType = DefaultTile | BombTile | HologramTile | GumTile | PlumTile

export type Position = { x: number; y: number }

export type AgentEnvironment = {
  tileMap: { type: TileType; position: Position }[]
  setTileMap: (tiles: { type: TileType; position: Position }[], i: number) => void
  index: number
  visionCapacity: number
  setVisionCapacity: (visionCapacity: number, i: number) => void
  position: Position
  setPosition: (position: Position, i: number) => void
  startingSteps: number
  setStartingSteps: (staringSteps: number, i: number) => void
  coins: number
  setCoins: (coins: number, i: number) => void
  hearts: number
  setHearts: (hearts: number, i: number) => void
}

export type EnvironmentState = {
  agentEnvironment: AgentEnvironment[]
  setAgentEnvironment: (agentEnvironment: AgentEnvironment, i: number) => void
  currentAgentIdx: number
  setCurrentAgentIdx: (currentAgentIdx: number) => void
  TILE_COUNT: number
}
