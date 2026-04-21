import { useState } from 'react'
import { X, TrendingUp, ChevronRight, Star } from 'lucide-react'
import clsx from 'clsx'
import {
  FINANCIAL_PRODUCTS, INSTITUTIONS, INVESTMENT_TYPES, VALUE_RANGES,
  type InvestmentType, type ValueRange,
} from '../data/products'
import { PoinsDisplay } from '../components/PoinsDisplay'

const tagColors: Record<string, string> = {
  green:  'bg-emerald-900/40 text-emerald-400 border-emerald-700/40',
  blue:   'bg-blue-900/40 text-blue-400 border-blue-700/40',
  purple: 'bg-brand-900/40 text-brand-400 border-brand-700/40',
  orange: 'bg-orange-900/40 text-orange-400 border-orange-700/40',
  pink:   'bg-pink-900/40 text-pink-400 border-pink-700/40',
}

const instColors: Record<string, string> = {
  'BD': 'bg-blue-700',   'CI': 'bg-green-700',  'BF': 'bg-orange-700',
  'XF': 'bg-purple-700', 'SB': 'bg-teal-700',   'B3': 'bg-red-700',
}

export default function Products() {
  const [institution, setInstitution] = useState<string>('')
  const [type, setType] = useState<InvestmentType | ''>('')
  const [range, setRange] = useState<ValueRange | ''>('')

  const filtered = FINANCIAL_PRODUCTS.filter(p =>
    (!institution || p.institution === institution) &&
    (!type || p.type === type) &&
    (!range || p.valueRange === range)
  )

  const clearFilters = () => { setInstitution(''); setType(''); setRange('') }
  const hasFilters = institution || type || range

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Produtos Financeiros</h1>
        <p className="text-gray-400 text-sm mt-1">
          Invista e receba cashback em <span className="text-brand-400 font-semibold">P$ Poins</span> para usar em jogos.
        </p>
      </div>

      {/* Filtros */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Filtros</p>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
              <X size={12} /> Limpar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            className="input-field text-sm"
            value={institution}
            onChange={e => setInstitution(e.target.value)}
          >
            <option value="">Todas as instituições</option>
            {INSTITUTIONS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select
            className="input-field text-sm"
            value={type}
            onChange={e => setType(e.target.value as InvestmentType | '')}
          >
            <option value="">Todos os tipos</option>
            {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            className="input-field text-sm"
            value={range}
            onChange={e => setRange(e.target.value as ValueRange | '')}
          >
            <option value="">Qualquer valor</option>
            {VALUE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* Resultado */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <TrendingUp size={14} />
        <span>{filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className={clsx(
            'card hover:border-brand-600/60 hover:bg-dark-600 transition-all cursor-pointer group',
            p.popular && 'border-brand-700/40'
          )}>
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0',
                instColors[p.institutionLogo] ?? 'bg-dark-400'
              )}>
                {p.institutionLogo}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="tag bg-dark-500 text-gray-300">{p.type}</span>
                      {p.tag && (
                        <span className={clsx('tag border', tagColors[p.tagColor ?? 'blue'])}>
                          {p.tag}
                        </span>
                      )}
                      {p.popular && (
                        <span className="tag bg-brand-900/40 text-brand-400 border border-brand-700/40">
                          <Star size={10} className="mr-1" /> Popular
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white mt-1">{p.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{p.institution}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">Cashback em Poins</p>
                    <PoinsDisplay amount={p.cashbackPoins} size="lg" />
                    <p className="text-xs text-gray-500">{p.cashbackPercent}% do valor</p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mt-2">{p.description}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-500">
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>📈 <strong className="text-white">{p.rate}</strong></span>
                    <span>💰 A partir de <strong className="text-white">
                      {p.minValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </strong></span>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 group-hover:gap-2 transition-all">
                    Investir agora <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">Nenhum produto encontrado</p>
            <p className="text-sm">Tente ajustar os filtros</p>
          </div>
        )}
      </div>
    </div>
  )
}
