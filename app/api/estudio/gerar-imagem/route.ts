import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const prompt: string = body?.prompt?.trim() ?? ''
  const inputImageUrl: string | null = body?.input_image_url?.trim() || null

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt não pode ser vazio' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: generation, error: insertError } = await admin
    .from('generations')
    .insert({
      profile_id: user.id,
      course_id: null,
      type: 'image',
      status: 'queued',
      provider: 'fal.ai',
      input_prompt: prompt,
      input_image_url: inputImageUrl,
    })
    .select('id')
    .single()

  if (insertError || !generation) {
    console.error('[gerar-imagem] insert error:', insertError)
    return NextResponse.json({ error: 'Erro ao criar geração' }, { status: 500 })
  }

  const generationId = generation.id

  if (process.env.UGC_MOCK_MODE === 'true') {
    // Mock: atualiza para done em background após 3s (dev only)
    void (async () => {
      await new Promise((r) => setTimeout(r, 3000))
      await admin
        .from('generations')
        .update({
          status: 'done',
          output_url: `https://picsum.photos/seed/${generationId}/800/600`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', generationId)
    })()
  } else {
    const webhookUrl = `${process.env.N8N_WEBHOOK_BASE_URL}/ugc-image-start`
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          generation_id: generationId,
          profile_id: user.id,
          prompt,
          input_image_url: inputImageUrl,
        }),
      })
    } catch (err) {
      console.error('[gerar-imagem] n8n webhook error:', err)
      // Não falha o request — generation já está em 'queued', n8n pode ser retentado
    }
  }

  return NextResponse.json({ generation_id: generationId })
}
