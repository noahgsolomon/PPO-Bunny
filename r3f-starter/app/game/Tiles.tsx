import { a, animated, config, useSpring, useSprings } from '@react-spring/three'
import { CameraControls, Center, Html, PerspectiveCamera, Plane, RoundedBox } from '@react-three/drei'
import { Player } from './Player'
import { button, useControls } from 'leva'
import { Fragment, useEffect, useRef } from 'react'
import { Group } from 'three'
import { useThree } from '@react-three/fiber'
import { log } from 'console'
import { Button } from '@/components/ui/button'
import { Skull } from './Skull'

export default function Tiles() {
  const [springs, api] = useSprings(100, (i) => {
    const row = Math.floor(i / 10)
    const col = i % 10
    const centerRow = 4.5
    const centerCol = 4.5
    const distance = Math.sqrt((row - centerRow) ** 2 + (col - centerCol) ** 2)

    return {
      from: { scale: 0 },
      to: { scale: 1 },
      delay: distance * 100,
      config: config.gentle,
    }
  })

  const baseSpring = useSpring({
    from: { positionY: -7 },
    to: { positionY: -1 },
    config: config.gentle,
  })

  const player = useRef<Group>()

  //   const cameraControlsRef = useRef<CameraControls>()

  //   useControls({
  //     'fitToBox(mesh)': button(() => {
  //       cameraControlsRef.current?.fitToBox(player.current, true)
  //     }),
  //   })

  //   const three = useThree()

  //   useEffect(() => {
  //     cameraControlsRef.current?.fitToBox(player.current, true)
  //   }, [cameraControlsRef, player])

  return (
    <>
      <group>
        {/* <CameraControls smoothTime={0.5} ref={cameraControlsRef} enabled makeDefault /> */}
        <Center top position-y={0.3}>
          {springs.map((props, i) => {
            const fallingTile = Math.random() > 0.95
            return (
              <Fragment key={i}>
                {Math.random() < 0.8 || i === 37 ? (
                  <animated.mesh
                    scale={props.scale}
                    key={i}
                    position={[(i % 10) * 1.1, fallingTile ? 0 : 1, Math.floor(i / 10) * 1.1]}
                  >
                    {fallingTile && <Skull position-y={1.5} scale={0.3} />}
                    {i === 37 && <Player position-y={0.5} ref={player} />}
                    <RoundedBox args={[1, fallingTile ? 2.1 : 0.1, 1]}>
                      <meshStandardMaterial
                        metalness={0}
                        roughness={1}
                        color={
                          fallingTile
                            ? 'maroon'
                            : Math.random() > 0.1
                              ? '#3A3D5E'
                              : Math.random() > 0.5
                                ? '#fc4bb3'
                                : '#7c62ff'
                        }
                      />
                    </RoundedBox>
                  </animated.mesh>
                ) : null}
              </Fragment>
            )
          })}
        </Center>
        <animated.mesh position-y={baseSpring.positionY} rotation-x={Math.PI * 0.5}>
          <RoundedBox args={[20, 20]}>
            <meshStandardMaterial color={'#212336'} />
          </RoundedBox>
        </animated.mesh>
        <Html position-z={10} position-y={2}>
          <Button variant='secondary'>PLAY</Button>
        </Html>
      </group>
    </>
  )
}
