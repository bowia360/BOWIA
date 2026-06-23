-- ============================================================
-- SEED — Prompts de exemplo para a Galeria (Fase 1)
-- Rodar no SQL Editor do projeto studiobowia, DEPOIS do schema principal.
-- São placeholders para testar a estrutura (filtro, modal, favoritar).
-- Trocar por prompts reais quando o Rafael organizar o conteúdo definitivo.
-- ============================================================

insert into public.prompts (title, category, prompt_text, preview_url, is_published) values

('Retrato Editorial Masculino', 'retrato',
'Use this reference image and create a hyper-realistic, close-up portrait of a charismatic male model in a moody, editorial setting. His face is lit with sharp, contrasting beams of amber and icy blue light, highlighting the symmetry of his jawline and subtle beard texture. Cinematic color grading, shallow depth of field, 85mm lens look.',
null, true),

('Retrato Editorial Feminino', 'retrato',
'Use this reference image and create a hyper-realistic editorial portrait of a confident female model against a warm sunset backdrop, soft golden hour lighting wrapping around her face, subtle film grain, fashion magazine cover aesthetic.',
null, true),

('Produto em Cenário Urbano Noturno', 'produto',
'Place the product on reflective wet asphalt at night, neon signs blurred in the background (cyberpunk Tokyo style), dramatic rim lighting on the product edges, shallow depth of field, high contrast.',
null, true),

('UGC Selfie Estilo Autêntico', 'ugc',
'Create a realistic selfie-style photo, slightly imperfect framing, natural indoor lighting, holding the product casually, candid expression, looks like a real customer photo, not a studio shot.',
null, true),

('Cenário Praia Editorial', 'lifestyle',
'Model standing near the ocean during golden hour, flowing fabric caught by the wind, warm rim light from the setting sun, cinematic wide shot, travel editorial style.',
null, true),

('Still de Produto Minimalista', 'produto',
'Clean minimalist product shot on a seamless pastel background, soft studio lighting, subtle shadow beneath the product, e-commerce ready, centered composition.',
null, true),

('Retrato Estilo Cyberpunk', 'criativo',
'Portrait with neon blue and magenta lighting, futuristic cyberpunk aesthetic, subtle holographic reflections, moody atmosphere, inspired by Blade Runner color palette.',
null, true),

('Vídeo UGC Unboxing Casual', 'ugc',
'A person casually unboxing the product at a kitchen table, natural daylight from a window, handheld camera feel, authentic and unscripted energy, vertical video format.',
null, true);
