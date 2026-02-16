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

// Footer camera — pulled back and up, away from bright product lights
const FOOTER_ANGLE = -Math.PI / 8
const FOOTER_PHI = Math.PI / 2.8
const FOOTER_RADIUS = 12
const FOOTER_TARGET_Y = 0.4

// Mobile devices need the camera pulled back so the full object is visible
const MOBILE_RADIUS_SCALE =
  typeof window !== 'undefined' && window.innerWidth < 768 ? 1.45 : 1

export default function CameraRig() {
  const { camera } = useThree()
  const introComplete = useRef(false)

  const anim = useRef({
    theta: INTRO_ANGLE,
    phi: INTRO_PHI,
    radius: INTRO_RADIUS,
    targetY: INTRO_TARGET_Y,
  })

  // Cinematic zoom-in on load — listens for 'intro-complete' event
  useEffect(() => {
    const onIntroComplete = () => {
      introComplete.current = true
      gsap.to(anim.current, {
        theta: HERO_ANGLE,
        phi: HERO_PHI,
        radius: HERO_RADIUS * MOBILE_RADIUS_SCALE,
        targetY: HERO_TARGET_Y,
        duration: 3.5,
        ease: 'power2.inOut',
      })
    }

    window.addEventListener('intro-complete', onIntroComplete)

    // Fallback if intro is skipped
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
    // +2 because: hero slot + N content sections + footer section
    const totalSlots = sections.length + 2
    const segmentDuration = 1 / (totalSlots - 1)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2.0,
      },
    })

    // First keyframe: anchor at HERO so scroll starts from the right place
    // (prevents double-zoom where scroll timeline fights the intro animation)
    tl.set(anim.current, {
      theta: HERO_ANGLE,
      phi: HERO_PHI,
      radius: HERO_RADIUS * MOBILE_RADIUS_SCALE,
      targetY: HERO_TARGET_Y,
    })

    sections.forEach((section, i) => {
      const progress = (i + 1) * segmentDuration

      // Between section 3→4: subtle push away then pull back
      if (i === 3) {
        const prevSection = sections[i - 1]
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
        tl.to(anim.current, {
          theta: section.angle,
          phi: section.phi,
          radius: section.radius * MOBILE_RADIUS_SCALE,
          targetY: section.targetY,
          duration: segmentDuration * 0.6,
          ease: 'power2.inOut',
        })
      } else {
        tl.to(
          anim.current,
          {
            theta: section.angle,
            phi: section.phi,
            radius: section.radius * MOBILE_RADIUS_SCALE,
            targetY: section.targetY,
            duration: segmentDuration,
            ease: 'power1.inOut',
          },
          progress - segmentDuration
        )
      }
    })

    // FOOTER section — pull camera back and up so the product's
    // bright lights don't blow out the final text
    const footerProgress = (sections.length + 1) * segmentDuration
    tl.to(
      anim.current,
      {
        theta: FOOTER_ANGLE,
        phi: FOOTER_PHI,
        radius: FOOTER_RADIUS * MOBILE_RADIUS_SCALE,
        targetY: FOOTER_TARGET_Y,
        duration: segmentDuration,
        ease: 'power1.inOut',
      },
      footerProgress - segmentDuration
    )
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
