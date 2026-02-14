import { useRef, useState, useEffect } from 'react'

export default function VibesButton() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = new Audio('/vibes.mp3')
    audio.loop = true
    audio.volume = 0.35
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1.5 group cursor-pointer"
      title={playing ? 'Pause vibes' : 'Play vibes'}
    >
      <div
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 backdrop-blur-sm ${
          playing
            ? 'border-[#d4a853]/40 bg-[#d4a853]/10 shadow-[0_0_12px_rgba(212,168,83,0.15)]'
            : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
        }`}
      >
        {/* Speaker icon with animated sound waves */}
        <div className="relative flex items-center justify-center">
          <svg
            className={`w-4 h-4 transition-colors duration-300 ${
              playing ? 'text-[#d4a853]' : 'text-white/40 group-hover:text-white/70'
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
        className={`text-[8px] tracking-[0.25em] uppercase font-mono transition-colors duration-300 ${
          playing ? 'text-[#d4a853]/60' : 'text-white/20 group-hover:text-white/40'
        }`}
      >
        vibes
      </span>
    </button>
  )
}
