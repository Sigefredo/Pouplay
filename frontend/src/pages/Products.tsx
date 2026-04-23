import { useState, useRef, useEffect } from 'react'
import { X, TrendingUp, ChevronRight, Star, BookOpen, Camera, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import {
  FINANCIAL_PRODUCTS, INSTITUTIONS, INVESTMENT_TYPES, VALUE_RANGES,
  type InvestmentType, type ValueRange, type FinancialProduct,
} from '../data/products'
import { useAuthStore } from '../store/authStore'
import { useImageStore } from '../store/imageStore'
import { useDepositStore, type Investment } from '../store/depositStore'

const tagColors: Record<string, string> = {
  green:  'bg-emerald-900/40 text-emerald-400 border-emerald-700/40',
  blue:   'bg-blue-900/40 text-blue-400 border-blue-700/40',
  purple: 'bg-brand-900/40 text-brand-400 border-brand-700/40',
  orange: 'bg-orange-900/40 text-orange-400 border-orange-700/40',
  pink:   'bg-pink-900/40 text-pink-400 border-pink-700/40',
}

const instColors: Record<string, string> = {
  BD: 'bg-blue-700', CI: 'bg-green-700', BF: 'bg-orange-700',
  XF: 'bg-purple-700', SB: 'bg-teal-700', B3: 'bg-red-700',
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function ProductLogo({ productId, logo, colorClass }: { productId: string; logo: string; colorClass: string }) {
  const { images, setImage } = useImageStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const img = images[productId]
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { if (ev.target?.result) setImage(productId, ev.target.result as string) }
    reader.readAsDataURL(file)
  }
  return (
    <div className="relative w-12 h-12 flex-shrink-0 group/logo cursor-pointer" onClick={() => fileRef.current?.click()} title="Clique para adicionar foto">
      {img
        ? <img src={img} alt={logo} className="w-12 h-12 rounded-xl object-cover" />
        : <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white', colorClass)}>{logo}</div>}
      <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
        <Camera size={14} className="text-white" />
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

interface InvestModal { product: FinancialProduct }

export default function Products() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { availableNetBalance, addInvestment, deposits } = useDepositStore()

  const [institution, setInstitution] = useState('')
  const [type, setType] = useState<InvestmentType | ''>('')
  const [range, setRange] = useState<ValueRange | ''>('')
  const [modal, setModal] = useState<InvestModal | null>(null)
  const [amountCents, setAmountCents] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  // Abre o modal automaticamente quando vindo do Guia com ?invest=<id>
  useEffect(() => {
    const investId = searchParams.get('invest')
    if (investId) {
      const product = FINANCIAL_PRODUCTS.find(p => p.id === investId)
      if (product) { setModal({ product }); setAmountCents(Math.round(netBalance * 100)) }
    }
  }, [])

  const netBalance = availableNetBalance()
  const investAmount = amountCents / 100

  const matchesRange = (minValue: number) => {
    switch (range) {
      case '0-50':     return minValue <= 50
      case '50-100':   return minValue > 50  && minValue <= 100
      case '100-500':  return minValue > 100 && minValue <= 500
      case '500-1000': return minValue > 500 && minValue <= 1000
      case '1000+':    return minValue > 1000
      default:         return true
    }
  }

  const filtered = FINANCIAL_PRODUCTS.filter(p =>
    (!institution || p.institution === institution) &&
    (!type || p.type === type) &&
    matchesRange(p.minValue)
  )
  const availableProducts = filtered.filter(p => p.minValue <= netBalance)
  const unavailableProducts = filtered.filter(p => p.minValue > netBalance)
  const sorted = [...availableProducts, ...unavailableProducts]

  const clearFilters = () => { setInstitution(''); setType(''); setRange('') }
  const hasFilters = institution || type || range

  const handleInvest = async () => {
    if (!modal || !user) return
    setProcessing(true)
    await new Promise(r => setTimeout(r, 1800))

    // Encontra o depósito confirmado com maior saldo restante
    const dep = deposits
      .filter(d => d.status === 'confirmed' && d.remainingNet > 0)
      .sort((a, b) => b.remainingNet - a.remainingNet)[0]

    if (!dep) { setProcessing(false); return }

    const inv: Investment = {
      id: `inv_${Date.now()}`,
      depositId: dep.id,
      productId: modal.product.id,
      productName: modal.product.name,
      institution: modal.product.institution,
      institutionLogo: modal.product.institutionLogo,
      amount: Math.min(investAmount, dep.remainingNet),
      poinsReleased: dep.poinsAmount,
      status: 'pending',
      investedAt: new Date().toISOString(),
    }

    addInvestment(inv)
    setProcessing(false)
    setDone(true)
  }

  const closeModal = () => { setModal(null); setDone(false); setProcessing(false); setAmountCents(0) }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Produtos Financeiros</h1>
          <p className="text-gray-400 text-sm mt-1">
            Invista e libere os <span className="text-brand-400 font-semibold">P$ Poins</span> do seu filho.
          </p>
        </div>
        <button
          onClick={() => navigate('/guia?section=investir')}
          className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/30 border border-brand-700/30 px-3 py-2 rounded-xl transition-colors flex-shrink-0"
        >
          <BookOpen size={13} /> Guia
        </button>
      </div>

      {/* Saldo de garantia */}
      <div className={clsx(
        'rounded-xl px-4 py-3 flex items-center justify-between gap-4',
        netBalance > 0
          ? 'bg-emerald-900/20 border border-emerald-700/30'
          : 'bg-dark-700 border border-dark-500'
      )}>
        <div>
          <p className="text-xs text-gray-400">Saldo disponível para investir</p>
          <p className={clsx('text-lg font-extrabold', netBalance > 0 ? 'text-emerald-400' : 'text-gray-500')}>
            {fmt(netBalance)}
          </p>
        </div>
        {netBalance === 0 && (
          <button
            onClick={() => navigate('/depositar')}
            className="text-xs bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-lg transition-all flex items-center gap-1"
          >
            Depositar <ChevronRight size={13} />
          </button>
        )}
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
          <select className="input-field text-sm" value={institution} onChange={e => setInstitution(e.target.value)}>
            <option value="">Todas as instituições</option>
            {INSTITUTIONS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select className="input-field text-sm" value={type} onChange={e => setType(e.target.value as InvestmentType | '')}>
            <option value="">Todos os tipos</option>
            {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input-field text-sm" value={range} onChange={e => setRange(e.target.value as ValueRange | '')}>
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
        {sorted.map(p => {
          const canInvest = netBalance > 0 && p.minValue <= netBalance
          return (
            <div key={p.id} className={clsx(
              'card transition-all group',
              canInvest ? 'hover:border-brand-600/60 hover:bg-dark-600' : 'opacity-50',
              p.popular && canInvest && 'border-brand-700/40'
            )}>
              <div className="flex items-start gap-4">
                <ProductLogo productId={p.id} logo={p.institutionLogo} colorClass={instColors[p.institutionLogo] ?? 'bg-dark-400'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="tag bg-dark-500 text-gray-300">{p.type}</span>
                        {p.tag && <span className={clsx('tag border', tagColors[p.tagColor ?? 'blue'])}>{p.tag}</span>}
                        {p.popular && canInvest && (
                          <span className="tag bg-brand-900/40 text-brand-400 border border-brand-700/40">
                            <Star size={10} className="mr-1" /> Popular
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white mt-1">{p.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{p.institution}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">Rendimento</p>
                      <p className="text-white font-bold text-sm">{p.rate}</p>
                      <p className="text-xs text-gray-500">mín. {fmt(p.minValue)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{p.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-500 gap-2 flex-wrap">
                    <div className="text-xs text-gray-500">
                      Poins liberados após confirmação:{' '}
                      <span className="text-brand-400 font-semibold">definidos no depósito</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/guia?section=investir&id=${p.id}`)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-400 border border-dark-400 hover:border-brand-700/50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <BookOpen size={12} /> Saiba mais
                      </button>
                      <button
                        onClick={() => { setModal({ product: p }); setAmountCents(Math.round(netBalance * 100)); setDone(false) }}
                        disabled={!canInvest}
                        className={clsx(
                          'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all active:scale-95',
                          canInvest
                            ? 'bg-brand-600 hover:bg-brand-700 text-white'
                            : 'bg-dark-500 text-gray-500 cursor-not-allowed'
                        )}
                      >
                        Investir agora <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">Nenhum produto encontrado</p>
            <p className="text-sm">Tente ajustar os filtros</p>
          </div>
        )}
      </div>

      {/* Modal de confirmação de investimento */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => !processing && closeModal()}>
          <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            {!done ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-white">Confirmar Investimento</h3>
                  {!processing && <button onClick={closeModal} className="text-gray-500 hover:text-gray-300"><X size={18} /></button>}
                </div>

                <div className="bg-dark-800 rounded-xl p-4 mb-4 space-y-2 text-sm border border-dark-500">
                  <p className="text-xs text-gray-400">Produto selecionado</p>
                  <p className="font-bold text-white">{modal.product.name}</p>
                  <p className="text-xs text-gray-400">{modal.product.institution} · {modal.product.type} · {modal.product.rate}</p>
                </div>

                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Saldo disponível</span>
                    <span className="text-emerald-400 font-semibold">{fmt(netBalance)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Valor mínimo</span>
                    <span className="text-gray-300">{fmt(modal.product.minValue)}</span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Digite o valor a investir</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={(amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        onFocus={e => e.target.select()}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '')
                          const cents = Math.min(
                            Math.round(netBalance * 100),
                            parseInt(digits || '0', 10)
                          )
                          setAmountCents(cents)
                        }}
                        className="input-field pl-9 text-sm w-full"
                      />
                    </div>
                    {investAmount < modal.product.minValue && investAmount > 0 && (
                      <p className="text-xs text-red-400 mt-1">
                        Valor mínimo: {fmt(modal.product.minValue)}
                      </p>
                    )}
                  </div>
                </div>

                {netBalance < modal.product.minValue && (
                  <div className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-3 text-xs text-yellow-400 mb-4">
                    <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                    Este produto exige mínimo de {fmt(modal.product.minValue)}. Seu saldo disponível ({fmt(netBalance)}) pode ser insuficiente.
                  </div>
                )}

                <div className="flex items-start gap-2 bg-brand-900/20 border border-brand-700/30 rounded-xl p-3 text-xs text-brand-300 mb-4">
                  <Lock size={12} className="mt-0.5 flex-shrink-0" />
                  Os Poins bloqueados serão liberados automaticamente após a confirmação do investimento pelo banco/corretora.
                </div>

                <div className="flex gap-3">
                  <button onClick={closeModal} disabled={processing} className="btn-secondary flex-1 py-2.5 text-sm">Cancelar</button>
                  <button onClick={handleInvest} disabled={processing || investAmount < modal.product.minValue || investAmount > netBalance} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                    {processing ? <><Loader2 size={14} className="animate-spin" /> Processando...</> : 'Confirmar'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4 space-y-4">
                <CheckCircle size={52} className="text-emerald-400 mx-auto" />
                <div>
                  <h3 className="font-bold text-white text-lg">Investimento registrado!</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Aguardando confirmação de <strong className="text-white">{modal.product.institution}</strong>.
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Quando confirmado, os Poins do seu filho serão liberados automaticamente.
                </p>
                <button onClick={() => { closeModal(); navigate('/investimentos') }} className="btn-primary w-full py-2.5 text-sm">
                  Ver em Meus Investimentos
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
