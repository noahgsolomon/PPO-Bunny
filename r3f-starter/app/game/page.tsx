'use client'

import Tiles from './Tiles'
import dynamic from 'next/dynamic'
import Lights from './Lights'
import { PerspectiveCamera, PresentationControls } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Info } from 'lucide-react'
import { config } from '@react-spring/three'
import Image from 'next/image'
import { Avatar, AvatarImage } from '@/components/ui/avatar'

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), { ssr: false })
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function Page() {
  return (
    <div>
      <View className='absolute top-0 w-full h-full touch-none'>
        {/* <fog attach='fog' args={['#121316', 0.1, 30]} /> */}
        <PresentationControls
          enabled
          global
          cursor={false}
          speed={1.5}
          zoom={1}
          rotation={[Math.PI * 0.175, 0, 0]}
          polar={[-Math.PI / 16, Math.PI / 3]}
          azimuth={[-Infinity, Infinity]}
          config={config.slow}
        >
          <Tiles />
        </PresentationControls>

        <Lights />
        <PerspectiveCamera makeDefault position={[0, 0, 25]} />
      </View>
      <div className='z-10 absolute top-8 text-center w-full flex items-center flex-col gap-4'>
        <h1 className=' font-bold italic text-4xl'>Bunny Bananza</h1>
        <div className='flex flex-row gap-2'>
          <Button size='lg'>Play</Button>
          <Button size='lg' className='flex flex-row gap-2 ' variant='outline'>
            Info <Info className='w-4 h-4' />
          </Button>
        </div>
      </div>
      <Button disabled variant='none' className='z-10 absolute right-10 top-1/2 transform -translate-y-1/2'>
        <ArrowRight className='w-10 h-10' />
      </Button>
      <Button disabled variant='none' className='z-10 absolute left-10 top-1/2 transform -translate-y-1/2'>
        <ArrowLeft className='w-10 h-10' />
      </Button>
      <div className='absolute z-10 left-12 top-12 flex flex-row gap-2 items-center'>
        <Avatar className='border-[5px] border-blue-500 outline-2 w-16 h-16'>
          <AvatarImage src='/bunnypfp.png' />
        </Avatar>
        <div className='flex flex-col gap-2'>
          <div className='flex flex-row gap-2 items-center'>
            <Image src={'/coin.webp'} alt='coin' width={24} height={24} />{' '}
            <span className='text-yellow-500 font-bold text-2xl'>0</span>
          </div>
          <div className='flex flex-row'>
            <Image width={24} height={24} alt='heart' src={'/legoheart.png'} />
            <Image width={24} height={24} alt='heart' src={'/legoheart.png'} />
            <Image width={24} height={24} alt='heart' src={'/legoheart.png'} />
          </div>
        </div>
      </div>
    </div>
  )
}
