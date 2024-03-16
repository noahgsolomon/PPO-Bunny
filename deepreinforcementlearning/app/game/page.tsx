'use client'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { config } from '@react-spring/three'
import { animated, useSpring, config as webConfig } from '@react-spring/web'
import { PerspectiveCamera, PresentationControls } from '@react-three/drei'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import { Info, Loader2, Trophy } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect } from 'react'
import Lights from './Lights'
import Tiles from './Tiles'
import useEnvironment from './store/useEnvironment'
import useGameState from './store/useGameState'

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), { ssr: false })

const colors = [
  '#FFB6C1',
  '#FFD700',
  '#FFA07A',
  '#FF69B4',
  '#FFE4E1',
  '#FF6347',
  '#FFA500',
  '#FFC0CB',
  '#FF4500',
  '#FFDAB9',
  '#FF8C00',
  '#FFA07A',
  '#FF1493',
  '#FF69B4',
  '#FF6347',
  '#FFA500',
  '#FFB6C1',
  '#FF4500',
  '#FFD700',
  '#FF8C00',
  '#FFA07A',
  '#FF69B4',
  '#FF6347',
  '#FFB6C1',
  '#FFDAB9',
]

export default function Page() {
  useEffect(() => {
    const model = tf.sequential()
    model.add(tf.layers.dense({ units: 64, inputShape: [1] }))
    model.add(tf.layers.dense({ units: 4 }))

    const inputTensor = tf.tensor2d([[1]], [1, 1])
    const logits = model.predict(inputTensor) as tf.Tensor2D
    const prob = tf.softmax(logits)
    const idx = tf.multinomial(prob, 1)
    idx.print()
    model.save('downloads://model.json')
  }, [])

  const environment = useEnvironment()
  const gameState = useGameState()

  const initialAnimation = useSpring({
    opacity: gameState.state === 'INITIAL' ? 1 : 0,
    transform: gameState.state === 'INITIAL' ? 'translateY(0)' : 'translateY(-200%)',
    config: webConfig.wobbly,
  })

  const playingAnimation = useSpring({
    opacity: gameState.state === 'COLLECTION' ? 1 : 0,
    transform: gameState.state === 'COLLECTION' ? 'translateY(0)' : 'translateY(200%)',
    config: webConfig.wobbly,
  })

  const optimizationAnimation = useSpring({
    opacity: gameState.state === 'OPTIMIZATION' ? 1 : 0,
    transform: gameState.state === 'OPTIMIZATION' ? 'translateY(0)' : 'translateY(200%)',
    config: webConfig.wobbly,
  })

  return (
    <div>
      <View className='absolute top-0 size-full touch-none'>
        <PresentationControls
          enabled
          global
          cursor={false}
          speed={1}
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

      <animated.div
        style={initialAnimation}
        className='z-10 absolute top-16 text-center w-full flex items-center flex-col gap-4'
      >
        <h1 className=' font-bold italic text-4xl'>BUNNY BONANZA</h1>
        <div className='flex flex-row gap-2'>
          <Button className='flex flex-row gap-2 ' onClick={() => gameState.setState('COLLECTION')} size='lg'>
            Train <Trophy className='h-4 w-4' />
          </Button>
          <Button size='lg' className='flex flex-row gap-2 ' variant='outline'>
            Info <Info className='w-4 h-4' />
          </Button>
        </div>
      </animated.div>

      {/* <Button disabled variant='none' className='z-10 absolute right-10 top-1/2 transform -translate-y-1/2'>
        <ArrowRight className='w-10 h-10' />
      </Button>
      <Button disabled variant='none' className='z-10 absolute left-10 top-1/2 transform -translate-y-1/2'>
        <ArrowLeft className='w-10 h-10' />
      </Button> */}
      <animated.div
        style={playingAnimation}
        className='hidden absolute w-full z-10 left-16 top-12 md:flex flex-row gap-2 items-center'
      >
        <Avatar
          style={{ borderColor: colors[environment.currentAgentIdx] ?? '#ffffff' }}
          className={`border-[5px] outline-2 size-16`}
        >
          <AvatarImage src='/bunnypfp.png' />
        </Avatar>
        <div className='flex flex-col gap-2'>
          <div className='flex flex-row gap-2 items-center'>
            <Image unoptimized src={'/coin.webp'} alt='coin' width={24} height={24} />{' '}
            <span className='text-yellow-500 font-bold text-2xl'>
              {environment.agentEnvironment[environment.currentAgentIdx].coins}
            </span>
          </div>
          <div className='flex flex-row'>
            {[...Array(environment.agentEnvironment[environment.currentAgentIdx].hearts)].map((_, i) => (
              <Image key={i} width={24} height={24} alt='heart' src={'/legoheart.png'} />
            ))}
          </div>
        </div>
      </animated.div>
      <animated.div
        style={playingAnimation}
        className='z-10 absolute top-16 text-center w-full flex items-center flex-col gap-4'
      >
        <h1 className=' font-bold italic text-4xl'>
          OBSERVATION <br />
          COLLECTION STEP
        </h1>
      </animated.div>
      <animated.div
        style={optimizationAnimation}
        className='z-10 absolute top-16 text-center w-full flex items-center flex-col gap-4'
      >
        <h1 className='font-bold italic text-4xl'>
          POLICY & VALUE <br />
          NETWORK OPTIMIZATION STEP
        </h1>
        <Loader2 className='size-4 animate-spin' />
      </animated.div>
    </div>
  )
}
