import { Suspense, lazy, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, useProgress } from '@react-three/drei'
import type { DeviceTier } from '../hooks/useDeviceCapability'

/* ─────────────────────────────────────────────────────────────
   Scene3D — the whole WebGL stack behind ONE lazy boundary.

   This file exists purely so that `@react-three/fiber`, `@react-three/drei`
   and `three` are never in the initial module graph. Before it, App imported
   <Canvas> and useProgress at the top level, which pulled ~376KB of 3D into
   the first chunk — so on a mid-range phone the hero text could not paint
   until all of it had been fetched, parsed and executed (measured LCP 5.9s
   on the live site at 4x CPU throttle).

   Now the overlay renders from a ~100KB chunk and the scene streams in
   behind it. The loading screen no longer calls useProgress itself; this
   component reports progress upward instead.
   ──────────────────────────────────────────────────────────── */

const Experience = lazy(() => import('./Experience'))

/** Bridges drei's loading manager out to the (non-3D) LoadingScreen. */
function ProgressBridge({ onProgress }: { onProgress: (p: number, active: boolean) => void }) {
  const { progress, active } = useProgress()
  useEffect(() => {
    onProgress(progress, active)
  }, [progress, active, onProgress])
  return null
}

interface Scene3DProps {
  tier: DeviceTier
  dpr: [number, number]
  conservative: boolean
  onCreated: () => void
  onProgress: (progress: number, active: boolean) => void
}

export default function Scene3D({
  tier,
  dpr,
  conservative,
  onCreated,
  onProgress,
}: Scene3DProps) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: tier === 'low' ? 50 : 35 }}
        gl={{
          antialias: !conservative && tier !== 'low',
          powerPreference: conservative ? 'default' : 'high-performance',
          alpha: false,
          stencil: !conservative,
        }}
        dpr={dpr}
        onCreated={onCreated}
      >
        <color attach="background" args={['#050510']} />
        <ProgressBridge onProgress={onProgress} />
        <Suspense fallback={null}>
          <Experience tier={tier} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
