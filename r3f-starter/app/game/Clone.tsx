import { useCursor } from '@react-three/drei'
import { forwardRef, useState } from 'react'
import CloneBunny from './CloneBunny'

export const Clone = forwardRef<any, any>((props, ref) => {
  const [hovered, setHovered] = useState(false)

  useCursor(hovered)

  return (
    <group ref={ref} {...props}>
      <group
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
