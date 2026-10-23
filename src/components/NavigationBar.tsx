import { useEffect, useRef, useState } from 'react'
import {
  AUDIT_MAILTO,
  PAGE_EVOLVE,
  PAGE_JARVIS,
  PAGE_KIN,
  PHONE_DISPLAY,
  PHONE_HREF,
} from '../config/sections'
import { asset } from '../lib/asset'

const HOME_HREF = asset('/')
/** Plain contact address already used in the footers. Book audit keeps AUDIT_MAILTO. */
const EMAIL_HREF = 'mailto:hello@kr8tiv.ai'
const EMAIL_LABEL = 'hello@kr8tiv.ai'

const PAGE_LINKS = [
  { label: 'Case study', href: PAGE_EVOLVE },
  { label: 'JARVIS', href: PAGE_JARVIS },
  { label: 'KIN', href: PAGE_KIN },
]

function SocialLinks() {
  return (
    <div className="site-socials">
      <a
        href="https://www.linkedin.com/company/kr8tivai"
        target="_blank"
        rel="noopener noreferrer"
        title="LinkedIn"
        aria-label="LinkedIn"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
          />
        </svg>
      </a>
      <a
        href="https://github.com/kr8tiv-ai"
        target="_blank"
        rel="noopener noreferrer"
        title="GitHub"
        aria-label="GitHub"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
      </a>
      <a href="https://x.com/kr8tivai" target="_blank" rel="noopener noreferrer" title="X" aria-label="X">
        <span aria-hidden="true">&#x1D54F;</span>
      </a>
    </div>
  )
}

export default function NavigationBar() {
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const wasOpen = useRef(false)

  const onHomeClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const next = new URL(event.currentTarget.href, window.location.href)
    const here = window.location.pathname.replace(/\/$/, '') || '/'
    const there = next.pathname.replace(/\/$/, '') || '/'
    setOpen(false)
    if (here !== there) return
    event.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  const onMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target
    if (!(target instanceof Element) || !target.closest('a')) return
    // Hide after the click's default action so tel/mailto/navigation still fire.
    window.setTimeout(() => setOpen(false), 0)
  }

  useEffect(() => {
    if (open) {
      wasOpen.current = true
      menuRef.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
      return
    }
    if (!wasOpen.current) return
    const toggle = toggleRef.current
    if (toggle && toggle.getClientRects().length) toggle.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setOpen(false)
    }
    const onClick = (event: globalThis.MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (headerRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [open])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <header ref={headerRef} id="top" className="site-header" data-site-header="">
      <a className="site-wordmark" href={HOME_HREF} aria-current="page" onClick={onHomeClick}>
        kr8tiv AI
      </a>

      <nav className="site-inline" aria-label="Pages">
        {PAGE_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
        <a className="site-phone" href={PHONE_HREF}>
          {PHONE_DISPLAY}
        </a>
        <SocialLinks />
      </nav>

      <div className="site-tools">
        <a className="site-audit" href={AUDIT_MAILTO}>
          Book audit
        </a>
        <button
          ref={toggleRef}
          type="button"
          className="site-toggle"
          data-nav-toggle=""
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label="Menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true" />
        </button>
      </div>

      <nav
        ref={menuRef}
        id="site-menu"
        className="site-menu"
        data-nav-menu=""
        aria-label="Menu"
        hidden={!open}
        onClick={onMenuClick}
      >
        <a href={HOME_HREF} aria-current="page" onClick={onHomeClick}>
          Home
        </a>
        {PAGE_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
        <a className="site-phone" href={PHONE_HREF}>
          {PHONE_DISPLAY}
        </a>
        <a className="site-mail" href={EMAIL_HREF}>
          {EMAIL_LABEL}
        </a>
        <SocialLinks />
      </nav>
    </header>
  )
}
