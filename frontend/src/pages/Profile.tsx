import { useState } from 'react'
import { User, Phone, Mail, Calendar, Shield, ChevronRight, CheckCircle, Plus, X, Check, UserPlus, Trash2, Building2, KeyRound } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAdminStore, type ManagedUser, type ChildPixAccount } from '../store/adminStore'
import { useWalletStore } from '../store/walletStore'
import { Avatar } from '../components/Avatar'
import { PoinsDisplay } from '../components/PoinsDisplay'

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

// ── Modal: Adicionar filho ──────────────────────────────────────────────────
interface AddChildForm { name: string; email: string; cpf: string; birthDate: string }

function AddChildModal({ onSave, onClose }: { onSave: (f: AddChildForm) => void; onClose: () => void }) {
  const [form, setForm] = useState<AddChildForm>({ name: '', email: '', cpf: '', birthDate: '' })
  const set = (k: keyof AddChildForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))
  const valid = form.name.trim() && form.email.trim() && form.cpf.trim() && form.birthDate

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="font-bold text-white flex items-center gap-2">
            <UserPlus size={18} className="text-brand-400" /> Adicionar filho
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nome completo *</label>
            <input value={form.name} onChange={set('name')} placeholder="Ex: Lucas Silva" className="input-field w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">E-mail *</label>
            <input value={form.email} onChange={set('email')} type="email" placeholder="filho@email.com" className="input-field w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">CPF *</label>
            <input value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" className="input-field w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Data de nascimento *</label>
            <input value={form.birthDate} onChange={set('birthDate')} type="date" className="input-field w-full" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 bg-dark-700 hover:bg-dark-600 transition-colors">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!valid}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
            <Check size={15} /> Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal: Adicionar conta PIX ──────────────────────────────────────────────
interface AddPixForm { institutionId: string; pixKey: string }

function AddPixAccountModal({
  childName,
  onSave,
  onClose,
}: {
  childName: string
  onSave: (f: AddPixForm) => void
  onClose: () => void
}) {
  const { institutions } = useAdminStore()
  const [form, setForm] = useState<AddPixForm>({ institutionId: '', pixKey: '' })
  const valid = form.institutionId && form.pixKey.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="font-bold text-white flex items-center gap-2">
            <KeyRound size={18} className="text-brand-400" /> Conta PIX — {childName}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Banco / Corretora *</label>
            <select
              value={form.institutionId}
              onChange={e => setForm(f => ({ ...f, institutionId: e.target.value }))}
              className="input-field w-full"
            >
              <option value="">Selecione a instituição</option>
              {institutions.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">Somente instituições cadastradas na plataforma.</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Chave PIX *</label>
            <input
              value={form.pixKey}
              onChange={e => setForm(f => ({ ...f, pixKey: e.target.value }))}
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              className="input-field w-full"
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 bg-dark-700 hover:bg-dark-600 transition-colors">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={!valid}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
            <Check size={15} /> Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Seção de contas PIX de um filho ────────────────────────────────────────
function ChildPixAccounts({ child }: { child: ManagedUser }) {
  const { addPixAccount, removePixAccount } = useAdminStore()
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = (form: AddPixForm) => {
    const inst = useAdminStore.getState().institutions.find(i => i.id === form.institutionId)
    if (!inst) return
    addPixAccount(child.id, {
      institutionId: inst.id,
      institutionName: inst.name,
      pixKey: form.pixKey.trim(),
    })
    setShowAdd(false)
  }

  return (
    <>
      <div className="mx-5 mb-4 border border-dark-500 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-dark-700/50">
          <p className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <KeyRound size={11} /> Contas de investimento PIX
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 bg-brand-900/20 border border-brand-700/30 px-2 py-1 rounded-lg transition-all"
          >
            <Plus size={10} /> Adicionar
          </button>
        </div>

        {(child.pixAccounts ?? []).length === 0 ? (
          <div className="px-3 py-3 text-center">
            <p className="text-xs text-gray-500 italic">Nenhuma conta cadastrada.</p>
            <button onClick={() => setShowAdd(true)} className="text-[10px] text-brand-400 hover:underline mt-1">
              Cadastrar agora
            </button>
          </div>
        ) : (
          (child.pixAccounts ?? []).map((acc: ChildPixAccount) => (
            <div key={acc.id} className="flex items-center gap-3 px-3 py-2.5 border-t border-dark-600">
              <div className="w-6 h-6 rounded-md bg-brand-700/30 border border-brand-600/30 flex items-center justify-center flex-shrink-0">
                <Building2 size={11} className="text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-400">{acc.institutionName}</p>
                <p className="text-xs text-gray-200 font-mono truncate">{acc.pixKey}</p>
              </div>
              <button
                onClick={() => removePixAccount(child.id, acc.id)}
                className="p-1 rounded-md text-gray-600 hover:text-red-400 hover:bg-dark-600 transition-colors flex-shrink-0"
                title="Remover conta"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <AddPixAccountModal childName={child.name} onSave={handleAdd} onClose={() => setShowAdd(false)} />
      )}
    </>
  )
}

// ── Página principal ────────────────────────────────────────────────────────
export default function Profile() {
  const { user, switchProfileObj } = useAuthStore()
  const { users: allUsers, addUser } = useAdminStore()
  const { balance, totalCredited, totalPurchases } = useWalletStore()

  const [switched, setSwitched] = useState<string | null>(null)
  const [showAddChild, setShowAddChild] = useState(false)

  if (!user) return null

  const children: ManagedUser[] = allUsers.filter(u => u.linkedTo === user.id && u.role === 'menor')
  const parent: ManagedUser | undefined = user.role === 'menor'
    ? allUsers.find(u => u.id === user.linkedTo)
    : undefined

  const handleSwitch = (u: ManagedUser) => {
    switchProfileObj(u)
    setSwitched(u.id)
    setTimeout(() => setSwitched(null), 2000)
  }

  const handleAddChild = (form: AddChildForm) => {
    const initials = form.name.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    addUser({ name: form.name.trim(), email: form.email.trim(), cpf: form.cpf.trim(), birthDate: form.birthDate,
      role: 'menor', avatar: initials || '??', linkedTo: user.id, active: true, pixAccounts: [] })
    setShowAddChild(false)
  }

  const age = user.birthDate
    ? Math.floor((Date.now() - new Date(user.birthDate + 'T00:00:00').getTime()) / 31557600000)
    : null

  return (
    <div className="space-y-6">
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
            {age !== null && <p className="text-sm text-gray-400 mt-0.5">{age} anos</p>}
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <PoinsDisplay amount={balance} size="sm" />
                <p className="text-xs text-gray-500 mt-0.5">Saldo</p>
              </div>
              <div className="text-center">
                <PoinsDisplay amount={totalCredited()} size="sm" />
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
          <Field label="Data de nascimento"
            value={new Date(user.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}
            icon={<Calendar size={16} />} />
          <Field label="CPF" value={user.cpf} icon={<Shield size={16} />} />
        </div>
      </div>

      {/* ── Família ── */}
      {user.role === 'responsavel' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Família</h3>
            <button
              onClick={() => setShowAddChild(true)}
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/20 border border-brand-700/30 hover:border-brand-600 px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus size={13} /> Adicionar filho
            </button>
          </div>

          <div className="card divide-y divide-dark-500 p-0 overflow-hidden">
            {/* Responsável */}
            <div className="flex items-center gap-4 px-5 py-4">
              <Avatar initials={user.avatar} role={user.role} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-white text-sm">{user.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-emerald-900/40 text-emerald-400 border-emerald-700/40">Responsável</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-600 text-white">Ativo</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Filhos */}
            {children.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <p className="text-sm text-gray-500">Nenhum filho cadastrado.</p>
                <button onClick={() => setShowAddChild(true)} className="mt-2 text-xs text-brand-400 hover:underline">Adicionar agora</button>
              </div>
            ) : (
              children.map(child => (
                <div key={child.id} className="bg-dark-700/20">
                  {/* Cabeçalho do filho */}
                  <div className="flex items-center gap-4 px-5 py-4 pl-8">
                    <div className="w-0.5 h-10 bg-brand-700/40 rounded-full -ml-4 mr-2 flex-shrink-0" />
                    <Avatar initials={child.avatar} role={child.role} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white text-sm">{child.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-blue-900/40 text-blue-400 border-blue-700/40">Filho(a)</span>
                        {!child.active && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-red-900/40 text-red-400 border-red-700/40">Bloqueado</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{child.email}</p>
                      {child.cpf && <p className="text-xs text-gray-600">CPF: {child.cpf}</p>}
                      {child.birthDate && (
                        <p className="text-xs text-gray-600">
                          Nasc.: {new Date(child.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleSwitch(child)}
                      className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/20 hover:bg-brand-900/40 border border-brand-700/40 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                    >
                      {switched === child.id
                        ? <><CheckCircle size={12} /> Trocado!</>
                        : <>Trocar <ChevronRight size={12} /></>}
                    </button>
                  </div>

                  {/* Contas PIX do filho */}
                  <ChildPixAccounts child={child} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Responsável (visão do filho) */}
      {user.role === 'menor' && parent && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Responsável</h3>
          <div className="card">
            <div className="flex items-center gap-4">
              <Avatar initials={parent.avatar} role={parent.role} size="md" />
              <div className="flex-1">
                <p className="font-semibold text-white">{parent.name}</p>
                <p className="text-xs text-gray-400">Responsável</p>
                <p className="text-xs text-gray-500">{parent.email}</p>
              </div>
              <button
                onClick={() => handleSwitch(parent)}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/20 hover:bg-brand-900/40 border border-brand-700/40 px-3 py-1.5 rounded-lg transition-all"
              >
                {switched === parent.id ? <><CheckCircle size={12} /> Trocado!</> : <>Trocar <ChevronRight size={12} /></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configurações */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Configurações da conta</h3>
        <div className="card p-0 overflow-hidden divide-y divide-dark-500">
          {['Alterar senha', 'Notificações', 'Segurança e privacidade', 'Termos de uso', 'Política de privacidade'].map(item => (
            <button key={item} className="w-full flex items-center justify-between px-5 py-4 hover:bg-dark-600 transition-colors text-left">
              <span className="text-sm text-white">{item}</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          ))}
        </div>
      </div>

      {showAddChild && <AddChildModal onSave={handleAddChild} onClose={() => setShowAddChild(false)} />}
    </div>
  )
}
