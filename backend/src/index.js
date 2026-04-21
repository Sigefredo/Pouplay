import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = 4000
const JWT_SECRET = 'pouplay-dev-secret-2026'

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

// ── Dados fictícios ─────────────────────────────────────────────────────────

const USERS = [
  { id: 'u1', name: 'João Silva',  email: 'joao.silva@email.com',  password: '123456', role: 'responsavel' },
  { id: 'u2', name: 'Lucas Silva', email: 'lucas.silva@email.com', password: '123456', role: 'menor', linkedTo: 'u1' },
]

const PRODUCTS = [
  { id: 'fp1', institution: 'Banco Digital Plus', type: 'CDB', name: 'CDB Premium 120% CDI', rate: '120% CDI', minValue: 1000, cashbackPoins: 50 },
  { id: 'fp2', institution: 'Corretora Investe+', type: 'Tesouro Direto', name: 'Tesouro Selic 2029', rate: '100% Selic', minValue: 100, cashbackPoins: 15 },
  { id: 'fp3', institution: 'BancoFlex', type: 'LCA', name: 'LCA Agronegócio 95% CDI', rate: '95% CDI', minValue: 500, cashbackPoins: 30 },
]

const GAMES = [
  { id: 'freefire', name: 'Free Fire', company: 'Garena' },
  { id: 'roblox',   name: 'Roblox',    company: 'Roblox Corporation' },
  { id: 'fortnite', name: 'Fortnite',  company: 'Epic Games' },
]

// ── Middleware de autenticação ───────────────────────────────────────────────

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token ausente' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

// ── Rotas ────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const user = USERS.find(u => u.email === email && u.password === password)
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

app.get('/api/products', auth, (_req, res) => res.json(PRODUCTS))
app.get('/api/games',    auth, (_req, res) => res.json(GAMES))

app.get('/api/wallet', auth, (req, res) => {
  res.json({ balance: 1250.08, userId: req.user.id })
})

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'Pouplay API' }))

app.listen(PORT, () => {
  console.log(`🟣 Pouplay API rodando em http://localhost:${PORT}`)
})
