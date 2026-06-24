// Usa @next/env (com dotenv-expand) — mesma lógica do servidor Next.js
import pkg from '@next/env'
const { loadEnvConfig } = pkg

loadEnvConfig(process.cwd(), true /* isDev */)

const key = process.env.ASAAS_API_KEY ?? ''
const url = process.env.ASAAS_API_URL ?? ''
const token = process.env.ASAAS_WEBHOOK_TOKEN ?? ''

console.log('\n=== Verificação de variáveis Asaas (via @next/env + dotenv-expand) ===\n')

if (!key) {
  console.error('ASAAS_API_KEY: VAZIA ou ausente — expansão de $ provavelmente ainda ativa')
} else {
  console.log(`ASAAS_API_KEY    : presente | length=${key.length} | começa com: ${key.slice(0, 5)}...`)
}

console.log(`ASAAS_API_URL    : ${url || '(ausente)'}`)
console.log(`ASAAS_WEBHOOK_TOKEN: presente? ${!!token} | length=${token.length}`)
console.log()
