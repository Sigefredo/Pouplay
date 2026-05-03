import { Link } from 'react-router-dom'
import { Gamepad2, Wallet, ArrowRight, ArrowUpRight, ArrowDownRight, Lock, PiggyBank, TrendingUp, BarChart2 } from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '../store/authStore'
import { OnboardingModal } from '../components/OnboardingModal'
import { useWalletStore } from '../store/walletStore'
import { useDepositStore } from '../store/depositStore'
import { useAdminStore } from '../store/adminStore'
import { PoinsDisplay } from '../components/PoinsDisplay'
import { Avatar } from '../components/Avatar'

const instColors: Record<string, string> = {
  BD: 'bg-blue-700', CI: 'bg-green-700', BF: 'bg-orange-700',
  XF: 'bg-purple-700', SB: 'bg-teal-700', B3: 'bg-red-700',
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function StatCard({ label, value, sub, icon, color }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; color: string
}) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  )
}

/* ── Dashboard do filho ────────────────────────────────────── */
function ChildDashboard() {
  const { user } = useAuthStore()
  const { balance, transactions, totalPurchases } = useWalletStore()
  const { investments } = useDepositStore()

  const myInvestments = investments.filter(inv => inv.childId === user?.id)
  const blockedPoins = myInvestments
    .filter(inv => inv.status === 'pending')
    .reduce((s, inv) => s + inv.poinsReleased, 0)
  const totalInvested = myInvestments.reduce((s, inv) => s + inv.amount, 0)

  // Agrupa investimentos por instituição
  const byInst = myInvestments.reduce((acc, inv) => {
    if (!acc[inv.institution]) acc[inv.institution] = { total: 0, logo: inv.institutionLogo, count: 0 }
    acc[inv.institution].total += inv.amount
    acc[inv.institution].count += 1
    return acc
  }, {} as Record<string, { total: number; logo: string; count: number }>)

  const recentTx = transactions.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-gray-400 text-sm">Bem-vindo de volta,</p>
        <h1 className="text-xl md:text-2xl font-extrabold text-white">{user?.name} 👋</h1>
      </div>

      {/* Saldo em Poins */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-dark-700 p-8 border border-brand-700/40 shadow-xl shadow-brand-900/40">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #a78bfa 0%, transparent 60%)' }} />
        <p className="text-brand-200 text-sm mb-2">Seus Poins disponíveis</p>
        <PoinsDisplay amount={balance} size="xl" className="!text-white" />
        <p className="text-brand-300/70 text-xs mt-2">P$ 1,00 = R$ 1,00 em jogos parceiros</p>

        {blockedPoins > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 w-fit">
            <Lock size={13} className="text-yellow-400" />
            <span className="text-xs text-yellow-300">
              P$ {blockedPoins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} bloqueados — aguardando confirmação
            </span>
          </div>
        )}

        <div className="mt-6">
          <Link to="/jogos" className="btn-primary text-sm py-2 px-5 bg-white/15 hover:bg-white/25 inline-flex items-center gap-2">
            <Gamepad2 size={14} /> Usar Poins em jogos
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Total investido pelo responsável"
          value={fmt(totalInvested)}
          sub={`${myInvestments.length} investimento${myInvestments.length !== 1 ? 's' : ''}`}
          icon={<TrendingUp size={18} className="text-emerald-400" />}
          color="bg-emerald-900/40"
        />
        <StatCard
          label="Gasto em jogos"
          value={`P$ ${totalPurchases().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          sub="total de compras"
          icon={<Gamepad2 size={18} className="text-brand-400" />}
          color="bg-brand-900/40"
        />
      </div>

      {/* Extrato por instituição */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Investimentos por instituição</h2>
          <Link to="/investimentos" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Ver extrato completo <ArrowRight size={14} />
          </Link>
        </div>
        {myInvestments.length === 0 ? (
          <div className="card text-center py-10 text-gray-500">
            <p className="text-3xl mb-2">📈</p>
            <p className="text-sm">Nenhum investimento ainda.</p>
            <p className="text-xs mt-1">Aguarde seu responsável investir em seu nome!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(byInst).map(([inst, { total, logo, count }]) => (
              <div key={inst} className="card py-3 flex items-center gap-3">
                <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0', instColors[logo] ?? 'bg-dark-400')}>
                  {logo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{inst}</p>
                  <p className="text-xs text-gray-400">{count} produto{count !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-sm font-bold text-emerald-400 flex-shrink-0">{fmt(total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Últimas movimentações */}
      {recentTx.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Últimas movimentações</h2>
            <Link to="/carteira" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card p-0 overflow-hidden divide-y divide-dark-500">
            {recentTx.map(tx => {
              const isPending = tx.status === 'pending' && tx.type === 'poins'
              return (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
                <span className="text-xl">{tx.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <PoinsDisplay amount={tx.amount} size="sm" showSign className={isPending ? '!text-yellow-400' : undefined} />
              </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Visão por filho (bloco no dashboard do pai) ───────────── */
function ChildrenOverview() {
  const { user } = useAuthStore()
  const adminUsers = useAdminStore(s => s.users)
  const { investments } = useDepositStore()

  const children = adminUsers.filter(u => u.linkedTo === user?.id && u.role === 'menor' && u.active !== false)
  if (children.length === 0) return null

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">Visão por filho</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map(child => {
          const childInvs = investments.filter(inv => inv.childId === child.id)
          const releasedPoins = childInvs.filter(inv => inv.status === 'confirmed').reduce((s, inv) => s + inv.poinsReleased, 0)
          const blockedPoins  = childInvs.filter(inv => inv.status === 'pending').reduce((s, inv) => s + inv.poinsReleased, 0)
          const totalInvested = childInvs.reduce((s, inv) => s + inv.amount, 0)

          return (
            <div key={child.id} className="card space-y-4">
              <div className="flex items-center gap-3">
                <Avatar initials={child.avatar} role={child.role} />
                <div>
                  <p className="font-semibold text-white">{child.name}</p>
                  <p className="text-xs text-gray-400">
                    Nascimento: {new Date(child.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-dark-500 text-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Investido</p>
                  <p className="text-sm font-bold text-white mt-0.5">{fmt(totalInvested)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Poins livres</p>
                  <p className="text-sm font-bold text-brand-400 mt-0.5">P$ {releasedPoins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Bloqueados</p>
                  <p className="text-sm font-bold text-yellow-400 mt-0.5">P$ {blockedPoins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {childInvs.length > 0 && (
                <div className="space-y-1.5">
                  {childInvs.slice(0, 3).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-gray-400 truncate">{inv.productName}</span>
                      <span className={clsx('flex-shrink-0 font-medium', inv.status === 'confirmed' ? 'text-emerald-400' : 'text-yellow-400')}>
                        {fmt(inv.amount)}
                      </span>
                    </div>
                  ))}
                  {childInvs.length > 3 && (
                    <p className="text-xs text-gray-500">+{childInvs.length - 3} investimento{childInvs.length - 3 !== 1 ? 's' : ''}</p>
                  )}
                </div>
              )}

              {childInvs.length === 0 && (
                <p className="text-xs text-gray-500 italic">Nenhum investimento ainda.</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Dashboard do responsável ──────────────────────────────── */
function ParentDashboard() {
  const { user, onboardedUserIds, markOnboarded } = useAuthStore()
  const { balance, blockedBalance, transactions, totalPurchases } = useWalletStore()
  const { availableNetBalance, deposits, investments } = useDepositStore()

  type MovementEntry = {
    id: string; date: string; icon: string; description: string
    detail?: string; kind: 'wallet' | 'investment' | 'deposit'
    isPending: boolean; tag: string; tagColor: string
    poinsAmount?: number; fiatAmount?: number
  }

  const walletTagLabels: Record<string, string> = { poins: 'Poins', purchase: 'Compra', fee: 'Taxa', transfer: 'Transferência' }
  const walletTagColors: Record<string, string> = {
    poins:    'bg-emerald-900/40 text-emerald-400 border-emerald-700/40',
    purchase: 'bg-brand-900/40 text-brand-400 border-brand-700/40',
    fee:      'bg-gray-800 text-gray-400 border-gray-700/40',
    transfer: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
  }

  const allMovements: MovementEntry[] = [
    ...transactions.map(tx => {
      const isPending = tx.status === 'pending' && tx.type === 'poins'
      return {
        id: tx.id, date: tx.date, icon: tx.icon, description: tx.description,
        detail: tx.detail, kind: 'wallet' as const, isPending,
        tag: isPending ? 'Poins bloqueados' : (walletTagLabels[tx.type] ?? tx.type),
        tagColor: isPending ? 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40' : (walletTagColors[tx.type] ?? walletTagColors.transfer),
        poinsAmount: tx.amount,
      }
    }),
    ...investments.map(inv => ({
      id: inv.id, date: inv.investedAt,
      icon: inv.status === 'confirmed' ? '✅' : '⏳',
      description: `Investimento — ${inv.productName}`,
      detail: inv.institution + (inv.beneficiaryName ? ` · ${inv.beneficiaryName}` : ''),
      kind: 'investment' as const,
      isPending: inv.status === 'pending',
      tag: inv.status === 'confirmed' ? 'Confirmado' : 'Pendente',
      tagColor: inv.status === 'confirmed'
        ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40'
        : 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40',
      fiatAmount: inv.amount,
    })),
    ...deposits.map(dep => ({
      id: dep.id, date: dep.createdAt,
      icon: dep.status === 'confirmed' ? '💳' : '⏳',
      description: 'Depósito via PIX',
      detail: dep.status === 'confirmed' ? 'PIX confirmado' : 'Aguardando PIX',
      kind: 'deposit' as const,
      isPending: dep.status === 'awaiting_pix',
      tag: 'Depósito',
      tagColor: dep.status === 'confirmed'
        ? 'bg-gray-800 text-gray-400 border-gray-700/40'
        : 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40',
      fiatAmount: dep.amount,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Only self-registered users have IDs starting with 'u_'; demo users (u0-u4) never see this
  const showOnboarding = !!user && user.id.startsWith('u_') && !onboardedUserIds.includes(user.id)

  return (
    <>
      {showOnboarding && (
        <OnboardingModal
          userName={user!.name}
          onDismiss={() => markOnboarded(user!.id)}
        />
      )}
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-gray-400 text-sm">Bem-vindo de volta,</p>
        <h1 className="text-xl md:text-2xl font-extrabold text-white">{user?.name} 👋</h1>
      </div>

      {/* Cards principais — lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Saldo em Poins */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-dark-700 p-8 border border-brand-700/40 shadow-xl shadow-brand-900/40 flex flex-col">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #a78bfa 0%, transparent 60%)' }} />
          <p className="text-brand-200 text-sm mb-2">Saldo total em Poins</p>
          <PoinsDisplay amount={balance} size="xl" className="!text-white" />
          <p className="text-brand-300/70 text-xs mt-2">P$ 1,00 = R$ 1,00 em jogos parceiros</p>
          {blockedBalance > 0 && (
            <div className="mt-3 flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 w-fit">
              <Lock size={13} className="text-yellow-400" />
              <span className="text-xs text-yellow-300">
                P$ {blockedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} bloqueados — aguardando confirmação
              </span>
            </div>
          )}
          <div className="flex gap-4 mt-auto pt-6">
            <Link to="/depositar" className="btn-primary text-sm py-2 px-4 bg-white/15 hover:bg-white/25">
              <PiggyBank size={14} className="inline mr-1" /> Depositar
            </Link>
            <Link to="/jogos" className="btn-secondary text-sm py-2 px-4 bg-white/10 hover:bg-white/20 border-0">
              🎮 Usar Poins
            </Link>
          </div>
        </div>

        {/* Disponível para investir */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 p-8 border border-emerald-600/40 shadow-xl shadow-emerald-900/40 flex flex-col">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #6ee7b7 0%, transparent 60%)' }} />
          <p className="text-emerald-100 text-sm mb-2">Disponível para investir</p>
          <p className="text-3xl md:text-4xl font-extrabold text-white">
            {availableNetBalance().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-emerald-200/60 text-xs mt-2">saldo líquido disponível para produtos financeiros</p>
          <div className="mt-auto pt-6">
            <Link to="/produtos" className="btn-primary text-sm py-2 px-4 bg-white/15 hover:bg-white/25 inline-flex items-center gap-1.5">
              Investir <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Gasto em jogos"
          value={`P$ ${totalPurchases().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          sub="total de compras"
          icon={<ArrowDownRight size={18} className="text-brand-400" />}
          color="bg-brand-900/40"
        />
        <StatCard
          label="Transações realizadas"
          value={transactions.length.toString()}
          sub="no extrato completo"
          icon={<Wallet size={18} className="text-blue-400" />}
          color="bg-blue-900/40"
        />
      </div>

      {/* Atalhos */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Acesso rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/depositar" className="card hover:border-brand-600 hover:bg-dark-600 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/40 flex items-center justify-center mb-3">
              <PiggyBank size={20} className="text-emerald-400" />
            </div>
            <p className="font-semibold text-white">Depositar via PIX</p>
            <p className="text-xs text-gray-400 mt-1">Deposite e defina os Poins dos seus filhos</p>
            <div className="flex items-center gap-1 text-brand-400 text-xs mt-3 group-hover:gap-2 transition-all">
              Depositar <ArrowRight size={12} />
            </div>
          </Link>

          <Link to="/jogos" className="card hover:border-brand-600 hover:bg-dark-600 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-brand-900/40 flex items-center justify-center mb-3">
              <Gamepad2 size={20} className="text-brand-400" />
            </div>
            <p className="font-semibold text-white">Jogos & Pacotes</p>
            <p className="text-xs text-gray-400 mt-1">Use Poins em Free Fire, Roblox e mais</p>
            <div className="flex items-center gap-1 text-brand-400 text-xs mt-3 group-hover:gap-2 transition-all">
              Ver jogos <ArrowRight size={12} />
            </div>
          </Link>

          <Link to="/carteira" className="card hover:border-brand-600 hover:bg-dark-600 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center mb-3">
              <Wallet size={20} className="text-blue-400" />
            </div>
            <p className="font-semibold text-white">Carteira</p>
            <p className="text-xs text-gray-400 mt-1">Extrato completo de todas as movimentações</p>
            <div className="flex items-center gap-1 text-brand-400 text-xs mt-3 group-hover:gap-2 transition-all">
              Ver extrato <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </div>

      {/* Visão consolidada por filho */}
      <ChildrenOverview />

      {/* Movimentações consolidadas */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-white mr-auto">Movimentações</h2>
          <Link
            to="/carteira"
            className="text-xs font-medium text-brand-300 bg-brand-900/30 border border-brand-700/40 hover:border-brand-500 px-3 py-1.5 rounded-lg transition-all"
          >
            em Poins
          </Link>
          <Link
            to="/investimentos"
            className="text-xs font-medium text-emerald-300 bg-emerald-900/20 border border-emerald-700/40 hover:border-emerald-500 px-3 py-1.5 rounded-lg transition-all"
          >
            em Investimentos
          </Link>
          <Link to="/carteira" className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-1 ml-1">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card p-0 overflow-hidden divide-y divide-dark-500">
          {allMovements.length === 0 && (
            <p className="text-sm text-gray-500 px-5 py-6 text-center">Nenhuma movimentação ainda.</p>
          )}
          {allMovements.map(entry => (
            <div key={entry.id} className="flex items-center gap-4 px-5 py-4 hover:bg-dark-600 transition-colors">
              <span className="text-xl flex-shrink-0">{entry.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-white truncate">{entry.description}</p>
                  <span className={clsx('tag border text-[10px]', entry.tagColor)}>{entry.tag}</span>
                </div>
                <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                  <span>
                    {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {entry.detail && <><span className="text-gray-600">·</span><span className="truncate">{entry.detail}</span></>}
                </div>
              </div>
              {entry.kind === 'wallet' && entry.poinsAmount !== undefined
                ? <PoinsDisplay amount={entry.poinsAmount} size="sm" showSign className={entry.isPending ? '!text-yellow-400' : undefined} />
                : <span className={clsx('text-sm font-semibold flex-shrink-0 whitespace-nowrap',
                    entry.kind === 'deposit' ? 'text-emerald-400' : entry.isPending ? 'text-yellow-400' : 'text-blue-400'
                  )}>
                    {fmt(entry.fiatAmount ?? 0)}
                  </span>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

/* ── Componente raiz ───────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuthStore()
  return user?.role === 'menor' ? <ChildDashboard /> : <ParentDashboard />
}
