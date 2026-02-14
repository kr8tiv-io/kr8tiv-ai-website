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
        radius: HERO_RADIUS,
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
      tl.to(
        anim.current,
        {
          theta: section.angle,
          phi: section.phi,
          radius: section.radius,
          targetY: section.targetY,
          duration: segmentDuration,
          ease: 'none',
        },
        progress - segmentDuration
      )
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
