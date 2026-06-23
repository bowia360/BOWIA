import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue-lt opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue" />
            </span>
            <span className="text-xs font-sora font-semibold text-neon-blue-lt tracking-wide uppercase">
              Fase 0 — Fundação
            </span>
          </div>

          <h1 className="font-sora font-bold text-3xl text-white mb-2">
            Bem-vindo ao{' '}
            <span className="text-gradient">BOW Creator</span>
          </h1>
          <p className="text-text-muted">
            Sua plataforma de aprendizado e produção com IA.
            {user?.email && (
              <span className="text-text-dim"> Logado como {user.email}.</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Formações', desc: 'Trilhas de aprendizado com IA', phase: 'Fase 6' },
            { title: 'Galeria de Prompts', desc: 'Grid filtrável com prompts prontos', phase: 'Fase 1' },
            { title: 'Estúdio UGC', desc: 'Geração de imagem e vídeo com IA', phase: 'Fase 4' },
          ].map((item) => (
            <div key={item.title} className="glass-card rounded-bow p-5 opacity-50">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-sora font-semibold text-text-off">{item.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-dim font-sora shrink-0">
                  {item.phase}
                </span>
              </div>
              <p className="text-sm text-text-dim">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
