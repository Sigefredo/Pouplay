import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { TrendingUp, Gamepad2, ChevronRight, ChevronLeft, ShieldCheck, Zap, Star, BookOpen } from 'lucide-react'
import { FINANCIAL_PRODUCTS } from '../data/products'
import { GAMES } from '../data/games'
import { useImageStore } from '../store/imageStore'
import clsx from 'clsx'

type Section = 'investir' | 'jogos'

const instColors: Record<string, string> = {
  BD: 'bg-blue-700',   CI: 'bg-green-700',  BF: 'bg-orange-700',
  XF: 'bg-purple-700', SB: 'bg-teal-700',   B3: 'bg-red-700',
}

const PRODUCT_GUIDE: Record<string, { highlights: string[]; howItWorks: string; idealFor: string; tip: string }> = {
  fp1: {
    highlights: ['Rentabilidade de 120% do CDI', 'Liquidez diária após 90 dias', 'Garantido pelo FGC até R$ 250 mil'],
    howItWorks: 'Você empresta dinheiro ao banco por um prazo determinado. Em troca, o banco paga juros sobre o valor investido. Quanto maior o CDI, maior o seu rendimento.',
    idealFor: 'Quem já tem uma reserva de emergência e quer fazer o dinheiro crescer mais do que na poupança.',
    tip: 'Com P$ 50 de cashback por investimento, você já consegue comprar um pacote de diamantes no Free Fire!',
  },
  fp2: {
    highlights: ['100% da taxa Selic', 'Emitido pelo governo federal', 'Pode vender a qualquer dia útil'],
    howItWorks: 'Você empresta dinheiro para o governo brasileiro. É o investimento mais seguro do país — o risco é praticamente zero.',
    idealFor: 'Quem está começando a investir e quer segurança acima de tudo.',
    tip: 'Com P$ 15 de cashback você já garante Robux para o seu filho!',
  },
  fp3: {
    highlights: ['Isento de Imposto de Renda para pessoa física', '95% do CDI de rendimento', 'Prazo de 12 meses'],
    howItWorks: 'O banco usa seu dinheiro para financiar o agronegócio brasileiro. Em troca, você recebe juros e ainda é isento de IR — o que aumenta bastante o rendimento real.',
    idealFor: 'Quem pode deixar o dinheiro parado por 12 meses e quer pagar menos imposto.',
    tip: 'P$ 30 de cashback cobrem um pacote médio de V-Bucks no Fortnite.',
  },
  fp4: {
    highlights: ['Liquidez diária desde o primeiro dia', '115% do CDI', 'Ideal para reserva de emergência'],
    howItWorks: 'Funciona como um CDB comum, mas você pode retirar o dinheiro a qualquer momento. Ótimo para quem precisa de flexibilidade.',
    idealFor: 'Quem quer investir sem abrir mão da possibilidade de usar o dinheiro quando precisar.',
    tip: 'Use como poupança dos Poins: a cada resgate, seu filho ganha moedas no jogo favorito.',
  },
  fp5: {
    highlights: ['Sem valor mínimo alto', 'Rendimento superior à poupança tradicional', 'Fácil de entender'],
    howItWorks: 'Semelhante à poupança comum, mas com rendimento maior. Boa porta de entrada para quem ainda não investiu antes.',
    idealFor: 'Quem está dando os primeiros passos e quer algo simples.',
    tip: 'Com apenas P$ 5 de cashback você já acumula Poins para trocar por moedas de jogos.',
  },
  fp6: {
    highlights: ['Diversificação automática', '110% do CDI', 'Gestão profissional'],
    howItWorks: 'Seu dinheiro é investido em vários ativos de renda fixa ao mesmo tempo, gerenciados por especialistas. Você não precisa escolher nada.',
    idealFor: 'Quem quer uma carteira diversificada sem precisar acompanhar cada ativo.',
    tip: 'P$ 45 de cashback equivalem a um pacote completo de Minecoins no Minecraft.',
  },
  fp7: {
    highlights: ['Isento de IR', 'Lastreado no mercado imobiliário', 'Prazo de 9 meses'],
    howItWorks: 'Parecido com a LCA, mas o dinheiro financia projetos imobiliários. A isenção de IR torna o rendimento real muito atrativo.',
    idealFor: 'Quem quer diversificar e aproveitar a isenção fiscal com prazo menor que a LCA.',
    tip: 'P$ 28 de cashback já cobrem Robux para personalizar o avatar do seu filho no Roblox.',
  },
  fp8: {
    highlights: ['Produto especial para famílias', '108% do CDI', 'A partir de R$ 50'],
    howItWorks: 'Um CDB projetado para pais que querem investir pensando no futuro dos filhos, com entrada acessível e bom rendimento.',
    idealFor: 'Pais que querem começar a investir pequeno e ao mesmo tempo presentear os filhos com moedas em jogos.',
    tip: 'É o produto mais alinhado com a proposta da Pouplay: poupar e jogar!',
  },
}

const GAME_GUIDE: Record<string, { whatFor: string[]; howToUse: string; tip: string; ageNote?: string }> = {
  freefire: {
    whatFor: ['Comprar skins de personagens e armas', 'Desbloquear emotes exclusivos', 'Adquirir pets e acessórios', 'Participar de eventos especiais'],
    howToUse: 'Após a compra, os Diamantes são creditados diretamente na conta Free Fire pelo Player ID. Não é preciso código de resgate.',
    tip: 'Pacotes maiores têm bônus de diamantes — comprar o pacote de 520 sai mais barato por diamante do que comprar o de 310.',
    ageNote: 'Indicado para maiores de 12 anos. Verifique a classificação indicativa antes de autorizar.',
  },
  roblox: {
    whatFor: ['Personalizar o avatar com roupas e acessórios', 'Comprar itens dentro dos jogos da plataforma', 'Acessar jogos premium exclusivos', 'Criar e publicar jogos próprios'],
    howToUse: 'A compra gera um código de resgate. O código deve ser inserido em roblox.com/redeem com a conta do usuário logada.',
    tip: 'O Roblox é uma plataforma com milhares de jogos diferentes — os Robux funcionam em todos eles.',
    ageNote: 'Indicado para todas as idades. A Roblox Corporation tem controles parentais disponíveis.',
  },
  fortnite: {
    whatFor: ['Comprar skins de personagens', 'Adquirir o Passe de Batalha da temporada', 'Comprar emotes e acessórios', 'Desbloquear armas cosméticas'],
    howToUse: 'Após a compra, os V-Bucks são creditados diretamente na conta Epic Games vinculada ao dispositivo.',
    tip: 'O Passe de Batalha custa 950 V-Bucks e permite ganhar dezenas de skins ao longo da temporada — é o melhor custo-benefício.',
    ageNote: 'Classificação livre, mas recomendado para maiores de 12 anos pelo conteúdo competitivo.',
  },
  minecraft: {
    whatFor: ['Comprar skins de personagens', 'Adquirir pacotes de textura', 'Desbloquear mundos de aventura', 'Acessar o Marketplace oficial'],
    howToUse: 'A compra gera um código de resgate que deve ser usado na loja do Minecraft dentro do jogo ou em minecraft.net/redeem.',
    tip: 'Os pacotes de textura transformam completamente a aparência do jogo — uma ótima forma de renovar a experiência.',
    ageNote: 'Indicado para todas as idades. Um dos jogos mais seguros para crianças.',
  },
}

export default function Guide() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { images } = useImageStore()

  const section = searchParams.get('section') as Section | null
  const focusId = searchParams.get('id')

  const [expanded, setExpanded] = useState<string | null>(focusId)

  const setSection = (s: Section) => {
    setSearchParams({ section: s })
    setExpanded(null)
  }

  const clearSection = () => {
    setSearchParams({})
    setExpanded(null)
  }

  // ── Landing ───────────────────────────────────────────────────────────────
  if (!section) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <BookOpen size={24} className="text-brand-400" /> Guia Pouplay
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Entenda como funcionam os produtos e jogos disponíveis na plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <button
            onClick={() => setSection('investir')}
            className="card hover:border-brand-600/60 hover:bg-dark-600 transition-all text-left group p-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-900/40 border border-brand-700/40 flex items-center justify-center mb-4">
              <TrendingUp size={28} className="text-brand-400" />
            </div>
            <h2 className="text-lg font-extrabold text-white mb-2">Como Investir</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Entenda cada produto financeiro disponível — como funciona, para quem é indicado
              e quanto de <span className="text-brand-400 font-semibold">P$ Poins</span> você
              recebe de cashback.
            </p>
            <div className="flex items-center gap-1 text-brand-400 text-sm font-semibold mt-4 group-hover:gap-2 transition-all">
              Ver produtos <ChevronRight size={16} />
            </div>
          </button>

          <button
            onClick={() => setSection('jogos')}
            className="card hover:border-brand-600/60 hover:bg-dark-600 transition-all text-left group p-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-900/30 border border-emerald-700/30 flex items-center justify-center mb-4">
              <Gamepad2 size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-extrabold text-white mb-2">Como Jogar</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Descubra para que servem as moedas de cada jogo, como usar os Poins
              para comprá-las e dicas para aproveitar melhor cada título.
            </p>
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold mt-4 group-hover:gap-2 transition-all">
              Ver jogos <ChevronRight size={16} />
            </div>
          </button>
        </div>

        <div className="card p-5 bg-brand-900/10 border-brand-700/30">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Como a Pouplay funciona</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Você investe em produtos financeiros de instituições parceiras e recebe cashback
                em <span className="text-brand-400 font-semibold">P$ Poins</span> (P$1,00 = R$1,00).
                Esses Poins são usados para comprar moedas em jogos digitais para os seus filhos.
                É uma forma de transformar investimento em diversão!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Seção: Como Investir ──────────────────────────────────────────────────
  if (section === 'investir') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={clearSection}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} /> Guia
          </button>
          <span className="text-gray-600">/</span>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-400" /> Como Investir
          </h1>
        </div>

        <p className="text-sm text-gray-400">
          Clique em qualquer produto para entender como ele funciona e quanto de Poins você recebe.
        </p>

        <div className="space-y-3">
          {FINANCIAL_PRODUCTS.map(p => {
            const guide = PRODUCT_GUIDE[p.id]
            const isOpen = expanded === p.id
            const img = images[p.id]
            return (
              <div key={p.id} className={clsx('card transition-all', isOpen && 'border-brand-600/50')}>
                <button
                  className="w-full flex items-center gap-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                >
                  {img ? (
                    <img src={img} alt={p.institution} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0', instColors[p.institutionLogo] ?? 'bg-dark-400')}>
                      {p.institutionLogo}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.institution} · {p.type}</p>
                  </div>
                  <div className="text-right mr-2">
                    <p className="text-xs text-gray-500">Cashback</p>
                    <p className="text-brand-400 font-extrabold text-sm">P$ {p.cashbackPoins}</p>
                  </div>
                  <ChevronRight size={16} className={clsx('text-gray-500 transition-transform flex-shrink-0', isOpen && 'rotate-90')} />
                </button>

                {isOpen && guide && (
                  <div className="mt-4 pt-4 border-t border-dark-500 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Destaques</p>
                      <ul className="space-y-1.5">
                        {guide.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <Star size={12} className="text-brand-400 mt-0.5 flex-shrink-0" /> {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Como funciona</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{guide.howItWorks}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Para quem é ideal</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{guide.idealFor}</p>
                    </div>
                    <div className="bg-brand-900/20 border border-brand-700/30 rounded-xl p-3 flex items-start gap-2">
                      <Zap size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-brand-300">{guide.tip}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/produtos?invest=${p.id}`)}
                      className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
                    >
                      Investir agora <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Seção: Como Jogar ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={clearSection}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Guia
        </button>
        <span className="text-gray-600">/</span>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Gamepad2 size={20} className="text-emerald-400" /> Como Jogar
        </h1>
      </div>

      <p className="text-sm text-gray-400">
        Clique em um jogo para entender como usar seus Poins e aproveitar ao máximo cada título.
      </p>

      <div className="space-y-3">
        {GAMES.map(game => {
          const guide = GAME_GUIDE[game.id]
          const isOpen = expanded === game.id
          const img = images[game.id]
          return (
            <div key={game.id} className={clsx('card transition-all', isOpen && 'border-emerald-600/40')}>
              <button
                className="w-full flex items-center gap-4 text-left"
                onClick={() => setExpanded(isOpen ? null : game.id)}
              >
                {img ? (
                  <img src={img} alt={game.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: game.color + '22', border: `1px solid ${game.color}44` }}
                  >
                    <span style={{ color: game.color }} className="font-extrabold">{game.logo}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{game.name}</p>
                  <p className="text-xs text-gray-400">{game.company}</p>
                </div>
                <ChevronRight size={16} className={clsx('text-gray-500 transition-transform flex-shrink-0', isOpen && 'rotate-90')} />
              </button>

              {isOpen && guide && (
                <div className="mt-4 pt-4 border-t border-dark-500 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Para que servem as moedas</p>
                    <ul className="space-y-1.5">
                      {guide.whatFor.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <Star size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" /> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Como funciona a entrega</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{guide.howToUse}</p>
                  </div>
                  {guide.ageNote && (
                    <div className="bg-dark-800 border border-dark-500 rounded-xl p-3">
                      <p className="text-xs text-gray-400">
                        <span className="font-semibold text-gray-300">Classificação: </span>
                        {guide.ageNote}
                      </p>
                    </div>
                  )}
                  <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-3 flex items-start gap-2">
                    <Zap size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-emerald-300">{guide.tip}</p>
                  </div>
                  <button
                    onClick={() => navigate('/jogos')}
                    className="w-full py-2.5 text-sm font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-2"
                  >
                    Comprar moedas <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
