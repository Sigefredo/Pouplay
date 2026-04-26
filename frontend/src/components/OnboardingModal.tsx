import { useNavigate } from 'react-router-dom'
import { X, ChevronRight, Users, PiggyBank, Gamepad2, TrendingUp } from 'lucide-react'

interface Props {
  userName: string
  onDismiss: () => void
}

const STEPS = [
  { icon: Users,      title: 'Acesse seu Perfil',               desc: 'Pelo menu lateral (desktop) ou barra inferior (celular).' },
  { icon: PiggyBank,  title: 'Clique em "Adicionar filho"',      desc: 'Informe nome completo, CPF e data de nascimento.' },
  { icon: TrendingUp, title: 'Deposite e defina os Poins',       desc: 'Escolha quanto do depósito vira P$ Poins para o filho.' },
  { icon: Gamepad2,   title: 'Investimento confirmado = Poins!', desc: 'Os Poins são liberados para o filho usar em jogos.' },
]

export function OnboardingModal({ userName, onDismiss }: Props) {
  const navigate = useNavigate()
  const firstName = userName.trim().split(/\s+/)[0]

  const goToProfile = () => {
    onDismiss()
    navigate('/perfil')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[92dvh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-dark-800 border-b border-dark-600 px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center font-extrabold text-white text-sm flex-shrink-0">
              P$
            </div>
            <div>
              <p className="font-extrabold text-white leading-tight">Bem-vindo(a), {firstName}! 👋</p>
              <p className="text-xs text-gray-400">Conta criada com sucesso</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Pergunta */}
          <div className="bg-brand-900/20 border border-brand-700/30 rounded-xl p-4">
            <p className="font-semibold text-white text-sm mb-1">
              Você tem filhos para cadastrar na plataforma?
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ao vincular o perfil do seu filho, você pode investir em nome dele e gerar{' '}
              <span className="text-brand-400 font-semibold">P$ Poins</span>{' '}
              que ele usa para comprar moedas nos jogos favoritos.
            </p>
          </div>

          {/* Passos */}
          <div>
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-3">
              Como cadastrar em 4 passos
            </p>
            <div className="space-y-3">
              {STEPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-dark-700 border border-dark-500 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-brand-400" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-3 pt-1">
            <button
              onClick={goToProfile}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Ir para o Perfil <ChevronRight size={15} />
            </button>
            <button
              onClick={onDismiss}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
            >
              Fazer isso depois
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
