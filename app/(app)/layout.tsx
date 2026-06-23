import { logout } from '@/app/(auth)/actions'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-bg-dark overflow-hidden">
      <aside className="w-16 flex flex-col items-center py-5 border-r border-[rgba(255,255,255,0.06)] bg-[rgba(13,19,31,0.92)] shrink-0">
        {/* Logo mark */}
        <div className="mb-8 w-9 h-9 rounded-bow-sm flex items-center justify-center bg-neon-blue/10 border border-neon-blue/20">
          <span className="font-sora font-bold text-sm text-neon-blue">B</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1 w-full px-2">
          <a
            href="/dashboard"
            className="w-full h-10 flex items-center justify-center rounded-[10px] text-text-muted hover:text-text-off hover:bg-white/5 transition-colors"
            title="Dashboard"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </a>
        </nav>

        {/* Logout */}
        <form action={logout} className="px-2 w-full">
          <button
            type="submit"
            className="w-full h-10 flex items-center justify-center rounded-[10px] text-text-dim hover:text-text-muted transition-colors"
            title="Sair"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </form>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
