import Link from 'next/link'
import { signup } from '../actions'

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen bg-bg-dark flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-sora font-bold text-2xl text-white">
            BOW <span className="text-neon-blue">Creator</span>
          </span>
        </div>

        <div className="glass-card rounded-bow p-8">
          <h1 className="font-sora font-bold text-2xl text-white mb-1">
            Criar conta
          </h1>
          <p className="text-text-muted text-sm mb-8">
            Já tem conta?{' '}
            <Link
              href="/entrar"
              className="text-neon-blue-lt hover:text-neon-blue transition-colors"
            >
              Entrar
            </Link>
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-bow-sm bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form action={signup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-off mb-1.5">
                Nome completo
              </label>
              <input
                type="text"
                name="full_name"
                required
                autoComplete="name"
                placeholder="Rafael Gullo"
                className="w-full px-4 py-3 bg-bg-alt border border-[rgba(255,255,255,0.08)] rounded-bow-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-off mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-bg-alt border border-[rgba(255,255,255,0.08)] rounded-bow-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-off mb-1.5">
                Senha
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="new-password"
                placeholder="mínimo 6 caracteres"
                minLength={6}
                className="w-full px-4 py-3 bg-bg-alt border border-[rgba(255,255,255,0.08)] rounded-bow-sm text-text-off placeholder-text-dim focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-colors"
              />
            </div>

            <div className="pt-1">
              <div className="relative">
                <button
                  type="submit"
                  className="btn-primary w-full py-3 px-6 rounded-bow-sm font-sora font-semibold text-white text-sm"
                >
                  Criar conta grátis
                </button>
                <span className="border-beam" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
