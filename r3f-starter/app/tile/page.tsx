'use client'

import ViewLoader from '@/components/loaders/ViewLoader'
import dynamic from 'next/dynamic'
import { a, animated, config, useSpring, useSpringValue } from '@react-spring/three'
import { useEffect } from 'react'
import { Vector3 } from 'three'
import { Float } from '@react-three/drei'

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => <ViewLoader />,
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function Page() {
  const scale = useSpringValue(0, {
    config: config.wobbly,
  })

  const [rotate, rotateApi] = useSpring(() => ({
    from: {
      y: 0,
    },
  }))

  useEffect(() => {
    scale.start(1)
  }, [])

  const handleRotate = () => {
    rotateApi.start({
      from: { y: 0 },
      to: { y: Math.PI },
      config: config.wobbly,
    })
  }

  return (
    <div>
      <div>sup</div>
      <View className='absolute left-0 top-0 w-full h-full'>
        <Float>
          <animated.mesh rotation-y={rotate.y} onClick={handleRotate} scale={scale}>
            <boxGeometry />
            <meshStandardMaterial color={'red'} />
          </animated.mesh>
        </Float>

        <Common />
      </View>
    </div>
  )
}
