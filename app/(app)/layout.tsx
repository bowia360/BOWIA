import NavRail from './NavRail'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-bg-dark overflow-hidden">
      <NavRail />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
