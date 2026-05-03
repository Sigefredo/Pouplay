import { useState, useRef } from 'react'
import { ShoppingCart, X, CheckCircle, AlertCircle, Zap, Copy, Check, Loader2, BookOpen, Camera, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { GAMES, GAME_COMPANIES, GAME_PRICE_RANGES, type GamePackage, type Game } from '../data/games'
import { PoinsDisplay } from '../components/PoinsDisplay'
import { useWalletStore } from '../store/walletStore'
import { useAuthStore } from '../store/authStore'
import { useImageStore } from '../store/imageStore'

interface ConfirmState { game: Game; pkg: GamePackage }
interface DeliveryState {
  game: Game
  pkg: GamePackage
  transactionId: string
  deliveryMethod: 'code' | 'account_credit'
  code: string | null
  deliveryMessage: string
}

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

export default function Games() {
  const { balance, blockedBalance, purchasePackage } = useWalletStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [gameFilter, setGameFilter]       = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [priceFilter, setPriceFilter]     = useState(-1)

  const [confirm, setConfirm]     = useState<ConfirmState | null>(null)
  const [delivery, setDelivery]   = useState<DeliveryState | null>(null)
  const [insufficient, setInsufficient] = useState(false)
  const [processing, setProcessing]     = useState(false)
  const [copied, setCopied]             = useState(false)

  const filteredGames = GAMES.filter(g => {
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
  }

  const handleConfirm = async () => {
    if (!confirm || !user) return
    const { game, pkg } = confirm
    const fee = parseFloat((pkg.pricePoins * 0.05).toFixed(2))
    const total = pkg.pricePoins + fee

    if (balance < total) { setInsufficient(true); return }

    setProcessing(true)

    try {
      // Tenta processar via backend (distribuidor de jogos)
      const res = await fetch('/api/games/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          gameName: game.name,
          packageId: pkg.id,
          coins: pkg.coins,
          coinName: pkg.coinName,
          pricePoins: pkg.pricePoins,
          userId: user.id,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Debita do saldo local
        purchasePackage(`${pkg.coins} ${pkg.coinName} · ${game.name}`, pkg.pricePoins)
        setConfirm(null)
        setDelivery({
          game,
          pkg,
          transactionId: data.transactionId,
          deliveryMethod: data.deliveryMethod,
          code: data.code,
          deliveryMessage: data.deliveryMessage,
        })
      } else {
        // Backend retornou erro — usa fluxo local de fallback
        const ok = purchasePackage(`${pkg.coins} ${pkg.coinName} · ${game.name}`, pkg.pricePoins)
        if (ok) {
          setConfirm(null)
          setDelivery({
            game,
            pkg,
            transactionId: `LOCAL-${Date.now()}`,
            deliveryMethod: 'account_credit',
            code: null,
            deliveryMessage: `${pkg.coins} ${pkg.coinName} serão creditados em breve na sua conta do jogo.`,
          })
        }
      }
    } catch {
      // Backend indisponível — usa fluxo local
      const ok = purchasePackage(`${pkg.coins} ${pkg.coinName} · ${game.name}`, pkg.pricePoins)
      if (ok) {
        setConfirm(null)
        setDelivery({
          game,
          pkg,
          transactionId: `LOCAL-${Date.now()}`,
          deliveryMethod: 'account_credit',
          code: null,
          deliveryMessage: `${pkg.coins} ${pkg.coinName} serão creditados em breve na sua conta do jogo.`,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Jogos & Pacotes</h1>
          <p className="text-gray-400 text-sm mt-1">
            Use seus <span className="text-brand-400 font-semibold">P$ Poins</span> para comprar
            moedas nos seus jogos favoritos.
          </p>
        </div>
        <button
          onClick={() => navigate('/guia?section=jogos')}
          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-900/20 border border-emerald-700/30 px-3 py-2 rounded-xl transition-colors flex-shrink-0"
        >
          <BookOpen size={13} /> Guia de jogos
        </button>
      </div>

      {/* Saldo disponível */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-dark-700 p-6 border border-brand-700/30 shadow-lg shadow-brand-900/30">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #a78bfa 0%, transparent 60%)' }} />
        <p className="text-brand-200 text-sm mb-2">Saldo disponível em Poins</p>
        <PoinsDisplay amount={balance} size="xl" className="!text-white" />
        <p className="text-brand-300/60 text-xs mt-2">P$ 1,00 = R$ 1,00 em jogos parceiros</p>
        {blockedBalance > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 w-fit">
            <Lock size={13} className="text-yellow-400" />
            <span className="text-xs text-yellow-300">
              P$ {blockedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} bloqueados — aguardando confirmação
            </span>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="card p-4 space-y-3">
        <p className="text-sm font-semibold text-white">Filtros</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select className="input-field text-sm" value={gameFilter} onChange={e => setGameFilter(e.target.value)}>
            <option value="">Todos os jogos</option>
            {GAMES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
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
                <h2 className="font-bold text-white text-lg">{game.name}</h2>
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
                        {pkg.coins.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-400">{pkg.coinName}</p>
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
      </div>

      {/* ── Modal de confirmação ── */}
      {confirm && !delivery && (
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
                {confirm.pkg.coins.toLocaleString('pt-BR')} {confirm.pkg.coinName}
              </p>
              {confirm.pkg.bonus && <p className="text-xs text-emerald-400 mt-1">+ {confirm.pkg.bonus}</p>}
            </div>

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
                disabled={processing}
                className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              >
                {processing
                  ? <><Loader2 size={14} className="animate-spin" /> Processando...</>
                  : 'Confirmar'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de entrega ── */}
      {delivery && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-5">
              <CheckCircle size={52} className="text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Compra realizada!</h3>
              <p className="text-sm text-gray-400 mt-1">
                {delivery.pkg.coins.toLocaleString('pt-BR')} {delivery.pkg.coinName} de{' '}
                <strong className="text-white">{delivery.game.name}</strong>
              </p>
            </div>

            {/* Detalhes da entrega */}
            <div className="bg-dark-800 rounded-xl p-4 mb-4 space-y-3">
              <div className="flex justify-between text-xs text-gray-400">
                <span>ID da transação</span>
                <span className="text-gray-300 font-mono">{delivery.transactionId}</span>
              </div>
              <div className="border-t border-dark-500 pt-3">
                <p className="text-xs text-gray-400 mb-1">Entrega</p>
                <p className="text-sm text-white">{delivery.deliveryMessage}</p>
              </div>

              {/* Código resgatável (Roblox, Minecraft) */}
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
                  <p className="text-xs text-gray-500 mt-1">
                    Resgate em: <strong>store.{delivery.game.id}.com/redeem</strong>
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => { setDelivery(null); setCopied(false) }}
              className="btn-primary w-full py-2.5 text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
