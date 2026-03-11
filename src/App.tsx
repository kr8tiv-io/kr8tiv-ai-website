import { Suspense, lazy, useState, useCallback, useEffect, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { ReactLenis } from 'lenis/react'
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

const Experience = lazy(() => import('./experience/Experience'))

function LenisWrapper({ children }: { children: ReactNode }) {
  useGSAPSync()
  useScrollVelocity() // Feeds scroll speed to 3D scene for reactive effects
  return <>{children}</>
}

function isWebGLErrorMessage(message: string) {
  return /webgl context|failed to create webgl context|error creating webgl context/i.test(message)
}

export default function App() {
  const { tier, supportsWebGL, webglChecked } = useDeviceCapability()
  const [loadingDone, setLoadingDone] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const [canvasFailed, setCanvasFailed] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
    document.body.style.overflow = ''
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

  return (
    <>
      {/* Layer 1: Fixed 3D Canvas */}
      {shouldRenderCanvas && (
        <div className="fixed inset-0 z-0">
          <Canvas
            camera={{ position: [0, 1.5, 5], fov: tier === 'low' ? 50 : 35 }}
            gl={{
              antialias: tier !== 'low',
              powerPreference: 'high-performance',
              alpha: false,
            }}
            dpr={tier === 'low' ? [1, 1.5] : [1.5, 2]}
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
      {tier === 'low' ? (
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

      {/* Intro sequence — plays after loading */}
      {loadingDone && !introComplete && (
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
