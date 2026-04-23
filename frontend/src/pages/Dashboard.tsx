import { Link } from 'react-router-dom'
import { Gamepad2, Wallet, ArrowRight, ArrowUpRight, ArrowDownRight, Lock, PiggyBank } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useWalletStore } from '../store/walletStore'
import { useDepositStore } from '../store/depositStore'
import { PoinsDisplay } from '../components/PoinsDisplay'
import { Avatar } from '../components/Avatar'
import { MOCK_USERS } from '../data/users'

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

export default function Dashboard() {
  const { user, linkedUser } = useAuthStore()
  const { balance, blockedBalance, transactions, totalPurchases } = useWalletStore()
  const { availableNetBalance } = useDepositStore()
  const linked = linkedUser()
  const recentTx = transactions.slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-gray-400 text-sm">Bem-vindo de volta,</p>
        <h1 className="text-xl md:text-2xl font-extrabold text-white">{user?.name} 👋</h1>
      </div>

      {/* Saldo principal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-dark-700 p-8 border border-brand-700/40 shadow-xl shadow-brand-900/40">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #a78bfa 0%, transparent 60%)' }} />
        <p className="text-brand-200 text-sm mb-2">Seu saldo total em Poins</p>
        <PoinsDisplay amount={balance} size="xl" className="!text-white" />
        <p className="text-brand-300/70 text-xs mt-2">P$ 1,00 = R$ 1,00 em jogos parceiros</p>

        {blockedBalance > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 w-fit">
            <Lock size={13} className="text-yellow-400" />
            <span className="text-xs text-yellow-300">
              P$ {blockedBalance.toFixed(2)} bloqueados — aguardando confirmação
            </span>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <Link to="/depositar" className="btn-primary text-sm py-2 px-4 bg-white/15 hover:bg-white/25">
            <PiggyBank size={14} className="inline mr-1" /> Depositar
          </Link>
          <Link to="/jogos" className="btn-secondary text-sm py-2 px-4 bg-white/10 hover:bg-white/20 border-0">
            🎮 Usar Poins
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Disponível para investir"
          value={availableNetBalance().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          sub="conta de garantia"
          icon={<ArrowUpRight size={18} className="text-emerald-400" />}
          color="bg-emerald-900/40"
        />
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
            <p className="text-xs text-gray-400 mt-1">Deposite e defina os Poins do seu filho</p>
            <div className="flex items-center gap-1 text-brand-400 text-xs mt-3 group-hover:gap-2 transition-all">
              Depositar <ArrowRight size={12} />
            </div>
          </Link>

          <Link to="/jogos" className="card hover:border-brand-600 hover:bg-dark-600 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-brand-900/40 flex items-center justify-center mb-3">
              <Gamepad2 size={20} className="text-brand-400" />
            </div>
            <p className="font-semibold text-white">Jogos & Pacotes</p>
            <p className="text-xs text-gray-400 mt-1">Use seus Poins em Free Fire, Roblox e mais</p>
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

      {/* Últimas transações */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Últimas movimentações</h2>
          <Link to="/carteira" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
        <div className="card p-0 overflow-hidden divide-y divide-dark-500">
          {recentTx.map(tx => (
            <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
              <span className="text-xl">{tx.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <PoinsDisplay amount={tx.amount} size="sm" showSign />
            </div>
          ))}
        </div>
      </div>

      {/* Perfis vinculados */}
      {linked && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Perfil vinculado</h2>
          <div className="card flex items-center gap-4">
            <Avatar initials={linked.avatar} role={linked.role} size="lg" />
            <div>
              <p className="font-semibold text-white">{linked.name}</p>
              <p className="text-xs text-gray-400">
                {linked.role === 'menor' ? 'Filho(a) vinculado(a)' : 'Responsável'}
              </p>
              {linked.birthDate && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Nascimento: {new Date(linked.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <div className="ml-auto">
              <span className="tag bg-brand-900/50 text-brand-300 border border-brand-700/40">
                {MOCK_USERS.find(u => u.id === linked.id)?.role === 'menor' ? '👦 Menor' : '👤 Adulto'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
