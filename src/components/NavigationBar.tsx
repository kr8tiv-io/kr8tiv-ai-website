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

      {/* Social icons. LinkedIn is live. Short-form and messenger icons stay off. */}
      {/* TODO: add the KR8TIV AI Facebook icon once Matt provides the public Page URL. */}
      {/* Do not use the Kr8tiv studio Page. Do not add a GitHub icon in this row. */}
      <div className="flex items-center gap-2 sm:gap-3">
        <a href="https://www.linkedin.com/company/kr8tivai" target="_blank" rel="noopener noreferrer"
           className="text-white/30 hover:text-white/80 transition-colors duration-300" title="LinkedIn">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
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
