export type TileType = {
  default: { heartGain: 0; coinGain: 0; stepsGain: -1 }
  bomb: { heartGain: -2; coinGain: -3; stepsGain: -1 }
  hologram: { heartGain: 0; coinGain: 0; stepsGain: -100 }
  gum: { heartGain: 0; coinGain: 3; stepGain: -1 }
  plum: { heartGain: 0; coinGain: 1; stepGain: -1 }
}

export type EnvironmentState = {
  tiles: { type: TileType; position: { x: number; y: number } }[]
  setTiles: (tiles: { type: TileType; position: { x: number; y: number } }[]) => void
  visionCapacity: number
  setVisionCapacity: (visionCapacity: number) => void
  position: { x: number; y: number }
  setPosition: (position: { x: number; y: number }) => void
}
