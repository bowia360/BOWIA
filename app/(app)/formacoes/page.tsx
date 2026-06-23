import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CoverImage } from './CoverImage'

type Formation = {
  id: string
  title: string
  slug: string
  description: string | null
  cover_url: string | null
}

export default async function FormacoesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: formations } = await supabase
    .from('formations')
    .select('id, title, slug, description, cover_url')
    .eq('is_published', true)
    .order('order_index')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-sora font-bold text-2xl text-white mb-1">Formações</h1>
        <p className="text-sm text-text-muted">
          Trilhas de aprendizado para você dominar IA aplicada.
        </p>
      </div>

      {!formations || formations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mb-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3D8BFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <p className="font-sora font-semibold text-text-off mb-1">Em breve</p>
          <p className="text-sm text-text-dim">
            As formações estão sendo preparadas. Volte em breve.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(formations as Formation[]).map((f) => (
            <Link
              key={f.id}
              href={`/formacoes/${f.slug}`}
              className="glass-card overflow-hidden hover:border-[rgba(255,255,255,0.12)] transition-colors group"
            >
              <div className="h-40 relative overflow-hidden bg-gradient-to-br from-neon-blue/20 to-[rgba(0,102,255,0.04)]">
                <div className="absolute inset-0 bg-grid opacity-40" />
                {f.cover_url && (
                  <CoverImage
                    src={f.cover_url}
                    alt={f.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                  />
                )}
              </div>
              <div className="p-5">
                <h2 className="font-sora font-semibold text-base text-text-off group-hover:text-white transition-colors mb-1.5 leading-snug">
                  {f.title}
                </h2>
                {f.description && (
                  <p className="text-sm text-text-dim line-clamp-2">{f.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
