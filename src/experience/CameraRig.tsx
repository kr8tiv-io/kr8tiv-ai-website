import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sections } from '../config/sections'

gsap.registerPlugin(ScrollTrigger)

// Starting position: dramatic hero angle looking at the product
const HERO_ANGLE = -Math.PI / 6
const HERO_PHI = Math.PI / 2.3
const HERO_RADIUS = 6.5
const HERO_TARGET_Y = 0.3

export default function CameraRig() {
  const { camera } = useThree()

  // GSAP proxy object — GSAP writes, useFrame reads
  const anim = useRef({
    theta: HERO_ANGLE,
    phi: HERO_PHI,
    radius: HERO_RADIUS,
    targetY: HERO_TARGET_Y,
  })

  useGSAP(() => {
    // Total scroll sections = hero (1) + content sections (4) = 5 pages
    const totalSections = sections.length + 1 // +1 for hero

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        snap: {
          snapTo: Array.from({ length: totalSections }, (_, i) => i / (totalSections - 1)),
          duration: { min: 0.3, max: 0.8 },
          delay: 0.1,
          ease: 'power2.inOut',
        },
      },
    })

    // Hero → first content section
    const segmentDuration = 1 / (totalSections - 1)

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

  // Every frame: spherical → cartesian, position camera
  useFrame(() => {
    const { theta, phi, radius, targetY } = anim.current

    camera.position.x = radius * Math.sin(phi) * Math.sin(theta)
    camera.position.y = radius * Math.cos(phi)
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta)

    camera.lookAt(0, targetY, 0)
  })

  return null
}
