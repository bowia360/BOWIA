import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (!process.env.UGC_WEBHOOK_SECRET || secret !== process.env.UGC_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const generationId: string | undefined = body?.generation_id
  const outputUrl: string | undefined = body?.output_url
  const errorMessage: string | undefined = body?.error_message

  if (!generationId) {
    return NextResponse.json({ error: 'generation_id obrigatório' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Valida que a generation existe antes de atualizar
  const { data: existing } = await admin
    .from('generations')
    .select('id')
    .eq('id', generationId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'generation não encontrada' }, { status: 404 })
  }

  const update = outputUrl
    ? { status: 'done', output_url: outputUrl, error_message: null, updated_at: new Date().toISOString() }
    : { status: 'failed', error_message: errorMessage ?? 'Erro desconhecido', updated_at: new Date().toISOString() }

  const { error } = await admin.from('generations').update(update).eq('id', generationId)

  if (error) {
    console.error('[fal-callback] update error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar geração' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
