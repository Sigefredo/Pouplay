// Serviço de consulta de CPF no SERPRO (Governo Federal)
// Em produção: requer proxy backend para proteger credenciais OAuth 2.0
// Documentação: https://developers.serpro.gov.br/api/consulta-cpf

export interface SerproCpfData {
  ni: string          // CPF (sem pontuação)
  nome: string        // Nome completo registrado
  situacao: { codigo: string; descricao: string }
  nascimento: string  // Formato DD/MM/YYYY
}

// Base mock para ambiente de demonstração
// Em produção, esta função faz POST de token + GET no endpoint SERPRO
const MOCK_DB: Record<string, SerproCpfData> = {
  '98765432100': { ni: '98765432100', nome: 'MATEUS GAMER',    situacao: { codigo: '0', descricao: 'Regular' }, nascimento: '22/07/2010' },
  '11122233344': { ni: '11122233344', nome: 'LUA SILVA',        situacao: { codigo: '0', descricao: 'Regular' }, nascimento: '10/04/2013' },
  '55566677788': { ni: '55566677788', nome: 'CARLOS MOREIRA',  situacao: { codigo: '0', descricao: 'Regular' }, nascimento: '20/08/1985' },
  '12345678900': { ni: '12345678900', nome: 'JOÃO SILVA',       situacao: { codigo: '0', descricao: 'Regular' }, nascimento: '15/03/1986' },
}

function stripCpf(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

function luhnCpfValid(cpf: string): boolean {
  const d = stripCpf(cpf)
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(d[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(d[10])
}

export type ConsultaResult =
  | { ok: true;  data: SerproCpfData }
  | { ok: false; error: string }

export async function consultarCPF(cpf: string): Promise<ConsultaResult> {
  // Simula latência de rede
  await new Promise(r => setTimeout(r, 1400))

  const d = stripCpf(cpf)

  if (d.length !== 11) return { ok: false, error: 'CPF deve ter 11 dígitos.' }
  if (!luhnCpfValid(d))  return { ok: false, error: 'CPF inválido (dígito verificador incorreto).' }

  const data = MOCK_DB[d]
  if (!data) return { ok: false, error: 'CPF não localizado na base do SERPRO.' }
  if (data.situacao.codigo !== '0') return { ok: false, error: `Situação irregular no SERPRO: ${data.situacao.descricao}.` }

  return { ok: true, data }
}

// Converte DD/MM/YYYY → YYYY-MM-DD (formato input[type=date])
export function serpro2isoDate(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split('/')
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

// Capitaliza nome vindo do SERPRO (maiúsculas) → "João Silva"
export function capitalizeName(name: string): string {
  const stops = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])
  return name.toLowerCase().split(' ').map((w, i) =>
    i === 0 || !stops.has(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w
  ).join(' ')
}
