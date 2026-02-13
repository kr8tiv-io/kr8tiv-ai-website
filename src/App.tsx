import { Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { ReactLenis } from 'lenis/react'
import ScrollSections from './components/ScrollSections'
import LoadingScreen from './components/LoadingScreen'
import HeroOverlay from './components/HeroOverlay'
import NavigationBar from './components/NavigationBar'
import { useGSAPSync } from './hooks/useGSAPSync'
import { useDeviceCapability } from './hooks/useDeviceCapability'

const Experience = lazy(() => import('./experience/Experience'))

function LenisWrapper({ children }: { children: React.ReactNode }) {
  useGSAPSync()
  return <>{children}</>
}

export default function App() {
  const tier = useDeviceCapability()

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
      <ReactLenis
        root
        options={{
          lerp: 0.07,
          duration: 1.2,
          smoothWheel: true,
          syncTouch: false,
        }}
      >
        <LenisWrapper>
          <NavigationBar />
          <HeroOverlay />
          <ScrollSections />
        </LenisWrapper>
      </ReactLenis>

      {/* Loading overlay */}
      <LoadingScreen />
    </>
  )
}
