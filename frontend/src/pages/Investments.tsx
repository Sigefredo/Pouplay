import { useState } from 'react'
import { CheckCircle, Clock, Lock, RefreshCw, Zap, TrendingUp, PiggyBank, ChevronRight, Hash, User, Baby } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '../store/authStore'
import { MOCK_USERS } from '../data/users'
import { useDepositStore } from '../store/depositStore'
import { useWalletStore } from '../store/walletStore'
import { PoinsDisplay } from '../components/PoinsDisplay'

const instColors: Record<string, string> = {
  BD: 'bg-blue-700', CI: 'bg-green-700', BF: 'bg-orange-700',
  XF: 'bg-purple-700', SB: 'bg-teal-700', B3: 'bg-red-700',
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Investments() {
  const navigate = useNavigate()
  const { user, registeredUsers } = useAuthStore()
  const { deposits, investments, confirmInvestment, confirmDeposit, availableNetBalance, pendingInvestmentsCount, totalInvested } = useDepositStore()
  const { releasePoins, releasePoinsToChild, releaseAllBlockedPoins, blockPoins, blockPoinsForChild, transactions, balance } = useWalletStore()
  const blockedBalance = transactions
    .filter(t => t.type === 'poins' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0)
  const [simulating, setSimulating] = useState<string | null>(null)
  const [confirmingPix, setConfirmingPix] = useState<string | null>(null)
  const [generatingChildPoins, setGeneratingChildPoins] = useState<string | null>(null)
  const [tab, setTab] = useState<'investimentos' | 'depositos'>('investimentos')
  const [childFilter, setChildFilter] = useState<string | null>(null)

  const linkedChildren = [...MOCK_USERS, ...registeredUsers].filter(u => u.linkedTo === user?.id)

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
        if (alloc.poinsAmount > 0) {
          blockPoinsForChild(alloc.poinsAmount, alloc.childId, `Poins bloqueados — depósito de ${fmt(dep.amount)}`)
        }
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
      if (alloc.poinsAmount > 0) {
        blockPoinsForChild(alloc.poinsAmount, alloc.childId, `Poins bloqueados — depósito de ${fmt(dep.amount)}`)
      }
    })
    setGeneratingChildPoins(null)
  }

  const isChild = user?.role === 'menor'

  // Filho vê apenas seus próprios investimentos; pai filtra por filho selecionado ou vê todos
  const visibleInvestments = isChild
    ? investments.filter(inv => inv.childId === user?.id)
    : childFilter === '__self__'
      ? investments.filter(inv => !inv.childId)
      : childFilter
        ? investments.filter(inv => inv.childId === childFilter)
        : investments

  const myTotalInvested = isChild
    ? visibleInvestments.reduce((s, inv) => s + inv.amount, 0)
    : totalInvested()

  const myPendingCount = isChild
    ? visibleInvestments.filter(inv => inv.status === 'pending').length
    : pendingInvestmentsCount()

  const myBlockedPoins = isChild
    ? visibleInvestments.filter(inv => inv.status === 'pending').reduce((s, inv) => s + inv.poinsReleased, 0)
    : 0

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white">
          {isChild ? 'Meu Extrato de Investimentos' : 'Meus Investimentos'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {isChild
            ? 'Acompanhe os investimentos realizados em seu nome e seus '
            : 'Acompanhe depósitos, investimentos e os '}
          <span className="text-brand-400 font-semibold">P$ Poins</span>
          {isChild ? ' disponíveis.' : ' dos seus filhos.'}
        </p>
      </div>

      {/* Resumo */}
      {isChild ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Total investido</p>
            <p className="text-lg font-bold text-white">{fmt(myTotalInvested)}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Saldo em Poins</p>
            <div className="flex items-center gap-1">
              <PoinsDisplay amount={balance} size="md" className="!text-brand-400" />
            </div>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Poins bloqueados</p>
            <div className="flex items-center gap-1">
              <Lock size={12} className="text-yellow-400" />
              <PoinsDisplay amount={myBlockedPoins} size="md" className="!text-yellow-400" />
            </div>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Aguardando confirmação</p>
            <p className="text-lg font-bold text-yellow-400">{myPendingCount}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Disponível p/ investir</p>
            <p className="text-lg font-bold text-emerald-400">{fmt(availableNetBalance())}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Total investido</p>
            <p className="text-lg font-bold text-white">{fmt(totalInvested())}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Meu saldo em Poins</p>
            <div className="flex items-center gap-1">
              <PoinsDisplay amount={balance} size="md" className="!text-brand-400" />
            </div>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Confirmações pendentes</p>
            <p className="text-lg font-bold text-yellow-400">{pendingInvestmentsCount()}</p>
          </div>
        </div>
      )}

      {/* Como funciona — só para o pai */}
      {!isChild && (
        <div className="card bg-brand-900/10 border-brand-700/20 p-4 text-sm text-gray-400 space-y-2">
          <p className="font-semibold text-brand-300 flex items-center gap-2">
            <TrendingUp size={14} /> Como funciona a PouPlay
          </p>
          <div className="space-y-1.5 text-xs">
            <p><span className="text-brand-400 font-semibold">1.</span> <strong className="text-white">Deposite via PIX</strong> e defina o % de Poins para o seu filho</p>
            <p><span className="text-yellow-400 font-semibold">2.</span> <strong className="text-yellow-400">Poins ficam bloqueados</strong> até a confirmação da transferência</p>
            <p><span className="text-white font-semibold">3.</span> <strong className="text-white">Transfira o valor líquido</strong> para a conta corrente do seu filho</p>
            <p><span className="text-emerald-400 font-semibold">4.</span> Confirme a transferência → <strong className="text-emerald-400">Poins liberados</strong> para uso no filho</p>
          </div>
        </div>
      )}

      {/* Tabs — filho não tem aba de depósitos */}
      {!isChild && (
        <div className="flex gap-2 flex-wrap items-center">
          {(['depositos', 'investimentos'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all',
                tab === t ? 'bg-brand-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white border border-dark-500')}>
              {t === 'investimentos' ? `Investimentos (${investments.length})` : `Depósitos (${deposits.length})`}
            </button>
          ))}
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
                    selfActive
                      ? 'bg-brand-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:text-white border border-dark-500'
                  )}
                >
                  <User size={12} />
                  {selfFirstName} ({selfCount})
                </button>
              )
            })()}
            {linkedChildren.map(child => {
              const firstName = child.name.split(' ')[0]
              const count = investments.filter(inv => inv.childId === child.id).length
              const active = childFilter === child.id
              return (
                <button
                  key={child.id}
                  onClick={() => setChildFilter(active ? null : child.id)}
                  className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5',
                    active
                      ? 'bg-purple-700 text-white'
                      : 'bg-dark-700 text-gray-400 hover:text-white border border-dark-500'
                  )}
                >
                  <Baby size={12} />
                  {firstName} ({count})
                </button>
              )
            })}
          </>
        </div>
      )}

      {/* Aviso de Poins bloqueados sem investimento vinculado */}
      {!isChild && blockedBalance > 0 && visibleInvestments.filter(i => i.status === 'pending').length === 0 && (
        <div className="card border-yellow-700/30 bg-yellow-900/10 flex items-start gap-3">
          <Lock size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-yellow-300">Poins bloqueados sem investimento vinculado</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">
              Há P$ {blockedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} bloqueados que não possuem investimento pendente associado. Isso pode ocorrer quando o depósito foi confirmado mas o investimento foi cancelado ou não registrado.
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

      {/* ── Lista de investimentos ── */}
      {(isChild || tab === 'investimentos') && (
        visibleInvestments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-4">📈</p>
            <p className="font-semibold text-white">Nenhum investimento ainda</p>
            <p className="text-sm mt-1">
              {isChild
                ? 'Aguarde seu responsável realizar investimentos em seu nome.'
                : <>Primeiro <button onClick={() => navigate('/depositar')} className="text-brand-400 underline">deposite via PIX</button> e transfira o valor para a conta do seu filho.</>}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleInvestments.map(inv => {
              const isPending = inv.status === 'pending'
              const isSim = simulating === inv.id
              return (
                <div key={inv.id} className="card hover:border-dark-400 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0', instColors[inv.institutionLogo] ?? 'bg-dark-400')}>
                      {inv.institutionLogo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-white text-sm">{inv.productName}</p>
                          <p className="text-xs text-gray-500">{inv.institution}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Valor investido</p>
                          <p className="text-white font-bold text-sm">{fmt(inv.amount)}</p>
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
                          {isPending ? `P$ ${inv.poinsReleased.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} bloqueados` : `P$ ${inv.poinsReleased.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} liberados`}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mt-1.5">
                        Investido em {new Date(inv.investedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {inv.confirmedAt && (
                          <span className="text-emerald-600"> · Confirmado em {new Date(inv.confirmedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                        )}
                      </p>

                      {/* Rastreio e beneficiário */}
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
                            <span>Beneficiário: <span className="text-gray-300">{inv.beneficiaryName}</span> · CPF {inv.beneficiaryCpf}</span>
                          </div>
                        )}
                      </div>

                      {/* Simulação de confirmação — apenas para o responsável */}
                      {!isChild && isPending && (
                        <button
                          onClick={() => handleSimConfirm(inv.id, inv.poinsReleased, inv.productName, inv.childId)}
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
            })}
          </div>
        )
      )}

      {/* ── Aba Depósitos — apenas para o pai ── */}
      {!isChild && tab === 'depositos' && (
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
            {deposits.map(dep => (
              <div key={dep.id} className="card hover:border-dark-400 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-white">{fmt(dep.amount)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(dep.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={clsx('tag border',
                    dep.status === 'confirmed'
                      ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40'
                      : 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40'
                  )}>
                    {dep.status === 'confirmed' ? '✓ PIX confirmado' : '⏳ Aguardando PIX'}
                  </span>
                </div>
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
                        <p className="text-gray-500">Saldo restante</p>
                        <p className="text-emerald-400 font-bold">{fmt(dep.remainingNet)}</p>
                      </div>
                    </div>
                    {dep.childAllocations && dep.childAllocations.length > 0 && (
                      <div className="flex items-center justify-between gap-3 flex-wrap border-t border-dark-500 pt-3">
                        <div className="text-xs text-gray-400 space-y-0.5">
                          <p className="text-yellow-400/80 italic font-medium">🧪 Apenas para testes</p>
                          {dep.childAllocations.map(alloc => (
                            <p key={alloc.childId}>
                              <span className="text-white">{alloc.childName}:</span>{' '}
                              <span className="text-brand-400 font-semibold">P$ {alloc.poinsAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>{' '}
                              bloqueados
                            </p>
                          ))}
                        </div>
                        <button
                          onClick={() => handleGenChildPoins(dep.id)}
                          disabled={generatingChildPoins === dep.id}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/40 text-brand-300 px-3 py-1.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-wait flex-shrink-0"
                        >
                          {generatingChildPoins === dep.id
                            ? <><RefreshCw size={11} className="animate-spin" /> Gerando...</>
                            : <><Lock size={11} /> Gerar Poins bloqueados (simulação)</>
                          }
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {dep.status === 'awaiting_pix' && (
                  <div className="mt-3 pt-3 border-t border-dark-500 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-yellow-400/70 italic">
                      🧪 Apenas para testes — simula a confirmação do PIX pelo banco
                    </p>
                    <button
                      onClick={() => handleSimConfirmPix(dep.id)}
                      disabled={confirmingPix === dep.id}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-3 py-1.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-wait"
                    >
                      {confirmingPix === dep.id
                        ? <><RefreshCw size={11} className="animate-spin" /> Confirmando...</>
                        : <><CheckCircle size={11} /> Confirmar PIX (simulação)</>
                      }
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button onClick={() => navigate('/depositar')} className="w-full py-2.5 text-sm text-brand-400 hover:text-brand-300 border border-brand-700/30 hover:border-brand-600 rounded-xl transition-all flex items-center justify-center gap-2">
              <PiggyBank size={14} /> Novo depósito <ChevronRight size={13} />
            </button>
          </div>
        )
      )}
    </div>
  )
}
