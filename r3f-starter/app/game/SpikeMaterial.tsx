import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import { MeshPhysicalMaterial } from 'three'

export default function SpikeMaterial() {
  const customMaterial = useMemo(() => {
    const material = new MeshPhysicalMaterial({
      color: '#444444',
      metalness: 0.5,
      roughness: 0.4,
      reflectivity: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      ior: 1.5,
      iridescence: 1.6,
    })
    return material
  }, [])

  customMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.spikeHeight = { value: 1.0 }
    shader.uniforms.spikeFrequency = { value: 1.0 }
    shader.vertexShader = shader.vertexShader
      .replace(
        'void main() {',
        `
        uniform float spikeHeight;
        uniform float spikeFrequency;
        void main() {
        `,
      )
      .replace(
        'varying vec3 vViewPosition;',
        `varying vec3 vViewPosition;
          varying vec2 vUv;
      `,
      )

    console.log(shader.vertexShader)

    shader.fragmentShader = `${shader.fragmentShader}`
  }

  return <primitive object={customMaterial} attach='material' />
}
