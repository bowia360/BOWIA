# Design System — BOW Creator

> **Fonte da verdade:** extraído diretamente de `style.css` / `index.html` de
> `bowia.com.br` (arquivos reais, não estimados). Qualquer dúvida visual futura,
> reabrir esses arquivos antes de chutar valor.

## Por que este documento existe

Numa sessão anterior, tentamos recriar este design system a partir de uma única
screenshot e erramos a cor de acento (laranja em vez de azul) e a tipografia
(Archivo/JetBrains Mono em vez de Sora/Inter). Só depois de ler o CSS real é que
os tokens abaixo foram confirmados. **Nunca estimar tokens visuais por print
quando o código-fonte está disponível.**

## Tokens

```css
:root {
  /* superfícies */
  --bg-dark:        #06090F;
  --bg-alt:         #080C14;
  --bg-grid:        rgba(255,255,255,0.02);
  --glass-card:     rgba(15,22,36,0.55);
  --glass-solid:    rgba(13,19,31,0.92);
  --glass-border:   rgba(255,255,255,0.08);
  --glass-border-hi:rgba(255,255,255,0.16);

  /* marca */
  --neon-blue:    #0066FF;
  --neon-blue-lt: #3D8BFF;
  --neon-glow:    rgba(0,102,255,0.45);
  --green:        #36E27B;   /* status "disponível/ativo" */

  /* texto */
  --text-white: #FFFFFF;
  --text-off:   #E8EDF5;
  --text-muted: #8A99AD;
  --text-dim:   #5A6678;

  /* tipografia */
  --font-display: 'Sora', system-ui, sans-serif;   /* 700/800 em H1, 600 em badges/CTA */
  --font-body:    'Inter', system-ui, sans-serif;

  --radius:    18px;
  --radius-lg: 26px;
  --shadow-card: 0 20px 60px -20px rgba(0,0,0,.7);
  --shadow-glow: 0 0 0 1px rgba(0,102,255,.25), 0 18px 60px -12px var(--neon-glow);
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Componentes-assinatura (não são genéricos — copiar o padrão exato)

### Grid de fundo
Linhas verticais sutis (`background-image: linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)`),
`background-size: 64px 100%`, com `mask-image: linear-gradient(#000, transparent)`
pra esmaecer verticalmente. Nunca usar grid de pontos — é linear.

### `border-beam` (borda animada girando)
Não é um glow estático embaixo do botão — é uma borda em `conic-gradient` azul que
gira continuamente via `@property --beam-angle` + `@keyframes beamRotate { to { --beam-angle: 360deg } }`,
duração 5s linear infinite. Aplicado via pseudo-elemento com `mask-composite: exclude`
pra só a borda aparecer, não o miolo.

### Badge com ponto pulsante
Pill com `background: rgba(0,102,255,.12)`, `border: 1px solid rgba(0,102,255,.32)`,
contendo um `<span>` de 8px com `box-shadow` neon + animação `dotPing` (scale 1→3,
opacity 0.7→0) em `cubic-bezier(.16,1,.3,1)`, 2s infinite.

### Botão primário
`linear-gradient(180deg, #1f7bff, #0066FF)`, `box-shadow: 0 10px 30px -8px rgba(0,102,255,.45),
inset 0 1px 0 rgba(255,255,255,.25)`. Hover: `filter: brightness(1.08)`. Quando o
contexto pede destaque máximo (CTA principal), envolver com `border-beam`.

### Botão ghost/secundário
Transparente, `border: 1px solid rgba(255,255,255,.08)`. Hover: borda vira
`var(--neon-blue-lt)`. Sem glow, sem beam.

### Cards glass
`background: var(--glass-card)`, `border: 1px solid var(--glass-border)`,
`backdrop-filter: blur(20px)`, `border-radius: var(--radius)`.

### Texto com gradiente
Para palavras de destaque dentro de headlines: `background: linear-gradient(100deg, #fff 20%, #3D8BFF);
-webkit-background-clip: text; background-clip: text; color: transparent`.

## O que NÃO usar (erros já cometidos, não repetir)

- ❌ Laranja como cor de marca/ação — não existe no CSS real. Reservar laranja só se
  uma seção específica do site institucional (ainda não confirmada) realmente usar —
  não assumir.
- ❌ Archivo / JetBrains Mono — a tipografia real é Sora (display) + Inter (corpo)
- ❌ Glow estático "halo" embaixo de botão — o efeito real é a borda girando (`border-beam`)
- ❌ Glassmorphism genérico sem os valores exatos de blur/opacity acima

## Skill correspondente

Os tokens deste arquivo estão também empacotados em
`.claude/skills/bow-design-system/SKILL.md` para carregamento automático em
qualquer sessão de Claude Code que toque em frontend do Creator.
