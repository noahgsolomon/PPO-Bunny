import { animated, useSprings } from '@react-spring/three'
import { CameraControls, Center, PerspectiveCamera, RoundedBox } from '@react-three/drei'
import { Player } from './Player'
import { button, useControls } from 'leva'
import { Fragment, useEffect, useRef } from 'react'
import { Group } from 'three'
import { useThree } from '@react-three/fiber'
import { log } from 'console'

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
    }
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
    <Center top position-y={0.3}>
      <group>
        {/* <CameraControls smoothTime={0.5} ref={cameraControlsRef} enabled makeDefault /> */}
        {springs.map((props, i) => {
          const fallingTile = Math.random() > 0.95
          return (
            <Fragment key={i}>
              {Math.random() < 0.8 || i === 37 ? (
                <animated.mesh
                  receiveShadow
                  scale={props.scale}
                  key={i}
                  position={[(i % 10) * 1.1, fallingTile ? 0 : 5, Math.floor(i / 10) * 1.1]}
                >
                  {i === 37 && <Player castShadow position-y={0.5} ref={player} />}
                  <RoundedBox args={[1, fallingTile ? 10.1 : 0.1, 1]}>
                    <meshStandardMaterial
                      metalness={0}
                      roughness={1}
                      color={Math.random() > 0.2 ? '#7c62ff' : Math.random() > 0.2 ? '#fc4bb3' : '#3A3D5E'}
                    />
                  </RoundedBox>
                </animated.mesh>
              ) : null}
            </Fragment>
          )
        })}
      </group>
    </Center>
  )
}
