import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const SYSTEM_PROMPT = `Você é um especialista em prompt engineering para geração de imagem e vídeo com IA (modelos como Stable Diffusion, Flux, Veo3, Sora).

Sua tarefa: transformar a descrição casual do usuário em um prompt visual estruturado, detalhado e pronto para uso em ferramentas de geração de imagem/vídeo.

Regras:
- Responda APENAS com o prompt final, em inglês. Nenhuma explicação, nenhum prefácio, nenhum comentário.
- O prompt deve ser descritivo, específico e rico em detalhes visuais: iluminação, composição, profundidade de campo, paleta de cores, estética, textura, câmera/lente quando relevante.
- Siga o estilo: "hyper-realistic editorial portrait, soft golden hour lighting, shallow depth of field, 85mm lens look, fashion magazine aesthetic" — detalhado, cinematográfico, concreto.
- Quando for UGC (conteúdo gerado por usuário), preserve a autenticidade: "candid, handheld feel, natural lighting, looks like a real customer photo".
- Não invente produtos ou pessoas — se o usuário não especificou detalhes, use placeholders descritivos genéricos (ex: "the product", "the model").
- Comprimento ideal: 2–5 frases densas ou uma lista de atributos separados por vírgula. Nunca menos de 30 palavras.`

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const description: string = body?.description?.trim() ?? ''

  if (!description) {
    return NextResponse.json({ error: 'Descrição não pode ser vazia' }, { status: 400 })
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: description }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('[gerar-prompt] Anthropic error:', err)
    return NextResponse.json({ error: 'Erro ao chamar a API de IA' }, { status: 502 })
  }

  const data = await response.json()
  const prompt: string = data?.content?.[0]?.text ?? ''

  return NextResponse.json({ prompt })
}
