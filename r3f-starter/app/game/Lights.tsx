export default function Lights() {
  return (
    <>
      <directionalLight
        castShadow
        intensity={2}
        position={[-4, 5, 0]}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-camera-top={10}
        shadow-camera-right={10}
        shadow-camera-bottom={-10}
        shadow-camera-left={-10}
        color={'#ffffff'}
      />
      <ambientLight intensity={1.5} />
    </>
  )
}
