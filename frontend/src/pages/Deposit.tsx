import { useState, useEffect } from 'react'
import { Copy, Check, QrCode, Loader2, CheckCircle, ChevronRight, Lock, Users, ToggleLeft, ToggleRight } from 'lucide-react'
import clsx from 'clsx'
import { useDepositStore, type Deposit, type ChildAllocation } from '../store/depositStore'
import { useWalletStore } from '../store/walletStore'
import { FEATURES } from '../config/features'
import { useAuthStore } from '../store/authStore'
import { useAdminStore } from '../store/adminStore'

const PIX_KEY = 'pouplay@financeiro.com.br'
const SERVICE_FEE_RATE = 0.05

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function calc(amount: number, pct: number) {
  const poinsAmount  = parseFloat((amount * (pct / 100)).toFixed(2))
  const serviceFee   = parseFloat((poinsAmount * SERVICE_FEE_RATE).toFixed(2))
  const netAmount    = parseFloat((amount - poinsAmount - serviceFee).toFixed(2))
  return { poinsAmount, serviceFee, netAmount }
}

type Step = 'form' | 'pix' | 'done'

export default function Deposit() {
  const { addDeposit, confirmDeposit, deposits } = useDepositStore()
  const { blockPoins } = useWalletStore()
  const { user } = useAuthStore()
  const { users: allUsers } = useAdminStore()

  const children = allUsers.filter(u => u.linkedTo === user?.id && u.role === 'menor' && u.active !== false)

  const [step, setStep]                     = useState<Step>('form')
  const [amountCents, setAmountCents]       = useState(0)
  const [pct, setPct]                       = useState(10)
  const [childPcts, setChildPcts]           = useState<number[]>([])
  const [distributeToChildren, setDistributeToChildren] = useState(children.length > 0)
  const [copied, setCopied]                 = useState(false)
  const [processing, setProcessing]         = useState(false)
  const [currentId, setCurrentId]           = useState<string | null>(null)
  const [rawAmount, setRawAmount]           = useState(0)

  useEffect(() => {
    if (children.length === 0) return
    const equal = Math.floor(100 / children.length)
    setChildPcts(children.map((_, i) =>
      i < children.length - 1 ? equal : 100 - equal * (children.length - 1)
    ))
  }, [children.length])

  const numAmount = amountCents / 100
  const { poinsAmount, serviceFee, netAmount } = calc(numAmount, pct)
  const valid = numAmount >= 50 && netAmount > 0

  const updateChildPct = (idx: number, val: number) => {
    const next = [...childPcts]
    next[idx] = val
    const usedByOthers = next.slice(0, -1).reduce((a, b) => a + b, 0)
    next[children.length - 1] = Math.max(0, 100 - usedByOthers)
    setChildPcts(next)
  }

  const buildAllocations = (): ChildAllocation[] =>
    children.map((c, i) => ({
      childId: c.id,
      childName: c.name,
      percent: childPcts[i] ?? 0,
      poinsAmount: parseFloat((poinsAmount * ((childPcts[i] ?? 0) / 100)).toFixed(2)),
    }))

  const handleGenPix = () => {
    if (!valid) return
    const id = `dep_${Date.now()}`
    const d: Deposit = {
      id,
      amount: numAmount,
      poinsPercent: pct,
      poinsAmount,
      serviceFee,
      netAmount,
      remainingNet: netAmount,
      status: 'awaiting_pix',
      createdAt: new Date().toISOString(),
      childAllocations: distributeToChildren && children.length > 0 ? buildAllocations() : undefined,
    }
    addDeposit(d)
    setCurrentId(id)
    setRawAmount(numAmount)
    setStep('pix')
  }

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleSimConfirm = async () => {
    if (!currentId) return
    setProcessing(true)
    await new Promise(r => setTimeout(r, 1800))
    confirmDeposit(currentId)
    // Só bloqueia no walletStore do pai se os Poins NÃO foram distribuídos a filhos
    if (!distributeToChildren || children.length === 0) {
      const dep = deposits.find(d => d.id === currentId)
      const pa = dep?.poinsAmount ?? calc(rawAmount, pct).poinsAmount
      blockPoins(pa, `Poins gerados e bloqueados — depósito de ${fmt(rawAmount)}`)
    }
    setProcessing(false)
    setStep('done')
  }

  const handleNew = () => {
    setStep('form')
    setAmountCents(0)
    setPct(10)
    setDistributeToChildren(children.length > 0)
    setCurrentId(null)
  }

  // ── Etapa 1: Formulário ──────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Depositar via PIX</h1>
          <p className="text-gray-400 text-sm mt-1">
            Defina o valor e o percentual destinado a{' '}
            <span className="text-brand-400 font-semibold">P$ Poins</span>{' '}
            {children.length === 0 ? 'para você mesmo.' : children.length > 1 ? 'para seus filhos.' : 'para seu filho.'}
          </p>
        </div>

        <div className="card space-y-5">
          {/* Valor */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Valor do depósito (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={amountCents > 0 ? (amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '')
                  setAmountCents(parseInt(digits || '0', 10))
                }}
                onFocus={e => e.target.select()}
                className="input-field pl-9 text-lg font-bold"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Mínimo: R$ 50,00</p>
          </div>

          {/* Percentual total */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                % total destinado a Poins
              </label>
              <span className="text-brand-400 font-extrabold text-lg">{pct}%</span>
            </div>
            <input
              type="range"
              min={1} max={50} step={1}
              value={pct}
              onChange={e => setPct(Number(e.target.value))}
              className="w-full accent-brand-500 h-2"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1%</span><span>25%</span><span>50%</span>
            </div>
          </div>

          {/* Toggle: distribuir Poins para filhos ou manter para o pai */}
          {children.length > 0 && (
            <div
              className={clsx(
                'flex items-center justify-between rounded-xl border p-3.5 transition-colors',
                distributeToChildren
                  ? 'bg-brand-900/20 border-brand-700/40'
                  : 'bg-dark-800 border-dark-500'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Users size={15} className={distributeToChildren ? 'text-brand-400' : 'text-gray-500'} />
                <div>
                  <p className="text-sm font-medium text-white">Distribuir Poins para os filhos</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {distributeToChildren
                      ? `Os Poins irão para a conta do${children.length > 1 ? 's' : ''} seu${children.length > 1 ? 's' : ''} filho${children.length > 1 ? 's' : ''}`
                      : 'Os Poins ficam na sua conta para uso pessoal'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDistributeToChildren(v => !v)}
                className={clsx(
                  'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
                  distributeToChildren ? 'bg-brand-600' : 'bg-dark-500'
                )}
              >
                <span className={clsx(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200',
                  distributeToChildren ? 'translate-x-5' : 'translate-x-0'
                )} />
              </button>
            </div>
          )}

          {/* Distribuição por filho (apenas com 2+ filhos e toggle ativo) */}
          {distributeToChildren && children.length > 1 && numAmount >= 50 && poinsAmount > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-brand-400" />
                <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                  Distribuição de Poins por filho
                </p>
              </div>
              {children.map((child, i) => {
                const childPoins = parseFloat((poinsAmount * ((childPcts[i] ?? 0) / 100)).toFixed(2))
                const isLast = i === children.length - 1
                return (
                  <div key={child.id} className="bg-dark-700 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white">{child.name}</span>
                      <span className="text-brand-400 font-bold">
                        P$ {childPoins.toFixed(2)}
                        <span className="text-gray-500 font-normal text-xs ml-1">({childPcts[i] ?? 0}%)</span>
                      </span>
                    </div>
                    {!isLast ? (
                      <input
                        type="range"
                        min={0}
                        max={100 - (childPcts.slice(0, i).reduce((a, b) => a + b, 0))}
                        value={childPcts[i] ?? 0}
                        onChange={e => updateChildPct(i, Number(e.target.value))}
                        className="w-full accent-brand-500 h-1.5"
                      />
                    ) : (
                      <p className="text-xs text-gray-500">Calculado automaticamente pelo restante</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Cálculo resumo */}
          {numAmount >= 50 && (
            <div className="bg-dark-800 rounded-xl p-4 space-y-2.5 border border-dark-500">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Resumo</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valor depositado</span>
                <span className="text-white font-semibold">{fmt(numAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {!distributeToChildren || children.length === 0
                    ? `Seus Poins (${pct}%)`
                    : children.length > 1
                      ? `Poins para os filhos (${pct}%)`
                      : `Poins para seu filho (${pct}%)`}
                </span>
                <span className="text-brand-400 font-bold">P$ {poinsAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Taxa da plataforma (5% dos Poins)</span>
                <span className="text-gray-300">- {fmt(serviceFee)}</span>
              </div>
              <div className="border-t border-dark-500 pt-2.5 flex justify-between text-sm font-bold">
                <span className="text-white">Valor líquido para investir</span>
                <span className="text-emerald-400">{fmt(netAmount)}</span>
              </div>

              <div className="pt-1 flex items-start gap-2 text-xs text-gray-500">
                <Lock size={11} className="mt-0.5 flex-shrink-0 text-yellow-500" />
                <span>
                  Os <strong className="text-yellow-400">P$ {poinsAmount.toFixed(2)}</strong> ficam
                  bloqueados até a confirmação do investimento pelo banco/corretora.
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleGenPix}
            disabled={!valid}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <QrCode size={16} /> Gerar chave PIX <ChevronRight size={14} />
          </button>
        </div>
      </div>
    )
  }

  // ── Etapa 2: PIX ────────────────────────────────────────────────────────
  if (step === 'pix') {
    const dep = deposits.find(d => d.id === currentId)
    return (
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Realize o PIX</h1>
          <p className="text-gray-400 text-sm mt-1">
            Transfira exatamente o valor abaixo para a chave PIX da Pouplay.
          </p>
        </div>

        <div className="card space-y-5">
          <div className="text-center py-2">
            <p className="text-xs text-gray-400 mb-1">Valor a transferir</p>
            <p className="text-3xl font-extrabold text-white">{fmt(dep?.amount ?? rawAmount)}</p>
          </div>

          <div className="bg-dark-800 rounded-xl p-4 space-y-3 border border-dark-500">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chave PIX</p>
            <div className="flex items-center gap-3">
              <span className="flex-1 font-mono text-brand-300 font-bold text-sm break-all">{PIX_KEY}</span>
              <button
                onClick={handleCopyPix}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-400 bg-dark-700 border border-dark-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? <><Check size={12} className="text-emerald-400" /> Copiado!</> : <><Copy size={12} /> Copiar</>}
              </button>
            </div>
            <p className="text-xs text-gray-500">Titular: Pouplay Tecnologia Ltda. · CNPJ 00.000.000/0001-00</p>
          </div>

          <div className="bg-dark-800 rounded-xl p-4 space-y-2 border border-dark-500 text-xs">
            <p className="font-semibold text-gray-300">Após o PIX, o que acontece:</p>
            {dep?.childAllocations && dep.childAllocations.length > 1 ? (
              dep.childAllocations.map(alloc => (
                <p key={alloc.childId} className="text-gray-400">
                  • <strong className="text-brand-400">P$ {alloc.poinsAmount.toFixed(2)}</strong> serão bloqueados para <strong className="text-white">{alloc.childName}</strong>
                </p>
              ))
            ) : dep?.childAllocations && dep.childAllocations.length === 1 ? (
              <p className="text-gray-400">
                • <strong className="text-brand-400">P$ {dep.childAllocations[0].poinsAmount.toFixed(2)}</strong> serão bloqueados para <strong className="text-white">{dep.childAllocations[0].childName}</strong>
              </p>
            ) : (
              <p className="text-gray-400">
                • <strong className="text-brand-400">P$ {dep?.poinsAmount.toFixed(2) ?? poinsAmount.toFixed(2)}</strong> serão bloqueados na sua conta
              </p>
            )}
            <p className="text-gray-400">
              • <strong className="text-emerald-400">{fmt(dep?.netAmount ?? netAmount)}</strong> ficam disponíveis na Conta da Pouplay para investir
            </p>
            <p className="text-gray-400">• Os Poins são liberados após a confirmação do investimento pelo banco</p>
          </div>

          <button
            onClick={handleSimConfirm}
            disabled={processing}
            className="w-full py-2.5 text-sm font-semibold rounded-xl bg-dark-600 hover:bg-dark-500 border border-dark-400 text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {processing
              ? <><Loader2 size={14} className="animate-spin" /> Confirmando depósito...</>
              : '✓ Simular confirmação do PIX (demonstração)'}
          </button>
        </div>
      </div>
    )
  }

  // ── Etapa 3: Concluído ───────────────────────────────────────────────────
  const dep = deposits.find(d => d.id === currentId)
  return (
    <div className="space-y-6 max-w-lg">
      <div className="card text-center py-8 space-y-4">
        <CheckCircle size={56} className="text-emerald-400 mx-auto" />
        <div>
          <h2 className="text-xl font-extrabold text-white">Depósito confirmado!</h2>
          <p className="text-sm text-gray-400 mt-1">O saldo foi creditado na Conta da Pouplay.</p>
        </div>

        <div className="bg-dark-800 rounded-xl p-4 space-y-2 text-sm border border-dark-500 text-left">
          {dep?.childAllocations && dep.childAllocations.length > 1 ? (
            dep.childAllocations.map(alloc => (
              <div key={alloc.childId} className="flex justify-between">
                <span className="text-gray-400">Poins bloqueados — {alloc.childName}</span>
                <span className="text-yellow-400 font-bold flex items-center gap-1">
                  <Lock size={12} /> P$ {alloc.poinsAmount.toFixed(2)}
                </span>
              </div>
            ))
          ) : dep?.childAllocations && dep.childAllocations.length === 1 ? (
            <div className="flex justify-between">
              <span className="text-gray-400">Poins bloqueados — {dep.childAllocations[0].childName}</span>
              <span className="text-yellow-400 font-bold flex items-center gap-1">
                <Lock size={12} /> P$ {dep.childAllocations[0].poinsAmount.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-gray-400">Seus Poins bloqueados</span>
              <span className="text-yellow-400 font-bold flex items-center gap-1">
                <Lock size={12} /> P$ {dep?.poinsAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-dark-500 pt-2 mt-1">
            <span className="text-gray-400">Disponível para investir</span>
            <span className="text-emerald-400 font-bold">{fmt(dep?.netAmount ?? 0)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          {FEATURES.financialProducts
            ? <>Acesse <strong className="text-brand-400">Produtos Financeiros</strong> para escolher onde investir o valor disponível.</>
            : <>Acesse <strong className="text-brand-400">Meus Investimentos</strong> para acompanhar o extrato do depósito.</>}
        </p>

        <div className="flex gap-3">
          <button onClick={handleNew} className="btn-secondary flex-1 py-2.5 text-sm">
            Novo depósito
          </button>
          {FEATURES.financialProducts
            ? <a href="/produtos" className="btn-primary flex-1 py-2.5 text-sm text-center">Investir agora</a>
            : <a href="/investimentos" className="btn-primary flex-1 py-2.5 text-sm text-center">Ver extrato</a>}
        </div>
      </div>
    </div>
  )
}
