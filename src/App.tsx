import { Suspense, lazy, useState, useCallback } from 'react'
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

const Experience = lazy(() => import('./experience/Experience'))

function LenisWrapper({ children }: { children: React.ReactNode }) {
  useGSAPSync()
  return <>{children}</>
}

export default function App() {
  const tier = useDeviceCapability()
  const [loadingDone, setLoadingDone] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
    document.body.style.overflow = ''
  }, [])

  return (
    <>
      {/* Layer 1: Fixed 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 1.5, 5], fov: tier === 'low' ? 50 : 35 }}
          gl={{
            antialias: tier !== 'low',
            powerPreference: 'high-performance',
            alpha: false,
          }}
          dpr={tier === 'low' ? [1, 1] : [1, 2]}
        >
          <color attach="background" args={['#050510']} />
          <Suspense fallback={null}>
            <Experience tier={tier} />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>

      {/* Layer 2: Scrollable HTML overlay */}
      {tier === 'low' ? (
        /* Skip Lenis on low-tier devices — native scroll is lighter */
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

      {/* Intro sequence — always mounted so its bg covers the canvas;
           animation starts only after loading finishes */}
      {!introComplete && (
        <IntroSequence onComplete={handleIntroComplete} startAnimation={loadingDone} />
      )}

      {/* Loading overlay */}
      <LoadingScreen onDone={() => {
        document.body.style.overflow = 'hidden'
        setLoadingDone(true)
      }} />
    </>
  )
}
