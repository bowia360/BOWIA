'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/(auth)/actions'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/galeria',
    label: 'Galeria de Prompts',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    href: '/favoritos',
    label: 'Meus Favoritos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
]

export default function NavRail() {
  const pathname = usePathname()

  return (
    <aside className="w-16 flex flex-col items-center py-5 border-r border-[rgba(255,255,255,0.06)] bg-[rgba(13,19,31,0.92)] shrink-0">
      <Link
        href="/dashboard"
        className="mb-8 w-9 h-9 rounded-bow-sm flex items-center justify-center bg-neon-blue/10 border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors"
      >
        <span className="font-sora font-bold text-sm text-neon-blue">B</span>
      </Link>

      <nav className="flex-1 flex flex-col gap-1 w-full px-2">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`w-full h-10 flex items-center justify-center rounded-[10px] transition-colors ${
                isActive
                  ? 'bg-neon-blue/15 text-neon-blue-lt'
                  : 'text-text-muted hover:text-text-off hover:bg-white/5'
              }`}
            >
              {icon}
            </Link>
          )
        })}
      </nav>

      <form action={logout} className="px-2 w-full">
        <button
          type="submit"
          title="Sair"
          className="w-full h-10 flex items-center justify-center rounded-[10px] text-text-dim hover:text-text-muted transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </form>
    </aside>
  )
}
