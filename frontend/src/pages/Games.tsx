import { useState } from 'react'
import { ShoppingCart, X, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import clsx from 'clsx'
import { GAMES, GAME_COMPANIES, GAME_PRICE_RANGES, type GamePackage, type Game } from '../data/games'
import { PoinsDisplay } from '../components/PoinsDisplay'
import { useWalletStore } from '../store/walletStore'

interface ConfirmModal {
  game: Game
  pkg: GamePackage
}

export default function Games() {
  const { balance, purchasePackage } = useWalletStore()
  const [gameFilter, setGameFilter] = useState<string>('')
  const [companyFilter, setCompanyFilter] = useState<string>('')
  const [priceFilter, setPriceFilter] = useState<number>(-1)
  const [confirm, setConfirm] = useState<ConfirmModal | null>(null)
  const [purchased, setPurchased] = useState<string | null>(null)
  const [insufficient, setInsufficient] = useState(false)

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
    setPurchased(null)
  }

  const handleConfirm = () => {
    if (!confirm) return
    const fee = parseFloat((confirm.pkg.pricePoins * 0.05).toFixed(2))
    if (balance < confirm.pkg.pricePoins + fee) {
      setInsufficient(true)
      return
    }
    const ok = purchasePackage(
      `${confirm.pkg.coins} ${confirm.pkg.coinName} · ${confirm.game.name}`,
      confirm.pkg.pricePoins
    )
    if (ok) {
      setPurchased(confirm.pkg.id)
      setTimeout(() => { setConfirm(null); setPurchased(null) }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white">Jogos & Pacotes</h1>
        <p className="text-gray-400 text-sm mt-1">
          Use seus <span className="text-brand-400 font-semibold">P$ Poins</span> para comprar moedas nos seus jogos favoritos.
        </p>
      </div>

      {/* Saldo rápido */}
      <div className="flex items-center gap-3 bg-brand-900/20 border border-brand-700/30 rounded-xl px-4 py-3">
        <Zap size={16} className="text-brand-400" />
        <span className="text-sm text-gray-300">Saldo disponível:</span>
        <PoinsDisplay amount={balance} size="md" />
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
            {/* Game header */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: game.color + '33', border: `1px solid ${game.color}44` }}
              >
                <span style={{ color: game.color }}>{game.logo}</span>
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">{game.name}</h2>
                <p className="text-xs text-gray-400">{game.company} · {game.description}</p>
              </div>
            </div>

            {/* Packages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {game.packages.map(pkg => {
                const fee = parseFloat((pkg.pricePoins * 0.05).toFixed(2))
                const canAfford = balance >= pkg.pricePoins + fee
                return (
                  <div
                    key={pkg.id}
                    className={clsx(
                      'card hover:border-brand-600/60 transition-all relative group',
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
                        + P$ {fee.toFixed(2)} taxa · Total: P$ {(pkg.pricePoins + fee).toFixed(2)}
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

      {/* Modal de confirmação */}
      {confirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setConfirm(null)}>
          <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            {purchased ? (
              <div className="text-center py-4">
                <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-lg font-bold text-white">Compra realizada!</p>
                <p className="text-sm text-gray-400 mt-1">
                  {confirm.pkg.coins.toLocaleString('pt-BR')} {confirm.pkg.coinName} de {confirm.game.name}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Confirmar compra</h3>
                  <button onClick={() => setConfirm(null)} className="text-gray-500 hover:text-gray-300">
                    <X size={18} />
                  </button>
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
                    <span className="text-gray-300">
                      P$ {(confirm.pkg.pricePoins * 0.05).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-white border-t border-dark-500 pt-2">
                    <span>Total descontado</span>
                    <PoinsDisplay amount={confirm.pkg.pricePoins + parseFloat((confirm.pkg.pricePoins * 0.05).toFixed(2))} size="sm" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Saldo após compra</span>
                    <span>P$ {(balance - confirm.pkg.pricePoins - parseFloat((confirm.pkg.pricePoins * 0.05).toFixed(2))).toFixed(2)}</span>
                  </div>
                </div>

                {insufficient && (
                  <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/40 rounded-xl p-3 text-sm text-red-400 mb-3">
                    <AlertCircle size={14} />
                    Saldo insuficiente para esta compra.
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setConfirm(null)} className="btn-secondary flex-1 py-2.5 text-sm">
                    Cancelar
                  </button>
                  <button onClick={handleConfirm} className="btn-primary flex-1 py-2.5 text-sm">
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
