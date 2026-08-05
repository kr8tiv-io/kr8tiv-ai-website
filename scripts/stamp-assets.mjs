#!/usr/bin/env node
/* Cache-bust the assets Vite does NOT hash.
 *
 * Vite content-hashes anything imported from src/ (index-<hash>.js), so those
 * are safe to cache forever. Everything in public/ keeps its filename — the
 * shared sub-page stylesheet, the OG card, the favicon — so a redeploy that
 * changes one of them would keep serving the old file to anyone (and any CDN)
 * holding a long max-age.
 *
 * This stamps a content hash onto those references in the built HTML:
 *   styles/page.css  ->  styles/page.css?v=a1b2c3d4
 * A different byte anywhere in the file means a different URL, so the fetch
 * cannot be answered from a stale cache entry.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const DIST = path.resolve('dist')

function hashOf(file) {
  return createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 8)
}

function htmlFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full))
    else if (entry.endsWith('.html')) out.push(full)
  }
  return out
}

// filename in dist -> the reference forms that can appear in HTML
const TARGETS = ['styles/page.css', 'og-card.png', 'favicon.png']

const stamps = new Map()
for (const rel of TARGETS) {
  const file = path.join(DIST, rel)
  if (existsSync(file)) stamps.set(rel, hashOf(file))
}

let touched = 0
for (const file of htmlFiles(DIST)) {
  let html = readFileSync(file, 'utf8')
  const before = html

  for (const [rel, hash] of stamps) {
    const name = rel.split('/').pop()
    // matches ./x, ../x, /x and bare x — but never one already stamped
    const re = new RegExp(`((?:\\.{1,2}/)*(?:[\\w./-]*/)?${name.replace('.', '\\.')})(?![?\\w])`, 'g')
    html = html.replace(re, (m) => `${m}?v=${hash}`)
  }

  if (html !== before) {
    writeFileSync(file, html)
    touched++
  }
}

console.log(
  `stamp-assets: ${touched} html file(s) stamped — ` +
    [...stamps].map(([k, v]) => `${k}@${v}`).join(' ')
)
