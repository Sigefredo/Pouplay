import { useState, useRef, useEffect, useMemo } from 'react'
import { X, TrendingUp, ChevronRight, Star, BookOpen, Camera, Lock, AlertCircle, Loader2, CheckCircle, Users, User as UserIcon, Copy, Check } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import {
  FINANCIAL_PRODUCTS, INSTITUTIONS, INVESTMENT_TYPES, VALUE_RANGES,
  type InvestmentType, type ValueRange, type FinancialProduct,
} from '../data/products'
import { useAuthStore } from '../store/authStore'
import { useImageStore } from '../store/imageStore'
import { useDepositStore, type Investment } from '../store/depositStore'
import { useAdminStore, type ChildPixAccount } from '../store/adminStore'
import { useProfileStore } from '../store/profileStore'
import { useWalletStore } from '../store/walletStore'

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

interface DoneInvestment {
  childName: string
  amount: number
  pixKey: string
  trackingId: string
}

function generateTrackingId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `POI-${date}-${rand}`
}

export default function Products() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { availableNetBalance, addInvestment, deposits } = useDepositStore()
  const adminUsers = useAdminStore(s => s.users)
  const adminInstitutions = useAdminStore(s => s.institutions)

  const [institution, setInstitution] = useState('')
  const [type, setType] = useState<InvestmentType | ''>('')
  const [range, setRange] = useState<ValueRange | ''>('')
  const [modal, setModal] = useState<InvestModal | null>(null)
  const [amountCents, setAmountCents] = useState(0)
  const [childPixSel, setChildPixSel] = useState<Record<string, string>>({})
  const [selfPixKey, setSelfPixKey] = useState('')
  const [selfAccountId, setSelfAccountId] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)
  const [doneInvestments, setDoneInvestments] = useState<DoneInvestment[]>([])
  const [showPixGuide, setShowPixGuide] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { investmentAccounts } = useProfileStore()
  const { blockPoinsForChild } = useWalletStore()

  const copyField = (value: string, key: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(key)
      setTimeout(() => setCopiedField(null), 2000)
    })
  }

  const netBalance = availableNetBalance()
  const investAmount = amountCents / 100

  const children = useMemo(
    () => adminUsers.filter(u => u.linkedTo === user?.id && u.role === 'menor' && u.active !== false),
    [adminUsers, user?.id]
  )

  const dep = useMemo(
    () =>
      deposits
        .filter(d => d.status === 'confirmed' && d.remainingNet > 0)
        .sort((a, b) => b.remainingNet - a.remainingNet)[0] ?? null,
    [deposits]
  )

  // Destino determinado pelo depósito selecionado: se tiver alocações de filhos → filhos, senão → pai
  const destination: 'self' | 'children' =
    (dep?.childAllocations && dep.childAllocations.length > 0) ? 'children' : 'self'

  const productInst = useMemo(
    () => (modal ? adminInstitutions.find(i => i.name === modal.product.institution) ?? null : null),
    [modal, adminInstitutions]
  )

  const childAmounts = useMemo(() => {
    if (!dep || children.length === 0) return {} as Record<string, number>
    const result: Record<string, number> = {}
    if (dep.childAllocations && dep.childAllocations.length > 0) {
      let remaining = investAmount
      children.forEach((child, i) => {
        if (i === children.length - 1) {
          result[child.id] = parseFloat(Math.max(0, remaining).toFixed(2))
        } else {
          const alloc = dep.childAllocations!.find(a => a.childId === child.id)
          const pct = alloc?.percent ?? 0
          const a = parseFloat((investAmount * pct / 100).toFixed(2))
          result[child.id] = a
          remaining -= a
        }
      })
    } else {
      const base = parseFloat((investAmount / children.length).toFixed(2))
      let remaining = investAmount
      children.forEach((child, i) => {
        if (i === children.length - 1) {
          result[child.id] = parseFloat(Math.max(0, remaining).toFixed(2))
        } else {
          result[child.id] = base
          remaining -= base
        }
      })
    }
    return result
  }, [dep, children, investAmount])

  const childPoins = useMemo(() => {
    if (!dep || children.length === 0 || !dep.childAllocations?.length) return {} as Record<string, number>
    const result: Record<string, number> = {}
    children.forEach(child => {
      const alloc = dep.childAllocations!.find(a => a.childId === child.id)
      result[child.id] = alloc?.poinsAmount ?? 0
    })
    return result
  }, [dep, children])

  // Per-child share of the total available balance, derived from each deposit's childAllocations percent
  const childNetBalances = useMemo(() => {
    if (children.length === 0) return {} as Record<string, number>
    const result: Record<string, number> = {}
    children.forEach(c => { result[c.id] = 0 })
    deposits
      .filter(d => d.status === 'confirmed' && d.remainingNet > 0)
      .forEach(d => {
        if (d.childAllocations && d.childAllocations.length > 0) {
          d.childAllocations.forEach(alloc => {
            if (alloc.childId in result) {
              result[alloc.childId] = parseFloat(
                (result[alloc.childId] + d.remainingNet * alloc.percent / 100).toFixed(2)
              )
            }
          })
        // else: depósitos sem alocações de filhos não são distribuídos para eles
        }
      })
    return result
  }, [deposits, children])

  const childMatchingPix = useMemo(() => {
    const result: Record<string, ChildPixAccount[]> = {}
    children.forEach(child => {
      result[child.id] = productInst
        ? (child.pixAccounts ?? []).filter(p => p.institutionId === productInst.id)
        : []
    })
    return result
  }, [children, productInst])

  // Contas do pai que correspondem à instituição do produto selecionado
  const selfMatchingAccounts = useMemo(
    () => productInst
      ? investmentAccounts.filter(a => a.institutionId === productInst.id)
      : [],
    [investmentAccounts, productInst]
  )

  // Proporção investida em relação ao netAmount total do depósito
  const poinsRatio = dep && dep.netAmount > 0 ? Math.min(1, investAmount / dep.netAmount) : 0
  // Poins a liberar para o responsável (investimento próprio)
  const selfPoinsToRelease = dep ? parseFloat((poinsRatio * dep.poinsAmount).toFixed(2)) : 0
  // Poins a liberar por filho
  const childPoinsToRelease: Record<string, number> = {}
  children.forEach(child => {
    childPoinsToRelease[child.id] = dep
      ? parseFloat((poinsRatio * (childPoins[child.id] ?? 0)).toFixed(2))
      : 0
  })

  const openModal = (product: FinancialProduct) => {
    const inst = adminInstitutions.find(i => i.name === product.institution) ?? null
    const currentChildren = adminUsers.filter(
      u => u.linkedTo === user?.id && u.role === 'menor' && u.active !== false
    )
    const sel: Record<string, string> = {}
    currentChildren.forEach(child => {
      const matching = inst ? (child.pixAccounts ?? []).filter(p => p.institutionId === inst.id) : []
      sel[child.id] = matching[0]?.id ?? ''
    })
    setModal({ product })
    setAmountCents(Math.round(netBalance * 100))
    setChildPixSel(sel)
    setSelfPixKey('')
    setSelfAccountId('')
    setShowConfirm(false)
    setProcessing(false)
    setDone(false)
    setDoneInvestments([])
  }

  const closeModal = () => {
    setModal(null)
    setDone(false)
    setShowConfirm(false)
    setProcessing(false)
    setAmountCents(0)
    setSelfPixKey('')
    setSelfAccountId('')
    setDoneInvestments([])
  }

  useEffect(() => {
    const investId = searchParams.get('invest')
    if (investId) {
      const product = FINANCIAL_PRODUCTS.find(p => p.id === investId)
      if (product) openModal(product)
    }
  }, [])

  const allChildrenHavePix = children.length > 0 && children.every(child => {
    const matching = childMatchingPix[child.id] ?? []
    const selId = childPixSel[child.id]
    return matching.length > 0 && !!selId
  })

  const selfValid = selfMatchingAccounts.length > 0 && !!selfAccountId && !!selfPixKey.trim()

  const formValid =
    !!modal &&
    !!dep &&
    investAmount >= (modal?.product.minValue ?? 0) &&
    investAmount <= netBalance &&
    (destination === 'self' || children.length === 0
      ? selfValid
      : allChildrenHavePix)

  const handleConfirmInvest = async () => {
    if (!modal || !dep || !user) return
    setProcessing(true)
    await new Promise(r => setTimeout(r, 1200))

    const created: DoneInvestment[] = []

    // Investe para si mesmo (sem filhos, ou pai com filhos que escolheu "Para mim")
    if (children.length === 0 || destination === 'self') {
      const trackingId = generateTrackingId()
      const inv: Investment = {
        id: `inv_${Date.now()}`,
        depositId: dep.id,
        productId: modal.product.id,
        productName: modal.product.name,
        institution: modal.product.institution,
        institutionLogo: modal.product.institutionLogo,
        amount: investAmount,
        poinsReleased: selfPoinsToRelease,
        status: 'pending',
        investedAt: new Date().toISOString(),
        pixKey: selfPixKey.trim(),
        trackingId,
        beneficiaryName: user.name,
        beneficiaryCpf: user.cpf,
      }
      addInvestment(inv)
      created.push({ childName: user.name, amount: investAmount, pixKey: selfPixKey.trim(), trackingId })
    }

    if (destination === 'self') {
      setDoneInvestments(created)
      setProcessing(false)
      setShowConfirm(false)
      setDone(true)
      return
    }

    children.forEach(child => {
      const selPixId = childPixSel[child.id]
      const pixAcc = (child.pixAccounts ?? []).find(p => p.id === selPixId)
      if (!pixAcc) return

      const amount = childAmounts[child.id] ?? 0
      const poinsReleased = childPoinsToRelease[child.id] ?? 0
      const trackingId = generateTrackingId()

      const inv: Investment = {
        id: `inv_${Date.now()}_${child.id}`,
        depositId: dep.id,
        productId: modal.product.id,
        productName: modal.product.name,
        institution: modal.product.institution,
        institutionLogo: modal.product.institutionLogo,
        amount,
        poinsReleased,
        status: 'pending',
        investedAt: new Date().toISOString(),
        pixKey: pixAcc.pixKey,
        trackingId,
        beneficiaryName: child.name,
        beneficiaryCpf: child.cpf,
        childId: child.id,
      }

      addInvestment(inv)
      if (poinsReleased > 0) {
        blockPoinsForChild(poinsReleased, child.id, `Poins bloqueados — ${modal.product.name}`)
      }
      created.push({ childName: child.name, amount, pixKey: pixAcc.pixKey, trackingId })
    })

    setDoneInvestments(created)
    setProcessing(false)
    setShowConfirm(false)
    setDone(true)
  }

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

      {/* Saldo disponível */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-dark-700 p-6 border border-emerald-700/40 shadow-lg shadow-emerald-900/30">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #34d399 0%, transparent 60%)' }} />

        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1">
            <p className="text-emerald-300 text-sm mb-2">Disponível para investir</p>
            <p className={clsx('text-3xl md:text-4xl font-extrabold', netBalance > 0 ? 'text-white' : 'text-gray-400')}>
              {fmt(netBalance)}
            </p>
            <p className="text-emerald-600/80 text-xs mt-2">saldo líquido em Conta da Pouplay</p>
          </div>

          {netBalance > 0 && destination === 'children' && (
            <>
              <div className="hidden md:block w-px bg-white/10 self-stretch" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-400/70 mb-2 flex items-center gap-1.5">
                  <Users size={11} /> Distribuição por filho
                </p>
                <div className="space-y-1.5">
                  {children.map(child => (
                    <div key={child.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{child.name}</span>
                      <span className="text-emerald-300 font-semibold">{fmt(childNetBalances[child.id] ?? 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {netBalance === 0 && (
            <button
              onClick={() => navigate('/depositar')}
              className="self-start text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              Depositar <ChevronRight size={13} />
            </button>
          )}
        </div>
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
                        onClick={() => openModal(p)}
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

      {/* Modal principal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => !processing && !showConfirm && closeModal()}
        >
          <div
            className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {!done ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-white">Confirmar Investimento</h3>
                  {!processing && (
                    <button onClick={closeModal} className="text-gray-500 hover:text-gray-300">
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Produto */}
                <div className="bg-dark-800 rounded-xl p-4 mb-4 space-y-1 text-sm border border-dark-500">
                  <p className="text-xs text-gray-400">Produto selecionado</p>
                  <p className="font-bold text-white">{modal.product.name}</p>
                  <p className="text-xs text-gray-400">
                    {modal.product.institution} · {modal.product.type} · {modal.product.rate}
                  </p>
                </div>

                {/* Valor total */}
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
                    <label className="block text-xs text-gray-400 mb-1">Valor total a investir</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={(amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        onFocus={e => e.target.select()}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '')
                          const cents = Math.min(Math.round(netBalance * 100), parseInt(digits || '0', 10))
                          setAmountCents(cents)
                        }}
                        className="input-field pl-9 text-sm w-full"
                      />
                    </div>
                    {investAmount > 0 && investAmount < modal.product.minValue && (
                      <p className="text-xs text-red-400 mt-1">
                        Valor mínimo: {fmt(modal.product.minValue)}
                      </p>
                    )}
                  </div>
                  {dep && investAmount >= modal.product.minValue && (
                    <div className="bg-dark-800 border border-dark-500 rounded-xl px-3 py-2 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <Lock size={10} className="text-brand-400" /> Poins a liberar
                        </span>
                        <span className="text-brand-400 font-semibold">
                          P$ {(destination === 'children'
                            ? Object.values(childPoinsToRelease).reduce((a, b) => a + b, 0)
                            : selfPoinsToRelease
                          ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {poinsRatio < 0.9999 && (() => {
                        const totalAllocPoins = destination === 'children'
                          ? Object.values(childPoins).reduce((a, b) => a + b, 0)
                          : dep.poinsAmount
                        const poinsStillBlocked = parseFloat(
                          (((dep.remainingNet - investAmount) / dep.netAmount) * totalAllocPoins).toFixed(2)
                        )
                        return (
                          <>
                            <div className="flex justify-between text-xs">
                              <span className="text-yellow-400/80 flex items-center gap-1.5">
                                <Lock size={10} /> Poins bloqueados restantes
                              </span>
                              <span className="text-yellow-400 font-semibold">
                                P$ {Math.max(0, poinsStillBlocked).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs border-t border-dark-600 pt-1.5">
                              <span className="text-gray-400">Saldo restante a investir</span>
                              <span className="text-emerald-400 font-semibold">
                                {fmt(parseFloat((dep.remainingNet - investAmount).toFixed(2)))}
                              </span>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>

                {/* Destino determinado automaticamente pelo depósito selecionado */}
                {children.length > 0 && (
                  <div className="mb-3 flex items-center gap-2 text-xs bg-dark-800 rounded-xl px-3 py-2">
                    <span className="text-gray-400">Destino:</span>
                    {destination === 'children'
                      ? <span className="text-brand-400 font-semibold">👦 Meus filhos — conforme configurado no depósito</span>
                      : <span className="text-blue-400 font-semibold">👤 Para mim — depósito sem distribuição a filhos</span>
                    }
                  </div>
                )}

                {/* Investimento próprio (sem filhos, ou depósito destinado ao pai) */}
                {(children.length === 0 || destination === 'self') && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <UserIcon size={13} className="text-brand-400" />
                      <p className="text-xs font-semibold text-gray-300">Beneficiário</p>
                    </div>
                    <div className="bg-dark-800 border border-dark-500 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Nome</span>
                        <span className="text-white font-medium">{user?.name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">CPF</span>
                        <span className="text-gray-300">{user?.cpf}</span>
                      </div>
                      <div className="mt-1">
                        <label className="block text-xs text-gray-400 mb-1">Conta nesta instituição</label>
                        {selfMatchingAccounts.length === 0 ? (
                          <div className="flex items-start gap-1.5 text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-2 py-2">
                            <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
                            <span>
                              Nenhuma conta cadastrada para <strong>{modal?.product.institution}</strong>.{' '}
                              <button
                                type="button"
                                onClick={() => { closeModal(); navigate('/perfil') }}
                                className="underline text-yellow-200 hover:text-white transition-colors"
                              >
                                Cadastre no Perfil
                              </button>
                              {' '}para continuar.
                            </span>
                          </div>
                        ) : (
                          <select
                            className="input-field text-xs w-full"
                            value={selfAccountId}
                            onChange={e => {
                              const id = e.target.value
                              setSelfAccountId(id)
                              const acc = selfMatchingAccounts.find(a => a.id === id)
                              if (acc) setSelfPixKey(acc.pixKey)
                            }}
                          >
                            <option value="">Selecione uma conta</option>
                            {selfMatchingAccounts.map(a => (
                              <option key={a.id} value={a.id}>
                                {a.institutionName}{a.accountNumber ? ` — ${a.accountNumber}` : ''}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      {selfMatchingAccounts.length > 0 && (
                        <div className="mt-1">
                          <label className="block text-xs text-gray-400 mb-1">Chave PIX destino</label>
                          <input
                            type="text"
                            placeholder="Auto-preenchido ao selecionar a conta"
                            value={selfPixKey}
                            onChange={e => setSelfPixKey(e.target.value)}
                            className="input-field text-xs w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Distribuição por filho */}
                {children.length > 0 && destination === 'children' && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={13} className="text-brand-400" />
                      <p className="text-xs font-semibold text-gray-300">Distribuição por filho</p>
                    </div>
                    <div className="space-y-3">
                      {children.map(child => {
                        const childAmt = childAmounts[child.id] ?? 0
                        const matching = childMatchingPix[child.id] ?? []
                        const selId = childPixSel[child.id] ?? ''
                        const hasPix = matching.length > 0

                        return (
                          <div key={child.id} className="bg-dark-800 border border-dark-500 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-white">{child.name}</span>
                              <div className="text-right">
                                <p className="text-sm font-bold text-emerald-400">{fmt(childAmt)}</p>
                                <p className="text-xs text-brand-400">
                                  P$ {(childPoinsToRelease[child.id] ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} liberados
                                </p>
                              </div>
                            </div>
                            {hasPix ? (
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Chave PIX</label>
                                <select
                                  className="input-field text-xs w-full"
                                  value={selId}
                                  onChange={e => setChildPixSel(prev => ({ ...prev, [child.id]: e.target.value }))}
                                >
                                  {matching.map(pix => (
                                    <option key={pix.id} value={pix.id}>
                                      {pix.pixKey} ({pix.institutionName})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2 text-xs text-yellow-400">
                                <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                                <span>
                                  Nenhuma chave PIX cadastrada para{' '}
                                  <strong>{modal.product.institution}</strong>.{' '}
                                  <button
                                    onClick={() => { closeModal(); navigate('/perfil') }}
                                    className="underline hover:text-yellow-300"
                                  >
                                    Cadastrar agora
                                  </button>
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Aviso Poins */}
                <div className="flex items-start gap-2 bg-brand-900/20 border border-brand-700/30 rounded-xl p-3 text-xs text-brand-300 mb-4">
                  <Lock size={12} className="mt-0.5 flex-shrink-0" />
                  {dep && poinsRatio < 0.9999
                    ? 'Apenas os Poins proporcionais ao valor investido serão liberados após a confirmação. O restante permanece bloqueado até o próximo investimento.'
                    : 'Os Poins bloqueados serão liberados automaticamente após a confirmação do investimento pelo banco/corretora.'}
                </div>

                <div className="flex gap-3">
                  <button onClick={closeModal} disabled={processing} className="btn-secondary flex-1 py-2.5 text-sm">
                    Cancelar
                  </button>
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={!formValid}
                    className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    Revisar <ChevronRight size={14} />
                  </button>
                </div>
              </>
            ) : (
              /* Done */
              <div className="space-y-4 py-2">
                <div className="text-center">
                  <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
                  <h3 className="font-bold text-white text-lg">Investimentos registrados!</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Aguardando confirmação de{' '}
                    <strong className="text-white">{modal.product.institution}</strong>.
                  </p>
                </div>

                <div className="space-y-3">
                  {doneInvestments.map((inv, i) => (
                    <div key={i} className="bg-dark-800 border border-dark-500 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-white">{inv.childName}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Valor</span>
                          <span className="text-white font-bold">{fmt(inv.amount)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-400 flex-shrink-0">Chave PIX destino</span>
                          <span className="text-white break-all text-right">{inv.pixKey}</span>
                        </div>
                      </div>
                      <div className="bg-brand-900/30 border border-brand-700/40 rounded-lg p-2">
                        <p className="text-xs text-gray-400 mb-0.5">Código de rastreio</p>
                        <p className="font-mono font-bold text-brand-300 text-xs tracking-wider">{inv.trackingId}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 text-xs text-yellow-400 bg-yellow-900/10 border border-yellow-700/30 rounded-xl p-3">
                  <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                  <span>
                    Inclua o código de rastreio na descrição de cada transferência PIX para rastrearmos o investimento.{' '}
                    <button
                      type="button"
                      onClick={() => setShowPixGuide(true)}
                      className="underline text-yellow-200 hover:text-white font-semibold transition-colors"
                    >
                      Saiba Como
                    </button>
                  </span>
                </div>

                {/* Popup passo a passo — Como fazer o PIX */}
                {showPixGuide && (
                  <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4"
                    onClick={() => setShowPixGuide(false)}
                  >
                    <div
                      className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-sm w-full shadow-2xl overflow-y-auto max-h-[90vh]"
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Cabeçalho */}
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-white text-base">Como realizar o PIX de investimento</h3>
                        <button onClick={() => setShowPixGuide(false)} className="text-gray-500 hover:text-gray-300">
                          <X size={18} />
                        </button>
                      </div>

                      {/* Dados do investimento para copiar */}
                      {doneInvestments.length > 0 && (
                        <div className="mb-5 space-y-3">
                          <p className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
                            Dados para o PIX
                          </p>
                          {doneInvestments.map((inv, i) => (
                            <div key={i} className="bg-dark-800 border border-dark-500 rounded-xl p-3 space-y-2">
                              {doneInvestments.length > 1 && (
                                <p className="text-xs font-semibold text-white border-b border-dark-500 pb-2 mb-2">
                                  {inv.childName}
                                </p>
                              )}

                              {/* Chave PIX */}
                              <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Chave PIX de destino</p>
                                <div className="flex items-center gap-2 bg-dark-700 border border-dark-400 rounded-lg px-2.5 py-1.5">
                                  <span className="flex-1 text-xs text-brand-200 font-mono break-all">{inv.pixKey}</span>
                                  <button
                                    onClick={() => copyField(inv.pixKey, `${i}-pix`)}
                                    className="text-gray-400 hover:text-brand-400 transition-colors flex-shrink-0"
                                    title="Copiar chave PIX"
                                  >
                                    {copiedField === `${i}-pix`
                                      ? <Check size={13} className="text-emerald-400" />
                                      : <Copy size={13} />}
                                  </button>
                                </div>
                              </div>

                              {/* Valor */}
                              <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Valor exato a transferir</p>
                                <div className="flex items-center gap-2 bg-dark-700 border border-dark-400 rounded-lg px-2.5 py-1.5">
                                  <span className="flex-1 text-xs text-emerald-300 font-bold">{fmt(inv.amount)}</span>
                                  <button
                                    onClick={() => copyField(inv.amount.toFixed(2), `${i}-val`)}
                                    className="text-gray-400 hover:text-brand-400 transition-colors flex-shrink-0"
                                    title="Copiar valor"
                                  >
                                    {copiedField === `${i}-val`
                                      ? <Check size={13} className="text-emerald-400" />
                                      : <Copy size={13} />}
                                  </button>
                                </div>
                              </div>

                              {/* Código de rastreio */}
                              <div>
                                <p className="text-[10px] text-yellow-500 uppercase tracking-wider mb-1 font-semibold">⚠ Código de rastreio (obrigatório)</p>
                                <div className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-700/40 rounded-lg px-2.5 py-1.5">
                                  <span className="flex-1 text-xs font-mono font-bold text-yellow-300 tracking-wider">{inv.trackingId}</span>
                                  <button
                                    onClick={() => copyField(inv.trackingId, `${i}-tid`)}
                                    className="text-yellow-500 hover:text-yellow-300 transition-colors flex-shrink-0"
                                    title="Copiar código de rastreio"
                                  >
                                    {copiedField === `${i}-tid`
                                      ? <Check size={13} className="text-emerald-400" />
                                      : <Copy size={13} />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Passos */}
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Passo a passo
                      </p>
                      <ol className="space-y-3">
                        {[
                          {
                            n: 1,
                            title: 'Abra seu aplicativo bancário',
                            body: 'Acesse o app do banco ou corretora e inicie uma nova transferência via PIX.',
                          },
                          {
                            n: 2,
                            title: 'Informe a chave PIX de destino',
                            body: 'Copie a chave PIX exibida acima e cole no campo destinatário do seu app.',
                          },
                          {
                            n: 3,
                            title: 'Defina o valor exato',
                            body: 'Transfira exatamente o valor indicado acima para cada beneficiário.',
                          },
                          {
                            n: 4,
                            title: 'Inclua o código de rastreio',
                            body: 'No campo "Mensagem", "Descrição" ou "Identificador" do PIX, cole o código de rastreio copiado acima. Este passo é obrigatório — sem ele a instituição não consegue vincular o pagamento ao seu investimento.',
                            highlight: true,
                          },
                          {
                            n: 5,
                            title: 'Confirme e envie',
                            body: 'Revise chave PIX, valor e código de rastreio antes de confirmar a transferência.',
                          },
                          {
                            n: 6,
                            title: 'Aguarde a confirmação',
                            body: 'Quando a instituição confirmar o recebimento, os Poins serão liberados automaticamente no aplicativo.',
                          },
                        ].map(step => (
                          <li key={step.n} className={clsx('flex gap-3 rounded-xl p-3', step.highlight ? 'bg-yellow-900/20 border border-yellow-700/30' : 'bg-dark-800')}>
                            <span className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5', step.highlight ? 'bg-yellow-500 text-black' : 'bg-brand-600 text-white')}>
                              {step.n}
                            </span>
                            <div>
                              <p className={clsx('text-sm font-semibold', step.highlight ? 'text-yellow-300' : 'text-white')}>{step.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{step.body}</p>
                            </div>
                          </li>
                        ))}
                      </ol>

                      <p className="text-xs text-gray-500 mt-4 text-center">
                        Guarde o comprovante do PIX até a confirmação do investimento.
                      </p>

                      <button
                        onClick={() => setShowPixGuide(false)}
                        className="btn-primary w-full py-2.5 text-sm mt-4"
                      >
                        Entendido
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center">
                  Quando o banco confirmar, os Poins {destination === 'children' ? 'dos seus filhos serão liberados automaticamente.' : 'serão liberados automaticamente.'}
                </p>
                <button
                  onClick={() => { closeModal(); navigate('/investimentos') }}
                  className="btn-primary w-full py-2.5 text-sm"
                >
                  Ver em Meus Investimentos
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popup de confirmação */}
      {modal && showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-sm w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Revisar e Confirmar</h3>
              {!processing && (
                <button onClick={() => setShowConfirm(false)} className="text-gray-500 hover:text-gray-300">
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Produto */}
            <div className="bg-dark-800 rounded-xl p-3 mb-4 border border-dark-500 text-xs">
              <p className="text-gray-400 mb-0.5">Produto</p>
              <p className="font-bold text-white">{modal.product.name}</p>
              <p className="text-gray-400">{modal.product.institution} · {modal.product.rate}</p>
            </div>

            {/* Beneficiário(s) */}
            <div className="space-y-2 mb-4">
              {destination === 'self' ? (
                <div className="bg-dark-800 border border-dark-500 rounded-xl p-3 text-xs space-y-1">
                  <p className="font-semibold text-white">{user?.name}</p>
                  <div className="flex justify-between text-gray-400">
                    <span>CPF</span>
                    <span className="text-gray-300">{user?.cpf}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Valor</span>
                    <span className="text-white font-bold">{fmt(investAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span className="flex items-center gap-1"><Lock size={10} /> Poins a liberar</span>
                    <span className="text-brand-400 font-semibold">P$ {selfPoinsToRelease.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-gray-400">
                    <span className="flex-shrink-0">Chave PIX</span>
                    <span className="text-white break-all text-right">{selfPixKey || '—'}</span>
                  </div>
                </div>
              ) : (
                children.map(child => {
                  const selPixId = childPixSel[child.id]
                  const pixAcc = (child.pixAccounts ?? []).find(p => p.id === selPixId)
                  const childAmt = childAmounts[child.id] ?? 0
                  return (
                    <div key={child.id} className="bg-dark-800 border border-dark-500 rounded-xl p-3 text-xs space-y-1">
                      <p className="font-semibold text-white">{child.name}</p>
                      <div className="flex justify-between text-gray-400">
                        <span>Valor</span>
                        <span className="text-white font-bold">{fmt(childAmt)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span className="flex items-center gap-1"><Lock size={10} /> Poins a liberar</span>
                        <span className="text-brand-400 font-semibold">P$ {(childPoinsToRelease[child.id] ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between gap-2 text-gray-400">
                        <span className="flex-shrink-0">Chave PIX</span>
                        <span className="text-white break-all text-right">{pixAcc?.pixKey ?? '—'}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between text-sm font-bold mb-5 border-t border-dark-500 pt-3">
              <span className="text-gray-300">Total</span>
              <span className="text-emerald-400">{fmt(investAmount)}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={processing}
                className="btn-secondary flex-1 py-2.5 text-sm"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmInvest}
                disabled={processing}
                className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              >
                {processing
                  ? <><Loader2 size={14} className="animate-spin" /> Processando...</>
                  : 'Confirmar e enviar PIX'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
