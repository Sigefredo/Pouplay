import { useState, useRef } from 'react'
import {
  ShoppingCart, X, CheckCircle, AlertCircle, Copy, Check, Loader2,
  BookOpen, Camera, Lock, RefreshCw, Bell, Clock, Package, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { GAMES, GAME_COMPANIES, GAME_PRICE_RANGES, GAME_CATEGORIES, WISH_LIST_GAMES, type GamePackage, type Game } from '../data/games'
import { PoinsDisplay } from '../components/PoinsDisplay'
import { useWalletStore } from '../store/walletStore'
import { useAuthStore } from '../store/authStore'
import { useImageStore } from '../store/imageStore'
import { useOrderStore, type GameOrder } from '../store/orderStore'

interface ConfirmState { game: Game; pkg: GamePackage }
interface DeliveryState {
  game: Game
  pkg: GamePackage
  transactionId: string
  deliveryMethod: 'code' | 'account_credit'
  code: string | null
  deliveryMessage: string
  orderId?: string
  gameUid?: string
}

function getUidLabel(gameId: string): { label: string; hint: string } {
  if (gameId === 'freefire') return {
    label: 'UID Free Fire',
    hint: 'Abra o jogo → Configurações → Básico → UID',
  }
  if (gameId === 'fortnite') return {
    label: 'Nome de usuário Epic',
    hint: 'Seu nome de exibição na conta Epic Games',
  }
  return { label: 'ID do jogo', hint: 'Seu identificador único no jogo' }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

// ── My Orders item ────────────────────────────────────────────────────────────

function OrderItem({ order }: { order: GameOrder }) {
  const [codeCopied, setCodeCopied] = useState(false)

  const statusMap = {
    pending:   { label: 'Processando', cls: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40' },
    delivered: { label: 'Entregue',    cls: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40' },
    failed:    { label: 'Falha',       cls: 'bg-red-900/40 text-red-400 border-red-700/40' },
  }
  const s = statusMap[order.status]

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    })
  }

  return (
    <div className="bg-dark-700/60 rounded-xl p-3 border border-dark-500/50">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-white font-semibold">{order.packageLabel}</p>
            <span className="text-xs text-gray-500">· {order.gameName}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">{order.id} · {fmtDate(order.createdAt)}</p>
          {order.gameUid && (
            <p className="text-xs text-gray-400 mt-0.5">ID: <span className="font-mono">{order.gameUid}</span></p>
          )}
        </div>
        <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0', s.cls)}>
          {s.label}
        </span>
      </div>

      {order.status === 'delivered' && order.deliveryMethod === 'code' && order.code && (
        <div className="mt-2 pt-2 border-t border-dark-500">
          <p className="text-xs text-gray-400 mb-1.5">Código de resgate</p>
          <div className="flex items-center gap-2 bg-dark-800 border border-brand-700/40 rounded-lg px-3 py-2">
            <span className="flex-1 font-mono text-brand-300 font-bold tracking-widest text-sm">{order.code}</span>
            <button
              onClick={() => copyCode(order.code!)}
              className="text-gray-400 hover:text-brand-400 transition-colors"
            >
              {codeCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
          {order.redeemUrl && (
            <p className="text-xs text-gray-500 mt-1">
              Resgate em: <strong className="text-gray-400">{order.redeemUrl}</strong>
            </p>
          )}
        </div>
      )}

      {order.status === 'delivered' && order.deliveryMethod === 'account_credit' && (
        <p className="text-xs text-emerald-400 mt-2 pt-2 border-t border-dark-500">
          ✓ Crédito efetuado na conta {order.gameUid ? `(${order.gameUid})` : ''}
        </p>
      )}

      {order.status === 'pending' && (
        <p className="text-xs text-yellow-400/80 mt-2 pt-2 border-t border-dark-500">
          ⏱ Entrega em até 2 horas úteis — aguarde o código aparecer aqui
        </p>
      )}

      {order.status === 'failed' && (
        <p className="text-xs text-red-400 mt-2 pt-2 border-t border-dark-500">
          ✕ Falha na entrega — Poins estornados ao saldo
        </p>
      )}
    </div>
  )
}

// ── Game Logo ─────────────────────────────────────────────────────────────────

function GameLogo({ game }: { game: Game }) {
  const { images, setImage } = useImageStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const img = images[game.id]

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      if (ev.target?.result) setImage(game.id, ev.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      className="relative w-12 h-12 flex-shrink-0 group/logo cursor-pointer"
      onClick={() => fileRef.current?.click()}
      title="Clique para adicionar foto"
    >
      {img ? (
        <img src={img} alt={game.name} className="w-12 h-12 rounded-xl object-cover" />
      ) : (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: game.color + '22', border: `1px solid ${game.color}44` }}
        >
          <span style={{ color: game.color }} className="font-extrabold">{game.logo}</span>
        </div>
      )}
      <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
        <Camera size={14} className="text-white" />
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Games() {
  const { balance, transactions, purchasePackage, releaseAllBlockedPoins } = useWalletStore()
  const blockedPoins = transactions
    .filter(t => t.type === 'poins' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0)
  const { user } = useAuthStore()
  const isChild = user?.role === 'menor'
  const navigate = useNavigate()
  const { createOrder, ordersForUser } = useOrderStore()

  const [clearingBlocked, setClearingBlocked] = useState(false)
  const handleClearBlocked = async () => {
    setClearingBlocked(true)
    await new Promise(r => setTimeout(r, 900))
    releaseAllBlockedPoins()
    setClearingBlocked(false)
  }

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'moeda' | 'gift_card'>('all')
  const [gameFilter, setGameFilter]       = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [priceFilter, setPriceFilter]     = useState(-1)

  const [confirm, setConfirm]           = useState<ConfirmState | null>(null)
  const [gameUid, setGameUid]           = useState('')
  const [delivery, setDelivery]         = useState<DeliveryState | null>(null)
  const [insufficient, setInsufficient] = useState(false)
  const [processing, setProcessing]     = useState(false)
  const [copied, setCopied]             = useState(false)

  // "Não encontrei meu jogo" modal
  const [wishOpen, setWishOpen]         = useState(false)
  const [wishSelected, setWishSelected] = useState<string[]>([])
  const [wishSent, setWishSent]         = useState(false)

  // "Meus Pedidos" section
  const [ordersExpanded, setOrdersExpanded] = useState(true)

  const toggleWish = (g: string) =>
    setWishSelected(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const handleWishSubmit = () => {
    if (wishSelected.length === 0) return
    const key = `pouplay_wishlist_${user?.id ?? 'anon'}`
    const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as string[]
    localStorage.setItem(key, JSON.stringify([...new Set([...existing, ...wishSelected])]))
    setWishSent(true)
  }

  const handleWishClose = () => { setWishOpen(false); setWishSelected([]); setWishSent(false) }

  const filteredGames = GAMES.filter(g => {
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false
    if (gameFilter && g.id !== gameFilter) return false
    if (companyFilter && g.company !== companyFilter) return false
    return true
  }).map(g => ({
    ...g,
    packages: g.packages.filter(pkg => {
      if (priceFilter < 0) return true
      const r = GAME_PRICE_RANGES[priceFilter]
      return pkg.pricePoins >= r.min && pkg.pricePoins < r.max
    }),
  })).filter(g => g.packages.length > 0)

  const handleBuy = (game: Game, pkg: GamePackage) => {
    setConfirm({ game, pkg })
    setInsufficient(false)
    setGameUid('')
  }

  const handleConfirm = async () => {
    if (!confirm || !user) return
    const { game, pkg } = confirm
    const fee = parseFloat((pkg.pricePoins * 0.05).toFixed(2))
    const total = pkg.pricePoins + fee

    if (balance < total) { setInsufficient(true); return }

    // UID required for account_credit games
    if (game.deliveryMethod === 'account_credit' && !gameUid.trim()) {
      setInsufficient(false)
      return
    }

    setProcessing(true)
    const pkgLabel = pkg.label ?? `${pkg.coins} ${pkg.coinName}`

    try {
      const res = await fetch('/api/games/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, packageId: pkg.id, userId: user.id }),
      })

      if (res.ok) {
        const data = await res.json()
        purchasePackage(`${pkgLabel} · ${game.name}`, pkg.pricePoins)
        const orderId = createOrder({
          userId: user.id, userName: user.name,
          gameId: game.id, gameName: game.name,
          packageId: pkg.id, packageLabel: pkgLabel,
          pricePoins: pkg.pricePoins, deliveryMethod: game.deliveryMethod,
          gameUid: gameUid.trim() || undefined, redeemUrl: game.redeemUrl,
        })
        setConfirm(null)
        setDelivery({
          game, pkg,
          transactionId: data.transactionId,
          deliveryMethod: data.deliveryMethod,
          code: data.code,
          deliveryMessage: data.deliveryMessage,
          orderId,
          gameUid: gameUid.trim() || undefined,
        })
      } else {
        throw new Error('backend_error')
      }
    } catch {
      const ok = purchasePackage(`${pkgLabel} · ${game.name}`, pkg.pricePoins)
      if (ok) {
        const orderId = createOrder({
          userId: user.id, userName: user.name,
          gameId: game.id, gameName: game.name,
          packageId: pkg.id, packageLabel: pkgLabel,
          pricePoins: pkg.pricePoins, deliveryMethod: game.deliveryMethod,
          gameUid: gameUid.trim() || undefined, redeemUrl: game.redeemUrl,
        })
        setConfirm(null)
        setGameUid('')
        setDelivery({
          game, pkg,
          transactionId: orderId,
          deliveryMethod: game.deliveryMethod,
          code: null,
          deliveryMessage: '',
          orderId,
          gameUid: gameUid.trim() || undefined,
        })
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const userOrders = user ? ordersForUser(user.id) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Jogos & Pacotes</h1>
          <p className="text-gray-400 text-sm mt-1">
            Use seus <span className="text-brand-400 font-semibold">P$ Poins</span> para comprar
            moedas e gift cards nos seus jogos favoritos.
          </p>
        </div>
        <button
          onClick={() => navigate('/guia?section=jogos')}
          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-900/20 border border-emerald-700/30 px-3 py-2 rounded-xl transition-colors flex-shrink-0"
        >
          <BookOpen size={13} /> Guia de jogos
        </button>
      </div>

      {/* Saldo disponível + Poins bloqueados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-dark-700 p-6 border border-brand-700/30 shadow-lg shadow-brand-900/30 flex flex-col">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #a78bfa 0%, transparent 60%)' }} />
          <p className="text-brand-200 text-sm mb-2">Saldo disponível em Poins</p>
          <PoinsDisplay amount={balance} size="xl" className="!text-white" />
          <p className="text-brand-300/60 text-xs mt-2">P$ 1,00 = R$ 1,00 em jogos parceiros</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-600 to-amber-800 p-6 border border-yellow-500/30 shadow-lg shadow-yellow-900/30 flex flex-col">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fde68a 0%, transparent 60%)' }} />
          <div className="flex items-center gap-2 mb-2">
            <Lock size={14} className="text-yellow-100" />
            <p className="text-yellow-100 text-sm">Poins bloqueados</p>
          </div>
          <PoinsDisplay amount={blockedPoins} size="xl" className="!text-white" />
          <p className="text-yellow-100/60 text-xs mt-2">Aguardando confirmação de repasse</p>
          {isChild && blockedPoins > 0 && (
            <button
              onClick={handleClearBlocked}
              disabled={clearingBlocked}
              className="mt-auto pt-4 flex items-center gap-1.5 text-xs font-semibold text-yellow-200/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait w-fit"
            >
              {clearingBlocked
                ? <><RefreshCw size={11} className="animate-spin" /> Liberando...</>
                : <><CheckCircle size={11} /> Liberar Poins bloqueados (simulação)</>
              }
            </button>
          )}
        </div>
      </div>

      {/* Tabs de categoria */}
      <div className="flex gap-2">
        {GAME_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setCategoryFilter(cat.id as typeof categoryFilter); setGameFilter('') }}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              categoryFilter === cat.id
                ? 'bg-brand-600 text-white shadow-md shadow-brand-900/30'
                : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 border border-dark-500'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="card p-4 space-y-3">
        <p className="text-sm font-semibold text-white">Filtros</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            className="input-field text-sm"
            value={gameFilter}
            onChange={e => setGameFilter(e.target.value)}
          >
            <option value="">Todos os jogos</option>
            {GAMES.filter(g => categoryFilter === 'all' || g.category === categoryFilter)
              .map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select className="input-field text-sm" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}>
            <option value="">Todas as empresas</option>
            {GAME_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input-field text-sm" value={priceFilter} onChange={e => setPriceFilter(Number(e.target.value))}>
            <option value={-1}>Qualquer valor</option>
            {GAME_PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* Jogos */}
      <div className="space-y-8">
        {filteredGames.map(game => (
          <div key={game.id}>
            <div className="flex items-center gap-4 mb-4">
              <GameLogo game={game} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-white text-lg">{game.name}</h2>
                  {game.category === 'gift_card' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-700/30">
                      Gift Card
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{game.company} · {game.description}</p>
              </div>
              <button
                onClick={() => navigate(`/guia?section=jogos&id=${game.id}`)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-400 border border-dark-400 hover:border-emerald-700/50 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
              >
                <BookOpen size={12} /> Saiba mais
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {game.packages.map(pkg => {
                const fee = parseFloat((pkg.pricePoins * 0.05).toFixed(2))
                const canAfford = balance >= pkg.pricePoins + fee
                return (
                  <div
                    key={pkg.id}
                    className={clsx(
                      'card hover:border-brand-600/60 transition-all relative',
                      pkg.popular && 'border-brand-700/50',
                      !canAfford && 'opacity-60'
                    )}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 left-4 tag bg-brand-600 text-white text-[10px]">
                        Mais popular
                      </span>
                    )}
                    <div className="text-center mb-3">
                      <p className="text-2xl font-extrabold text-white">
                        {pkg.label ?? pkg.coins.toLocaleString('pt-BR')}
                      </p>
                      {!pkg.label && <p className="text-xs text-gray-400">{pkg.coinName}</p>}
                      {pkg.bonus && (
                        <span className="inline-block mt-1 text-xs text-emerald-400 font-semibold">
                          + {pkg.bonus}
                        </span>
                      )}
                    </div>
                    <div className="text-center mb-4">
                      <PoinsDisplay amount={pkg.pricePoins} size="lg" />
                      <p className="text-xs text-gray-500 mt-0.5">
                        + P$ {fee.toFixed(2)} taxa · Total P$ {(pkg.pricePoins + fee).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBuy(game, pkg)}
                      disabled={!canAfford}
                      className={clsx(
                        'w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all',
                        canAfford
                          ? 'bg-brand-600 hover:bg-brand-700 text-white active:scale-95'
                          : 'bg-dark-400 text-gray-500 cursor-not-allowed'
                      )}
                    >
                      <ShoppingCart size={14} />
                      {canAfford ? 'Comprar' : 'Saldo insuficiente'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredGames.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🎮</p>
            <p className="font-semibold">Nenhum pacote encontrado</p>
            <p className="text-sm">Tente ajustar os filtros</p>
          </div>
        )}

        {/* Meus Pedidos */}
        <div className="card">
          <button
            onClick={() => setOrdersExpanded(v => !v)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Package size={16} className="text-brand-400" />
              <span className="font-bold text-white">Meus Pedidos</span>
              <span className="text-xs text-gray-500 bg-dark-600 px-1.5 py-0.5 rounded-full">
                {userOrders.length}
              </span>
              {userOrders.some(o => o.status === 'pending') && (
                <span className="text-[10px] bg-yellow-900/40 text-yellow-400 border border-yellow-700/40 px-1.5 py-0.5 rounded-full">
                  {userOrders.filter(o => o.status === 'pending').length} em andamento
                </span>
              )}
            </div>
            {ordersExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>

          {ordersExpanded && (
            <div className="mt-4">
              {userOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhum pedido ainda</p>
                  <p className="text-xs mt-1">Seus pedidos de moedas e gift cards aparecerão aqui após a compra.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userOrders.slice(0, 10).map(order => (
                    <OrderItem key={order.id} order={order} />
                  ))}
                  {userOrders.length > 10 && (
                    <p className="text-center text-xs text-gray-500 pt-1">
                      Mostrando os 10 pedidos mais recentes
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Não encontrei meu jogo */}
        <div className="card p-6 flex flex-col sm:flex-row items-center gap-4 border-dashed border-dark-400 bg-dark-800/50">
          <div className="flex-1 text-center sm:text-left">
            <p className="font-semibold text-white">Não encontrou seu jogo?</p>
            <p className="text-sm text-gray-400 mt-1">
              Nos diga quais jogos você quer ver na Pouplay e avisaremos quando estiverem disponíveis.
            </p>
          </div>
          <button
            onClick={() => setWishOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-600 hover:bg-dark-500 border border-dark-400 hover:border-brand-700/40 text-sm font-semibold text-white transition-all flex-shrink-0"
          >
            <Bell size={14} /> Solicitar jogo
          </button>
        </div>
      </div>

      {/* ── Modal de confirmação ── */}
      {confirm && !delivery && (() => {
        const needsUid = confirm.game.deliveryMethod === 'account_credit'
        const uidInfo = needsUid ? getUidLabel(confirm.game.id) : null
        const uidMissing = needsUid && !gameUid.trim()
        return (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => !processing && setConfirm(null)}>
            <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Confirmar compra</h3>
                {!processing && (
                  <button onClick={() => setConfirm(null)} className="text-gray-500 hover:text-gray-300">
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="bg-dark-800 rounded-xl p-4 mb-4 text-center">
                <p className="text-sm text-gray-400 mb-1">{confirm.game.name}</p>
                <p className="text-xl font-bold text-white">
                  {confirm.pkg.label ?? `${confirm.pkg.coins.toLocaleString('pt-BR')} ${confirm.pkg.coinName}`}
                </p>
                {confirm.pkg.bonus && <p className="text-xs text-emerald-400 mt-1">+ {confirm.pkg.bonus}</p>}
              </div>

              {/* UID field for account_credit games */}
              {needsUid && uidInfo && (
                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-1.5 block">
                    {uidInfo.label} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={gameUid}
                    onChange={e => setGameUid(e.target.value)}
                    placeholder={uidInfo.label}
                    className="input-field w-full text-sm"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">{uidInfo.hint}</p>
                  {uidMissing && processing && (
                    <p className="text-xs text-red-400 mt-1">Preencha o {uidInfo.label} para continuar</p>
                  )}
                </div>
              )}

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Valor do pacote</span>
                  <PoinsDisplay amount={confirm.pkg.pricePoins} size="sm" />
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Taxa de serviço (5%)</span>
                  <span className="text-gray-300">P$ {(confirm.pkg.pricePoins * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-white border-t border-dark-500 pt-2">
                  <span>Total descontado</span>
                  <PoinsDisplay
                    amount={confirm.pkg.pricePoins + parseFloat((confirm.pkg.pricePoins * 0.05).toFixed(2))}
                    size="sm"
                  />
                </div>
              </div>

              {insufficient && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-xl p-3 text-sm text-red-400 mb-3">
                  <AlertCircle size={14} /> Saldo insuficiente para esta compra.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirm(null)}
                  disabled={processing}
                  className="btn-secondary flex-1 py-2.5 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={processing || uidMissing}
                  className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {processing
                    ? <><Loader2 size={14} className="animate-spin" /> Processando...</>
                    : uidMissing ? `Informe o ${uidInfo?.label}` : 'Confirmar'
                  }
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Modal de entrega ── */}
      {delivery && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-sm w-full shadow-2xl">

            {/* Pending (manual) delivery */}
            {delivery.orderId ? (
              <>
                <div className="text-center mb-5">
                  <div className="w-14 h-14 rounded-full bg-yellow-900/30 border border-yellow-700/40 flex items-center justify-center mx-auto mb-3">
                    <Clock size={28} className="text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Pedido recebido!</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Estamos preparando seu{' '}
                    <strong className="text-white">
                      {delivery.pkg.label ?? `${delivery.pkg.coins.toLocaleString('pt-BR')} ${delivery.pkg.coinName}`}
                    </strong>{' '}
                    de <strong className="text-white">{delivery.game.name}</strong>.
                  </p>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Nº do pedido</span>
                    <span className="text-gray-200 font-mono text-xs">{delivery.orderId}</span>
                  </div>
                  {delivery.gameUid && (
                    <div className="flex justify-between text-gray-400">
                      <span>ID informado</span>
                      <span className="text-gray-200 font-mono">{delivery.gameUid}</span>
                    </div>
                  )}
                  <div className="border-t border-dark-500 pt-2">
                    {delivery.deliveryMethod === 'code' ? (
                      <p className="text-xs text-gray-400">
                        O código de resgate aparecerá em <strong className="text-white">Meus Pedidos</strong> assim que estiver pronto (até 2 horas úteis).
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Os créditos serão enviados à sua conta do jogo em até 2 horas úteis.
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => { setDelivery(null); setCopied(false) }}
                  className="btn-primary w-full py-2.5 text-sm"
                >
                  Entendido
                </button>
              </>
            ) : (
              /* Instant delivery (backend response) */
              <>
                <div className="text-center mb-5">
                  <CheckCircle size={52} className="text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white">Compra realizada!</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {delivery.pkg.label ?? `${delivery.pkg.coins.toLocaleString('pt-BR')} ${delivery.pkg.coinName}`}{' '}
                    de <strong className="text-white">{delivery.game.name}</strong>
                  </p>
                </div>

                <div className="bg-dark-800 rounded-xl p-4 mb-4 space-y-3">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>ID da transação</span>
                    <span className="text-gray-300 font-mono">{delivery.transactionId}</span>
                  </div>
                  <div className="border-t border-dark-500 pt-3">
                    <p className="text-xs text-gray-400 mb-1">Entrega</p>
                    <p className="text-sm text-white">{delivery.deliveryMessage}</p>
                  </div>
                  {delivery.deliveryMethod === 'code' && delivery.code && (
                    <div className="border-t border-dark-500 pt-3">
                      <p className="text-xs text-gray-400 mb-2">Seu código de resgate</p>
                      <div className="flex items-center gap-2 bg-dark-700 border border-brand-700/40 rounded-lg px-3 py-2">
                        <span className="flex-1 font-mono text-brand-300 font-bold tracking-widest text-sm">
                          {delivery.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(delivery.code!)}
                          className="text-gray-400 hover:text-brand-400 transition-colors"
                        >
                          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                      {delivery.game.redeemUrl && (
                        <p className="text-xs text-gray-500 mt-1">
                          Resgate em: <strong className="text-gray-400">{delivery.game.redeemUrl}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setDelivery(null); setCopied(false) }}
                  className="btn-primary w-full py-2.5 text-sm"
                >
                  Fechar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal "Não encontrei meu jogo" ── */}
      {wishOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={handleWishClose}>
          <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-sm w-full shadow-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-white">Solicitar novo jogo</h3>
              <button onClick={handleWishClose} className="text-gray-500 hover:text-gray-300"><X size={18} /></button>
            </div>

            {!wishSent ? (
              <>
                <p className="text-sm text-gray-400 mb-4">
                  Selecione os jogos que gostaria de ver na Pouplay. Avisaremos assim que estiverem disponíveis.
                </p>
                <div className="overflow-y-auto flex-1 space-y-1 mb-4 pr-1">
                  {WISH_LIST_GAMES.map(game => (
                    <label
                      key={game}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors',
                        wishSelected.includes(game)
                          ? 'bg-brand-900/40 border border-brand-700/40'
                          : 'hover:bg-dark-600 border border-transparent'
                      )}
                    >
                      <div className={clsx(
                        'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors',
                        wishSelected.includes(game) ? 'bg-brand-600' : 'border border-dark-300 bg-dark-800'
                      )}>
                        {wishSelected.includes(game) && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <input type="checkbox" className="hidden" checked={wishSelected.includes(game)} onChange={() => toggleWish(game)} />
                      <span className="text-sm text-gray-200">{game}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 pt-2 border-t border-dark-500">
                  <button onClick={handleWishClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancelar</button>
                  <button
                    onClick={handleWishSubmit}
                    disabled={wishSelected.length === 0}
                    className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Enviar{wishSelected.length > 0 ? ` (${wishSelected.length})` : ''}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 flex-1 flex flex-col items-center justify-center">
                <CheckCircle size={48} className="text-emerald-400 mb-3" />
                <p className="font-semibold text-white mb-1">Solicitação enviada!</p>
                <p className="text-sm text-gray-400 mb-6">
                  Avisaremos quando {wishSelected.length === 1 ? 'esse jogo estiver' : 'esses jogos estiverem'} disponível{wishSelected.length !== 1 ? 'is' : ''} na Pouplay.
                </p>
                <button onClick={handleWishClose} className="btn-primary px-8 py-2.5 text-sm">Fechar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
