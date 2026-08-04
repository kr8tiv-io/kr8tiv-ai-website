/** Prefix a public-root asset path with Vite's base URL so raw fetches
 *  (HDR env maps, textures, audio) keep working when the site is served
 *  from a subpath (e.g. GitHub Pages preview). */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return base.replace(/\/$/, '') + path
}
