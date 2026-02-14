import { useRef, useEffect, useState } from 'react'
import type { Section } from '../../config/sections'

interface HudPanelProps {
  section: Section
  index: number
}

function AnimatedValue({ target, unit }: { target: string; unit?: string }) {
  const [display, setDisplay] = useState('--')
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // Observe visibility to trigger count-up
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate from scrambled to final value
          const chars = '0123456789.'
          let frame = 0
          const totalFrames = 12
          const interval = setInterval(() => {
            frame++
            if (frame >= totalFrames) {
              setDisplay(target)
              clearInterval(interval)
              return
            }
            // Random scramble that converges to target
            const result = target
              .split('')
              .map((ch, j) => {
                if (frame > totalFrames - 4 || j < frame / 2) return ch
                return chars[Math.floor(Math.random() * chars.length)]
              })
              .join('')
            setDisplay(result)
          }, 40)

          return () => clearInterval(interval)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {unit && <span className="text-[9px] ml-1 opacity-50">{unit}</span>}
    </span>
  )
}

export default function HudPanel({ section, index }: HudPanelProps) {
  return (
    <div
      className="hud-panel opacity-0 flex-shrink-0 w-full lg:w-[320px] relative"
      style={{
        ['--hud-color' as string]: section.hudColor,
      }}
    >
      {/* Tracer animation — glowing star orbiting the border */}
      <div className="hud-tracer-container">
        <div className="hud-tracer" />
        <div className="hud-tracer hud-tracer-2" />
      </div>

      {/* Panel frame */}
      <div
        className="relative p-5 backdrop-blur-md rounded-sm"
        style={{
          background: `linear-gradient(135deg, ${section.hudColor}08 0%, ${section.hudColor}03 100%)`,
          border: `1px solid ${section.hudColor}20`,
          boxShadow: `0 0 30px ${section.hudColor}08, inset 0 0 30px ${section.hudColor}03`,
        }}
      >
        {/* Corner brackets — top-left */}
        <div
          className="absolute top-0 left-0 w-4 h-4"
          style={{
            borderTop: `1px solid ${section.hudColor}60`,
            borderLeft: `1px solid ${section.hudColor}60`,
          }}
        />
        {/* Corner brackets — top-right */}
        <div
          className="absolute top-0 right-0 w-4 h-4"
          style={{
            borderTop: `1px solid ${section.hudColor}60`,
            borderRight: `1px solid ${section.hudColor}60`,
          }}
        />
        {/* Corner brackets — bottom-left */}
        <div
          className="absolute bottom-0 left-0 w-4 h-4"
          style={{
            borderBottom: `1px solid ${section.hudColor}60`,
            borderLeft: `1px solid ${section.hudColor}60`,
          }}
        />
        {/* Corner brackets — bottom-right */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4"
          style={{
            borderBottom: `1px solid ${section.hudColor}60`,
            borderRight: `1px solid ${section.hudColor}60`,
          }}
        />

        {/* Panel header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: section.hudColor,
                boxShadow: `0 0 6px ${section.hudColor}`,
              }}
            />
            <span
              className="text-[9px] tracking-[0.3em] uppercase font-mono"
              style={{ color: `${section.hudColor}cc` }}
            >
              SECTOR {String(index + 1).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[8px] font-mono text-white/20">
            SYS.{['WHO', 'TKN', 'JRV', 'IND', 'HMN'][index]}
          </span>
        </div>

        {/* Connector line from panel header */}
        <div
          className="hud-connector h-px w-full mb-4 origin-left"
          style={{
            background: `linear-gradient(90deg, ${section.hudColor}40, transparent)`,
          }}
        />

        {/* Data grid */}
        <div className="grid grid-cols-2 gap-3">
          {section.hudData.map((dp, j) => (
            <div key={j} className="hud-data-item opacity-0">
              <div className="text-[8px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1">
                {dp.label}
              </div>
              <div
                className="text-lg font-mono font-medium leading-none"
                style={{ color: section.hudColor }}
              >
                <AnimatedValue target={dp.value} unit={dp.unit} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom status bar */}
        <div
          className="hud-connector mt-4 pt-3 flex items-center justify-between origin-left"
          style={{
            borderTop: `1px solid ${section.hudColor}15`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-1 h-1 rounded-full animate-pulse"
              style={{ backgroundColor: '#22c55e' }}
            />
            <span className="text-[8px] font-mono text-white/25">NOMINAL</span>
          </div>
          <span className="text-[8px] font-mono" style={{ color: `${section.hudColor}40` }}>
            {new Date().toISOString().slice(11, 19)}Z
          </span>
        </div>
      </div>

      {/* Floating data lines connecting to the 3D scene */}
      <div className="absolute -top-4 left-1/2 w-px h-4" style={{ background: `${section.hudColor}20` }} />
      <div
        className="absolute -bottom-2 left-8 w-16 h-px"
        style={{ background: `linear-gradient(90deg, ${section.hudColor}30, transparent)` }}
      />
    </div>
  )
}
