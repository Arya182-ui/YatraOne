import { OrbitControls, Environment, useGLTF, Center } from "@react-three/drei";


export function FittedBus() {
  const { scene } = useGLTF("/bus.glb");

  return (
    <>
      {/* Center model auto center karega */}
      <Center position={[0, 3, 0]}>
        <primitive object={scene} scale={0.5} /> {/* 👈 bus ko perfect center kiya */}
      </Center>

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 8, 5]} intensity={1} />

  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} target={[0, 3, 0]} />

      <Environment preset="city" />
    </>
  );
}