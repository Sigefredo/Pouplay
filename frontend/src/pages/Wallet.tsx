import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react'
import clsx from 'clsx'
import { useWalletStore } from '../store/walletStore'
import { PoinsDisplay } from '../components/PoinsDisplay'
import type { TransactionType } from '../data/transactions'

const typeLabels: Record<TransactionType, string> = {
  poins:    'Poins',
  purchase: 'Compra',
  fee:      'Taxa',
  transfer: 'Transferência',
}

const typeColors: Record<TransactionType, string> = {
  poins:    'bg-emerald-900/40 text-emerald-400 border-emerald-700/40',
  purchase: 'bg-brand-900/40 text-brand-400 border-brand-700/40',
  fee:      'bg-gray-800 text-gray-400 border-gray-700/40',
  transfer: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
}

export default function Wallet() {
  const { balance, transactions, totalPoinsReleased, totalPurchases } = useWalletStore()
  const [filter, setFilter] = useState<TransactionType | 'all'>('all')

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter)

  const totalFees = transactions
    .filter(t => t.type === 'fee')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white">Carteira</h1>
        <p className="text-gray-400 text-sm mt-1">Extrato completo e saldo em Poins.</p>
      </div>

      {/* Saldo principal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-dark-700 p-6 border border-brand-700/30">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #a78bfa 0%, transparent 60%)' }} />
        <p className="text-brand-200 text-sm">Saldo disponível</p>
        <PoinsDisplay amount={balance} size="xl" className="!text-white mt-1" />
        <p className="text-brand-300/60 text-xs mt-1">Equivalente a R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/40 flex items-center justify-center">
              <ArrowUpRight size={16} className="text-emerald-400" />
            </div>
            <p className="text-xs text-gray-400">Total de Poins liberados</p>
          </div>
          <PoinsDisplay amount={totalPoinsReleased()} size="lg" />
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-900/40 flex items-center justify-center">
              <ArrowDownRight size={16} className="text-brand-400" />
            </div>
            <p className="text-xs text-gray-400">Gasto em jogos</p>
          </div>
          <PoinsDisplay amount={-totalPurchases()} size="lg" showSign />
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
              <Filter size={16} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-400">Taxas pagas</p>
          </div>
          <span className="text-2xl font-bold text-gray-400">
            P$ {totalFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Filtro de tipo */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'poins', 'purchase', 'fee'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
              filter === f
                ? 'bg-brand-600 border-brand-600 text-white'
                : 'bg-dark-700 border-dark-400 text-gray-400 hover:border-brand-600 hover:text-white'
            )}
          >
            {f === 'all' ? 'Tudo' : typeLabels[f]}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500 self-center">
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Extrato */}
      <div className="card p-0 overflow-hidden divide-y divide-dark-500">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-3xl mb-2">📋</p>
            <p>Nenhuma transação nesta categoria.</p>
          </div>
        )}
        {filtered.map(tx => (
          <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-dark-600 transition-colors">
            <span className="text-xl flex-shrink-0">{tx.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                <span className={clsx('tag border text-[10px]', typeColors[tx.type])}>
                  {typeLabels[tx.type]}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                <span>
                  {new Date(tx.date).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
                {tx.detail && <span className="text-gray-600">·</span>}
                {tx.detail && <span className="truncate">{tx.detail}</span>}
              </div>
            </div>
            <PoinsDisplay amount={tx.amount} size="sm" showSign />
          </div>
        ))}
      </div>
    </div>
  )
}
