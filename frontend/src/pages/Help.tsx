import { useState } from 'react'
import { HelpCircle, BookOpen, FileText, MessageCircle, Phone, Mail, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

type Tab = 'manual' | 'faq' | 'termos' | 'contato'

const tabs: { id: Tab; label: string; icon: typeof HelpCircle }[] = [
  { id: 'manual',  label: 'Manual',       icon: BookOpen       },
  { id: 'faq',     label: 'FAQ',          icon: HelpCircle     },
  { id: 'termos',  label: 'Termos de Uso',icon: FileText       },
  { id: 'contato', label: 'Fale Conosco', icon: MessageCircle  },
]

export default function Help() {
  const [tab, setTab] = useState<Tab>('manual')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
          <HelpCircle size={24} className="text-brand-400" /> Ajuda
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Tire suas dúvidas, leia o manual e entre em contato com o suporte.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              tab === id
                ? 'bg-brand-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 border border-dark-500'
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {tab === 'manual'  && <Manual />}
      {tab === 'faq'     && <FAQ />}
      {tab === 'termos'  && <Termos />}
      {tab === 'contato' && <Contato />}
    </div>
  )
}

// ── Placeholder Manual ───────────────────────────────────────────────────────
function Manual() {
  return (
    <div className="card p-6 text-gray-400 text-sm">
      <p className="text-white font-bold mb-2">Manual de Utilização</p>
      <p>Em breve.</p>
    </div>
  )
}

// ── Placeholder FAQ ──────────────────────────────────────────────────────────
function FAQ() {
  return (
    <div className="card p-6 text-gray-400 text-sm">
      <p className="text-white font-bold mb-2">Perguntas Frequentes</p>
      <p>Em breve.</p>
    </div>
  )
}

// ── Placeholder Termos ───────────────────────────────────────────────────────
function Termos() {
  return (
    <div className="card p-6 text-gray-400 text-sm">
      <p className="text-white font-bold mb-2">Termos de Uso</p>
      <p>Em breve.</p>
    </div>
  )
}

// ── Canais de Ajuda ──────────────────────────────────────────────────────────
function Contato() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Nossa equipe está disponível para ajudar você. Escolha o canal de sua preferência:
      </p>

      <a
        href="https://wa.me/5586999213970"
        target="_blank"
        rel="noopener noreferrer"
        className="card flex items-center gap-4 hover:border-emerald-600/60 hover:bg-dark-600 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center flex-shrink-0">
          <Phone size={22} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">WhatsApp</p>
          <p className="text-sm text-emerald-400">(86) 99921-3970</p>
          <p className="text-xs text-gray-500 mt-0.5">Clique para abrir uma conversa</p>
        </div>
        <ChevronRight size={16} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
      </a>

      <a
        href="mailto:sigefredo@gmail.com"
        className="card flex items-center gap-4 hover:border-brand-600/60 hover:bg-dark-600 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-brand-900/40 border border-brand-700/40 flex items-center justify-center flex-shrink-0">
          <Mail size={22} className="text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">E-mail</p>
          <p className="text-sm text-brand-400">sigefredo@gmail.com</p>
          <p className="text-xs text-gray-500 mt-0.5">Respondemos em até 24 horas</p>
        </div>
        <ChevronRight size={16} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
      </a>

      <div className="card p-4 bg-dark-800/50">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="text-gray-300 font-semibold">Horário de atendimento:</span>{' '}
          Segunda a sexta, das 9h às 18h (horário de Brasília). Mensagens fora desse horário
          serão respondidas no próximo dia útil.
        </p>
      </div>
    </div>
  )
}
