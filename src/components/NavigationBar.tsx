import { useRef, useState, useEffect } from 'react'

export default function NavigationBar() {
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050510]/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#d4a853] animate-pulse" />
        <span
          className="text-sm tracking-[0.25em] uppercase text-white/70"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          kr8tiv
        </span>
        <span className="text-[10px] tracking-[0.15em] uppercase text-white/30 hidden sm:inline">
          AI
        </span>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-mono hidden md:inline">
          SYS.ONLINE
        </span>
        <a
          href="https://kr8tiv.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs tracking-[0.15em] uppercase text-white/40 hover:text-[#d4a853] transition-colors duration-300"
        >
          kr8tiv.ai
        </a>
      </div>
    </nav>
  )
}
