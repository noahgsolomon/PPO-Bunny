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
        shadow-camera-top={15}
        shadow-camera-right={15}
        shadow-camera-bottom={-15}
        shadow-camera-left={-15}
        color={'#ffffff'}
      />
      <ambientLight intensity={1.5} />
    </>
  )
}
