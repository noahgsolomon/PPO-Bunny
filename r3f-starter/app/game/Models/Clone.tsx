'use client'

import { useCursor } from '@react-three/drei'
import { forwardRef, useState } from 'react'
import CloneBunny from '../CloneBunny'
import { GroupProps } from '@react-three/fiber'
import useEnvironment from '../store/useEnvironment'

interface CloneProps extends GroupProps {
  i: number
}

export const Clone = forwardRef<any, CloneProps>(({ i, ...groupProps }, ref) => {
  const [hovered, setHovered] = useState(false)

  useCursor(hovered)

  const environment = useEnvironment()

  const { x, y } = {
    x: i % Math.sqrt(environment.TILE_COUNT),
    y: Math.floor(i / Math.sqrt(environment.TILE_COUNT)),
  }

  return (
    <group ref={ref} {...groupProps}>
      <group
        onClick={() => {
          const agent = environment.agentEnvironment.filter(
            (agent) => agent.position.x === x && agent.position.y === y,
          )[0]

          environment.setCurrentAgentIdx(agent.index)
        }}
        onPointerEnter={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerLeave={(e) => {
          e.stopPropagation()
          setHovered(false)
        }}
      >
        <CloneBunny />
      </group>
    </group>
  )
})
