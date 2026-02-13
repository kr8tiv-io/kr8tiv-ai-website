# Pipeline Guide — Video to Deployed 3D Website

Complete step-by-step pipeline from a product video/image to a live, deployed 3D scroll website.

## Table of Contents
1. Phase 1: Get a 3D Model (3 paths)
2. Phase 2: Optimize for Web
3. Phase 3: Build the Website
4. Phase 4: Deploy

---

## Phase 1: Get a 3D Model

You have three paths depending on what the user has and what quality they need.

### Path A: User already has a GLB/GLTF model
Skip to Phase 2.

### Path B: Generate from a single image (fastest, cleanest)

Extract the best frame from the video (sharpest, best angle, most of the product visible):

```bash
# Extract frame 150 (adjust number for best frame)
ffmpeg -i product_video.mp4 -vf "select=eq(n\,150)" -vframes 1 best_frame.png
```

Then use one of these free AI tools to generate a 3D model:

**Option 1: TRELLIS.2 (Microsoft, MIT license) — RECOMMENDED**
- HuggingFace Space: https://huggingface.co/spaces/trellis-community/TRELLIS
- Upload image → download GLB with PBR materials
- Local: `pip install trellis2` then:
```python
from trellis2.pipelines import Trellis2ImageTo3DPipeline
pipe = Trellis2ImageTo3DPipeline.from_pretrained("microsoft/TRELLIS.2-4B")
pipe.cuda()
mesh = pipe.run("best_frame.png")[0]
from trellis2.utils import postprocess
glb = postprocess.to_glb(mesh)
glb.export("product.glb")
```
- Requires: 16GB+ VRAM locally, or use the free HuggingFace Space

**Option 2: Hunyuan3D 2.1 (Tencent, open-source)**
- HuggingFace Space: https://huggingface.co/spaces/tencent/Hunyuan3D-2
- Good for complex geometry, produces textured mesh
- Alternative if TRELLIS.2 doesn't capture the shape well

**Option 3: Meshy.ai (free tier)**
- Web app at https://meshy.ai — upload image, get 3D model
- Free tier gives limited generations per month
- Good quality, easy to use, no technical setup

**Option 4: Tripo3D (free tier)**
- Web app at https://tripo3d.ai — image or text to 3D
- Free tier available, exports GLB

### Path C: Full video reconstruction (most photorealistic)

Uses the actual video frames to reconstruct the exact geometry and textures:

```bash
# Install Nerfstudio (Apache 2.0)
pip install nerfstudio

# Process video — extracts frames + runs COLMAP for camera poses
ns-process-data video --data product_video.mp4 --output-dir data/product

# Train Gaussian Splatting model (Splatfacto)
ns-train splatfacto --data data/product

# Export as mesh
ns-export poisson --load-config outputs/product/splatfacto/config.yml --output-dir exports/

# OR export as Gaussian Splat PLY (for web rendering via Spark)
ns-export gaussian-splat --load-config outputs/product/splatfacto/config.yml --output-dir exports/
```

For mesh extraction from Gaussian Splats, use **SuGaR**:
```bash
git clone https://github.com/Anttwo/SuGaR
python train_full_pipeline.py -s data/product -r "dn_consistency" --high_poly True --export_obj True
```

Then import the OBJ into Blender, clean up, and export as GLB.

**Requirements**: NVIDIA GPU with 8GB+ VRAM, 30-60 minutes training time.

**Video capture tips for best reconstruction:**
- Orbit the device slowly and steadily
- 2-3 elevation angles (eye level, 30° above, slightly below)
- 60-80% frame overlap between consecutive views
- Consistent, diffused lighting (no harsh shadows)
- Fixed distance from object
- 30-60 seconds, aim for 100-300 extracted frames

---

## Phase 2: Optimize for Web

Raw 3D models are often 30-100MB. Target: **under 5MB for desktop, under 2MB for mobile**.

### Step 1: Clean up in Blender (if needed)

1. Import the model (File > Import > GLTF/OBJ)
2. Edit Mode → Mesh > Clean Up > Merge by Distance
3. Recalculate Normals (Shift+N)
4. Apply Decimate Modifier (ratio 0.3-0.5 depending on polycount)
5. Smart UV Project if UVs are broken
6. Bake textures if needed: Diffuse, Normal, Roughness, Metallic at 1024×1024
7. Export as GLB with Draco compression enabled

### Step 2: Automated compression

```bash
# Install the optimization toolkit
npm install -g @gltf-transform/cli

# Full optimization pipeline
gltf-transform optimize product.glb optimized.glb \
  --compress draco \
  --texture-compress webp \
  --texture-resize 1024

# Check final size
ls -lh optimized.glb
```

### Step 3: Generate React component (optional but recommended)

```bash
# gltfjsx generates a typed React component + further compresses the GLB
npx gltfjsx optimized.glb --transform --types

# Outputs:
# - Product.tsx (typed React component with all mesh/material refs)
# - product-transformed.glb (further optimized)
```

### Size targets
- Hero product model: < 3MB (desktop), < 1.5MB (mobile)
- Textures: 1024×1024 max for web (2048 only if close-up detail is critical)
- Polycount: < 100K triangles for smooth 60fps

---

## Phase 3: Build the Website

### Step 1: Scaffold

```bash
npm create vite@latest my-product-site -- --template react-ts
cd my-product-site

# Core 3D
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing

# Animation
npm install gsap @gsap/react

# Smooth scroll
npm install lenis

# Styling
npm install -D tailwindcss @tailwindcss/vite
```

Configure Tailwind in `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Step 2: Place model

Copy the optimized GLB to `public/models/product.glb`.

### Step 3: Build components

Follow the architecture in `references/architecture.md`. Build in this order:

1. `App.tsx` — Two-layer root (Canvas + Lenis scroll)
2. `experience/Experience.tsx` — Scene setup with Environment
3. `experience/ProductModel.tsx` — Load the GLB
4. `experience/CameraRig.tsx` — Scroll-driven orbit
5. `config/sections.ts` — Define camera stops + content
6. `components/ScrollSections.tsx` — HTML overlay with fade animations
7. `experience/Effects.tsx` — Post-processing
8. `components/LoadingScreen.tsx` — Loading state

### Step 4: Iterate and polish

- Tune camera positions by adjusting `angle`, `phi`, `radius` in sections config
- Adjust GSAP `scrub` value (higher = smoother but laggier, 1-2 is the sweet spot)
- Tweak snap timing for the right feel
- Add text animations with SplitText
- Test on mobile — reduce effects, increase FOV, simplify
- Add a hero navigation bar (fixed, z-20, glass morphism)

---

## Phase 4: Deploy

### Option A: Cloudflare Pages (RECOMMENDED — unlimited bandwidth free)

```bash
# Build
npm run build

# Deploy (first time creates the project)
npx wrangler pages deploy dist --project-name my-product-site

# Upload 3D assets to R2 for CDN delivery (optional, for very large assets)
npx wrangler r2 object put my-assets/product.glb --file public/models/product.glb
```

Set cache headers for 3D assets:
```
Cache-Control: public, max-age=31536000, immutable
```

### Option B: Vercel

```bash
npm i -g vercel
vercel
```

Note: Vercel free tier has 100GB/month bandwidth. A 3MB GLB served to 33K visitors = limit reached. Cloudflare has no such limit.

### Option C: Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

Free tier: 100GB bandwidth, similar constraint as Vercel.

---

## Timing estimates

| Phase | Time |
|-------|------|
| Extract frame + generate 3D model (Path B) | 15-30 min |
| Full video reconstruction (Path C) | 1-3 hours |
| Optimize model for web | 15-30 min |
| Scaffold + build site | 3-5 hours |
| Polish + mobile testing | 1-2 hours |
| Deploy | 10 min |
| **Total (Path B)** | **5-8 hours** |
| **Total (Path C)** | **6-11 hours** |
