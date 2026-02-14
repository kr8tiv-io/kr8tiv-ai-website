import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sections } from '../config/sections'

gsap.registerPlugin(ScrollTrigger)

// Where the hero rests after zoom-in
const HERO_ANGLE = -Math.PI / 6
const HERO_PHI = Math.PI / 2.3
const HERO_RADIUS = 9
const HERO_TARGET_Y = 0.3

// Where the camera starts — way up and far back
const INTRO_ANGLE = -Math.PI / 4
const INTRO_PHI = Math.PI / 3.5
const INTRO_RADIUS = 28
const INTRO_TARGET_Y = 1.5

// Mobile devices need the camera pulled back so the full object is visible
const MOBILE_RADIUS_SCALE =
  typeof window !== 'undefined' && window.innerWidth < 768 ? 1.45 : 1

export default function CameraRig() {
  const { camera } = useThree()

  const anim = useRef({
    theta: INTRO_ANGLE,
    phi: INTRO_PHI,
    radius: INTRO_RADIUS,
    targetY: INTRO_TARGET_Y,
  })

  // Cinematic zoom-in on load — listens for 'intro-complete' event
  useEffect(() => {
    const onIntroComplete = () => {
      gsap.to(anim.current, {
        theta: HERO_ANGLE,
        phi: HERO_PHI,
        radius: HERO_RADIUS * MOBILE_RADIUS_SCALE,
        targetY: HERO_TARGET_Y,
        duration: 3,
        ease: 'power3.inOut',
      })
    }

    // If intro already finished before mount, zoom immediately
    window.addEventListener('intro-complete', onIntroComplete)

    // Also auto-zoom after a short delay in case intro is skipped
    const fallback = setTimeout(() => {
      if (anim.current.radius > HERO_RADIUS + 1) {
        onIntroComplete()
      }
    }, 5000)

    return () => {
      window.removeEventListener('intro-complete', onIntroComplete)
      clearTimeout(fallback)
    }
  }, [])

  useGSAP(() => {
    const totalSections = sections.length + 1
    const segmentDuration = 1 / (totalSections - 1)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      },
    })

    sections.forEach((section, i) => {
      const progress = (i + 1) * segmentDuration

      // Between section 3→4: subtle push away then pull back
      if (i === 3) {
        const prevSection = sections[i - 1]
        // First 40% — push OUT
        tl.to(
          anim.current,
          {
            theta: (section.angle + prevSection.angle) / 2,
            phi: section.phi,
            radius: (section.radius + 3) * MOBILE_RADIUS_SCALE,
            targetY: section.targetY + 0.2,
            duration: segmentDuration * 0.4,
            ease: 'power2.out',
          },
          progress - segmentDuration
        )
        // Remaining 60% — pull back IN to target
        tl.to(
          anim.current,
          {
            theta: section.angle,
            phi: section.phi,
            radius: section.radius * MOBILE_RADIUS_SCALE,
            targetY: section.targetY,
            duration: segmentDuration * 0.6,
            ease: 'power2.inOut',
          }
        )
      } else {
        tl.to(
          anim.current,
          {
            theta: section.angle,
            phi: section.phi,
            radius: section.radius * MOBILE_RADIUS_SCALE,
            targetY: section.targetY,
            duration: segmentDuration,
            ease: 'none',
          },
          progress - segmentDuration
        )
      }
    })
  }, [])

  useFrame(() => {
    const { theta, phi, radius, targetY } = anim.current

    camera.position.x = radius * Math.sin(phi) * Math.sin(theta)
    camera.position.y = radius * Math.cos(phi)
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta)

    camera.lookAt(0, targetY, 0)
  })

  return null
}
