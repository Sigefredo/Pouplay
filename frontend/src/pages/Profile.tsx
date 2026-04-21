import { useState } from 'react'
import { User, Phone, Mail, Calendar, Shield, ChevronRight, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useWalletStore } from '../store/walletStore'
import { Avatar } from '../components/Avatar'
import { PoinsDisplay } from '../components/PoinsDisplay'
import { MOCK_USERS } from '../data/users'

function Field({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-dark-500 last:border-0">
      <div className="w-8 text-gray-500">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, linkedUser, switchProfile } = useAuthStore()
  const { balance, totalCashback, totalPurchases } = useWalletStore()
  const linked = linkedUser()
  const [switched, setSwitched] = useState(false)

  if (!user) return null

  const handleSwitch = (id: string) => {
    switchProfile(id)
    setSwitched(true)
    setTimeout(() => setSwitched(false), 2000)
  }

  const age = user.birthDate
    ? Math.floor((Date.now() - new Date(user.birthDate + 'T00:00:00').getTime()) / 31557600000)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white">Perfil</h1>
        <p className="text-gray-400 text-sm mt-1">Seus dados e contas vinculadas.</p>
      </div>

      {/* Perfil principal */}
      <div className="card">
        <div className="flex items-start gap-5">
          <Avatar initials={user.avatar} role={user.role} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span className={`tag ${user.role === 'responsavel' ? 'bg-blue-900/40 text-blue-400' : 'bg-brand-900/40 text-brand-400'}`}>
                {user.role === 'responsavel' ? '👤 Responsável' : '👦 Perfil menor'}
              </span>
            </div>
            {age !== null && (
              <p className="text-sm text-gray-400 mt-0.5">{age} anos</p>
            )}
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <PoinsDisplay amount={balance} size="sm" />
                <p className="text-xs text-gray-500 mt-0.5">Saldo</p>
              </div>
              <div className="text-center">
                <PoinsDisplay amount={totalCashback()} size="sm" />
                <p className="text-xs text-gray-500 mt-0.5">Cashback total</p>
              </div>
              <div className="text-center">
                <PoinsDisplay amount={-totalPurchases()} size="sm" showSign />
                <p className="text-xs text-gray-500 mt-0.5">Gasto em jogos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dados pessoais */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Dados pessoais</h3>
        <div className="card p-0 overflow-hidden">
          <Field label="Nome completo" value={user.name} icon={<User size={16} />} />
          <Field label="E-mail" value={user.email} icon={<Mail size={16} />} />
          {user.phone && <Field label="Telefone" value={user.phone} icon={<Phone size={16} />} />}
          <Field
            label="Data de nascimento"
            value={new Date(user.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}
            icon={<Calendar size={16} />}
          />
          <Field label="CPF" value={user.cpf} icon={<Shield size={16} />} />
        </div>
      </div>

      {/* Contas vinculadas */}
      {linked && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Conta vinculada</h3>
          <div className="card">
            <div className="flex items-center gap-4">
              <Avatar initials={linked.avatar} role={linked.role} size="md" />
              <div className="flex-1">
                <p className="font-semibold text-white">{linked.name}</p>
                <p className="text-xs text-gray-400">
                  {linked.role === 'menor' ? 'Filho(a) · Perfil menor' : 'Responsável'}
                </p>
                <p className="text-xs text-gray-500">{linked.email}</p>
              </div>
              <button
                onClick={() => handleSwitch(linked.id)}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/20 hover:bg-brand-900/40 border border-brand-700/40 px-3 py-1.5 rounded-lg transition-all"
              >
                {switched
                  ? <><CheckCircle size={12} /> Trocado!</>
                  : <>Trocar perfil <ChevronRight size={12} /></>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Todos os perfis (para responsável) */}
      {user.role === 'responsavel' && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Todos os perfis</h3>
          <div className="space-y-2">
            {MOCK_USERS.map(u => (
              <div
                key={u.id}
                className={`card flex items-center gap-4 ${u.id === user.id ? 'border-brand-700/50' : ''}`}
              >
                <Avatar initials={u.avatar} role={u.role} />
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.id === user.id && (
                    <span className="tag bg-brand-600 text-white text-[10px]">Ativo</span>
                  )}
                  <span className={`tag ${u.role === 'responsavel' ? 'bg-blue-900/40 text-blue-400' : 'bg-brand-900/40 text-brand-300'}`}>
                    {u.role === 'responsavel' ? 'Responsável' : 'Menor'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configurações */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Configurações da conta</h3>
        <div className="card p-0 overflow-hidden divide-y divide-dark-500">
          {[
            'Alterar senha',
            'Notificações',
            'Segurança e privacidade',
            'Termos de uso',
            'Política de privacidade',
          ].map(item => (
            <button
              key={item}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-dark-600 transition-colors text-left"
            >
              <span className="text-sm text-white">{item}</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
