import { Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor, Preload, useProgress } from '@react-three/drei'
import type { PerformanceMonitorApi } from '@react-three/drei'
import type { DeviceTier } from '../hooks/useDeviceCapability'
import { setFogSuppressed } from './Atmosphere'

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

/**
 * Resolution drops before the frame rate does. PerformanceMonitor steps
 * `factor` down when samples sit under the lower bound; that factor is copied
 * onto r3f's performance.current so AdaptiveDpr can scale the pixel ratio.
 * The same signal unmounts the fog sheets — after a short grace period, so a
 * shader-compile hitch on the first frames does not blank the haze.
 */
function AdaptiveQuality({
  ceiling,
  onScale,
  children,
}: {
  ceiling: number
  onScale: (scale: number) => void
  children: ReactNode
}) {
  const set = useThree((s) => s.set)
  const armedAt = useRef(0)
  const floor = ceiling > 0 ? Math.min(1, 1 / ceiling) : 1

  useEffect(() => {
    armedAt.current = performance.now() + 6000
  }, [])

  const onChange = useCallback(
    (api: PerformanceMonitorApi) => {
      const current = Math.min(1, Math.max(api.factor, floor))
      set((state) => {
        if (state.performance.current === current) return state
        return { performance: { ...state.performance, current } }
      })
      onScale(current)
    },
    [set, floor, onScale]
  )

  return (
    <PerformanceMonitor
      factor={1}
      step={0.1}
      flipflops={3}
      ms={500}
      iterations={8}
      bounds={(hz) => (hz > 100 ? [50, 90] : [32, 55])}
      onChange={onChange}
      onDecline={() => {
        if (performance.now() < armedAt.current) return
        setFogSuppressed(true)
      }}
      onIncline={(api) => {
        if (api.factor >= 0.999) setFogSuppressed(false)
      }}
      onFallback={() => setFogSuppressed(true)}
    >
      <AdaptiveDpr />
      {children}
    </PerformanceMonitor>
  )
}

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
  const [scale, setScale] = useState(1)
  const onScale = useCallback((next: number) => {
    setScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next))
  }, [])
  // Numeric ratio, already clamped to the tier ceiling passed in from App.
  // Keeping the prop equal to the adapted value stops Canvas from snapping
  // the pixel ratio back to the ceiling on the next parent render.
  const ceiling = dpr[1]
  const pixelRatio = Math.max(1, ceiling * scale)

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: tier === 'low' ? 50 : 35 }}
        gl={{
          // MSAA on every non-conservative context, and on the low tier even
          // when the context is conservative. A composer without samples
          // replaces that with FXAA (see Effects) so the low tier is never
          // left with aliased edges.
          antialias: tier === 'low' || !conservative,
          powerPreference: conservative ? 'default' : 'high-performance',
          alpha: false,
          stencil: !conservative,
        }}
        dpr={pixelRatio}
        onCreated={onCreated}
      >
        <color attach="background" args={['#050510']} />
        <ProgressBridge onProgress={onProgress} />
        <Suspense fallback={null}>
          <AdaptiveQuality ceiling={ceiling} onScale={onScale}>
            <Experience tier={tier} />
          </AdaptiveQuality>
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
