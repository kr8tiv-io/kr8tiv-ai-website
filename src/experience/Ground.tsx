import { MeshReflectorMaterial } from '@react-three/drei'

export default function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        mirror={0.4}
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={0.8}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050510"
        metalness={0.5}
      />
    </mesh>
  )
}
