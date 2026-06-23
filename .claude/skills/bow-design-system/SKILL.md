---
name: bow-design-system
description: Use this skill whenever building, styling, or reviewing ANY frontend component, page, or visual element for the BOW IA Studio project (or the bowia.com.br institutional site). Triggers on requests involving UI components, pages, colors, typography, buttons, cards, badges, or any visual/CSS work in this codebase. This skill is the single source of truth for visual tokens — always check it before guessing a color, font, or effect, and before reaching for generic glassmorphism/gradient defaults.
---

# BOW Design System

## Priority

This skill takes priority over generic frontend-design defaults (Inter font,
purple gradients, generic glassmorphism) for anything in the BOWIA repository.
Tokens here were extracted directly from the real `style.css` of `bowia.com.br` —
never estimated from a screenshot. If a token is needed that isn't covered here,
extrapolate in the spirit of these tokens, don't fall back to generic AI-slop defaults.

## Core tokens

```css
:root {
  --bg-dark:        #06090F;
  --bg-alt:         #080C14;
  --glass-card:     rgba(15,22,36,0.55);
  --glass-solid:    rgba(13,19,31,0.92);
  --glass-border:   rgba(255,255,255,0.08);
  --glass-border-hi:rgba(255,255,255,0.16);

  --neon-blue:    #0066FF;
  --neon-blue-lt: #3D8BFF;
  --neon-glow:    rgba(0,102,255,0.45);
  --green:        #36E27B;

  --text-white: #FFFFFF;
  --text-off:   #E8EDF5;
  --text-muted: #8A99AD;
  --text-dim:   #5A6678;

  --font-display: 'Sora', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;

  --radius:    18px;
  --radius-lg: 26px;
  --shadow-card: 0 20px 60px -20px rgba(0,0,0,.7);
  --shadow-glow: 0 0 0 1px rgba(0,102,255,.25), 0 18px 60px -12px var(--neon-glow);
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Hard rules — never violate

1. **No orange/laranja as brand color.** The blue neon (`#0066FF`) is the only
   accent. If a reference image shows orange, treat it as a different page/section
   not yet confirmed — ask before applying, don't assume.
2. **Sora + Inter only.** Never Archivo, never JetBrains Mono, never default
   system fonts for display text.
3. **The signature button effect is a rotating conic-gradient border (`border-beam`),
   not a static glow underneath.** See implementation below — get this exact.
4. **Background grid is vertical lines, not dots.** `linear-gradient(90deg, ...)`,
   not radial dot patterns.
5. **Glass cards use `backdrop-filter: blur(20px)`** with the exact opacity values
   above — not arbitrary blur/opacity guesses.

## Signature components (copy the exact pattern)

### Rotating border-beam
```css
@property --beam-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
@keyframes beamRotate { to { --beam-angle: 360deg; } }

.border-beam {
  position: absolute; inset: 0; border-radius: inherit; padding: 1.6px;
  background: conic-gradient(from var(--beam-angle), transparent 0 70%,
    #0066FF 84%, #9fc4ff 92%, transparent 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  animation: beamRotate 5s linear infinite;
  pointer-events: none;
}
```
Use only on the single highest-priority CTA on a screen — it loses impact if
overused.

### Pulsing dot badge
```css
@keyframes dotPing { 0%{transform:scale(1);opacity:.7} 70%,100%{transform:scale(3);opacity:0} }

.badge-dot {
  position: relative; width: 8px; height: 8px; border-radius: 50%;
  background: #3D8BFF; box-shadow: 0 0 8px rgba(0,102,255,.45);
}
.badge-dot::after {
  content: ''; position: absolute; inset: 0; border-radius: 50%;
  background: #3D8BFF; animation: dotPing 2s cubic-bezier(.16,1,.3,1) infinite;
}
```

### Background grid with fade mask
```css
.bg-grid {
  background-image: linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
  background-size: 64px 100%;
  -webkit-mask-image: linear-gradient(#000, transparent);
  mask-image: linear-gradient(#000, transparent);
}
```

### Primary button
```css
.btn-primary {
  background: linear-gradient(180deg, #1f7bff, #0066FF);
  box-shadow: 0 10px 30px -8px rgba(0,102,255,.45), inset 0 1px 0 rgba(255,255,255,.25);
  border-radius: 11px; color: #fff; font-family: 'Sora', sans-serif; font-weight: 600;
}
.btn-primary:hover { filter: brightness(1.08); }
```

### Gradient text accent
```css
.text-accent {
  background: linear-gradient(100deg, #fff 20%, #3D8BFF);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
```

## When extending to new screens not covered here

The Estúdio UGC, Galeria de Prompts, and Trilhas screens don't exist yet in the
original site. When building them: keep the same surface/glass/blue-neon palette
and Sora/Inter typography, but feel free to use `--green` (#36E27B) as a secondary
accent for "active/available" states (e.g. a generation that's ready), following
the same pattern as the badge/border-beam components above — don't invent a new
color family.

## Full reference

See `/docs/DESIGN-SYSTEM.md` in the repository root for the complete token list
and the "what NOT to use" section documenting past mistakes.
