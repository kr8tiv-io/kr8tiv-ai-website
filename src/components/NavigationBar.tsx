import {
  AUDIT_MAILTO,
  PAGE_BLOG,
  PAGE_EVOLVE,
  PAGE_SERVICES,
  PHONE_DISPLAY,
  PHONE_HREF,
} from '../config/sections'

const PAGE_LINKS = [
  { label: 'Services', href: PAGE_SERVICES },
  { label: 'Case study', href: PAGE_EVOLVE },
  { label: 'Field Notes', href: PAGE_BLOG },
]

export default function NavigationBar() {
  return (
    <div className="fixed top-3 right-4 sm:top-4 sm:right-6 lg:right-8 z-50 flex items-center gap-2.5 sm:gap-4">
      {/* Static sub-pages, desktop only; mobile gets the same links in the footer */}
      <nav className="hidden lg:flex items-center gap-4" aria-label="Pages">
        {PAGE_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[10px] tracking-[0.18em] uppercase text-white/40 hover:text-white/85 transition-colors duration-300"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a
        href={PHONE_HREF}
        className="text-[10px] tracking-[0.15em] text-white/40 hover:text-white/80 font-mono transition-colors duration-300 hidden md:inline"
      >
        {PHONE_DISPLAY}
      </a>

      {/* Social icons. LinkedIn, GitHub, and Facebook are live (Matt, t2753u / t2754u). Short-form and messenger icons stay off. */}
      <div className="flex items-center gap-2 sm:gap-3">
        <a href="https://www.linkedin.com/company/kr8tivai" target="_blank" rel="noopener noreferrer"
           className="text-white/30 hover:text-white/80 transition-colors duration-300" title="LinkedIn">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <a href="https://github.com/kr8tiv-ai" target="_blank" rel="me noopener"
           className="text-white/30 hover:text-white/80 transition-colors duration-300" title="GitHub" aria-label="GitHub">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a href="https://www.facebook.com/people/Kr8tiv-AI/61588252989738/" target="_blank" rel="me noopener"
           className="text-white/30 hover:text-white/80 transition-colors duration-300" title="Facebook" aria-label="Facebook">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
      </div>

      <a
        href={AUDIT_MAILTO}
        className="px-3.5 py-1.5 border border-[#d4a853]/40 text-[10px] tracking-[0.18em] uppercase text-white/70 hover:text-white hover:border-[#d4a853] hover:bg-[#d4a853]/10 transition-all duration-300"
      >
        Book audit
      </a>
    </div>
  )
}
