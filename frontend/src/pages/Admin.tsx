import { useState } from 'react'
import {
  ShieldCheck, Building2, Gamepad2, Users, Plus, ChevronDown, ChevronRight,
  Pencil, Trash2, Star, Tag, X, Check, AlertTriangle,
} from 'lucide-react'
import clsx from 'clsx'
import { useAdminStore, AdminInstitution, AdminProduct, AdminGamePartner, AdminPackage, ProductType, TagColor, DeliveryMethod } from '../store/adminStore'
import { useDepositStore } from '../store/depositStore'
import { MOCK_USERS } from '../data/users'

type Tab = 'parceiros' | 'jogos' | 'usuarios'

const PRODUCT_TYPES: ProductType[] = ['CDB', 'LCA', 'LCI', 'Tesouro Direto', 'Fundo DI', 'Poupança+']
const TAG_COLORS: { value: TagColor; label: string; cls: string }[] = [
  { value: 'green',  label: 'Verde',   cls: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40' },
  { value: 'blue',   label: 'Azul',    cls: 'bg-blue-900/40 text-blue-400 border-blue-700/40' },
  { value: 'purple', label: 'Roxo',    cls: 'bg-purple-900/40 text-purple-400 border-purple-700/40' },
  { value: 'orange', label: 'Laranja', cls: 'bg-orange-900/40 text-orange-400 border-orange-700/40' },
  { value: 'pink',   label: 'Rosa',    cls: 'bg-pink-900/40 text-pink-400 border-pink-700/40' },
]

function tagCls(color?: TagColor) {
  return TAG_COLORS.find(t => t.value === color)?.cls ?? 'bg-dark-500 text-gray-400 border-dark-400'
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Institution Form ─────────────────────────────────────────────────────────

interface InstFormData {
  name: string
  cnpj: string
  pixKey: string
  commissionPercent: string
}

const emptyInstForm = (): InstFormData => ({ name: '', cnpj: '', pixKey: '', commissionPercent: '' })

function instToForm(i: AdminInstitution): InstFormData {
  return { name: i.name, cnpj: i.cnpj, pixKey: i.pixKey, commissionPercent: String(i.commissionPercent) }
}

interface InstModalProps {
  mode: 'add' | 'edit'
  initial: InstFormData
  onSave: (data: InstFormData) => void
  onClose: () => void
}

function InstitutionModal({ mode, initial, onSave, onClose }: InstModalProps) {
  const [form, setForm] = useState<InstFormData>(initial)
  const set = (k: keyof InstFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const valid = form.name.trim() && form.cnpj.trim() && form.pixKey.trim() && form.commissionPercent.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Building2 size={18} className="text-brand-400" />
            {mode === 'add' ? 'Nova Instituição' : 'Editar Instituição'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nome *</label>
            <input value={form.name} onChange={set('name')} placeholder="Ex: Banco Digital Plus"
              className="input-field w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">CNPJ *</label>
            <input value={form.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0001-00"
              className="input-field w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Chave PIX *</label>
            <input value={form.pixKey} onChange={set('pixKey')} placeholder="email@banco.com.br ou CNPJ"
              className="input-field w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Comissão % *</label>
            <input value={form.commissionPercent} onChange={set('commissionPercent')} type="number" min="0" step="0.1" placeholder="5"
              className="input-field w-full" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 bg-dark-700 hover:bg-dark-600 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onSave(form)} disabled={!valid}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
            <Check size={15} /> Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Product Form ─────────────────────────────────────────────────────────────

interface ProdFormData {
  name: string
  type: ProductType
  rate: string
  minValue: string
  tag: string
  tagColor: TagColor | ''
  popular: boolean
}

const emptyProdForm = (): ProdFormData => ({
  name: '', type: 'CDB', rate: '', minValue: '', tag: '', tagColor: '', popular: false,
})

function prodToForm(p: AdminProduct): ProdFormData {
  return {
    name: p.name, type: p.type, rate: p.rate, minValue: String(p.minValue),
    tag: p.tag ?? '', tagColor: p.tagColor ?? '', popular: p.popular,
  }
}

interface ProdModalProps {
  mode: 'add' | 'edit'
  initial: ProdFormData
  onSave: (data: ProdFormData) => void
  onClose: () => void
}

function ProductModal({ mode, initial, onSave, onClose }: ProdModalProps) {
  const [form, setForm] = useState<ProdFormData>(initial)
  const setField = (k: keyof ProdFormData, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const valid = form.name.trim() && form.rate.trim() && form.minValue.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Tag size={18} className="text-brand-400" />
            {mode === 'add' ? 'Novo Produto' : 'Editar Produto'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nome do produto *</label>
            <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Ex: CDB Premium 120% CDI"
              className="input-field w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tipo *</label>
              <select value={form.type} onChange={e => setField('type', e.target.value as ProductType)}
                className="input-field w-full">
                {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Taxa *</label>
              <input value={form.rate} onChange={e => setField('rate', e.target.value)} placeholder="120% CDI"
                className="input-field w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Valor mínimo (R$) *</label>
            <input value={form.minValue} onChange={e => setField('minValue', e.target.value)} type="number" min="0" step="1" placeholder="1000"
              className="input-field w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tag (opcional)</label>
              <input value={form.tag} onChange={e => setField('tag', e.target.value)} placeholder="Ex: Mais rentável"
                className="input-field w-full" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Cor da tag</label>
              <select value={form.tagColor} onChange={e => setField('tagColor', e.target.value as TagColor | '')}
                className="input-field w-full">
                <option value="">Nenhuma</option>
                {TAG_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={form.popular} onChange={e => setField('popular', e.target.checked)}
              className="w-4 h-4 accent-brand-500" />
            <span className="text-sm text-gray-300 flex items-center gap-1.5">
              <Star size={13} className="text-yellow-400" /> Marcar como popular
            </span>
          </label>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 bg-dark-700 hover:bg-dark-600 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onSave(form)} disabled={!valid}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
            <Check size={15} /> Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Game Partner Form ─────────────────────────────────────────────────────────

interface GpFormData {
  name: string
  apiKey: string
  merchantId: string
}

const emptyGpForm = (): GpFormData => ({ name: '', apiKey: '', merchantId: '' })

function gpToForm(g: AdminGamePartner): GpFormData {
  return { name: g.name, apiKey: g.apiKey, merchantId: g.merchantId }
}

interface GpModalProps {
  mode: 'add' | 'edit'
  initial: GpFormData
  onSave: (data: GpFormData) => void
  onClose: () => void
}

function GamePartnerModal({ mode, initial, onSave, onClose }: GpModalProps) {
  const [form, setForm] = useState<GpFormData>(initial)
  const set = (k: keyof GpFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Gamepad2 size={18} className="text-brand-400" />
            {mode === 'add' ? 'Novo Parceiro de Jogos' : 'Editar Parceiro de Jogos'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nome *</label>
            <input value={form.name} onChange={set('name')} placeholder="Ex: Garena"
              className="input-field w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">API Key</label>
            <input value={form.apiKey} onChange={set('apiKey')} placeholder="Fornecida pelo parceiro"
              className="input-field w-full font-mono" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Merchant ID</label>
            <input value={form.merchantId} onChange={set('merchantId')} placeholder="Fornecido pelo parceiro"
              className="input-field w-full font-mono" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 bg-dark-700 hover:bg-dark-600 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onSave(form)} disabled={!form.name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
            <Check size={15} /> Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Package Form ──────────────────────────────────────────────────────────────

interface PkgFormData {
  gameId: string
  gameName: string
  packageName: string
  coinAmount: string
  coinName: string
  pricePoins: string
  deliveryMethod: DeliveryMethod
  active: boolean
}

const emptyPkgForm = (): PkgFormData => ({
  gameId: '', gameName: '', packageName: '', coinAmount: '', coinName: '',
  pricePoins: '', deliveryMethod: 'account_credit', active: true,
})

function pkgToForm(p: AdminPackage): PkgFormData {
  return {
    gameId: p.gameId, gameName: p.gameName, packageName: p.packageName,
    coinAmount: String(p.coinAmount), coinName: p.coinName,
    pricePoins: String(p.pricePoins), deliveryMethod: p.deliveryMethod, active: p.active,
  }
}

interface PkgModalProps {
  mode: 'add' | 'edit'
  initial: PkgFormData
  onSave: (data: PkgFormData) => void
  onClose: () => void
}

function PackageModal({ mode, initial, onSave, onClose }: PkgModalProps) {
  const [form, setForm] = useState<PkgFormData>(initial)
  const setField = (k: keyof PkgFormData, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const valid = form.gameId.trim() && form.gameName.trim() && form.packageName.trim()
    && form.coinAmount.trim() && form.coinName.trim() && form.pricePoins.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Gamepad2 size={18} className="text-brand-400" />
            {mode === 'add' ? 'Novo Pacote' : 'Editar Pacote'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ID do jogo *</label>
              <input value={form.gameId} onChange={e => setField('gameId', e.target.value)} placeholder="freefire"
                className="input-field w-full font-mono" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nome do jogo *</label>
              <input value={form.gameName} onChange={e => setField('gameName', e.target.value)} placeholder="Free Fire"
                className="input-field w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nome do pacote *</label>
            <input value={form.packageName} onChange={e => setField('packageName', e.target.value)} placeholder="100 Diamantes"
              className="input-field w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Quantidade *</label>
              <input value={form.coinAmount} onChange={e => setField('coinAmount', e.target.value)} type="number" min="1" placeholder="100"
                className="input-field w-full" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Moeda *</label>
              <input value={form.coinName} onChange={e => setField('coinName', e.target.value)} placeholder="Diamantes"
                className="input-field w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Preço (R$) *</label>
            <input value={form.pricePoins} onChange={e => setField('pricePoins', e.target.value)} type="number" min="0" step="0.01" placeholder="9.90"
              className="input-field w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Método de entrega</label>
            <select value={form.deliveryMethod} onChange={e => setField('deliveryMethod', e.target.value as DeliveryMethod)}
              className="input-field w-full">
              <option value="account_credit">Crédito em conta</option>
              <option value="redeem_code">Código resgatável</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={form.active} onChange={e => setField('active', e.target.checked)}
              className="w-4 h-4 accent-brand-500" />
            <span className="text-sm text-gray-300">Pacote ativo</span>
          </label>
        </div>
        <div className="flex gap-3 p-5 border-t border-dark-500">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 bg-dark-700 hover:bg-dark-600 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onSave(form)} disabled={!valid}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
            <Check size={15} /> Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirm ────────────────────────────────────────────────────────────

interface DeleteConfirmProps {
  label: string
  onConfirm: () => void
  onClose: () => void
}

function DeleteConfirm({ label, onConfirm, onClose }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Confirmar exclusão</p>
            <p className="text-xs text-gray-400 mt-0.5">Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <p className="text-sm text-gray-300">
          Deseja excluir <span className="font-semibold text-white">"{label}"</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 bg-dark-700 hover:bg-dark-600 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-700 hover:bg-red-600 text-white transition-colors">
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('parceiros')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedGP, setExpandedGP] = useState<string | null>(null)

  const {
    institutions, addInstitution, updateInstitution, deleteInstitution,
    addProduct, updateProduct, deleteProduct,
    gamePartners, addGamePartner, updateGamePartner, deleteGamePartner,
    addPackage, updatePackage, deletePackage,
  } = useAdminStore()
  const { investments } = useDepositStore()

  // Institution modal
  const [instModal, setInstModal] = useState<{ open: boolean; mode: 'add' | 'edit'; target?: AdminInstitution } | null>(null)
  // Product modal
  const [prodModal, setProdModal] = useState<{ open: boolean; mode: 'add' | 'edit'; institutionId: string; target?: AdminProduct } | null>(null)
  // Game partner modal
  const [gpModal, setGpModal] = useState<{ open: boolean; mode: 'add' | 'edit'; target?: AdminGamePartner } | null>(null)
  // Package modal
  const [pkgModal, setPkgModal] = useState<{ open: boolean; mode: 'add' | 'edit'; partnerId: string; target?: AdminPackage } | null>(null)
  // Delete confirm
  const [delConfirm, setDelConfirm] = useState<
    | { type: 'institution'; id: string; name: string }
    | { type: 'product'; institutionId: string; id: string; name: string }
    | { type: 'gamePartner'; id: string; name: string }
    | { type: 'package'; partnerId: string; id: string; name: string }
    | null
  >(null)

  function firstOperationAt(institutionName: string): string | null {
    const dates = investments
      .filter(inv => inv.institution === institutionName && inv.confirmedAt)
      .map(inv => inv.confirmedAt!)
      .sort()
    return dates[0] ?? null
  }

  function handleSaveInstitution(form: InstFormData) {
    const data = {
      name: form.name.trim(),
      cnpj: form.cnpj.trim(),
      pixKey: form.pixKey.trim(),
      commissionPercent: parseFloat(form.commissionPercent),
    }
    if (instModal?.mode === 'edit' && instModal.target) {
      updateInstitution(instModal.target.id, data)
    } else {
      addInstitution(data)
    }
    setInstModal(null)
  }

  function handleSaveProduct(form: ProdFormData) {
    if (!prodModal) return
    const data = {
      gameId: prodModal.institutionId,
      gameName: '',
      name: form.name.trim(),
      type: form.type,
      rate: form.rate.trim(),
      minValue: parseFloat(form.minValue),
      tag: form.tag.trim() || undefined,
      tagColor: (form.tagColor || undefined) as TagColor | undefined,
      popular: form.popular,
    }
    if (prodModal.mode === 'edit' && prodModal.target) {
      updateProduct(prodModal.institutionId, prodModal.target.id, data)
    } else {
      addProduct(prodModal.institutionId, data)
    }
    setProdModal(null)
  }

  function handleSaveGamePartner(form: GpFormData) {
    const data = { name: form.name.trim(), apiKey: form.apiKey.trim(), merchantId: form.merchantId.trim() }
    if (gpModal?.mode === 'edit' && gpModal.target) {
      updateGamePartner(gpModal.target.id, data)
    } else {
      addGamePartner(data)
    }
    setGpModal(null)
  }

  function handleSavePackage(form: PkgFormData) {
    if (!pkgModal) return
    const data = {
      gameId: form.gameId.trim(),
      gameName: form.gameName.trim(),
      packageName: form.packageName.trim(),
      coinAmount: parseFloat(form.coinAmount),
      coinName: form.coinName.trim(),
      pricePoins: parseFloat(form.pricePoins),
      deliveryMethod: form.deliveryMethod,
      active: form.active,
    }
    if (pkgModal.mode === 'edit' && pkgModal.target) {
      updatePackage(pkgModal.partnerId, pkgModal.target.id, data)
    } else {
      addPackage(pkgModal.partnerId, data)
    }
    setPkgModal(null)
  }

  function handleDeleteConfirmed() {
    if (!delConfirm) return
    if (delConfirm.type === 'institution') {
      deleteInstitution(delConfirm.id)
    } else if (delConfirm.type === 'product') {
      deleteProduct(delConfirm.institutionId, delConfirm.id)
    } else if (delConfirm.type === 'gamePartner') {
      deleteGamePartner(delConfirm.id)
    } else {
      deletePackage(delConfirm.partnerId, delConfirm.id)
    }
    setDelConfirm(null)
  }

  const tabs: { id: Tab; icon: typeof ShieldCheck; label: string; count?: number }[] = [
    { id: 'parceiros', icon: Building2, label: 'Parceiros Financeiros', count: institutions.length },
    { id: 'jogos',     icon: Gamepad2,  label: 'Parceiros de Jogos',   count: gamePartners.length },
    { id: 'usuarios',  icon: Users,     label: 'Usuários', count: MOCK_USERS.length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck size={22} className="text-brand-400" /> Painel Administrativo
          </h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie parceiros, produtos e usuários da plataforma.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, icon: Icon, label, count }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
              activeTab === id
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40'
                : 'bg-dark-700 text-gray-400 hover:text-white border border-dark-500'
            )}>
            <Icon size={15} />
            {label}
            {count !== undefined && (
              <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                activeTab === id ? 'bg-white/20 text-white' : 'bg-dark-500 text-gray-400')}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Aba: Parceiros Financeiros ── */}
      {activeTab === 'parceiros' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{institutions.length} instituição{institutions.length !== 1 ? 's' : ''} cadastrada{institutions.length !== 1 ? 's' : ''}</p>
            <button
              onClick={() => setInstModal({ open: true, mode: 'add' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors">
              <Plus size={15} /> Nova Instituição
            </button>
          </div>

          {institutions.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Building2 size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-white">Nenhuma instituição cadastrada</p>
              <p className="text-sm mt-1">Adicione a primeira parceira financeira.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {institutions.map(inst => {
                const isExpanded = expanded === inst.id
                const firstOp = firstOperationAt(inst.name)
                return (
                  <div key={inst.id} className="card overflow-hidden">
                    {/* Institution header */}
                    <div
                      className="flex items-center gap-3 cursor-pointer select-none"
                      onClick={() => setExpanded(isExpanded ? null : inst.id)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-700/30 border border-brand-600/30 flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} className="text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white text-sm">{inst.name}</p>
                          <span className="text-[10px] text-gray-500 bg-dark-600 px-1.5 py-0.5 rounded-full">
                            {inst.products.length} produto{inst.products.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          CNPJ {inst.cnpj} · Comissão {inst.commissionPercent}%
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); setInstModal({ open: true, mode: 'edit', target: inst }) }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-brand-400 hover:bg-dark-600 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDelConfirm({ type: 'institution', id: inst.id, name: inst.name }) }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-dark-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                        {isExpanded ? <ChevronDown size={16} className="text-gray-400 ml-1" /> : <ChevronRight size={16} className="text-gray-400 ml-1" />}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-dark-500 space-y-4">
                        {/* Institution metadata */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="bg-dark-700 rounded-xl p-3">
                            <p className="text-gray-500 mb-0.5">Chave PIX</p>
                            <p className="text-gray-200 font-mono break-all">{inst.pixKey}</p>
                          </div>
                          <div className="bg-dark-700 rounded-xl p-3">
                            <p className="text-gray-500 mb-0.5">Comissão</p>
                            <p className="text-emerald-400 font-bold text-sm">{inst.commissionPercent}%</p>
                          </div>
                          <div className="bg-dark-700 rounded-xl p-3">
                            <p className="text-gray-500 mb-0.5">Cadastrado em</p>
                            <p className="text-gray-300">{fmtDate(inst.createdAt)}</p>
                          </div>
                          <div className="bg-dark-700 rounded-xl p-3">
                            <p className="text-gray-500 mb-0.5">1ª operação</p>
                            <p className={firstOp ? 'text-brand-400' : 'text-gray-600'}>{fmtDate(firstOp)}</p>
                          </div>
                        </div>

                        {/* Products */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Produtos</p>
                            <button
                              onClick={() => setProdModal({ open: true, mode: 'add', institutionId: inst.id })}
                              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/20 border border-brand-700/30 hover:border-brand-600 px-2.5 py-1.5 rounded-lg transition-all">
                              <Plus size={12} /> Adicionar produto
                            </button>
                          </div>

                          {inst.products.length === 0 ? (
                            <p className="text-xs text-gray-600 italic py-3 text-center border border-dashed border-dark-500 rounded-xl">
                              Nenhum produto cadastrado nesta instituição.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {inst.products.map(prod => (
                                <div key={prod.id} className="flex items-center gap-3 bg-dark-700 rounded-xl px-3 py-2.5">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm text-white font-medium">{prod.name}</p>
                                      {prod.popular && (
                                        <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 bg-yellow-900/30 border border-yellow-700/30 px-1.5 py-0.5 rounded-full">
                                          <Star size={9} fill="currentColor" /> Popular
                                        </span>
                                      )}
                                      {prod.tag && (
                                        <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full border', tagCls(prod.tagColor))}>
                                          {prod.tag}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {prod.type} · {prod.rate} · mín. {fmt(prod.minValue)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => setProdModal({ open: true, mode: 'edit', institutionId: inst.id, target: prod })}
                                      className="p-1.5 rounded-lg text-gray-500 hover:text-brand-400 hover:bg-dark-600 transition-colors">
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      onClick={() => setDelConfirm({ type: 'product', institutionId: inst.id, id: prod.id, name: prod.name })}
                                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-dark-600 transition-colors">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Aba: Parceiros de Jogos ── */}
      {activeTab === 'jogos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{gamePartners.length} parceiro{gamePartners.length !== 1 ? 's' : ''} cadastrado{gamePartners.length !== 1 ? 's' : ''}</p>
            <button
              onClick={() => setGpModal({ open: true, mode: 'add' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors">
              <Plus size={15} /> Novo Parceiro
            </button>
          </div>

          {gamePartners.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Gamepad2 size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-white">Nenhum parceiro cadastrado</p>
              <p className="text-sm mt-1">Adicione o primeiro distribuidor de jogos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gamePartners.map(gp => {
                const isExpanded = expandedGP === gp.id
                const activeCount = gp.packages.filter(p => p.active).length
                return (
                  <div key={gp.id} className="card overflow-hidden">
                    {/* Partner header */}
                    <div
                      className="flex items-center gap-3 cursor-pointer select-none"
                      onClick={() => setExpandedGP(isExpanded ? null : gp.id)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-700/30 border border-indigo-600/30 flex items-center justify-center flex-shrink-0">
                        <Gamepad2 size={18} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white text-sm">{gp.name}</p>
                          <span className="text-[10px] text-gray-500 bg-dark-600 px-1.5 py-0.5 rounded-full">
                            {activeCount}/{gp.packages.length} pacotes ativos
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Cadastrado em {fmtDate(gp.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); setGpModal({ open: true, mode: 'edit', target: gp }) }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-brand-400 hover:bg-dark-600 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDelConfirm({ type: 'gamePartner', id: gp.id, name: gp.name }) }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-dark-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                        {isExpanded ? <ChevronDown size={16} className="text-gray-400 ml-1" /> : <ChevronRight size={16} className="text-gray-400 ml-1" />}
                      </div>
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-dark-500 space-y-4">
                        {/* Credentials */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-dark-700 rounded-xl p-3">
                            <p className="text-gray-500 mb-0.5">API Key</p>
                            <p className="text-gray-300 font-mono truncate">
                              {gp.apiKey ? `${gp.apiKey.slice(0, 6)}${'•'.repeat(10)}` : <span className="text-gray-600 italic">não configurada</span>}
                            </p>
                          </div>
                          <div className="bg-dark-700 rounded-xl p-3">
                            <p className="text-gray-500 mb-0.5">Merchant ID</p>
                            <p className="text-gray-300 font-mono truncate">
                              {gp.merchantId || <span className="text-gray-600 italic">não configurado</span>}
                            </p>
                          </div>
                        </div>

                        {/* Packages */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pacotes</p>
                            <button
                              onClick={() => setPkgModal({ open: true, mode: 'add', partnerId: gp.id })}
                              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/20 border border-brand-700/30 hover:border-brand-600 px-2.5 py-1.5 rounded-lg transition-all">
                              <Plus size={12} /> Adicionar pacote
                            </button>
                          </div>

                          {gp.packages.length === 0 ? (
                            <p className="text-xs text-gray-600 italic py-3 text-center border border-dashed border-dark-500 rounded-xl">
                              Nenhum pacote cadastrado neste parceiro.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {gp.packages.map(pkg => (
                                <div key={pkg.id} className={clsx(
                                  'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                                  pkg.active ? 'bg-dark-700' : 'bg-dark-700/50 opacity-60'
                                )}>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm text-white font-medium">{pkg.packageName}</p>
                                      <span className={clsx(
                                        'text-[10px] px-1.5 py-0.5 rounded-full border',
                                        pkg.deliveryMethod === 'account_credit'
                                          ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40'
                                          : 'bg-blue-900/40 text-blue-400 border-blue-700/40'
                                      )}>
                                        {pkg.deliveryMethod === 'account_credit' ? 'Crédito em conta' : 'Código resgatável'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {pkg.coinAmount} {pkg.coinName} · {pkg.gameName} · {fmt(pkg.pricePoins)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      onClick={() => updatePackage(gp.id, pkg.id, { active: !pkg.active })}
                                      className={clsx(
                                        'relative w-9 h-5 rounded-full transition-colors flex-shrink-0',
                                        pkg.active ? 'bg-brand-600' : 'bg-dark-500'
                                      )}
                                      title={pkg.active ? 'Desativar' : 'Ativar'}
                                    >
                                      <span className={clsx(
                                        'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                                        pkg.active ? 'translate-x-4' : 'translate-x-0.5'
                                      )} />
                                    </button>
                                    <button
                                      onClick={() => setPkgModal({ open: true, mode: 'edit', partnerId: gp.id, target: pkg })}
                                      className="p-1.5 rounded-lg text-gray-500 hover:text-brand-400 hover:bg-dark-600 transition-colors">
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      onClick={() => setDelConfirm({ type: 'package', partnerId: gp.id, id: pkg.id, name: pkg.packageName })}
                                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-dark-600 transition-colors">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Aba: Usuários ── */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">{MOCK_USERS.length} usuário{MOCK_USERS.length !== 1 ? 's' : ''} cadastrado{MOCK_USERS.length !== 1 ? 's' : ''}</p>

          <div className="space-y-3">
            {MOCK_USERS.map(u => {
              const linked = u.linkedTo ? MOCK_USERS.find(x => x.id === u.linkedTo) : null
              const dependents = MOCK_USERS.filter(x => x.linkedTo === u.id)
              return (
                <div key={u.id} className="card">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0',
                      u.role === 'admin'      ? 'bg-gradient-to-br from-brand-500 to-brand-700' :
                      u.role === 'responsavel'? 'bg-gradient-to-br from-brand-600 to-brand-900' :
                                               'bg-gradient-to-br from-brand-500 to-brand-700'
                    )}>
                      {u.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white text-sm">{u.name}</p>
                        <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full border',
                          u.role === 'admin'       ? 'bg-brand-900/40 text-brand-300 border-brand-700/40' :
                          u.role === 'responsavel' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40' :
                                                     'bg-blue-900/40 text-blue-400 border-blue-700/40'
                        )}>
                          {u.role === 'admin' ? 'Admin' : u.role === 'responsavel' ? 'Responsável' : 'Menor'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-dark-600 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500 mb-0.5">CPF</p>
                      <p className="text-gray-300 font-mono">{u.cpf}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Nascimento</p>
                      <p className="text-gray-300">{fmtDate(u.birthDate)}</p>
                    </div>
                    {u.phone && (
                      <div>
                        <p className="text-gray-500 mb-0.5">Telefone</p>
                        <p className="text-gray-300">{u.phone}</p>
                      </div>
                    )}
                    {linked && (
                      <div>
                        <p className="text-gray-500 mb-0.5">Responsável</p>
                        <p className="text-brand-400">{linked.name}</p>
                      </div>
                    )}
                    {dependents.length > 0 && (
                      <div>
                        <p className="text-gray-500 mb-0.5">Dependente{dependents.length > 1 ? 's' : ''}</p>
                        <p className="text-blue-400">{dependents.map(d => d.name).join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {instModal?.open && (
        <InstitutionModal
          mode={instModal.mode}
          initial={instModal.target ? instToForm(instModal.target) : emptyInstForm()}
          onSave={handleSaveInstitution}
          onClose={() => setInstModal(null)}
        />
      )}

      {prodModal?.open && (
        <ProductModal
          mode={prodModal.mode}
          initial={prodModal.target ? prodToForm(prodModal.target) : emptyProdForm()}
          onSave={handleSaveProduct}
          onClose={() => setProdModal(null)}
        />
      )}

      {gpModal?.open && (
        <GamePartnerModal
          mode={gpModal.mode}
          initial={gpModal.target ? gpToForm(gpModal.target) : emptyGpForm()}
          onSave={handleSaveGamePartner}
          onClose={() => setGpModal(null)}
        />
      )}

      {pkgModal?.open && (
        <PackageModal
          mode={pkgModal.mode}
          initial={pkgModal.target ? pkgToForm(pkgModal.target) : emptyPkgForm()}
          onSave={handleSavePackage}
          onClose={() => setPkgModal(null)}
        />
      )}

      {delConfirm && (
        <DeleteConfirm
          label={delConfirm.name}
          onConfirm={handleDeleteConfirmed}
          onClose={() => setDelConfirm(null)}
        />
      )}
    </div>
  )
}
