'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin/prompts', label: 'Prompts' },
  { href: '/admin/formacoes', label: 'Formações' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="w-48 shrink-0 flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[rgba(13,19,31,0.92)]">
      <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
        <span className="inline-block text-xs font-sora font-semibold text-neon-blue-lt px-2 py-0.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 mb-3">
          ADMIN
        </span>
        <div className="font-sora font-bold text-white text-sm">BOW Creator</div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-[10px] text-sm font-inter transition-colors ${
                isActive
                  ? 'bg-neon-blue/15 text-neon-blue-lt font-medium'
                  : 'text-text-muted hover:text-text-off hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-text-dim hover:text-text-muted transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Voltar ao app
        </Link>
      </div>
    </aside>
  )
}
