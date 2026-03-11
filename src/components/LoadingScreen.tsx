import { useState, useEffect } from 'react'
import { useProgress } from '@react-three/drei'

interface LoadingScreenProps {
  forceComplete?: boolean
  onDone?: () => void
}

export default function LoadingScreen({ forceComplete = false, onDone }: LoadingScreenProps) {
  const { progress, active } = useProgress()
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const displayProgress = forceComplete ? 100 : progress

  useEffect(() => {
    if (fadeOut) {
      return
    }

    if (forceComplete || (!active && progress >= 100)) {
      setFadeOut(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onDone?.()
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [active, fadeOut, forceComplete, progress, onDone])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#050510] transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
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
