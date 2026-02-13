# 3D Model Sources — Free AI Tools for Video/Image to 3D

How to create web-ready 3D models from a video or image of a product using free, open-source AI tools.

---

## Quick Decision Guide

| Situation | Recommended Tool | Time | GPU Needed? |
|-----------|-----------------|------|-------------|
| Have a clear image, want fast results | TRELLIS.2 (HF Space) | 5 min | No (free cloud) |
| Have a clear image, want best quality | TRELLIS.2 (local) | 10 min | Yes (16GB VRAM) |
| Have video, want photorealistic capture | Nerfstudio Splatfacto | 1-3 hrs | Yes (8GB VRAM) |
| Have video, want easy mesh extraction | Nerfstudio + SuGaR | 2-4 hrs | Yes (8GB VRAM) |
| No GPU at all | Meshy.ai or Tripo3D free tier | 10 min | No (web app) |
| Want to try multiple tools quickly | HuggingFace Spaces | 15 min | No (free cloud) |

---

## Tool 1: TRELLIS.2 (Microsoft) — RECOMMENDED

The best single-image to 3D model as of early 2026. MIT license, 4B parameters, produces GLB with PBR materials directly.

**Free cloud (no GPU):**
- Go to https://huggingface.co/spaces/trellis-community/TRELLIS
- Upload your best frame image
- Wait 30-60 seconds
- Download the GLB file

**Local install (16GB+ VRAM):**
```bash
git clone --recurse-submodules https://github.com/microsoft/TRELLIS.2
cd TRELLIS.2
bash setup.sh --new-env
conda activate trellis2
```

```python
from trellis2.pipelines import Trellis2ImageTo3DPipeline
from trellis2.utils import postprocess

pipe = Trellis2ImageTo3DPipeline.from_pretrained("microsoft/TRELLIS.2-4B")
pipe.cuda()

outputs = pipe.run("best_frame.png")
mesh = outputs[0]
glb = postprocess.to_glb(mesh)
glb.export("product.glb")
```

**Strengths:** Fast, clean geometry, PBR materials, direct GLB export
**Weaknesses:** Single viewpoint only, may miss back details

---

## Tool 2: Hunyuan3D 2.1 (Tencent)

Open-source competitor to TRELLIS.2. Sometimes produces better results for complex shapes.

**Free cloud:**
- https://huggingface.co/spaces/tencent/Hunyuan3D-2
- Upload image → get 3D model

**Local:**
```bash
git clone https://github.com/Tencent/Hunyuan3D-2
cd Hunyuan3D-2
pip install -r requirements.txt
python generate.py --image best_frame.png --output product.glb
```

---

## Tool 3: Nerfstudio + Splatfacto (Full Video Reconstruction)

Captures the real product with exact textures from video. Most photorealistic but most work.

**Install:**
```bash
pip install nerfstudio
```

**Pipeline:**
```bash
# Step 1: Process video (extracts frames + COLMAP camera estimation)
ns-process-data video --data product_video.mp4 --output-dir data/product

# Step 2: Train Gaussian Splatting model
ns-train splatfacto --data data/product --max-num-iterations 30000

# Step 3: Export options

# Option A: Export as mesh (for standard Three.js rendering)
ns-export poisson --load-config outputs/product/splatfacto/config.yml --output-dir exports/

# Option B: Export as Gaussian splat PLY (for Spark web renderer)
ns-export gaussian-splat --load-config outputs/product/splatfacto/config.yml --output-dir exports/
```

**Mesh from Gaussian Splats via SuGaR:**
```bash
git clone https://github.com/Anttwo/SuGaR
cd SuGaR
python train_full_pipeline.py \
  -s data/product \
  -r "dn_consistency" \
  --high_poly True \
  --export_obj True
```

Then open the OBJ in Blender → export as GLB with Draco compression.

---

## Tool 4: NVIDIA Lyra (Newest — ICLR 2026)

Video-to-3D Gaussian Splatting in a single forward pass. Eliminates COLMAP entirely. Open-source but new — may have rough edges.

```bash
git clone https://github.com/nv-tlabs/lyra
cd lyra
pip install -r requirements.txt
python inference.py --video product_video.mp4 --output product_splat.ply
```

---

## Tool 5: Web-Based Options (No Setup)

**Meshy.ai** — https://meshy.ai
- Upload image or describe with text → get 3D model
- Free tier: ~5 generations/month
- Exports GLB, FBX, OBJ, STL

**Tripo3D** — https://tripo3d.ai
- Image/text to 3D
- Free tier available
- Quick and clean results

**CSM (Common Sense Machines)** — https://3d.csm.ai
- Image to 3D with good texture quality
- Free tier with limited usage

**Luma Genie** — https://lumalabs.ai/genie
- Text or image to 3D
- Free tier, good quality

---

## Rendering Gaussian Splats in the Browser

If you exported a Gaussian Splat (PLY/SPZ) instead of a mesh, use **Spark** to render it directly in Three.js/R3F:

```bash
npm install @sparkjsdev/spark
```

```typescript
import { SplatMesh } from "@sparkjsdev/spark"

// In a Three.js scene:
const splat = new SplatMesh({ url: "/models/product.spz" })
scene.add(splat)

// Splats support translate, rotate, scale like any Object3D
splat.rotation.y = Math.PI / 4
```

Gaussian Splats look more photorealistic than meshes (they capture view-dependent effects like reflections) but are heavier to render. Best for desktop-first experiences.

---

## Post-Processing in Blender (Free)

If the AI-generated model needs cleanup:

1. **Import**: File > Import > GLTF 2.0 (or OBJ)
2. **Scale**: Normalize to ~1 unit height (S key, type value)
3. **Center**: Set origin to geometry center, move to world origin
4. **Clean geometry**: Edit Mode → Mesh > Clean Up > Merge by Distance
5. **Fix normals**: Select All → Mesh > Normals > Recalculate Outside
6. **Reduce polycount**: Add Decimate modifier, ratio 0.3-0.5
7. **Fix UVs**: If textures look wrong, Smart UV Project
8. **Material setup**: Ensure Principled BSDF with proper metalness/roughness
9. **Export**: File > Export > GLTF 2.0 with:
   - Format: GLB
   - Draco compression: ON
   - Texture format: JPEG (0.8 quality)
   - Apply modifiers: ON

---

## Choosing the Right Frame from Video

The quality of your 3D model depends heavily on which frame you feed the AI. Tips:

```bash
# Extract all frames as a grid to pick the best one
ffmpeg -i video.mp4 -vf "fps=2,scale=320:-1,tile=5x5" contact_sheet.png

# Once you've identified the best moment, extract it at full resolution
# Replace FRAME_NUMBER with the exact frame (e.g., 72)
ffmpeg -i video.mp4 -vf "select=eq(n\,FRAME_NUMBER)" -vframes 1 best_frame.png
```

**What makes a good frame:**
- Product fills 40-70% of the frame
- Sharp focus (no motion blur)
- Good lighting (even, no blown-out highlights)
- Shows the most distinctive angle (usually 3/4 front view)
- Clean background (easier for AI to isolate the product)
- Shows key features/branding visible

**What to avoid:**
- Extreme angles (too top-down or too low)
- Heavy motion blur
- Occluded views (hand holding the product, etc.)
- Very dark or very bright frames
