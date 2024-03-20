'use client'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { config } from '@react-spring/three'
import { animated, useSpring, config as webConfig } from '@react-spring/web'
import { PerspectiveCamera, PresentationControls } from '@react-three/drei'
import { ArrowLeft, ArrowRight, Info, Loader2, Trophy } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Lights from './Lights'
import Tiles, { NUM_AGENTS } from './Tiles'
import useEnvironment from './store/useEnvironment'
import useGameState from './store/useGameState'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
})

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
  const environment = useEnvironment()
  const gameState = useGameState()

  const initialAnimation = useSpring({
    opacity: gameState.state === 'INITIAL' ? 1 : 0,
    transform: gameState.state === 'INITIAL' ? 'translateY(0)' : 'translateY(100%)',
    config: webConfig.wobbly,
  })

  const playingAnimation = useSpring({
    opacity: gameState.state === 'COLLECTION' ? 1 : 0,
    transform: gameState.state === 'COLLECTION' ? 'translateY(0)' : 'translateY(-200%)',
    config: webConfig.wobbly,
  })

  const optimizationAnimation = useSpring({
    opacity: gameState.state === 'OPTIMIZATION' ? 1 : 0,
    transform: gameState.state === 'OPTIMIZATION' ? 'translateY(0)' : 'translateY(-200%)',
    config: webConfig.wobbly,
  })

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

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

      {gameState.state === 'LOADING' && (
        <div className='absolute inset-0 flex justify-center items-center'>
          <Loader2 className='size-6 animate-spin text-primary/70' />
        </div>
      )}

      <animated.div
        style={initialAnimation}
        className='z-10 absolute top-16 text-center w-full flex items-center flex-col gap-4'
      >
        <h1 className='text-4xl font-bold italic'>PPO Bunny</h1>
        <div className='flex flex-row gap-2'>
          <Button className='flex flex-row gap-2 ' onClick={() => gameState.setState('COLLECTION')} size='lg'>
            Train <Trophy className='size-4' />
          </Button>
          <Dialog>
            <DialogTrigger>
              <Button size='lg' className='flex flex-row gap-2' variant='outline'>
                Info <Info className='size-4' />
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-[90%] sm:max-w-lg bg-card text-sm max-h-[70%] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>INFO</DialogTitle>
                <DialogDescription className='text-primary/70'>
                  PPO Bunny is a PPO simulation where bunnies learn to navigate a complex environment in order to
                  retrieve the most optimal reward from a trajectory of n steps.
                </DialogDescription>
              </DialogHeader>
              <Image
                src={'/bunnyupclose.png'}
                width={400}
                height={250}
                className='rounded-lg border mx-auto'
                alt='bunny'
              />
              <div>
                <h2 className='font-bold'>The future of ai??</h2>
                <p className='text-primary/70'>
                  The aim of this project is to serve as a proof of concept. That the training procedure can take place
                  on customers devices. This has incredible security implications, especially considering when networks
                  need to be trained on customer data but the company is not allowed to store that data. By loading and
                  training on the customers device, there is no need to store this data. Instead, it is immediately
                  baked into the network(s).
                </p>
              </div>
              <div>
                <h2>How do the bunnies even learn?</h2>
                <p className={'text-primary/70'}>
                  The bunnies use a Proximal Gradient method known as Proximal Policy Optimization (PPO). This video
                  <Link
                    className={buttonVariants({ variant: 'link' })}
                    target='_blank'
                    href='https://www.youtube.com/watch?v=TjHH_--7l8g&t=2019s'
                  >
                    HERE
                  </Link>
                  covers the high level quite nicely.
                </p>
              </div>
            </DialogContent>
          </Dialog>
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
      {(gameState.state === 'COLLECTION' || gameState.state === 'OPTIMIZATION') && (
        <div className={'bottom-16 z-10 absolute text-center w-full flex justify-center flex-row gap-4'}>
          <Button
            disabled={environment.currentAgentIdx === 0}
            onClick={() => environment.setCurrentAgentIdx(environment.currentAgentIdx - 1)}
            variant='none'
          >
            <ArrowLeft className='size-8' />
          </Button>
          <div className={'flex flex-col gap-2 items-center'}>
            <div className={'flex items-center gap-4'}>
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
            </div>
            <h1 className='font-bold text-2xl'>AGENT_{environment.currentAgentIdx}</h1>
          </div>

          <Button
            disabled={environment.currentAgentIdx >= NUM_AGENTS - 1}
            onClick={() => environment.setCurrentAgentIdx(environment.currentAgentIdx + 1)}
            variant='none'
          >
            <ArrowRight className='size-8' />
          </Button>
        </div>
      )}
    </div>
  )
}
