import { useState, useEffect } from 'react'
import {
  CheckCircle, Clock, Lock, RefreshCw, Zap, PiggyBank, ChevronRight,
  Hash, User, Baby, AlertTriangle, X, Send, ArrowRight, RotateCcw,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '../store/authStore'
import { useAdminStore } from '../store/adminStore'
import { MOCK_USERS } from '../data/users'
import { useDepositStore, type Deposit, type Investment } from '../store/depositStore'
import { useWalletStore } from '../store/walletStore'
import { PoinsDisplay } from '../components/PoinsDisplay'
import { depositExpiresAt, businessDaysUntil } from '../utils/businessDays'

type Tab = 'a_transferir' | 'aguardando' | 'concluidos'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function trackingId() {
  const now = new Date()
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '')
  const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0')
  return `POI-${ymd}-${hex}`
}

// ── Countdown components ──────────────────────────────────────────────────────

function CountdownBadge({ daysLeft }: { daysLeft: number }) {
  if (daysLeft < 0) return (
    <span className="tag border bg-red-900/50 text-red-300 border-red-700/50 flex items-center gap-1">
      <AlertTriangle size={10} /> Prazo expirado
    </span>
  )
  if (daysLeft === 0) return (
    <span className="tag border bg-red-900/50 text-red-300 border-red-700/50 flex items-center gap-1 animate-pulse">
      <AlertTriangle size={10} /> Expira hoje!
    </span>
  )
  const cls = daysLeft >= 3
    ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40'
    : daysLeft === 2
      ? 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40'
      : 'bg-red-900/40 text-red-400 border-red-700/40'
  return (
    <span className={`tag border flex items-center gap-1 ${cls}`}>
      <Clock size={10} /> {daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''}
    </span>
  )
}

function CountdownBar({ daysLeft }: { daysLeft: number }) {
  const elapsed = Math.max(0, Math.min(5, 5 - Math.max(0, daysLeft)))
  const barColor = daysLeft >= 3 ? 'bg-emerald-500' : daysLeft === 2 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex gap-0.5 mt-1.5">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className={clsx('h-1.5 flex-1 rounded-full', i < elapsed ? barColor : 'bg-dark-500')} />
      ))}
    </div>
  )
}

// ── Register transfer form (inline) ──────────────────────────────────────────

function childNetAmount(dep: Deposit, alloc: { percent: number } | undefined): number {
  if (!alloc) return dep.remainingNet
  return parseFloat(Math.min(dep.remainingNet, dep.netAmount * alloc.percent / 100).toFixed(2))
}

function RegisterTransferForm({
  dep,
  onDone,
  onCancel,
}: {
  dep: Deposit
  onDone: (inv: Investment) => void
  onCancel: () => void
}) {
  const { user } = useAuthStore()
  const { users: adminUsers } = useAdminStore()
  const allocs = dep.childAllocations ?? []
  const defaultChildId = allocs.length > 0 ? allocs[0].childId : '__self__'

  const [childId, setChildId] = useState(defaultChildId)
  const [pixKey, setPixKey]   = useState('')
  const [customPixKey, setCustomPixKey] = useState('')
  const [amount, setAmount]   = useState('')
  const [done, setDone]       = useState<string | null>(null)

  const selectedAlloc = allocs.find(a => a.childId === childId)
  const childUser     = adminUsers.find(u => u.id === childId)
  const pixAccounts   = childUser?.pixAccounts ?? []
  const beneficiaryName = selectedAlloc?.childName ?? user?.name ?? ''

  // Re-initialise amount + pixKey whenever the selected child changes
  useEffect(() => {
    const net = childNetAmount(dep, selectedAlloc)
    setAmount(net.toFixed(2).replace('.', ','))
    setPixKey(pixAccounts[0]?.pixKey ?? '__custom__')
    setCustomPixKey('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId])

  // Initialise on first render
  useEffect(() => {
    const net = childNetAmount(dep, selectedAlloc)
    setAmount(net.toFixed(2).replace('.', ','))
    setPixKey(pixAccounts[0]?.pixKey ?? '__custom__')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const effectivePixKey = pixKey === '__custom__' ? customPixKey : pixKey
  const numAmount  = parseFloat(amount.replace(',', '.').replace(/[^\d.]/g, '')) || 0
  const poinsRatio = dep.netAmount > 0 ? Math.min(1, numAmount / dep.netAmount) : 0
  const poinsToRelease = selectedAlloc
    ? parseFloat((poinsRatio * selectedAlloc.poinsAmount).toFixed(2))
    : parseFloat((poinsRatio * dep.poinsAmount).toFixed(2))
  const isValid = effectivePixKey.trim().length > 0 && numAmount > 0 && numAmount <= dep.remainingNet + 0.005

  const resolvedInstitution = pixKey !== '__custom__'
    ? (pixAccounts.find(p => p.pixKey === pixKey)?.institutionName ?? 'A confirmar')
    : 'A confirmar'

  const handleConfirm = () => {
    const tid = trackingId()
    const inv: Investment = {
      id: `inv-${Date.now()}`,
      depositId: dep.id,
      productId: 'transfer',
      productName: 'Transferência para conta bancária',
      institution: resolvedInstitution,
      institutionLogo: '→',
      amount: numAmount,
      poinsReleased: poinsToRelease,
      status: 'pending',
      investedAt: new Date().toISOString(),
      pixKey: effectivePixKey.trim(),
      trackingId: tid,
      beneficiaryName,
      beneficiaryCpf: '',
      childId: childId !== '__self__' ? childId : undefined,
    }
    onDone(inv)
    setDone(tid)
  }

  if (done) {
    return (
      <div className="mt-3 pt-3 border-t border-dark-500 bg-emerald-900/10 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
          <CheckCircle size={14} /> Transferência registrada
        </p>
        <p className="text-xs text-gray-400">
          Inclua o código abaixo na descrição da sua transferência PIX para rastreio:
        </p>
        <p className="font-mono text-sm text-brand-300 font-bold bg-dark-700 rounded-lg px-3 py-2">{done}</p>
        <p className="text-xs text-gray-500">
          Após o banco confirmar, os Poins serão liberados automaticamente.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-3 pt-3 border-t border-dark-500 space-y-3">
      <p className="text-xs font-semibold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
        <Send size={11} /> Registrar transferência realizada
      </p>

      {/* Filho seletor — só quando há mais de um beneficiário */}
      {allocs.length > 1 && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Beneficiário (filho)</label>
          <select
            value={childId}
            onChange={e => setChildId(e.target.value)}
            className="input-field text-sm"
          >
            {allocs.map(a => (
              <option key={a.childId} value={a.childId}>{a.childName}</option>
            ))}
            <option value="__self__">Para mim ({user?.name.split(' ')[0]})</option>
          </select>
        </div>
      )}

      {/* Beneficiário — somente leitura, derivado automaticamente */}
      <div className="flex items-center gap-3 px-3 py-2.5 bg-dark-700/50 border border-dark-500 rounded-xl">
        <User size={14} className="text-gray-500 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Beneficiário</p>
          <p className="text-sm font-semibold text-white truncate">{beneficiaryName}</p>
        </div>
      </div>

      {/* Chave PIX */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Chave PIX destino</label>
        {pixAccounts.length > 0 ? (
          <>
            <select
              value={pixKey}
              onChange={e => { setPixKey(e.target.value); setCustomPixKey('') }}
              className="input-field text-sm"
            >
              {pixAccounts.map(p => (
                <option key={p.pixKey} value={p.pixKey}>
                  {p.institutionName} — {p.pixKey}
                </option>
              ))}
              <option value="__custom__">Outra chave PIX…</option>
            </select>
            {pixKey === '__custom__' && (
              <input
                type="text"
                value={customPixKey}
                onChange={e => setCustomPixKey(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                className="input-field text-sm mt-2"
              />
            )}
          </>
        ) : (
          <input
            type="text"
            value={customPixKey}
            onChange={e => { setCustomPixKey(e.target.value); setPixKey('__custom__') }}
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            className="input-field text-sm"
          />
        )}
      </div>

      {/* Valor — pré-calculado, editável para transferências parciais */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">
          Valor a transferir <span className="text-gray-600">(máx. {fmt(dep.remainingNet)})</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="input-field pl-9 text-sm font-bold"
          />
        </div>
        {numAmount > 0 && (
          <p className="text-xs text-brand-400 mt-1">
            Poins a liberar: P$ {poinsToRelease.toFixed(2)}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={!isValid}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle size={14} /> Confirmar registro
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-dark-600 hover:bg-dark-500 border border-dark-400 rounded-xl transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Investments() {
  const navigate = useNavigate()
  const { user, registeredUsers } = useAuthStore()
  const {
    deposits, investments, confirmInvestment, confirmDeposit,
    addInvestment, requestReturn, totalInvested, pendingInvestmentsCount,
  } = useDepositStore()
  const {
    releasePoins, releasePoinsToChild, releaseAllBlockedPoins,
    blockPoins, blockPoinsForChild, transactions, balance,
  } = useWalletStore()

  const blockedBalance = transactions
    .filter(t => t.type === 'poins' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0)

  const isChild = user?.role === 'menor'
  const linkedChildren = [...MOCK_USERS, ...registeredUsers].filter(u => u.linkedTo === user?.id)

  const [tab, setTab] = useState<Tab>('a_transferir')
  const [childFilter, setChildFilter] = useState<string | null>(null)
  const [simulating, setSimulating] = useState<string | null>(null)
  const [confirmingPix, setConfirmingPix] = useState<string | null>(null)
  const [generatingChildPoins, setGeneratingChildPoins] = useState<string | null>(null)
  const [requestingReturn, setRequestingReturn] = useState<string | null>(null)
  const [registeringFor, setRegisteringFor] = useState<string | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  // Deposits needing attention (expiring ≤ 2 days or already expired)
  const urgentDeposits = deposits.filter(d => {
    if (d.status !== 'confirmed' || d.remainingNet <= 0) return false
    return businessDaysUntil(depositExpiresAt(d.confirmedAt!)) <= 2
  })
  const expiredToday = urgentDeposits.filter(d => businessDaysUntil(depositExpiresAt(d.confirmedAt!)) <= 0)

  // Investment filters
  const visibleInvestments = isChild
    ? investments.filter(inv => inv.childId === user?.id)
    : childFilter === '__self__'
      ? investments.filter(inv => !inv.childId)
      : childFilter
        ? investments.filter(inv => inv.childId === childFilter)
        : investments

  const aTransferirCount = deposits.filter(d => d.status !== 'return_requested' && (d.status === 'awaiting_pix' || d.remainingNet > 0)).length
  const aguardandoCount = isChild
    ? visibleInvestments.filter(i => i.status === 'pending').length
    : pendingInvestmentsCount()
  const concluidosCount = visibleInvestments.filter(i => i.status === 'confirmed').length

  // Handlers
  const handleSimConfirmPix = async (depId: string) => {
    const dep = deposits.find(d => d.id === depId)
    if (!dep) return
    setConfirmingPix(depId)
    await new Promise(r => setTimeout(r, 1500))
    confirmDeposit(depId)
    if (!dep.childAllocations?.length) {
      blockPoins(dep.poinsAmount, `Poins gerados e bloqueados — depósito de ${fmt(dep.amount)}`)
    } else {
      dep.childAllocations.forEach(alloc => {
        if (alloc.poinsAmount > 0)
          blockPoinsForChild(alloc.poinsAmount, alloc.childId, `Poins bloqueados pelo responsável ${user?.name ?? 'Responsável'} — depósito de ${fmt(dep.amount)}`)
      })
    }
    setConfirmingPix(null)
  }

  const handleGenChildPoins = async (depId: string) => {
    const dep = deposits.find(d => d.id === depId)
    if (!dep?.childAllocations?.length) return
    setGeneratingChildPoins(depId)
    await new Promise(r => setTimeout(r, 1000))
    dep.childAllocations.forEach(alloc => {
      if (alloc.poinsAmount > 0)
        blockPoinsForChild(alloc.poinsAmount, alloc.childId, `Poins bloqueados pelo responsável ${user?.name ?? 'Responsável'} — depósito de ${fmt(dep.amount)}`)
    })
    setGeneratingChildPoins(null)
  }

  const handleSimConfirm = async (invId: string, poinsReleased: number, productName: string, childId?: string) => {
    setSimulating(invId)
    await new Promise(r => setTimeout(r, 2000))
    confirmInvestment(invId)
    if (childId) {
      releasePoinsToChild(poinsReleased, childId, `Poins liberados — ${productName}`)
    } else {
      releasePoins(poinsReleased, `Poins liberados — ${productName}`)
    }
    setSimulating(null)
  }

  const handleRequestReturn = async (depId: string) => {
    setRequestingReturn(depId)
    await new Promise(r => setTimeout(r, 1000))
    requestReturn(depId)
    setRequestingReturn(null)
  }

  const handleRegisterDone = (inv: Investment) => {
    addInvestment(inv)
    setRegisteringFor(null)
    setTab('aguardando')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Expiry banner */}
      {!bannerDismissed && (urgentDeposits.length > 0) && !isChild && (
        <div className={clsx(
          'rounded-xl border p-4 flex items-start gap-3',
          expiredToday.length > 0
            ? 'bg-red-900/20 border-red-700/40'
            : 'bg-yellow-900/15 border-yellow-700/40'
        )}>
          <AlertTriangle size={18} className={expiredToday.length > 0 ? 'text-red-400 flex-shrink-0 mt-0.5' : 'text-yellow-400 flex-shrink-0 mt-0.5'} />
          <div className="flex-1 min-w-0">
            <p className={clsx('text-sm font-semibold', expiredToday.length > 0 ? 'text-red-300' : 'text-yellow-300')}>
              {expiredToday.length > 0
                ? `${expiredToday.length} depósito${expiredToday.length > 1 ? 's' : ''} com prazo expirado — devolução pendente`
                : `${urgentDeposits.length} depósito${urgentDeposits.length > 1 ? 's' : ''} com prazo expirando em breve`}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {expiredToday.length > 0
                ? 'O prazo de 5 dias úteis foi atingido. Solicite a devolução ou realize a transferência agora.'
                : 'Realize a transferência ou solicite a devolução antes que o prazo seja atingido.'}
            </p>
          </div>
          <button onClick={() => setBannerDismissed(true)} className="text-gray-600 hover:text-gray-400 flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white">
          {isChild ? 'Meus Repasses' : 'Repasses Vinculados'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {isChild
            ? <>Acompanhe as transferências em seu nome e seus <span className="text-brand-400 font-semibold">P$ Poins</span>.</>
            : 'Gerencie os valores na Conta da Pouplay e acompanhe as transferências vinculadas.'}
        </p>
      </div>

      {/* Summary cards */}
      {isChild ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Total transferido</p>
            <p className="text-lg font-bold text-white">{fmt(visibleInvestments.reduce((s, i) => s + i.amount, 0))}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Saldo em Poins</p>
            <PoinsDisplay amount={balance} size="md" className="!text-brand-400" />
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Poins bloqueados</p>
            <div className="flex items-center gap-1">
              <Lock size={12} className="text-yellow-400" />
              <PoinsDisplay
                amount={blockedBalance}
                size="md" className="!text-yellow-400"
              />
            </div>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Aguardando confirmação</p>
            <p className="text-lg font-bold text-yellow-400">{visibleInvestments.filter(i => i.status === 'pending').length}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">A transferir</p>
            <p className="text-lg font-bold text-emerald-400">
              {fmt(deposits.filter(d => d.status === 'confirmed').reduce((s, d) => s + d.remainingNet, 0))}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Total transferido</p>
            <p className="text-lg font-bold text-white">{fmt(totalInvested())}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Meu saldo em Poins</p>
            <PoinsDisplay amount={balance} size="md" className="!text-brand-400" />
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Confirmações pendentes</p>
            <p className="text-lg font-bold text-yellow-400">{pendingInvestmentsCount()}</p>
          </div>
        </div>
      )}

      {/* Poins bloqueados sem transferência vinculada */}
      {!isChild && blockedBalance > 0 && visibleInvestments.filter(i => i.status === 'pending').length === 0 && (
        <div className="card border-yellow-700/30 bg-yellow-900/10 flex items-start gap-3">
          <Lock size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-yellow-300">Poins bloqueados sem transferência vinculada</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">
              Há P$ {blockedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} bloqueados sem repasse pendente associado.
            </p>
            <button
              onClick={() => releaseAllBlockedPoins()}
              className="flex items-center gap-1.5 text-xs text-yellow-300 hover:text-yellow-200 bg-yellow-900/30 border border-yellow-700/40 hover:border-yellow-600 px-3 py-1.5 rounded-lg transition-all"
            >
              <Zap size={11} /> Liberar Poins bloqueados <span className="text-gray-500">(simulação)</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs — filho não tem abas de depósito */}
      {!isChild ? (
        <div className="flex gap-2 flex-wrap items-center">
          {([
            ['a_transferir', `A Transferir (${aTransferirCount})`],
            ['aguardando',   `Aguardando (${aguardandoCount})`],
            ['concluidos',   `Concluídos (${concluidosCount})`],
          ] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all',
                tab === t ? 'bg-brand-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white border border-dark-500'
              )}>
              {label}
            </button>
          ))}

          {/* Child filter — only for investment tabs */}
          {(tab === 'aguardando' || tab === 'concluidos') && (
            <>
              <div className="w-px h-5 bg-dark-500 self-center" />
              {(() => {
                const selfFirstName = user?.name.split(' ')[0] ?? 'Eu'
                const selfCount = investments.filter(inv => !inv.childId).length
                const selfActive = childFilter === '__self__'
                return (
                  <button
                    onClick={() => setChildFilter(selfActive ? null : '__self__')}
                    className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5',
                      selfActive ? 'bg-brand-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white border border-dark-500'
                    )}
                  >
                    <User size={12} /> {selfFirstName} ({selfCount})
                  </button>
                )
              })()}
              {linkedChildren.map(child => {
                const firstName = child.name.split(' ')[0]
                const count = investments.filter(inv => inv.childId === child.id).length
                const active = childFilter === child.id
                return (
                  <button key={child.id}
                    onClick={() => setChildFilter(active ? null : child.id)}
                    className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5',
                      active ? 'bg-purple-700 text-white' : 'bg-dark-700 text-gray-400 hover:text-white border border-dark-500'
                    )}
                  >
                    <Baby size={12} /> {firstName} ({count})
                  </button>
                )
              })}
            </>
          )}
        </div>
      ) : null}

      {/* ── Tab: A Transferir ─────────────────────────────────────── */}
      {!isChild && tab === 'a_transferir' && (
        deposits.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-4">💳</p>
            <p className="font-semibold text-white">Nenhum depósito ainda</p>
            <button onClick={() => navigate('/depositar')} className="mt-3 btn-primary text-sm px-6 py-2 flex items-center gap-2 mx-auto">
              <PiggyBank size={14} /> Fazer primeiro depósito
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {deposits.map(dep => {
              const isRegistering = registeringFor === dep.id
              const expiresAt = dep.confirmedAt ? depositExpiresAt(dep.confirmedAt) : null
              const daysLeft = expiresAt ? businessDaysUntil(expiresAt) : null
              const isReturned = dep.status === 'return_requested'
              const fullyAllocated = dep.status === 'confirmed' && dep.remainingNet <= 0

              return (
                <div key={dep.id} className={clsx('card transition-colors', isReturned && 'opacity-70')}>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-bold text-white text-lg">{fmt(dep.amount)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Depósito de {shortDate(dep.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {dep.status === 'awaiting_pix' && (
                        <span className="tag border bg-yellow-900/40 text-yellow-400 border-yellow-700/40 flex items-center gap-1">
                          <Clock size={10} /> Aguardando PIX
                        </span>
                      )}
                      {dep.status === 'confirmed' && !fullyAllocated && daysLeft !== null && (
                        <CountdownBadge daysLeft={daysLeft} />
                      )}
                      {fullyAllocated && (
                        <span className="tag border bg-emerald-900/40 text-emerald-400 border-emerald-700/40 flex items-center gap-1">
                          <CheckCircle size={10} /> Totalmente alocado
                        </span>
                      )}
                      {isReturned && (
                        <span className="tag border bg-gray-800 text-gray-400 border-gray-700 flex items-center gap-1">
                          <RotateCcw size={10} /> Devolução solicitada
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Countdown bar — only for confirmed, not expired, not fully allocated */}
                  {dep.status === 'confirmed' && !fullyAllocated && !isReturned && daysLeft !== null && (
                    <CountdownBar daysLeft={daysLeft} />
                  )}

                  {/* Confirmed deposit detail */}
                  {dep.status === 'confirmed' && (
                    <div className="mt-3 pt-3 border-t border-dark-500 space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500">Poins gerados</p>
                          <p className="text-brand-400 font-bold">P$ {dep.poinsAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Taxa</p>
                          <p className="text-gray-300">{fmt(dep.serviceFee)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">A transferir</p>
                          <p className={clsx('font-bold', dep.remainingNet > 0 ? 'text-emerald-400' : 'text-gray-500')}>
                            {fmt(dep.remainingNet)}
                          </p>
                        </div>
                      </div>

                      {/* Child allocations */}
                      {dep.childAllocations && dep.childAllocations.length > 0 && (
                        <div className="flex items-center justify-between gap-3 flex-wrap border-t border-dark-500 pt-3">
                          <div className="text-xs text-gray-400 space-y-0.5">
                            {dep.childAllocations.map(alloc => (
                              <p key={alloc.childId}>
                                <span className="text-white">{alloc.childName}:</span>{' '}
                                <span className="text-brand-400 font-semibold">P$ {alloc.poinsAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>{' '}
                                bloqueados
                              </p>
                            ))}
                          </div>
                          {dep.childAllocations.some(a => a.poinsAmount > 0) && (
                            <button
                              onClick={() => handleGenChildPoins(dep.id)}
                              disabled={generatingChildPoins === dep.id}
                              className="flex items-center gap-1.5 text-xs font-semibold bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/40 text-brand-300 px-3 py-1.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-wait flex-shrink-0"
                            >
                              {generatingChildPoins === dep.id
                                ? <><RefreshCw size={11} className="animate-spin" /> Gerando...</>
                                : <><Lock size={11} /> Gerar Poins (simulação)</>}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Return requested info */}
                      {isReturned && dep.returnRequestedAt && (
                        <div className="flex items-center gap-2 bg-dark-700 rounded-lg p-3 text-xs text-gray-400">
                          <RotateCcw size={12} className="text-gray-500 flex-shrink-0" />
                          <span>
                            Devolução solicitada em {shortDate(dep.returnRequestedAt)}.
                            A Pouplay processará o retorno em até 1 dia útil via PIX de origem.
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      {!isReturned && !fullyAllocated && dep.remainingNet > 0 && (
                        <>
                          {!isRegistering ? (
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => setRegisteringFor(dep.id)}
                                className="flex items-center gap-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition-all"
                              >
                                <Send size={11} /> Registrar transferência
                              </button>
                              <button
                                onClick={() => handleRequestReturn(dep.id)}
                                disabled={requestingReturn === dep.id}
                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-300 bg-dark-600 hover:bg-red-900/20 border border-dark-400 hover:border-red-700/50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                              >
                                {requestingReturn === dep.id
                                  ? <><RefreshCw size={11} className="animate-spin" /> Solicitando...</>
                                  : <><RotateCcw size={11} /> Solicitar devolução</>}
                              </button>
                            </div>
                          ) : (
                            <RegisterTransferForm
                              dep={dep}
                              onDone={handleRegisterDone}
                              onCancel={() => setRegisteringFor(null)}
                            />
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Awaiting PIX simulation */}
                  {dep.status === 'awaiting_pix' && (
                    <div className="mt-3 pt-3 border-t border-dark-500 flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-xs text-yellow-400/70 italic">
                        🧪 Apenas para testes — simula a confirmação do PIX pelo banco
                      </p>
                      <button
                        onClick={() => handleSimConfirmPix(dep.id)}
                        disabled={confirmingPix === dep.id}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-3 py-1.5 rounded-lg transition-all disabled:opacity-60"
                      >
                        {confirmingPix === dep.id
                          ? <><RefreshCw size={11} className="animate-spin" /> Confirmando...</>
                          : <><CheckCircle size={11} /> Confirmar PIX (simulação)</>}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            <button onClick={() => navigate('/depositar')} className="w-full py-2.5 text-sm text-brand-400 hover:text-brand-300 border border-brand-700/30 hover:border-brand-600 rounded-xl transition-all flex items-center justify-center gap-2">
              <PiggyBank size={14} /> Novo depósito <ChevronRight size={13} />
            </button>
          </div>
        )
      )}

      {/* ── Tab: Aguardando Confirmação ───────────────────────────── */}
      {(isChild || tab === 'aguardando') && (
        (() => {
          const list = visibleInvestments.filter(i => i.status === 'pending')
          return list.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-5xl mb-4">⏳</p>
              <p className="font-semibold text-white">Nenhuma transferência aguardando confirmação</p>
              <p className="text-sm mt-1">
                {isChild
                  ? 'Aguarde seu responsável registrar uma transferência em seu nome.'
                  : <>Registre uma transferência na aba <button onClick={() => setTab('a_transferir')} className="text-brand-400 underline">A Transferir</button>.</>}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map(inv => (
                <InvestmentCard
                  key={inv.id}
                  inv={inv}
                  isChild={isChild}
                  simulating={simulating}
                  onSimConfirm={handleSimConfirm}
                />
              ))}
            </div>
          )
        })()
      )}

      {/* ── Tab: Concluídos ───────────────────────────────────────── */}
      {!isChild && tab === 'concluidos' && (
        (() => {
          const list = visibleInvestments.filter(i => i.status === 'confirmed')
          return list.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-5xl mb-4">✅</p>
              <p className="font-semibold text-white">Nenhuma transferência concluída ainda</p>
              <p className="text-sm mt-1">As transferências confirmadas aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map(inv => (
                <InvestmentCard
                  key={inv.id}
                  inv={inv}
                  isChild={isChild}
                  simulating={simulating}
                  onSimConfirm={handleSimConfirm}
                />
              ))}
            </div>
          )
        })()
      )}

      {/* ── Child: show all their investments ─────────────────────── */}
      {isChild && visibleInvestments.filter(i => i.status === 'confirmed').length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Concluídos</p>
          {visibleInvestments.filter(i => i.status === 'confirmed').map(inv => (
            <InvestmentCard
              key={inv.id}
              inv={inv}
              isChild={isChild}
              simulating={simulating}
              onSimConfirm={handleSimConfirm}
            />
          ))}
        </div>
      )}

    </div>
  )
}

// ── Investment card (shared) ──────────────────────────────────────────────────

function InvestmentCard({
  inv, isChild, simulating, onSimConfirm,
}: {
  inv: Investment
  isChild: boolean
  simulating: string | null
  onSimConfirm: (id: string, poins: number, name: string, childId?: string) => void
}) {
  const isPending = inv.status === 'pending'
  const isSim = simulating === inv.id

  return (
    <div className="card hover:border-dark-400 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-dark-400">
          {inv.institutionLogo === '→' ? <ArrowRight size={16} /> : inv.institutionLogo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold text-white text-sm">{inv.productName}</p>
              <p className="text-xs text-gray-500">{inv.institution}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Valor</p>
              <p className="text-white font-bold text-sm">
                {inv.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={clsx('tag border flex items-center gap-1',
              isPending
                ? 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40'
                : 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40'
            )}>
              {isPending ? <><Clock size={11} /> Aguardando confirmação</> : <><CheckCircle size={11} /> Confirmado</>}
            </span>
            <span className="tag bg-dark-500 text-gray-400 flex items-center gap-1">
              <Lock size={10} />
              {isPending
                ? `P$ ${inv.poinsReleased.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} bloqueados`
                : `P$ ${inv.poinsReleased.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} liberados`}
            </span>
          </div>

          <p className="text-xs text-gray-600 mt-1.5">
            Registrado em {new Date(inv.investedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            {inv.confirmedAt && (
              <span className="text-emerald-600"> · Confirmado em {new Date(inv.confirmedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
            )}
          </p>

          <div className="mt-2 pt-2 border-t border-dark-600 space-y-1 text-xs text-gray-500">
            {inv.trackingId && (
              <div className="flex items-center gap-1.5">
                <Hash size={10} className="text-brand-500 flex-shrink-0" />
                <span>Rastreio: <span className="font-mono text-brand-400">{inv.trackingId}</span></span>
              </div>
            )}
            {inv.pixKey && (
              <div className="flex items-center gap-1.5">
                <Lock size={10} className="text-gray-500 flex-shrink-0" />
                <span>PIX destino: <span className="text-gray-300">{inv.pixKey}</span></span>
              </div>
            )}
            {!isChild && inv.beneficiaryName && (
              <div className="flex items-center gap-1.5">
                <User size={10} className="text-gray-500 flex-shrink-0" />
                <span>Beneficiário: <span className="text-gray-300">{inv.beneficiaryName}</span></span>
              </div>
            )}
          </div>

          {!isChild && isPending && (
            <button
              onClick={() => onSimConfirm(inv.id, inv.poinsReleased, inv.productName, inv.childId)}
              disabled={!!simulating}
              className="mt-3 flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/20 border border-brand-700/30 hover:border-brand-600 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              {isSim
                ? <><RefreshCw size={11} className="animate-spin" /> Confirmando...</>
                : <><Zap size={11} /> Simular confirmação bancária <span className="text-gray-500">(demo)</span></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
