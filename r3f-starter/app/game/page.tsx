'use client'

import Tiles from './Tiles'
import dynamic from 'next/dynamic'
import Lights from './Lights'
import { Vector3 } from 'three'
import { Html, PerspectiveCamera } from '@react-three/drei'
import { Button } from '@/components/ui/button'

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), { ssr: false })
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function Page() {
  return (
    <div>
      <View orbit className='absolute top-0 w-full h-full bg-[#121316]'>
        {/* <fog attach='fog' args={['#121316', 0.1, 10]} /> */}
        <Tiles />
        <Lights />
        <PerspectiveCamera makeDefault position={[4, 10, 20]} />
      </View>
    </div>
  )
}
