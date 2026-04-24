import { useState } from 'react'
import {
  ShieldCheck, Building2, Gamepad2, Users, Plus, ChevronDown, ChevronRight,
  Pencil, Trash2, Star, Tag, X, Check, AlertTriangle,
} from 'lucide-react'
import clsx from 'clsx'
import { useAdminStore, AdminInstitution, AdminProduct, ProductType, TagColor } from '../store/adminStore'
import { useDepositStore } from '../store/depositStore'

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

  const {
    institutions, addInstitution, updateInstitution, deleteInstitution,
    addProduct, updateProduct, deleteProduct,
  } = useAdminStore()
  const { investments } = useDepositStore()

  // Institution modal
  const [instModal, setInstModal] = useState<{ open: boolean; mode: 'add' | 'edit'; target?: AdminInstitution } | null>(null)
  // Product modal
  const [prodModal, setProdModal] = useState<{ open: boolean; mode: 'add' | 'edit'; institutionId: string; target?: AdminProduct } | null>(null)
  // Delete confirm
  const [delConfirm, setDelConfirm] = useState<
    | { type: 'institution'; id: string; name: string }
    | { type: 'product'; institutionId: string; id: string; name: string }
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

  function handleDeleteConfirmed() {
    if (!delConfirm) return
    if (delConfirm.type === 'institution') {
      deleteInstitution(delConfirm.id)
    } else {
      deleteProduct(delConfirm.institutionId, delConfirm.id)
    }
    setDelConfirm(null)
  }

  const tabs: { id: Tab; icon: typeof ShieldCheck; label: string; count?: number }[] = [
    { id: 'parceiros', icon: Building2, label: 'Parceiros Financeiros', count: institutions.length },
    { id: 'jogos',     icon: Gamepad2,  label: 'Parceiros de Jogos' },
    { id: 'usuarios',  icon: Users,     label: 'Usuários' },
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

      {/* ── Aba: Parceiros de Jogos (placeholder) ── */}
      {activeTab === 'jogos' && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Gamepad2 size={40} className="text-brand-600 opacity-50" />
          <p className="font-semibold text-white">Parceiros de Jogos</p>
          <p className="text-sm text-gray-500 max-w-xs">Em breve: gestão de parceiros e pacotes de moedas por jogo.</p>
        </div>
      )}

      {/* ── Aba: Usuários (placeholder) ── */}
      {activeTab === 'usuarios' && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Users size={40} className="text-brand-600 opacity-50" />
          <p className="font-semibold text-white">Usuários</p>
          <p className="text-sm text-gray-500 max-w-xs">Em breve: listagem e gerenciamento de usuários da plataforma.</p>
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
