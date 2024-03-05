import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { a, config, useSpring } from '@react-spring/three'
import { GlobalCanvas, UseCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig'
import { StickyScrollScene } from '@14islands/r3f-scroll-rig/powerups'

import Logo from './Logo'
import './styles.css'

const AnimatedRoundedBox = a(RoundedBox)

function SpinningBox({ scale, scrollState, inViewport }) {
  const box = useRef()
  const size = scale.xy.min() * 0.5

  useFrame(() => {
    box.current.rotation.y = scrollState.progress * Math.PI * 2
  })

  const spring = useSpring({
    scale: inViewport ? size : 0,
    config: inViewport ? config.wobbly : config.stiff,
    delay: inViewport ? 100 : 0
  })

  return (
    <>
      <AnimatedRoundedBox ref={box} {...spring}>
        <meshNormalMaterial />
      </AnimatedRoundedBox>
    </>
  )
}

function StickySection() {
  const el = useRef()
  return (
    <section>
      <div className="StickyContainer">
        <div ref={el} className="SomeDomContent"></div>
      </div>
      <UseCanvas>
        <StickyScrollScene track={el}>
          {(props) => (
            <>
              <SpinningBox {...props} />
            </>
          )}
        </StickyScrollScene>
      </UseCanvas>
    </section>
  )
}

export default function App() {
  const [isTouch, setTouch] = useState(false)
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
    setTouch(isTouch)
  }, [])
  return (
    <>
      <GlobalCanvas style={{ zIndex: -1 }}>{/* UseCanvas children will be inserted here */}</GlobalCanvas>
      <SmoothScrollbar>
        {(bind) => (
          <article {...bind}>
            <header>@14islands/r3f-scroll-rig</header>
            <section>
              <h1>A "sticky" ScrollScene</h1>
            </section>
            {isTouch && (
              <section>
                <p style={{ color: 'orange' }}>
                  You are on a touch device which means the WebGL won't sync with the native scroll. Consider disabling ScrollScenes for
                  touch devices, or experiment with the `smoothTouch` setting on Lenis.
                </p>
              </section>
            )}
            <section>
              <p>StickyScrollScene is built on top of the scroll-rig and not part of core.</p>
              <p>
                The <code>powerups</code> package contains some example components that can be used for quick prototyping.
              </p>
            </section>
            <section>
              <p>Some extra space before the action starts...</p>
            </section>
            <StickySection />
            <Logo />
            <Logo />
            <Logo />
            <Logo />
            <Logo />
          </article>
        )}
      </SmoothScrollbar>
    </>
  )
}
