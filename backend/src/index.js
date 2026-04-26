import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

const app = express()
const PORT = 4000
const JWT_SECRET = 'pouplay-dev-secret-2026'
const WEBHOOK_SECRET = 'pouplay-webhook-secret-2026'

app.use(cors({
  origin: [
    'http://localhost:3000',
    /\.ngrok-free\.(app|dev)$/,
    /\.loca\.lt$/,
  ]
}))
app.use(express.json())

// ── Dados fictícios ──────────────────────────────────────────────────────────

const USERS = [
  { id: 'u1', name: 'João Silva',   email: 'joao.silva@email.com',  password: '123456', role: 'responsavel' },
  { id: 'u2', name: 'Mateus Gamer', email: 'mateus.gamer@email.com', password: '123456', role: 'menor', linkedTo: 'u1' },
]

// URLs de destino de cada instituição parceira (preenchidas no contrato comercial)
const INSTITUTION_URLS = {
  'Banco Digital Plus': 'https://www.bancodigitalplus.com.br/investimentos/cdb-premium',
  'Corretora Investe+':  'https://www.corretoraeinveste.com.br/produtos/tesouro-direto',
  'BancoFlex':           'https://www.bancoflex.com.br/investimentos/lca-agronegocio',
  'XFinance':            'https://www.xfinance.com.br/produtos/cdb-flex',
  'SafeBank':            'https://www.safebank.com.br/conta/poupanca-plus',
  'Broker360':           'https://www.broker360.com.br/fundos/fundo-di-master',
}

// ── Armazenamento em memória ─────────────────────────────────────────────────

const referrals = []       // cliques em produtos financeiros
const gamePurchases = []   // compras de moedas de jogos

// ── Autenticação ─────────────────────────────────────────────────────────────

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET)
      return next()
    } catch { /* token inválido, tenta fallback */ }
  }
  // Fallback de desenvolvimento: aceita userId do corpo da requisição
  const userId = req.body?.userId ?? req.query?.userId
  if (userId) {
    req.user = { id: userId }
    return next()
  }
  res.status(401).json({ error: 'Token ausente' })
}

// ── Distribuidor de jogos (mock da API Razer Gold / UniPin) ──────────────────

async function callDistributorAPI(gameId, { coins, coinName }) {
  // Simula latência real de uma API de distribuidor (~1.5s)
  await new Promise(r => setTimeout(r, 1500))

  const txId = `DIST-${randomBytes(5).toString('hex').toUpperCase()}`

  // Roblox e Minecraft usam códigos resgatáveis; Free Fire e Fortnite creditam direto na conta
  const usesCode = gameId === 'roblox' || gameId === 'minecraft'
  const code = usesCode
    ? [randomBytes(4), randomBytes(4), randomBytes(4)]
        .map(b => b.toString('hex').toUpperCase())
        .join('-')
    : null

  return {
    success: true,
    transactionId: txId,
    deliveryMethod: usesCode ? 'code' : 'account_credit',
    code,
    deliveryMessage: usesCode
      ? `Use o código abaixo para resgatar ${coins} ${coinName} na loja oficial do jogo.`
      : `${coins} ${coinName} foram creditados diretamente na sua conta do jogo.`,
  }
}

// ── Rotas: Autenticação ───────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const user = USERS.find(u => u.email === email && u.password === password)
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

// ── Rotas: Referral / Produtos Financeiros ────────────────────────────────────

// Registra clique e gera URL rastreável
app.post('/api/referral/register', auth, (req, res) => {
  const { productId, productName, institution, cashbackPoins } = req.body
  const userId = req.user.id

  const payload = `${userId}|${productId}|${Date.now()}`
  const referralCode = Buffer.from(payload).toString('base64url')

  const baseUrl = INSTITUTION_URLS[institution] ?? 'https://parceiro.pouplay.com.br'
  const referralUrl = `${baseUrl}?utm_source=pouplay&utm_medium=parceiro&utm_campaign=cashback&ref=${referralCode}`

  const referral = {
    id: `ref_${randomBytes(4).toString('hex')}`,
    userId,
    productId,
    productName,
    institution,
    cashbackPoins,
    referralCode,
    referralUrl,
    status: 'clicked',          // clicked → cashback_pending → cashback_received
    clickedAt: new Date().toISOString(),
    cashbackReceivedAt: null,
  }

  referrals.push(referral)
  console.log(`📎 Referral registrado: ${institution} → usuário ${userId}`)
  res.json(referral)
})

// Lista referrals do usuário autenticado
app.get('/api/referral/list', auth, (req, res) => {
  res.json(referrals.filter(r => r.userId === req.user.id))
})

// DEMO: simula o banco enviando a confirmação de cashback
app.post('/api/referral/simulate-cashback/:code', auth, (req, res) => {
  const ref = referrals.find(r => r.referralCode === req.params.code && r.userId === req.user.id)
  if (!ref) return res.status(404).json({ error: 'Referral não encontrado' })
  if (ref.status === 'cashback_received') return res.status(400).json({ error: 'Cashback já recebido' })

  ref.status = 'cashback_received'
  ref.cashbackReceivedAt = new Date().toISOString()

  console.log(`💰 [DEMO] Cashback simulado: P$ ${ref.cashbackPoins} para usuário ${ref.userId}`)
  res.json({ success: true, cashbackPoins: ref.cashbackPoins, referral: ref })
})

// PRODUÇÃO: webhook real que o banco/corretora chama após confirmar o investimento
// Header obrigatório: x-pouplay-signature: <WEBHOOK_SECRET>
app.post('/api/webhook/investment-confirm', (req, res) => {
  const sig = req.headers['x-pouplay-signature']
  if (sig !== WEBHOOK_SECRET) {
    console.warn('⚠️  Webhook recebido com assinatura inválida')
    return res.status(401).json({ error: 'Assinatura inválida' })
  }

  const { referralCode, investedAmount, cashbackAmount } = req.body
  const ref = referrals.find(r => r.referralCode === referralCode)
  if (!ref) return res.status(404).json({ error: 'Referral não encontrado' })

  ref.status = 'cashback_received'
  ref.investedAmount = investedAmount
  ref.cashbackPoins = cashbackAmount
  ref.cashbackReceivedAt = new Date().toISOString()

  console.log(`💰 [WEBHOOK] Cashback recebido de ${ref.institution}: P$ ${cashbackAmount} → usuário ${ref.userId}`)
  res.json({ success: true })
})

// ── Rotas: Compra de moedas de jogos ─────────────────────────────────────────

app.post('/api/games/purchase', auth, async (req, res) => {
  const { gameId, gameName, packageId, coins, coinName, pricePoins } = req.body
  const userId = req.user.id

  const fee = parseFloat((pricePoins * 0.05).toFixed(2))
  const total = parseFloat((pricePoins + fee).toFixed(2))

  try {
    const result = await callDistributorAPI(gameId, { coins, coinName })

    if (!result.success) {
      return res.status(502).json({ error: 'Distribuidor indisponível. Tente novamente.' })
    }

    const purchase = {
      id: `gp_${randomBytes(4).toString('hex')}`,
      userId,
      gameId,
      gameName,
      packageId,
      coins,
      coinName,
      pricePoins,
      fee,
      total,
      transactionId: result.transactionId,
      deliveryMethod: result.deliveryMethod,
      code: result.code,
      deliveryMessage: result.deliveryMessage,
      status: 'delivered',
      purchasedAt: new Date().toISOString(),
    }

    gamePurchases.push(purchase)
    console.log(`🎮 Compra processada: ${coins} ${coinName} de ${gameName} → usuário ${userId} (${result.transactionId})`)
    res.json(purchase)

  } catch (err) {
    console.error('Erro no distribuidor:', err)
    res.status(500).json({ error: 'Erro interno ao processar compra' })
  }
})

// Histórico de compras do usuário
app.get('/api/games/purchases', auth, (req, res) => {
  res.json(gamePurchases.filter(p => p.userId === req.user.id))
})

// ── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  app: 'Pouplay API v2',
  stats: { referrals: referrals.length, gamePurchases: gamePurchases.length },
  webhookUrl: `POST /api/webhook/investment-confirm  (header: x-pouplay-signature)`,
}))

app.listen(PORT, () => {
  console.log(`\n🟣 Pouplay API rodando em http://localhost:${PORT}`)
  console.log(`📡 Webhook bancário: POST http://localhost:${PORT}/api/webhook/investment-confirm`)
  console.log(`🔑 Webhook secret: ${WEBHOOK_SECRET}\n`)
})
