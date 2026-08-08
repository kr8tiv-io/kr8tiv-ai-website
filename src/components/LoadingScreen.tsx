import { useState, useEffect, useRef } from 'react'

interface LoadingScreenProps {
  /** Reported up from inside the lazy 3D chunk — importing drei's useProgress
   *  here would drag the whole three.js graph into the first bundle. */
  progress?: number
  active?: boolean
  forceComplete?: boolean
  onDone?: () => void
}

/** Dead-man switch: lift the curtain even if the loader never reports 100%. */
const MAX_HOLD_MS = 12000

export default function LoadingScreen({
  progress = 0,
  active = false,
  forceComplete = false,
  onDone,
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const startedRef = useRef(false)
  const timerRef = useRef<number | undefined>(undefined)
  const displayProgress = forceComplete ? 100 : progress

  // The dismiss timer lives in a ref, NOT in effect cleanup. Previously the
  // setFadeOut() re-render re-ran this effect, whose cleanup cancelled the very
  // timeout that unmounts the overlay — so it stayed mounted at opacity 0,
  // fixed inset-0 z-100, swallowing every click on the site.
  useEffect(() => {
    if (startedRef.current) return
    if (!(forceComplete || (!active && progress >= 100))) return

    startedRef.current = true
    setFadeOut(true)
    timerRef.current = window.setTimeout(() => {
      setVisible(false)
      onDone?.()
    }, 1200)
  }, [active, forceComplete, progress, onDone])

  // Failsafe: if progress never settles (stalled asset, odd browser), dismiss anyway.
  useEffect(() => {
    const failsafe = window.setTimeout(() => {
      if (startedRef.current) return
      startedRef.current = true
      setFadeOut(true)
      timerRef.current = window.setTimeout(() => {
        setVisible(false)
        onDone?.()
      }, 800)
    }, MAX_HOLD_MS)
    return () => window.clearTimeout(failsafe)
  }, [onDone])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#050510] transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* kr8tiv branding */}
        <h2
          className="text-2xl tracking-[0.2em] text-white/80 mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          kr8tiv
        </h2>
        <div className="text-[9px] tracking-[0.4em] uppercase text-white/20 font-mono mb-10">
          Initializing
        </div>

        {/* Progress bar */}
        <div className="w-48 h-px bg-white/10 relative overflow-hidden mx-auto">
          <div
            className="absolute inset-y-0 left-0 bg-[#d4a853]/80 transition-all duration-300"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        {/* Progress percentage */}
        <div className="text-[10px] font-mono text-white/20 mt-4 tabular-nums">
          {Math.round(displayProgress)}%
        </div>

        {/* System boot lines */}
        <div className="mt-8 text-[8px] font-mono text-white/10 space-y-1">
          {displayProgress > 10 && <div>Loading 3D environment...</div>}
          {displayProgress > 40 && <div>Compiling shaders...</div>}
          {displayProgress > 70 && <div>Initializing HUD systems...</div>}
          {displayProgress > 90 && <div className="text-white/40">System ready.</div>}
        </div>
      </div>
    </div>
  )
}
