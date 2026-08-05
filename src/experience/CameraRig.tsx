import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sections } from '../config/sections'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────────────────────
   CameraRig — the shot list.

   Every section is a DIFFERENT SHOT, not the same orbit nudged a
   few degrees: each one has its own angle, height, lens and framing,
   and each is played as two moves — an APPROACH that travels
   (swing wide, crane down, whip round, pull back) and a HOLD that
   keeps drifting while the copy is on screen, so the frame is never
   locked off.

   On top of that, every frame gets:
   - a slow breathing drift (orbit + dolly) so the idle hero shot lives
   - handheld noise on angle, dolly and roll
   - a scroll-velocity kick: fast scrolling pushes the camera out and
     rolls it slightly, then it settles

   All of it is amplitude-scaled and can be switched off entirely for
   prefers-reduced-motion.
   ──────────────────────────────────────────────────────────── */

interface Move {
  theta: number // orbit angle
  phi: number // polar angle: small = above, ~PI/2 = level
  radius: number // dolly distance
  tx?: number // look-at offsets — reframes the subject off-centre
  ty?: number
  tz?: number
  fov?: number // real lens zoom, independent of the dolly
  roll?: number // dutch angle
}

interface Shot {
  approach: Move // travelled into over the first part of the segment
  hold: Move // drifted to while the section is pinned
  approachEase?: string
  holdEase?: string
  split?: number // fraction of the segment spent on the approach
}

const D = Math.PI / 180

/* One entry per section in src/config/sections.ts. */
const SHOTS: Shot[] = [
  // 1 · What we automate — swing in from wide and push to a tight 3/4.
  {
    approach: { theta: 62 * D, phi: 62 * D, radius: 12.5, ty: 0.75, fov: 42 },
    hold: { theta: 96 * D, phi: 78 * D, radius: 5.4, tx: 0.15, ty: 0.35, fov: 31 },
    approachEase: 'power2.out',
    holdEase: 'sine.inOut',
    split: 0.5,
  },
  // 2 · Evolve case study — crane up and over, then descend to deck level.
  {
    approach: { theta: 148 * D, phi: 30 * D, radius: 9.4, ty: 0.55, fov: 38 },
    hold: { theta: 182 * D, phi: 84 * D, radius: 5.0, tx: -0.45, ty: 0.28, fov: 34 },
    approachEase: 'power1.inOut',
    holdEase: 'power1.out',
    split: 0.55,
  },
  // 3 · How it works — drop to a low hero angle and reframe onto the filed grid.
  {
    approach: { theta: 214 * D, phi: 96 * D, radius: 7.6, tx: 0.4, ty: 0.5, fov: 46 },
    hold: { theta: 236 * D, phi: 81 * D, radius: 4.9, tx: 1.05, ty: 0.34, fov: 40, roll: -1.5 * D },
    approachEase: 'power2.inOut',
    holdEase: 'sine.inOut',
    split: 0.45,
  },
  // 4 · The engines — big pull back and up: the whole machine in the fog.
  {
    approach: { theta: 262 * D, phi: 58 * D, radius: 6.2, ty: 0.4, fov: 33 },
    hold: { theta: 292 * D, phi: 34 * D, radius: 13.5, ty: 0.9, fov: 40 },
    approachEase: 'power2.in',
    holdEase: 'power2.out',
    split: 0.35,
  },
  // 5 · What you own — whip round the back and push in tight on the arm.
  {
    approach: { theta: 320 * D, phi: 70 * D, radius: 10.5, ty: 0.7, fov: 36 },
    hold: { theta: 352 * D, phi: 86 * D, radius: 4.0, tx: -0.75, ty: 0.55, fov: 33, roll: 1.8 * D },
    approachEase: 'power3.out',
    holdEase: 'sine.inOut',
    split: 0.4,
  },
  // 6 · The human part — slow crane out to the widest frame in the film.
  {
    approach: { theta: 384 * D, phi: 74 * D, radius: 7.0, ty: 0.4, fov: 34 },
    hold: { theta: 412 * D, phi: 46 * D, radius: 15.0, ty: 1.0, fov: 42 },
    approachEase: 'sine.inOut',
    holdEase: 'power1.inOut',
    split: 0.45,
  },
]

// Hero resting shot after the intro zoom.
const HERO: Move = { theta: -30 * D, phi: 76 * D, radius: 8.6, ty: 0.35, fov: 35 }
// Way up and far back — where the intro starts.
const INTRO: Move = { theta: -52 * D, phi: 40 * D, radius: 30, ty: 1.6, fov: 46 }

function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth < 768
}

export default function CameraRig() {
  const { camera } = useThree()

  // Phones need the whole machine in frame: pull back and widen the lens.
  const mobile = useRef(isMobileViewport())
  const radiusScale = useRef(mobile.current ? 1.34 : 1)
  const fovScale = useRef(mobile.current ? 1.2 : 1)

  const reduced = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const anim = useRef({
    theta: INTRO.theta,
    phi: INTRO.phi,
    radius: INTRO.radius,
    tx: 0,
    ty: INTRO.ty ?? 0,
    tz: 0,
    fov: INTRO.fov ?? 35,
    roll: 0,
  })

  const scrollTlRef = useRef<gsap.core.Timeline | null>(null)
  const zoomStartedRef = useRef(false)
  const lookTarget = useRef(new THREE.Vector3())
  const velRadius = useRef(0)
  const velRoll = useRef(0)

  const toVars = (m: Move) => ({
    theta: m.theta,
    phi: m.phi,
    radius: m.radius * radiusScale.current,
    tx: m.tx ?? 0,
    ty: m.ty ?? 0.3,
    tz: m.tz ?? 0,
    fov: (m.fov ?? 35) * fovScale.current,
    roll: m.roll ?? 0,
  })

  const buildScrollTimeline = () => {
    if (scrollTlRef.current) return

    // sections + the footer beat
    const segments = sections.length + 1
    const segment = 1 / (segments - 1)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
      },
    })

    SHOTS.forEach((shot, i) => {
      const start = i * segment
      const split = shot.split ?? 0.5

      tl.to(
        anim.current,
        {
          ...toVars(shot.approach),
          duration: segment * split,
          ease: shot.approachEase ?? 'power2.out',
        },
        start
      )

      tl.to(
        anim.current,
        {
          ...toVars(shot.hold),
          duration: segment * (1 - split),
          ease: shot.holdEase ?? 'sine.inOut',
        },
        start + segment * split
      )
    })

    scrollTlRef.current = tl
    ScrollTrigger.refresh()
  }

  // Keep the mobile framing correct across rotation / resize.
  useEffect(() => {
    const onResize = () => {
      const nowMobile = isMobileViewport()
      if (nowMobile === mobile.current) return
      mobile.current = nowMobile
      radiusScale.current = nowMobile ? 1.34 : 1
      fovScale.current = nowMobile ? 1.2 : 1
      scrollTlRef.current?.scrollTrigger?.kill()
      scrollTlRef.current?.kill()
      scrollTlRef.current = null
      buildScrollTimeline()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Cinematic zoom-in on load — listens for 'intro-complete'.
  useEffect(() => {
    const onIntroComplete = () => {
      if (zoomStartedRef.current) return
      zoomStartedRef.current = true

      gsap.to(anim.current, {
        ...toVars(HERO),
        duration: 3,
        ease: 'power3.inOut',
        onComplete: () => {
          buildScrollTimeline()
          ;(window as any).__kr8tiv_intro_zoom_complete = true
          window.dispatchEvent(new CustomEvent('intro-zoom-complete'))
        },
      })
    }

    window.addEventListener('intro-complete', onIntroComplete)

    // Failsafe if the intro is skipped or never fires.
    const fallback = setTimeout(() => {
      if (anim.current.radius > HERO.radius * radiusScale.current + 1) onIntroComplete()
    }, 5000)

    return () => {
      window.removeEventListener('intro-complete', onIntroComplete)
      clearTimeout(fallback)
      scrollTlRef.current?.scrollTrigger?.kill()
      scrollTlRef.current?.kill()
      scrollTlRef.current = null
    }
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const a = anim.current
    const live = reduced.current ? 0 : 1

    // Scroll velocity → a small dolly-out and roll, eased back to rest.
    const rawVel = Math.min(Math.abs((window as any).__kr8tiv_scrollVel ?? 0), 2000) / 2000
    const signedVel = Math.sign((window as any).__kr8tiv_scrollVel ?? 0) * rawVel
    velRadius.current += (rawVel * 0.9 * live - velRadius.current) * Math.min(1, delta * 3)
    velRoll.current += (signedVel * 0.9 * D * live - velRoll.current) * Math.min(1, delta * 3)

    // Always-on breathing so the hero shot is never dead.
    const driftTheta = Math.sin(t * 0.07) * 0.055 * live
    const driftPhi = Math.sin(t * 0.051 + 1.3) * 0.032 * live
    const driftRadius = Math.sin(t * 0.089 + 0.6) * 0.22 * live

    // Handheld — small, fast, irregular.
    const handTheta = (Math.sin(t * 0.63) + Math.sin(t * 1.17 + 2.1) * 0.5) * 0.006 * live
    const handPhi = (Math.sin(t * 0.71 + 0.9) + Math.sin(t * 1.43) * 0.5) * 0.005 * live
    const handRoll = Math.sin(t * 0.47 + 1.7) * 0.35 * D * live

    const theta = a.theta + driftTheta + handTheta
    const phi = THREE.MathUtils.clamp(a.phi + driftPhi + handPhi, 0.16, Math.PI - 0.16)
    const radius = Math.max(2.2, a.radius + driftRadius + velRadius.current)

    camera.position.set(
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.cos(theta)
    )

    // Portrait phones: the copy owns the top of the screen, so aim ABOVE the
    // machine — that drops the subject into the lower third, clear of the text.
    const lift = mobile.current ? 1.0 : 0
    lookTarget.current.set(a.tx, a.ty + lift, a.tz)
    camera.lookAt(lookTarget.current)

    const roll = a.roll + handRoll + velRoll.current
    if (roll !== 0) camera.rotateZ(roll)

    const persp = camera as THREE.PerspectiveCamera
    const targetFov = a.fov + velRadius.current * 1.5
    if (Math.abs(persp.fov - targetFov) > 0.01) {
      persp.fov = targetFov
      persp.updateProjectionMatrix()
    }
  })

  return null
}
