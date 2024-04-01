'use client'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { config } from '@react-spring/three'
import { animated, useSpring, config as webConfig } from '@react-spring/web'
import { PerspectiveCamera, PresentationControls } from '@react-three/drei'
import { ArrowLeft, ArrowRight, Brain, Info, Loader2, Rabbit, StopCircle, Trophy, Zap } from 'lucide-react'
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

export default function Page() {
  const environment = useEnvironment()
  const gameState = useGameState()

  const initialAnimation = useSpring({
    opacity: gameState.state === 'INITIAL' ? 1 : 0,
    transform: gameState.state === 'INITIAL' ? 'translateY(0)' : 'translateY(100%)',
    config: webConfig.wobbly,
  })

  const modelAnimation = useSpring({
    opacity: gameState.state != 'LOADING' ? 1 : 0,
    transform: gameState.state != 'LOADING' ? 'translateY(0)' : 'translateY(100%)',
    config: webConfig.wobbly,
  })

  const changingAnimation = useSpring({
    opacity: gameState.state === 'CHANGING' ? 1 : 0,
    transform: gameState.state === 'CHANGING' ? 'translateY(0)' : 'translateY(-100%)',
    config: webConfig.default,
  })

  const loadingModelAnimation = useSpring({
    opacity: gameState.state === 'LOADING_MODEL' ? 1 : 0,
    transform: gameState.state === 'LOADING_MODEL' ? 'translateY(0)' : 'translateY(-100%)',
    config: webConfig.default,
  })

  const playingAnimation = useSpring({
    opacity: gameState.state === 'RUNNING' ? 1 : 0,
    transform: gameState.state === 'RUNNING' ? 'translateY(0)' : 'translateY(-200%)',
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
        <PerspectiveCamera makeDefault position={[0, 0, 40]} />
      </View>

      {gameState.state === 'LOADING' && (
        <div className='absolute inset-0 flex justify-center items-center'>
          <p className='flex flex-row items-center gap-2'>
            Loading <Rabbit className='size-4' />
          </p>
        </div>
      )}

      <animated.div
        style={loadingModelAnimation}
        className='z-10 absolute top-16 text-center w-full flex items-center flex-col gap-4'
      >
        <p>Loading Policy Network</p>
      </animated.div>

      <animated.div
        style={initialAnimation}
        className='z-10 absolute top-16 text-center w-full flex items-center flex-col gap-4'
      >
        {gameState.state === 'INITIAL' && (
          <>
            <h1 className='text-4xl font-bold italic'>PPO Bunny</h1>
            <div className='flex flex-row gap-2'>
              <Button className='flex flex-row gap-2 ' onClick={() => gameState.setState('CHANGING')} size='lg'>
                Run <Rabbit className='size-4' />
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
                      PPO Bunny is a PPO simulation where bunnies navigate complex environments in order to retrieve the
                      most optimal reward.
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
          </>
        )}
      </animated.div>
      <animated.div
        style={playingAnimation}
        className='z-10 absolute top-16 text-center w-full flex items-center flex-col gap-4'
      >
        <h1 className=' font-bold italic text-4xl'>Find the reward</h1>
        <p>lvl. 1</p>
      </animated.div>
      <animated.div
        style={changingAnimation}
        className='z-10 absolute top-16 text-center w-full flex items-center flex-col gap-4'
      >
        {gameState.state === 'CHANGING' && (
          <>
            <h1 className='text-4xl font-bold italic'>{gameState.changingText}</h1>
          </>
        )}
      </animated.div>

      <animated.div
        style={modelAnimation}
        className={'bottom-16 z-10 absolute text-center w-full flex justify-center flex-row gap-4'}
      >
        <Dialog>
          <DialogTrigger>
            <Button size='lg' className='flex flex-row gap-2 items-center '>
              Model Details <Zap className='size-4 fill-yellow-500' />
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-[90%] sm:max-w-lg bg-card max-h-[70%] overflow-y-auto text-xs'>
            <DialogHeader className='pb-4 text-base underline'>
              <DialogTitle>MODEL DETAILS</DialogTitle>
            </DialogHeader>
            <div>
              <h3 className='font-bold text-red-500 text-sm pb-2'>Actor-Critic Architecture:</h3>
              <ul className='list-disc ml-6 flex flex-col gap-2'>
                <li>The agent consists of an actor network (policy) and a critic network (value function)</li>
                <li>The actor generates actions given states, while the critic estimates the value of states</li>
                <li>Both networks are updated during training to improve the policy and value estimates</li>
              </ul>
            </div>
            <div>
              <h3 className='font-bold mt-2 text-purple-500 text-sm pb-2'>Advantage Estimation:</h3>
              <ul className='list-disc ml-6 flex flex-col gap-2'>
                <li>Advantages are estimated using Generalized Advantage Estimation (GAE)</li>
                <li>GAE balances between bias and variance in the advantage estimates</li>
                <li>
                  The <code>gae_lambda</code> parameter controls the trade-off (0: high bias, 1: high variance)
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-bold mt-2 text-amber-400 text-sm pb-2'>Minibatch Updates:</h3>
              <ul className='list-disc ml-6 flex flex-col gap-2'>
                <li>The collected experiences are divided into minibatches for training</li>
                <li>Multiple epochs of updates are performed on each minibatch</li>
                <li>This helps stabilize learning and reduces the variance in gradients</li>
              </ul>
            </div>
            <div>
              <h3 className='font-bold mt-4 text-emerald-500 text-sm pb-2'>Clipped Surrogate Objective:</h3>
              <ul className='list-disc ml-6 flex flex-col gap-2'>
                <li>The surrogate objective is clipped to constrain policy updates</li>
                <li>Clipping helps prevent large destabilizing updates to the policy</li>
                <li>
                  The <code>clip_coef</code> parameter sets the clipping range (e.g. 0.2 = ±20%)
                </li>
              </ul>
            </div>
            <div>
              <h2 className='font-bold text-sm pb-2'>Hyper Parameters:</h2>
              <p className='ml-4 text-red-500'>learning_rate: 2.5e-4</p>
              <p className='ml-4  text-blue-500'>num_envs: 10</p> <p className='ml-4 text-green-500'>num_steps: 128</p>
              <p className='ml-4 text-yellow-500'>anneal_lr: True</p>
              <p className='ml-4 text-indigo-500'>gamma: 0.99</p>
              <p className='ml-4 text-purple-500'>gae_lambda: 0.95</p>
              <p className='ml-4 text-pink-500'>num_minibatches: 4</p>
              <p className='ml-4 text-teal-500'>update_epochs: 4</p> <p className='ml-4 text-red-600'>norm_adv: True</p>
              <p className='ml-4 text-blue-600'>clip_coef: 0.2</p>
              <p className='ml-4 text-green-600'>clip_vloss: True</p>
              <p className='ml-4 text-yellow-600'>ent_coef: 0.01</p>
              <p className='ml-4 text-indigo-600'>vf_coef: 0.5</p>
              <p className='ml-4 text-purple-600'>max_grad_norm: 0.5</p>
              <p className='ml-4 text-pink-600'>batch_size: int(num_envs * num_steps)</p>
              <p className='ml-4 text-amber-400'>minibatch_size: int(batch_size // num_minibatches)</p>
              <p className='ml-4 text-emerald-500'>num_iterations: total_timesteps // batch_size</p>
            </div>
          </DialogContent>
        </Dialog>
      </animated.div>
    </div>
  )
}
