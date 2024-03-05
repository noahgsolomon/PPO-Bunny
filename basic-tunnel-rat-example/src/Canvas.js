import * as THREE from 'three'
import { events, extend, createRoot } from '@react-three/fiber'
import { useEffect, useReducer } from 'react'

// Using the render-api here https://docs.pmnd.rs/react-three-fiber/api/render-function

extend(THREE)
const canvas = document.getElementById('canvas')
const getSize = () => ({ width: window.innerWidth, height: window.innerHeight })
export function Canvas({ children, ...props }) {
  const [size, set] = useReducer(getSize, getSize())
  useEffect(() => {
    window.addEventListener('resize', set)
    return () => window.removeEventListener('resize', set)
  }, [])
  createRoot(canvas, { events, size, ...props }).render(children)
  return null
}
