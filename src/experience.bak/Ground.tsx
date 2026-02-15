/**
 * Ground — nearly invisible void floor.
 * Ultra-dark with barely-there reflection. No visible pattern.
 * The ground should feel like you're floating over a dark abyss.
 */
export default function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial
        color="#010104"
        metalness={0.9}
        roughness={0.15}
        envMapIntensity={0.05}
      />
    </mesh>
  )
}
