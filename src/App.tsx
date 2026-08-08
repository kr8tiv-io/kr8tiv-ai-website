import { Suspense, lazy, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
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
import { asset } from './lib/asset'

gsap.registerPlugin(ScrollTrigger)

// The entire WebGL stack (r3f + drei + three) lives behind this boundary so it
// is never in the first chunk — the hero paints before any of it arrives.
const Scene3D = lazy(() => import('./experience/Scene3D'))

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
  // Asset-loading progress, reported up from inside the lazy 3D chunk so the
  // loading screen itself stays free of any three.js import.
  const [sceneProgress, setSceneProgress] = useState({ progress: 0, active: false })
  const handleSceneProgress = useCallback(
    (progress: number, active: boolean) => setSceneProgress({ progress, active }),
    []
  )

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

  // Skip the cinematic intro when it would cost more than it gives:
  //  - prefers-reduced-motion, obviously
  //  - phones, where the curtain was the single biggest thing delaying the
  //    hero copy. Measured: the hero paragraph was the LCP element at 5.0s on
  //    a 4x-throttled phone purely because it sat behind the loader + intro,
  //    while the HTML itself had painted at ~600ms.
  // The camera still settles: it listens for the same 'intro-complete' event.
  const skipIntro = prefersReducedMotion || tier === 'low'
  useEffect(() => {
    if (skipIntro && loadingDone && !introComplete) {
      window.dispatchEvent(new CustomEvent('intro-complete'))
      handleIntroComplete()
    }
  }, [skipIntro, loadingDone, introComplete, handleIntroComplete])

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
      {/* Layer 0: poster frame.
          Shown immediately — not only when WebGL fails — for two reasons: it
          replaces a black screen with the actual scene while three.js streams
          in, and it gives the browser a large element to paint early. Before
          this the canvas itself was the LCP candidate and only appeared once
          the whole 3D stack had booted (live mobile LCP 3.8s). It cross-fades
          out the moment the real canvas is ready. */}
      {(showStaticFallback || !canvasReady) && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700"
          style={{ opacity: canvasReady ? 0 : 1 }}
          aria-hidden="true"
        >
          <img
            src={asset('/fallback-scene.jpg')}
            alt=""
            fetchPriority="high"
            decoding="async"
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

      {/* Layer 1: Fixed 3D canvas — streamed in after the overlay has painted */}
      {shouldRenderCanvas && (
        <Suspense fallback={null}>
          <Scene3D
            tier={tier}
            dpr={canvasDpr}
            conservative={preferConservativeWebGL}
            onCreated={() => setCanvasReady(true)}
            onProgress={handleSceneProgress}
          />
        </Suspense>
      )}

      {/* Keyboard users land here first: the scene is decorative and the nav is
          visually last in the DOM, so offer a jump straight to the content. */}
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

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
      {!skipIntro && loadingDone && !introComplete && (
        <IntroSequence onComplete={handleIntroComplete} />
      )}

      {/* Loading overlay */}
      <LoadingScreen
        progress={sceneProgress.progress}
        active={sceneProgress.active}
        /* Lift the curtain as soon as there is a canvas to look at — waiting for
           every last asset kept the hero copy hidden long after it was ready. */
        forceComplete={canvasReady || (webglChecked && (!supportsWebGL || canvasFailed))}
        onDone={() => {
          document.body.style.overflow = 'hidden'
          setTimeout(() => setLoadingDone(true), 300)
        }}
      />
    </>
  )
}
