import { useState } from 'react'
import { X, ExternalLink, Info, CheckCircle, Shield } from 'lucide-react'
import type { FinancialProduct } from '../data/products'

interface Props {
  product: FinancialProduct
  referralUrl: string
  onClose: () => void
}

export function InvestRedirectModal({ product, referralUrl, onClose }: Props) {
  const [redirected, setRedirected] = useState(false)

  const handleRedirect = () => {
    window.open(referralUrl, '_blank', 'noopener,noreferrer')
    setRedirected(true)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-dark-700 border border-dark-400 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {!redirected ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Investir e ganhar Poins</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
                <X size={18} />
              </button>
            </div>

            {/* Produto */}
            <div className="bg-dark-800 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-400 mb-0.5">{product.institution}</p>
              <p className="font-semibold text-white">{product.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                📈 {product.rate} &nbsp;·&nbsp; a partir de{' '}
                {product.minValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            {/* Poins destaque */}
            <div className="bg-brand-900/20 border border-brand-700/30 rounded-xl p-4 mb-4 text-center">
              <p className="text-xs text-brand-300 mb-1">Seus Poins</p>
              <p className="text-sm text-brand-400 font-semibold">Definidos pelo % escolhido no depósito</p>
              <p className="text-xs text-gray-500 mt-1">
                Liberados automaticamente após confirmação do investimento
              </p>
            </div>

            {/* Como funciona */}
            <div className="flex items-start gap-2.5 bg-dark-800 rounded-xl p-3 mb-5 text-xs text-gray-400">
              <Info size={14} className="flex-shrink-0 mt-0.5 text-blue-400" />
              <p>
                Você será redirecionado para o site oficial da{' '}
                <strong className="text-white">{product.institution}</strong>. Ao concluir o
                investimento, os Poins são liberados automaticamente na sua carteira.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
              <Shield size={12} className="text-emerald-500" />
              Redirecionamento seguro com código de rastreio único
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">
                Cancelar
              </button>
              <button
                onClick={handleRedirect}
                className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              >
                Ir para o banco <ExternalLink size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
            <p className="font-bold text-white text-lg">Redirecionado!</p>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Conclua seu investimento no site da{' '}
              <strong className="text-white">{product.institution}</strong>. Seus Poins aparecerão
              em <strong className="text-brand-400">Meus Investimentos</strong> assim que
              confirmados.
            </p>
            <button onClick={onClose} className="btn-primary mt-5 w-full py-2.5 text-sm">
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
