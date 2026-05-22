import { useState } from 'react'
import { User, Phone, Mail, Calendar, Shield, ChevronRight, CheckCircle, Plus, X, Check, UserPlus, Trash2, Building2, KeyRound, Search, Info, Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAdminStore, type ManagedUser, type ChildPixAccount } from '../store/adminStore'
import { useWalletStore } from '../store/walletStore'
import { useProfileStore, type InvestmentAccount } from '../store/profileStore'
import { Avatar } from '../components/Avatar'
import { PoinsDisplay } from '../components/PoinsDisplay'
import { consultarCPF, serpro2isoDate, capitalizeName } from '../services/serpro'

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

// ── Modal: Adicionar filho (com validação SERPRO) ───────────────────────────
interface AddChildForm { name: string; email: string; cpf: string; birthDate: string }

type SerproStatus = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

function AddChildModal({ onSave, onClose }: { onSave: (f: AddChildForm) => void; onClose: () => void }) {
  const [form, setForm] = useState<AddChildForm>({ name: '', email: '', cpf: '', birthDate: '' })
  const [consent, setConsent] = useState(false)
  const [serproStatus, setSerproStatus] = useState<SerproStatus>('idle')
  const [serproMsg, setSerproMsg] = useState('')

  const setField = (k: keyof AddChildForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const cpfReady = form.cpf.replace(/\D/g, '').length === 11

  const handleConsultar = async () => {
    setSerproStatus('loading')
    setSerproMsg('')
    const result = await consultarCPF(form.cpf)
    if (result.ok) {
      setForm(f => ({
        ...f,
        name: capitalizeName(result.data.nome),
        birthDate: serpro2isoDate(result.data.nascimento),
      }))
      setSerproStatus('found')
      setSerproMsg(`Situação: ${result.data.situacao.descricao}`)
    } else {
      setSerproStatus(result.error.includes('não localizado') ? 'not_found' : 'error')
      setSerproMsg(result.error)
    }
  }

  const valid = form.name.trim() && form.email.trim() && form.cpf.trim() && form.birthDate

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[95vh]">
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="font-bold text-white flex items-center gap-2">
            <UserPlus size={18} className="text-brand-400" /> Adicionar filho
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">

          {/* CPF + consulta SERPRO */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">CPF *</label>
            <div className="flex gap-2">
              <input
                value={form.cpf}
                onChange={e => { setField('cpf')(e); setSerproStatus('idle') }}
                placeholder="000.000.000-00"
                className="input-field flex-1"
              />
              <button
                onClick={handleConsultar}
                disabled={!cpfReady || !consent || serproStatus === 'loading'}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {serproStatus === 'loading'
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Search size={13} />}
                {serproStatus === 'loading' ? 'Consultando...' : 'Consultar'}
              </button>
            </div>

            {/* Consentimento */}
            <label className="flex items-start gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="mt-0.5 accent-brand-500"
              />
              <span className="text-[11px] text-gray-400 leading-relaxed">
                Autorizo a consulta do CPF na base do{' '}
                <span className="text-brand-400 font-semibold">SERPRO</span>{' '}
                (Serviço Federal de Processamento de Dados) para validação dos dados cadastrais do menor, de forma consentida.
              </span>
            </label>

            {/* Feedback SERPRO */}
            {serproStatus === 'found' && (
              <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-700/30 rounded-lg px-3 py-2">
                <CheckCircle size={12} className="flex-shrink-0" />
                <span>CPF validado no SERPRO. {serproMsg}</span>
              </div>
            )}
            {(serproStatus === 'not_found' || serproStatus === 'error') && (
              <div className="flex items-start gap-2 mt-2 text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-3 py-2">
                <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                <span>{serproMsg} Preencha os dados manualmente.</span>
              </div>
            )}
          </div>

          {/* Nome — preenchido pelo SERPRO ou manual */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
              Nome completo *
              {serproStatus === 'found' && <span className="text-[10px] text-emerald-400">(via SERPRO)</span>}
            </label>
            <input
              value={form.name}
              onChange={setField('name')}
              placeholder="Ex: Lucas Silva"
              className="input-field w-full"
            />
          </div>

          {/* Data de nascimento — preenchida pelo SERPRO ou manual */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
              Data de nascimento *
              {serproStatus === 'found' && <span className="text-[10px] text-emerald-400">(via SERPRO)</span>}
            </label>
            <input
              value={form.birthDate}
              onChange={setField('birthDate')}
              type="date"
              className="input-field w-full"
            />
          </div>

          {/* E-mail — sempre manual */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">E-mail *</label>
            <input
              value={form.email}
              onChange={setField('email')}
              type="email"
              placeholder="filho@email.com"
              className="input-field w-full"
            />
          </div>

          <div className="flex items-start gap-2 bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-[11px] text-gray-500">
            <Info size={11} className="mt-0.5 flex-shrink-0 text-gray-400" />
            <span>A senha de acesso inicial será <strong className="text-gray-300">123456</strong>. O filho poderá alterá-la após o primeiro acesso.</span>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 bg-dark-700 hover:bg-dark-600 transition-colors">Cancelar</button>
          <button
            onClick={() => onSave(form)}
            disabled={!valid}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Check size={15} /> Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal: Adicionar conta PIX ──────────────────────────────────────────────
// ── Banner "Não encontrou sua instituição?" ────────────────────────────────
function BankRequestBanner() {
  const { user } = useAuthStore()
  const [open, setOpen]   = useState(false)
  const [name, setName]   = useState('')
  const [sent, setSent]   = useState(false)

  const handleSend = () => {
    if (!name.trim()) return
    const key = 'pouplay_bank_requests'
    const existing = JSON.parse(localStorage.getItem(key) ?? '[]')
    existing.push({ name: name.trim(), userId: user?.id ?? 'anon', createdAt: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(existing))
    setSent(true)
  }

  if (sent) return (
    <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
      <CheckCircle size={11} /> Solicitação registrada! Nossa equipe adicionará em breve.
    </p>
  )

  return (
    <div className="mt-1.5">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors underline-offset-2 hover:underline"
        >
          Não encontrou sua instituição? → Solicitar cadastro
        </button>
      ) : (
        <div className="flex gap-2 mt-1">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do banco ou fintech"
            className="input-field flex-1 text-xs py-1.5"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!name.trim()}
            className="text-xs px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition-colors"
          >
            Enviar
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setName('') }}
            className="text-xs px-2 py-1.5 rounded-lg bg-dark-600 hover:bg-dark-500 text-gray-400 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

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
            <BankRequestBanner />
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

// ── Modal: Conta de investimento próprio ────────────────────────────────────
interface InvestAccFormData { institutionId: string; institutionName: string; accountNumber: string; pixKey: string; holderName: string; holderCpf: string }

function InvestAccountModal({ mode, initial, onSave, onClose }: {
  mode: 'add' | 'edit'; initial: InvestAccFormData
  onSave: (d: InvestAccFormData) => void; onClose: () => void
}) {
  const { institutions } = useAdminStore()
  const [form, setForm] = useState<InvestAccFormData>(initial)
  const set = (k: keyof InvestAccFormData) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  const valid = form.institutionId && form.pixKey.trim() && form.holderName.trim() && form.holderCpf.trim()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Building2 size={18} className="text-brand-400" />
            {mode === 'add' ? 'Nova Conta de Investimento' : 'Editar Conta'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Instituição *</label>
            {institutions.length === 0 ? (
              <p className="text-xs text-yellow-400">Nenhuma instituição cadastrada. Acesse a área Admin para adicionar.</p>
            ) : (
              <select
                className="input-field w-full"
                value={form.institutionId}
                onChange={e => {
                  const inst = institutions.find(i => i.id === e.target.value)
                  setForm(f => ({ ...f, institutionId: e.target.value, institutionName: inst?.name ?? '' }))
                }}
              >
                <option value="">Selecione uma instituição</option>
                {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            )}
            <BankRequestBanner />
          </div>
          {[
            { key: 'accountNumber' as const, label: 'Número da conta', placeholder: 'Ex: 123456-7' },
            { key: 'pixKey' as const, label: 'Chave PIX *', placeholder: 'CPF, e-mail, telefone ou chave aleatória' },
            { key: 'holderName' as const, label: 'Nome do titular *', placeholder: 'Nome completo' },
            { key: 'holderCpf' as const, label: 'CPF do titular *', placeholder: '000.000.000-00' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-gray-400 mb-1 block">{label}</label>
              <input value={form[key]} onChange={set(key)} placeholder={placeholder} className="input-field w-full" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancelar</button>
          <button onClick={() => valid && onSave(form)} disabled={!valid} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-40">
            {mode === 'add' ? 'Adicionar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ────────────────────────────────────────────────────────
export default function Profile() {
  const { user, switchProfileObj, registerChild } = useAuthStore()
  const { users: allUsers, addUser } = useAdminStore()
  const { balance, totalPoinsReleased, totalPurchases } = useWalletStore()
  const { investmentAccounts, addAccount, updateAccount, removeAccount } = useProfileStore()

  const [switched, setSwitched] = useState<string | null>(null)
  const [showAddChild, setShowAddChild] = useState(false)
  const [investAccModal, setInvestAccModal] = useState<{ mode: 'add' } | { mode: 'edit'; account: InvestmentAccount } | null>(null)
  const [deleteAccTarget, setDeleteAccTarget] = useState<InvestmentAccount | null>(null)

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
    const id = `u_${Date.now()}`
    const initials = form.name.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    const childUser = {
      id,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      cpf: form.cpf.trim(),
      birthDate: form.birthDate,
      role: 'menor' as const,
      avatar: initials || '??',
      linkedTo: user.id,
      active: true,
    }
    addUser({ ...childUser, pixAccounts: [] })
    registerChild(childUser, '123456')
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

      {/* Aviso para perfil menor */}
      {user.role === 'menor' && (
        <div className="flex items-start gap-3 bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
          <Info size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-300">Perfil de menor de idade</p>
            <p className="text-xs text-blue-400/80 mt-0.5">
              Depósitos e aplicações em produtos financeiros são gerenciados exclusivamente pelo seu responsável.
              Você pode consultar seu extrato de investimentos e usar seus Poins em jogos parceiros.
            </p>
          </div>
        </div>
      )}

      {/* Perfil principal */}
      <div className="card">
        <div className="flex items-start gap-5">
          <Avatar initials={user.avatar} role={user.role} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
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
                <PoinsDisplay amount={totalPoinsReleased()} size="sm" />
                <p className="text-xs text-gray-500 mt-0.5">Poins recebidos</p>
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

      {/* ── Família (visão do responsável) ── */}
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
            </div>
          </div>
        </div>
      )}

      {/* Contas de Investimento — apenas responsável */}
      {user.role === 'responsavel' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contas de Investimento</h3>
            <button
              onClick={() => setInvestAccModal({ mode: 'add' })}
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/20 border border-brand-700/30 px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus size={13} /> Adicionar
            </button>
          </div>
          {investmentAccounts.length === 0 ? (
            <div className="card text-center py-6 space-y-1">
              <Building2 size={28} className="text-gray-600 mx-auto" />
              <p className="text-sm text-gray-400">Nenhuma conta cadastrada.</p>
              <p className="text-xs text-gray-500">Cadastre suas contas para investir em seu próprio nome.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {investmentAccounts.map(acc => (
                <div key={acc.id} className="card flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-900/40 border border-blue-700/30 flex items-center justify-center flex-shrink-0">
                      <Building2 size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0 text-xs space-y-0.5">
                      <p className="font-semibold text-white text-sm">{acc.institutionName}</p>
                      {acc.accountNumber && <p className="text-gray-400">Conta: {acc.accountNumber}</p>}
                      <p className="text-brand-400 font-mono truncate">PIX: {acc.pixKey}</p>
                      <p className="text-gray-500">{acc.holderName} · CPF {acc.holderCpf}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setInvestAccModal({ mode: 'edit', account: acc })}
                      className="p-1.5 text-gray-500 hover:text-brand-400 hover:bg-brand-900/20 rounded-lg transition-all"
                    ><KeyRound size={13} /></button>
                    <button
                      onClick={() => setDeleteAccTarget(acc)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                    ><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de conta de investimento */}
      {investAccModal && (
        <InvestAccountModal
          mode={investAccModal.mode}
          initial={investAccModal.mode === 'edit'
            ? { institutionId: investAccModal.account.institutionId, institutionName: investAccModal.account.institutionName, accountNumber: investAccModal.account.accountNumber, pixKey: investAccModal.account.pixKey, holderName: investAccModal.account.holderName, holderCpf: investAccModal.account.holderCpf }
            : { institutionId: '', institutionName: '', accountNumber: '', pixKey: '', holderName: user.name, holderCpf: user.cpf }}
          onSave={data => {
            if (investAccModal.mode === 'add') addAccount(data)
            else updateAccount(investAccModal.account.id, data)
            setInvestAccModal(null)
          }}
          onClose={() => setInvestAccModal(null)}
        />
      )}

      {/* Confirmação de exclusão de conta */}
      {deleteAccTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <p className="font-bold text-white">Remover conta</p>
            <p className="text-sm text-gray-300">Deseja remover a conta em <strong className="text-white">{deleteAccTarget.institutionName}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteAccTarget(null)} className="btn-secondary flex-1 py-2.5 text-sm">Cancelar</button>
              <button
                onClick={() => { removeAccount(deleteAccTarget.id); setDeleteAccTarget(null) }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
              >Remover</button>
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
