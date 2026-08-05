import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Surfaces — procedural PBR detail for the Ops Engine.

   The reference craft bar (threejspunk) gets its realism from real
   albedo/normal/roughness maps: light breaks up across a surface instead
   of sliding over it. We get the same effect without shipping a single
   texture byte — every map here is drawn into a canvas once at startup
   and cached, so it costs a few milliseconds and zero network.

   Three maps, all tileable:
   - roughnessMap  brushed anisotropic streaks + patchy wear, so highlights
                   smear along the grain instead of reading as plastic
   - normalMap     fine machining grain + occasional scratch
   - aoMap-ish     subtle blotchy darkening used as an albedo multiplier
   ──────────────────────────────────────────────────────────── */

const cache = new Map<string, THREE.Texture>()

function makeCanvas(size: number) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  return c
}

/** Deterministic value noise so every reload looks identical. */
function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function finish(canvas: HTMLCanvasElement, srgb: boolean, repeat: number) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat, repeat)
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

/** Brushed-metal roughness: streaks along X, blotches on top. */
export function brushedRoughness(size = 512, repeat = 3): THREE.Texture {
  const key = `rough-${size}-${repeat}`
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')!
  const rng = makeRng(20260804)

  // base
  ctx.fillStyle = '#6a6a6a'
  ctx.fillRect(0, 0, size, size)

  // brushed streaks
  ctx.globalAlpha = 0.14
  for (let i = 0; i < size * 2.2; i++) {
    const y = rng() * size
    const len = size * (0.25 + rng() * 0.75)
    const x = rng() * size
    const v = Math.floor(90 + rng() * 90)
    ctx.strokeStyle = `rgb(${v},${v},${v})`
    ctx.lineWidth = rng() < 0.85 ? 1 : 2
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + len, y + (rng() - 0.5) * 1.5)
    ctx.stroke()
  }

  // wear patches — where a machine gets touched, it gets shinier
  ctx.globalAlpha = 0.5
  for (let i = 0; i < 26; i++) {
    const x = rng() * size
    const y = rng() * size
    const r = size * (0.04 + rng() * 0.13)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const dark = rng() < 0.5
    g.addColorStop(0, dark ? 'rgba(40,40,40,0.55)' : 'rgba(150,150,150,0.5)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const tex = finish(canvas, false, repeat)
  cache.set(key, tex)
  return tex
}

/** Fine machining grain + scratches, converted to a tangent-space normal map. */
export function microNormal(size = 512, repeat = 3, strength = 1.6): THREE.Texture {
  const key = `norm-${size}-${repeat}-${strength}`
  const hit = cache.get(key)
  if (hit) return hit

  const height = makeCanvas(size)
  const hctx = height.getContext('2d')!
  const rng = makeRng(7761)

  hctx.fillStyle = '#808080'
  hctx.fillRect(0, 0, size, size)

  // grain
  hctx.globalAlpha = 0.09
  for (let i = 0; i < size * 3; i++) {
    const y = rng() * size
    const x = rng() * size
    const len = size * (0.1 + rng() * 0.5)
    const v = rng() < 0.5 ? 40 : 210
    hctx.strokeStyle = `rgb(${v},${v},${v})`
    hctx.lineWidth = 1
    hctx.beginPath()
    hctx.moveTo(x, y)
    hctx.lineTo(x + len, y + (rng() - 0.5) * 2)
    hctx.stroke()
  }

  // deeper scratches
  hctx.globalAlpha = 0.35
  for (let i = 0; i < 18; i++) {
    const x = rng() * size
    const y = rng() * size
    const len = size * (0.08 + rng() * 0.3)
    const ang = (rng() - 0.5) * 0.6
    hctx.strokeStyle = rng() < 0.5 ? '#2a2a2a' : '#d8d8d8'
    hctx.lineWidth = rng() < 0.7 ? 1 : 2
    hctx.beginPath()
    hctx.moveTo(x, y)
    hctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len)
    hctx.stroke()
  }
  hctx.globalAlpha = 1

  // height → normal (sobel)
  const src = hctx.getImageData(0, 0, size, size).data
  const out = makeCanvas(size)
  const octx = out.getContext('2d')!
  const img = octx.createImageData(size, size)
  const at = (x: number, y: number) => {
    const xi = (x + size) % size
    const yi = (y + size) % size
    return src[(yi * size + xi) * 4] / 255
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx =
        at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1) -
        (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1))
      const dy =
        at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1) -
        (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1))
      const nx = dx * strength
      const ny = dy * strength
      const nz = 1
      const len = Math.hypot(nx, ny, nz)
      const i = (y * size + x) * 4
      img.data[i] = ((nx / len) * 0.5 + 0.5) * 255
      img.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255
      img.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255
      img.data[i + 3] = 255
    }
  }
  octx.putImageData(img, 0, 0)

  const tex = finish(out, false, repeat)
  cache.set(key, tex)
  return tex
}

/** Blotchy grime/AO used to break up flat albedo. */
export function grimeMap(size = 256, repeat = 2): THREE.Texture {
  const key = `grime-${size}-${repeat}`
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')!
  const rng = makeRng(31337)

  ctx.fillStyle = '#8e8e8e'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 60; i++) {
    const x = rng() * size
    const y = rng() * size
    const r = size * (0.05 + rng() * 0.22)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${rng() < 0.6 ? 60 : 190},${rng() < 0.6 ? 60 : 190},70,0.35)`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = finish(canvas, false, repeat)
  cache.set(key, tex)
  return tex
}

export function disposeSurfaces() {
  cache.forEach((t) => t.dispose())
  cache.clear()
}
