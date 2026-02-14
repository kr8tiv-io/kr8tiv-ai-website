import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null)
  const target = useRef(new THREE.Vector3(0, 2, 5))

  useFrame((state) => {
    const { pointer, viewport } = state
    target.current.set(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2 + 1,
      4
    )
    if (lightRef.current) {
      lightRef.current.position.lerp(target.current, 0.06)
    }
  })

  return (
    <pointLight
      ref={lightRef}
      intensity={0.08}
      color="#ffffff"
      distance={6}
      decay={2}
    />
  )
}
