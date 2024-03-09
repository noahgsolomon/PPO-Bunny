import { animated, config, useSpring } from '@react-spring/three'
import { useCursor } from '@react-three/drei'
import { forwardRef, useState } from 'react'
import Bunny from './Models/Bunny'
import Heart from './Models/Heart'

export const Player = forwardRef<any, any>((props, ref) => {
  const [hovered, setHovered] = useState(false)

  useCursor(hovered)

  const { scale, rotation, positionY } = useSpring<{ scale: number; rotation: number; positionY: number }>({
    scale: hovered ? 1.2 : 1,
    rotation: hovered ? Math.PI * 2 : 0,
    positionY: hovered ? 0.3 : 0,
    from: { scale: 0 },
    config: config.gentle,
  })

  return (
    <group ref={ref} {...props}>
      <animated.group position-y={positionY} scale={scale}>
        <Heart position-y={0.8} position-x={-0.4} />
        <Heart position-y={0.8} position-x={0} />
        <Heart position-y={0.8} position-x={0.4} />
      </animated.group>
      <animated.group
        rotation-y={rotation}
        onPointerEnter={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerLeave={(e) => {
          e.stopPropagation()
          setHovered(false)
        }}
        position-y={positionY}
        scale={scale}
      >
        <Bunny />
      </animated.group>
    </group>
  )
})
