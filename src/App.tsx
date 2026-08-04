import { Suspense, lazy, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { ReactLenis } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollSections from './components/ScrollSections'
import LoadingScreen from './components/LoadingScreen'
import HeroOverlay from './components/HeroOverlay'
import NavigationBar from './components/NavigationBar'
import IntroSequence from './components/IntroSequence'
import TransitionFlash from './components/TransitionFlash'
import VibesButton from './components/VibesButton'
import { useGSAPSync } from './hooks/useGSAPSync'
import { useDeviceCapability } from './hooks/useDeviceCapability'
import { useScrollVelocity } from './hooks/useScrollVelocity'

gsap.registerPlugin(ScrollTrigger)

const Experience = lazy(() => import('./experience/Experience'))

function LenisWrapper({ children }: { children: ReactNode }) {
  useGSAPSync()
  useScrollVelocity() // Feeds scroll speed to 3D scene for reactive effects
  return <>{children}</>
}

function isWebGLErrorMessage(message: string) {
  return /webgl context|failed to create webgl context|error creating webgl context/i.test(message)
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export default function App() {
  const { tier, preferConservativeWebGL, supportsWebGL, webglChecked } = useDeviceCapability()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [loadingDone, setLoadingDone] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const [canvasFailed, setCanvasFailed] = useState(false)

  const isIOS = useMemo(
    () =>
      typeof navigator !== 'undefined' &&
      (/iP(hone|od|ad)/.test(navigator.userAgent) ||
        (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)),
    []
  )

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
    document.body.style.overflow = ''
  }, [])

  // The prerendered SEO copy in index.html is for crawlers only —
  // remove it once React owns the page so nothing is announced twice.
  useEffect(() => {
    document.getElementById('static-content')?.remove()
  }, [])

  // Reduced motion: skip the cinematic intro entirely (the camera still
  // settles, driven by the same event, just without the theatre).
  useEffect(() => {
    if (prefersReducedMotion && loadingDone && !introComplete) {
      window.dispatchEvent(new CustomEvent('intro-complete'))
      handleIntroComplete()
    }
  }, [prefersReducedMotion, loadingDone, introComplete, handleIntroComplete])

  // iOS: pinned full-screen sections + native touch scroll jitter without
  // normalized scroll. Only applied where Lenis smoothing is off (low tier).
  useEffect(() => {
    if (isIOS && tier === 'low') {
      ScrollTrigger.normalizeScroll(true)
      return () => {
        ScrollTrigger.normalizeScroll(false)
      }
    }
  }, [isIOS, tier])

  // Rotation / real resizes: ScrollTrigger pins cache their dimensions, so a
  // width change (orientation flip, split-screen) needs an explicit refresh.
  // Height-only changes (iOS URL bar) are deliberately ignored.
  useEffect(() => {
    let lastWidth = window.innerWidth
    let raf = 0
    let timeout: number | undefined
    const onResize = () => {
      const width = window.innerWidth
      if (Math.abs(width - lastWidth) < 60) return
      lastWidth = width
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        raf = window.requestAnimationFrame(() => ScrollTrigger.refresh())
      }, 250)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      window.clearTimeout(timeout)
      window.cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    if (!webglChecked || !supportsWebGL || canvasReady || canvasFailed) {
      return
    }

    const timeout = window.setTimeout(() => {
      setCanvasFailed(true)
    }, 4000)

    const handleError = (event: ErrorEvent) => {
      if (isWebGLErrorMessage(event.message)) {
        setCanvasFailed(true)
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message =
        typeof reason === 'string'
          ? reason
          : reason instanceof Error
            ? reason.message
            : ''

      if (isWebGLErrorMessage(message)) {
        setCanvasFailed(true)
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [canvasFailed, canvasReady, supportsWebGL, webglChecked])

  const shouldRenderCanvas = webglChecked && supportsWebGL && !canvasFailed
  const showStaticFallback = webglChecked && (!supportsWebGL || canvasFailed)
  const canvasDpr: [number, number] =
    tier === 'low' ? [1, 1] : preferConservativeWebGL ? [1, 1.25] : [1, 1.5]

  return (
    <>
      {/* Layer 0: static rendered scene for browsers without WebGL */}
      {showStaticFallback && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src="/fallback-scene.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-70"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(5,5,16,0.2) 0%, rgba(5,5,16,0.85) 100%)',
            }}
          />
        </div>
      )}

      {/* Layer 1: Fixed 3D Canvas */}
      {shouldRenderCanvas && (
        <div className="fixed inset-0 z-0">
          <Canvas
            camera={{ position: [0, 1.5, 5], fov: tier === 'low' ? 50 : 35 }}
            gl={{
              antialias: !preferConservativeWebGL && tier !== 'low',
              powerPreference: preferConservativeWebGL ? 'default' : 'high-performance',
              alpha: false,
              stencil: !preferConservativeWebGL,
            }}
            dpr={canvasDpr}
            onCreated={() => setCanvasReady(true)}
          >
            <color attach="background" args={['#050510']} />
            <Suspense fallback={null}>
              <Experience tier={tier} />
              <Preload all />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Layer 2: Scrollable HTML overlay */}
      {tier === 'low' || prefersReducedMotion ? (
        <div>
          <NavigationBar />
          <HeroOverlay />
          <ScrollSections />
        </div>
      ) : (
        <ReactLenis
          root
          options={{
            lerp: 0.08,
            duration: 1.0,
            smoothWheel: true,
            syncTouch: false,
            wheelMultiplier: 0.9,
          }}
        >
          <LenisWrapper>
            <NavigationBar />
            <HeroOverlay />
            <ScrollSections />
          </LenisWrapper>
        </ReactLenis>
      )}

      {/* Vibes music toggle */}
      <VibesButton />

      {/* Transition effects */}
      <TransitionFlash />

      {/* Intro sequence — plays after loading (skipped for reduced motion) */}
      {!prefersReducedMotion && loadingDone && !introComplete && (
        <IntroSequence onComplete={handleIntroComplete} />
      )}

      {/* Loading overlay */}
      <LoadingScreen
        forceComplete={webglChecked && (!supportsWebGL || canvasFailed)}
        onDone={() => {
          document.body.style.overflow = 'hidden'
          setTimeout(() => setLoadingDone(true), 300)
        }}
      />
    </>
  )
}
