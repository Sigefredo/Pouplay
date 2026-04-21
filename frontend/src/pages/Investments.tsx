import { useState } from 'react'
import { CheckCircle, Clock, MousePointerClick, RefreshCw, Zap, TrendingUp } from 'lucide-react'
import clsx from 'clsx'
import { useInvestmentStore, type ReferralStatus } from '../store/investmentStore'
import { useWalletStore } from '../store/walletStore'
import { PoinsDisplay } from '../components/PoinsDisplay'

const statusConfig: Record<ReferralStatus, {
  label: string
  color: string
  icon: React.ReactNode
}> = {
  clicked: {
    label: 'Aguardando investimento',
    color: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40',
    icon: <MousePointerClick size={12} />,
  },
  cashback_pending: {
    label: 'Investido — cashback a caminho',
    color: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
    icon: <Clock size={12} />,
  },
  cashback_received: {
    label: 'Cashback recebido',
    color: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40',
    icon: <CheckCircle size={12} />,
  },
}

const instColors: Record<string, string> = {
  BD: 'bg-blue-700',   CI: 'bg-green-700', BF: 'bg-orange-700',
  XF: 'bg-purple-700', SB: 'bg-teal-700',  B3: 'bg-red-700',
}

export default function Investments() {
  const { referrals, updateStatus, pendingCount, totalReceived } = useInvestmentStore()
  const { creditCashback } = useWalletStore()
  const [simulating, setSimulating] = useState<string | null>(null)

  const handleSimulate = async (referralCode: string, productName: string, cashbackPoins: number, institution: string) => {
    setSimulating(referralCode)
    // Simula o banco chamando o webhook (~2s)
    await new Promise(r => setTimeout(r, 2000))
    updateStatus(referralCode, 'cashback_received', new Date().toISOString())
    creditCashback(cashbackPoins, `Cashback — ${productName}`, `${institution} · Investimento confirmado`)
    setSimulating(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white">Meus Investimentos</h1>
        <p className="text-gray-400 text-sm mt-1">
          Acompanhe seus investimentos e o cashback em{' '}
          <span className="text-brand-400 font-semibold">P$ Poins</span>.
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">Cashback total recebido</p>
          <PoinsDisplay amount={totalReceived()} size="lg" />
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">Aguardando confirmação</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount()}</p>
        </div>
      </div>

      {/* Como funciona */}
      <div className="card bg-brand-900/10 border-brand-700/20 p-4 text-sm text-gray-400 space-y-2">
        <p className="font-semibold text-brand-300 flex items-center gap-2">
          <TrendingUp size={14} /> Como funciona o cashback
        </p>
        <div className="space-y-1.5 text-xs">
          <p><span className="text-yellow-400 font-semibold">1.</span> Clique em "Investir agora" em qualquer produto financeiro</p>
          <p><span className="text-blue-400 font-semibold">2.</span> Conclua o investimento no site do banco ou corretora</p>
          <p><span className="text-emerald-400 font-semibold">3.</span> O cashback em Poins é creditado automaticamente em até 5 dias úteis</p>
        </div>
      </div>

      {/* Lista de referrals */}
      {referrals.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-5xl mb-4">📈</p>
          <p className="font-semibold text-white">Nenhum investimento ainda</p>
          <p className="text-sm mt-1 text-gray-500">
            Acesse <strong className="text-brand-400">Produtos Financeiros</strong> e clique em{' '}
            <strong>"Investir agora"</strong> para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {referrals.map(ref => {
            const config = statusConfig[ref.status]
            const isSimulating = simulating === ref.referralCode
            return (
              <div key={ref.id} className="card hover:border-dark-400 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Logo da instituição */}
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
                    instColors[ref.institutionLogo] ?? 'bg-dark-400'
                  )}>
                    {ref.institutionLogo}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-white text-sm leading-tight">{ref.productName}</p>
                        <p className="text-xs text-gray-500">{ref.institution}</p>
                      </div>
                      <PoinsDisplay
                        amount={ref.cashbackPoins}
                        size="sm"
                        className={ref.status === 'cashback_received' ? '!text-emerald-400' : '!text-yellow-400'}
                      />
                    </div>

                    {/* Status */}
                    <div className="mt-2">
                      <span className={clsx('tag border flex items-center gap-1 w-fit', config.color)}>
                        {config.icon}
                        {config.label}
                      </span>
                    </div>

                    {/* Datas */}
                    <p className="text-xs text-gray-600 mt-1.5">
                      Iniciado em{' '}
                      {new Date(ref.clickedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                      {ref.cashbackReceivedAt && (
                        <span className="text-emerald-600">
                          {' '}· Recebido em{' '}
                          {new Date(ref.cashbackReceivedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short',
                          })}
                        </span>
                      )}
                    </p>

                    {/* Botão de simulação (somente demonstração) */}
                    {ref.status !== 'cashback_received' && (
                      <button
                        onClick={() => handleSimulate(ref.referralCode, ref.productName, ref.cashbackPoins, ref.institution)}
                        disabled={!!simulating}
                        className="mt-3 flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/20 border border-brand-700/30 hover:border-brand-600 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSimulating ? (
                          <><RefreshCw size={11} className="animate-spin" /> Processando cashback...</>
                        ) : (
                          <><Zap size={11} /> Simular cashback recebido <span className="text-gray-500">(demo)</span></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
