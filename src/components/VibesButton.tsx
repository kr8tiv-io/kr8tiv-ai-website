import { useRef, useState, useEffect } from 'react'

export default function VibesButton() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, [])

  const toggle = () => {
    // Lazy-create audio on first click (avoids 4.5MB download on mount)
    if (!audioRef.current) {
      const audio = new Audio('/vibes.mp3')
      audio.loop = true
      audio.volume = 0.35
      audio.preload = 'none'
      audioRef.current = audio
    }

    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }

    const p = audio.play()
    if (p) p.catch(() => {}) // ignore autoplay-policy failures
    setPlaying(true)
  }

  return (
    <>
      {/* Pulsing glow keyframes */}
      <style>{`
        @keyframes vibesPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(212,168,83,0.15), 0 0 20px rgba(212,168,83,0.05); }
          50% { box-shadow: 0 0 14px rgba(212,168,83,0.3), 0 0 30px rgba(212,168,83,0.1); }
        }
        @keyframes vibesIdlePulse {
          0%, 100% { box-shadow: 0 0 6px rgba(255,255,255,0.08), 0 0 16px rgba(255,255,255,0.03); }
          50% { box-shadow: 0 0 10px rgba(255,255,255,0.15), 0 0 24px rgba(255,255,255,0.06); }
        }
      `}</style>
      <button
        onClick={toggle}
        className="fixed z-50 flex flex-col items-center gap-1.5 group cursor-pointer"
        style={{
          bottom: 'calc(var(--vibes-bottom, 1.5rem) + var(--safe-bottom, 0px))',
          right: 'calc(1.5rem + var(--safe-right, 0px))',
        }}
        title={playing ? 'Pause vibes' : 'Play vibes'}
      >
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center transition-all duration-500 backdrop-blur-md ${
            playing
              ? 'border-[#d4a853]/50 bg-[#d4a853]/15'
              : 'border-white/20 bg-white/8 hover:border-white/35 hover:bg-white/15'
          }`}
          style={{
            animation: playing
              ? 'vibesPulse 2.5s ease-in-out infinite'
              : 'vibesIdlePulse 3s ease-in-out infinite',
          }}
        >
          {/* Speaker icon with animated sound waves */}
          <div className="relative flex items-center justify-center">
            <svg
              className={`w-4.5 h-4.5 transition-colors duration-300 ${
                playing ? 'text-[#d4a853]' : 'text-white/60 group-hover:text-white/85'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              {/* Speaker body */}
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
              {/* Sound waves — only show when playing */}
              {playing && (
                <>
                  <path
                    className="animate-pulse"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.54 8.46a5 5 0 010 7.07"
                    style={{ animationDuration: '1.5s' }}
                  />
                  <path
                    className="animate-pulse"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.07 4.93a10 10 0 010 14.14"
                    style={{ animationDuration: '2s', animationDelay: '0.3s' }}
                  />
                </>
              )}
            </svg>
          </div>
        </div>
        <span
          className={`text-[9px] tracking-[0.25em] uppercase font-mono transition-colors duration-300 ${
            playing ? 'text-[#d4a853]/70' : 'text-white/35 group-hover:text-white/55'
          }`}
        >
          vibes
        </span>
      </button>
    </>
  )
}
