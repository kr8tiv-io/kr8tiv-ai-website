import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCENE_LAYOUT, sections } from '../config/sections'

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

const _up = new THREE.Vector3(0, 1, 0)
const _z = new THREE.Vector3()
const _right = new THREE.Vector3()
const _camUp = new THREE.Vector3()

type Band = 'mobile' | 'tablet' | 'desktop'

function viewportBand(): Band {
  const w = window.innerWidth
  if (w >= SCENE_LAYOUT.desktopMin) return 'desktop'
  if (w >= SCENE_LAYOUT.tabletMin) return 'tablet'
  return 'mobile'
}

/** Which side the copy occupies. Holds the previous side across the spacer beats. */
function readTextSide(prev: 'left' | 'right'): 'left' | 'right' {
  const vh = window.innerHeight
  let best = 0
  let side: 'left' | 'right' | null = null

  const consider = (el: Element | null, next: 'left' | 'right', opacity = 1) => {
    if (!el || opacity < 0.08) return
    const r = el.getBoundingClientRect()
    const vis = Math.min(r.bottom, vh) - Math.max(r.top, 0)
    if (vis <= 8) return
    const score = vis * opacity
    if (score > best) {
      best = score
      side = next
    }
  }

  const hero = document.querySelector('[data-hero]')
  if (hero) {
    const r = hero.getBoundingClientRect()
    const vis = Math.min(r.bottom, vh) - Math.max(r.top, 0)
    if (vis > vh * 0.4) consider(hero, 'left', 1)
  }

  document.querySelectorAll<HTMLElement>('[data-text-side]').forEach((el) => {
    const next = el.getAttribute('data-text-side') === 'right' ? 'right' : 'left'
    const inner = el.querySelector('.section-inner')
    const opacity = inner ? Number.parseFloat(getComputedStyle(inner).opacity || '0') : 1
    consider(el, next, opacity)
  })

  return side ?? prev
}

function readFooterFade() {
  const footer = document.querySelector('[data-scene-slot="footer"]')
  if (!footer) return 0
  const top = footer.getBoundingClientRect().top
  const start = window.innerHeight * 1.02
  const end = window.innerHeight * 0.7
  return THREE.MathUtils.clamp((start - top) / (start - end), 0, 1)
}

function applySceneVeil(band: Band, side: number, footerFade: number) {
  const root = document.querySelector<HTMLElement>('[data-scene-veil]')
  if (!root) return
  const set = (name: string, value: number) => {
    const el = root.querySelector<HTMLElement>(`[data-veil="${name}"]`)
    if (el) el.style.opacity = value.toFixed(3)
  }
  const desktop = band === 'desktop'
  set('left', desktop ? THREE.MathUtils.clamp(side, 0, 1) : 0)
  set('right', desktop ? THREE.MathUtils.clamp(-side, 0, 1) : 0)
  // Tablet and phone: the copy sits in the lower band, so that band goes
  // opaque. Phones keep the authored camera; the veil is what keeps the
  // hero card off the machine (prompt 004 replaces the phone scene).
  set('lower', desktop ? 0 : 1)
  set('footer', footerFade)
}

function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth < 768
}

export default function CameraRig() {
  const { camera, size } = useThree()

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
  // +1 = copy on the left (subject on the right). Lerped so section changes don't pop.
  const sideLerp = useRef(1)
  const footerLerp = useRef(0)
  const heldSide = useRef<'left' | 'right'>('left')

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
    let phi = THREE.MathUtils.clamp(a.phi + driftPhi + handPhi, 0.16, Math.PI - 0.16)
    let radius = Math.max(2.2, a.radius + driftRadius + velRadius.current)

    const band = viewportBand()
    const k = 1 - Math.exp(-delta * 7)
    heldSide.current = readTextSide(heldSide.current)
    const sideTarget = heldSide.current === 'left' ? 1 : -1
    sideLerp.current += (sideTarget - sideLerp.current) * k
    const footerFade = readFooterFade()
    footerLerp.current += (footerFade - footerLerp.current) * k
    applySceneVeil(band, sideLerp.current, footerLerp.current)

    // Desktop / tablet: keep the shot level and far enough back that the dome
    // fits the free region. Phones keep the authored orbit (prompt 004 replaces
    // that view with a poster).
    const subjectScale = band === 'desktop' ? SCENE_LAYOUT.desktopScale : SCENE_LAYOUT.tabletScale
    // How far above screen-center to park the subject, in units of half the
    // vertical view. Desktop derives this from the band between the header
    // and the stat card so a short window cannot drop the dome onto either.
    let verticalLift = 0.66
    if (band !== 'mobile') {
      phi = THREE.MathUtils.clamp(phi, 58 * D, 84 * D)
      const tanV = Math.tan(THREE.MathUtils.degToRad(a.fov) / 2)
      const aspect = size.width / Math.max(1, size.height)
      if (band === 'desktop') {
        const h = Math.max(1, size.height)
        const topBand = SCENE_LAYOUT.headerReserve / h
        const hudBand = SCENE_LAYOUT.hudReserve / h
        const avail = Math.max(0.3, 1 - topBand - hudBand)
        const span = SCENE_LAYOUT.subjectWidth * subjectScale
        const fitW =
          span / (2 * SCENE_LAYOUT.desktopWidthFrac * tanV * Math.max(aspect, 0.8))
        const fitH = span / (2 * avail * tanV)
        radius = Math.max(radius, fitW, fitH)
        verticalLift = 1 - 2 * (topBand + avail / 2)
      } else {
        const fit =
          (SCENE_LAYOUT.subjectHeight * subjectScale) /
          (2 * SCENE_LAYOUT.tabletHeightFrac * tanV)
        radius = Math.max(radius, fit)
      }
    }

    camera.position.set(
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.cos(theta)
    )

    if (band === 'mobile') {
      // Phones keep the authored orbit. The lower veil covers the hero card,
      // which sits along the bottom; section copy on a short phone starts
      // under the header, above this lower-third framing.
      lookTarget.current.set(a.tx, a.ty + (mobile.current ? 1.0 : 0), a.tz)
      camera.lookAt(lookTarget.current)
      const roll = a.roll + handRoll + velRoll.current
      if (roll !== 0) camera.rotateZ(roll)
    } else {
      // Aim at the wire dome's center (local y 0.3, parent scale). Aiming
      // higher dropped the dome onto the stat card.
      lookTarget.current.set(0, 0.3 * subjectScale, 0)
      _z.subVectors(camera.position, lookTarget.current)
      if (_z.lengthSq() > 1e-6) {
        _z.normalize()
        _right.crossVectors(_up, _z)
        if (_right.lengthSq() > 1e-6) {
          _right.normalize()
          _camUp.crossVectors(_z, _right).normalize()
          const halfH = radius * Math.tan(THREE.MathUtils.degToRad(a.fov) / 2)
          if (band === 'desktop') {
            const aspect = size.width / Math.max(1, size.height)
            const shift = halfH * aspect * 0.58 * sideLerp.current
            lookTarget.current.addScaledVector(_right, -shift)
            lookTarget.current.addScaledVector(_camUp, -halfH * verticalLift)
          } else {
            lookTarget.current.addScaledVector(_camUp, -halfH * verticalLift)
          }
        }
      }
      camera.lookAt(lookTarget.current)
    }

    const persp = camera as THREE.PerspectiveCamera
    const targetFov = a.fov + velRadius.current * 1.5
    if (Math.abs(persp.fov - targetFov) > 0.01) {
      persp.fov = targetFov
      persp.updateProjectionMatrix()
    }
  })

  return null
}
