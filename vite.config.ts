import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Function form, deliberately. The object form declares these as
        // entry-adjacent chunks, so Vite emits <link rel="modulepreload"> for
        // three and r3f in index.html and the browser fetches ~340KB gzip of
        // WebGL at highest priority before the hero has painted. With the
        // function form the same grouping happens, but chunks reachable only
        // through a dynamic import stay async and are fetched after first paint.
        manualChunks(id) {
          // Vite's dynamic-import preload helper is a shared virtual module.
          // Left alone, Rollup parks it in the r3f chunk — and then the entry
          // statically imports r3f purely to get the helper, which pulls three
          // back into the initial graph. Pin it next to React instead.
          if (id.includes('vite/preload-helper')) return 'react'
          if (!id.includes('node_modules')) return
          // React must be named FIRST. It is shared by the entry and by r3f, and
          // if it is left unnamed Rollup hoists it into the r3f chunk — which
          // makes the entry statically import r3f, undoing the whole split.
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'react'
          }
          if (id.includes('/three/')) return 'three'
          if (id.includes('@react-three')) return 'r3f'
          if (id.includes('/gsap/') || id.includes('@gsap/')) return 'gsap'
        },
      },
    },
  },
})
