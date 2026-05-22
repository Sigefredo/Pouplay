import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  TrendingUp, Gamepad2, ChevronRight, ChevronLeft, ShieldCheck, Zap, Star,
  BookOpen, Send, Clock, CheckCircle, PiggyBank, RotateCcw, AlertTriangle,
} from 'lucide-react'
import { FINANCIAL_PRODUCTS } from '../data/products'
import { GAMES } from '../data/games'
import { FEATURES } from '../config/features'
import { useImageStore } from '../store/imageStore'
import clsx from 'clsx'

type Section = 'repasses' | 'investir' | 'jogos'

const instColors: Record<string, string> = {
  BD: 'bg-blue-700',   CI: 'bg-green-700',  BF: 'bg-orange-700',
  XF: 'bg-purple-700', SB: 'bg-teal-700',   B3: 'bg-red-700',
}

// ── Repasses guide steps ──────────────────────────────────────────────────────

const REPASSES_STEPS = [
  {
    icon: PiggyBank,
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/30 border-emerald-700/30',
    title: '1. Deposite via PIX',
    items: [
      'Acesse "Depositar" pelo menu lateral.',
      'Informe o valor que deseja depositar (mínimo R$ 50,00).',
      'Use o slider para definir o percentual que vira P$ Poins (1% a 50% do valor).',
      'Se tiver filhos cadastrados, o toggle "Distribuir Poins para os filhos" direciona os Poins para as contas deles — ativado por padrão.',
      'Clique em "Gerar chave PIX", copie a chave e realize a transferência no seu banco.',
      'Após a confirmação, os Poins ficam bloqueados e o valor líquido fica registrado na Conta da Pouplay.',
    ],
  },
  {
    icon: Clock,
    color: 'text-brand-400',
    bg: 'bg-brand-900/20 border-brand-700/30',
    title: '2. Monitore o prazo em Repasses',
    items: [
      'Acesse "Repasses Vinculados" pelo menu.',
      'A aba "A Transferir" mostra cada depósito confirmado com um countdown colorido de dias úteis.',
      'Verde (3–5 dias): você tem tempo. Amarelo (2 dias): atenção. Vermelho (1 dia ou expirando hoje): ação imediata.',
      'Você tem até 5 dias úteis, contados da confirmação do PIX, para registrar a transferência.',
      'No dia do vencimento, um alerta vermelho aparece no topo da página e no Dashboard.',
      'Seu filho também recebe um aviso no Dashboard quando o prazo está próximo.',
    ],
  },
  {
    icon: Send,
    color: 'text-blue-400',
    bg: 'bg-blue-900/20 border-blue-700/30',
    title: '3. Registre a transferência realizada',
    items: [
      'Na aba "A Transferir", clique em "Registrar transferência" no card do depósito desejado.',
      'Informe o nome do beneficiário e a chave PIX da conta destino (pode ser a conta do seu filho em qualquer banco).',
      'Ajuste o valor se necessário — o campo vem pré-preenchido com o total disponível.',
      'Clique em "Confirmar registro". Um código de rastreio no formato POI-AAAAMMDD-XXXXXX é gerado.',
      'Realize a transferência PIX no seu banco e inclua o código na descrição — isso vincula a transferência ao depósito.',
      'A transferência passa para a aba "Aguardando Confirmação".',
    ],
  },
  {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20 border-emerald-700/30',
    title: '4. Confirme e libere os Poins',
    items: [
      'Na aba "Aguardando Confirmação", você verá a transferência registrada com chave PIX, valor e código de rastreio.',
      'Após o banco confirmar o recebimento, clique em "Simular confirmação bancária" (modo demonstração do MVP).',
      'Os Poins do filho são liberados automaticamente — status muda de "bloqueados" para "disponíveis".',
      'O filho pode usar os Poins imediatamente para comprar moedas nos jogos da plataforma.',
      'O registro passa para a aba "Concluídos" com data e hora da confirmação.',
    ],
  },
  {
    icon: RotateCcw,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/15 border-yellow-700/30',
    title: '5. Solicitar devolução (prazo não utilizado)',
    items: [
      'Se não conseguir realizar a transferência dentro do prazo de 5 dias úteis, clique em "Solicitar devolução" no card do depósito.',
      'A Pouplay processará o retorno do valor integral (deduzida apenas a taxa de serviço já retida) em até 1 dia útil.',
      'O retorno é feito via PIX para a mesma chave de origem do depósito.',
      'Você receberá notificação quando o valor for devolvido.',
      'Os Poins bloqueados correspondentes serão também liberados.',
    ],
  },
]

// ── Products guide data ───────────────────────────────────────────────────────

const PRODUCT_GUIDE: Record<string, { highlights: string[]; howItWorks: string; idealFor: string; tip: string }> = {
  fp1: {
    highlights: ['Rentabilidade de 120% do CDI', 'Liquidez diária após 90 dias', 'Garantido pelo FGC até R$ 250 mil'],
    howItWorks: 'Você empresta dinheiro ao banco por um prazo determinado. Em troca, o banco paga juros sobre o valor investido. Quanto maior o CDI, maior o seu rendimento.',
    idealFor: 'Quem já tem uma reserva de emergência e quer fazer o dinheiro crescer mais do que na poupança.',
    tip: 'Invista R$ 1.000 com 10% de Poins e seu filho já recebe P$ 100 para usar nos jogos favoritos!',
  },
  fp2: {
    highlights: ['100% da taxa Selic', 'Emitido pelo governo federal', 'Pode vender a qualquer dia útil'],
    howItWorks: 'Você empresta dinheiro para o governo brasileiro. É o investimento mais seguro do país — o risco é praticamente zero.',
    idealFor: 'Quem está começando a investir e quer segurança acima de tudo.',
    tip: 'Com R$ 100 investidos e 10% de Poins, o seu filho já ganha Robux suficientes para personalizar o avatar!',
  },
  fp3: {
    highlights: ['Isento de Imposto de Renda para pessoa física', '95% do CDI de rendimento', 'Prazo de 12 meses'],
    howItWorks: 'O banco usa seu dinheiro para financiar o agronegócio brasileiro. Em troca, você recebe juros e ainda é isento de IR.',
    idealFor: 'Quem pode deixar o dinheiro parado por 12 meses e quer pagar menos imposto.',
    tip: 'Invista R$ 500 com 10% de Poins: o filho recebe P$ 50 para gastar nos jogos assim que o banco confirmar.',
  },
  fp4: {
    highlights: ['Liquidez diária desde o primeiro dia', '115% do CDI', 'Ideal para reserva de emergência'],
    howItWorks: 'Funciona como um CDB comum, mas você pode retirar o dinheiro a qualquer momento.',
    idealFor: 'Quem quer investir sem abrir mão da possibilidade de usar o dinheiro quando precisar.',
    tip: 'Use como poupança dos Poins: a cada investimento confirmado, seu filho ganha moedas no jogo favorito.',
  },
  fp5: {
    highlights: ['Sem valor mínimo alto', 'Rendimento superior à poupança tradicional', 'Fácil de entender'],
    howItWorks: 'Semelhante à poupança comum, mas com rendimento maior. Boa porta de entrada para quem ainda não investiu antes.',
    idealFor: 'Quem está dando os primeiros passos e quer algo simples.',
    tip: 'Com apenas R$ 50 investidos você já começa a acumular Poins para trocar por moedas de jogos!',
  },
  fp6: {
    highlights: ['Diversificação automática', '110% do CDI', 'Gestão profissional'],
    howItWorks: 'Seu dinheiro é investido em vários ativos de renda fixa ao mesmo tempo, gerenciados por especialistas.',
    idealFor: 'Quem quer uma carteira diversificada sem precisar acompanhar cada ativo.',
    tip: 'Com R$ 1.000 investidos e 10% de Poins, o filho recebe P$ 100 — dá para um pacote completo de Minecoins!',
  },
  fp7: {
    highlights: ['Isento de IR', 'Lastreado no mercado imobiliário', 'Prazo de 9 meses'],
    howItWorks: 'Parecido com a LCA, mas o dinheiro financia projetos imobiliários. A isenção de IR torna o rendimento real muito atrativo.',
    idealFor: 'Quem quer diversificar e aproveitar a isenção fiscal com prazo menor que a LCA.',
    tip: 'Invista R$ 500 com 10% de Poins e garanta Robux para personalizar o avatar do seu filho no Roblox.',
  },
  fp8: {
    highlights: ['Produto especial para famílias', '108% do CDI', 'A partir de R$ 50'],
    howItWorks: 'Um CDB projetado para pais que querem investir pensando no futuro dos filhos, com entrada acessível e bom rendimento.',
    idealFor: 'Pais que querem começar a investir pequeno e ao mesmo tempo presentear os filhos com moedas em jogos.',
    tip: 'É o produto mais alinhado com a proposta da Pouplay: poupar e jogar!',
  },
}

// ── Games guide data ──────────────────────────────────────────────────────────

const GAME_GUIDE: Record<string, { whatFor: string[]; howToUse: string; tip: string; ageNote?: string }> = {
  freefire: {
    whatFor: ['Comprar skins de personagens e armas', 'Desbloquear emotes exclusivos', 'Adquirir pets e acessórios', 'Participar de eventos especiais'],
    howToUse: 'Após a compra, os Diamantes são creditados diretamente na conta Free Fire pelo Player ID. Não é preciso código de resgate.',
    tip: 'Pacotes maiores têm bônus de diamantes — comprar o pacote de 520 sai mais barato por diamante do que o de 310.',
    ageNote: 'Indicado para maiores de 12 anos. Verifique a classificação indicativa antes de autorizar.',
  },
  roblox: {
    whatFor: ['Personalizar o avatar com roupas e acessórios', 'Comprar itens dentro dos jogos da plataforma', 'Acessar jogos premium exclusivos', 'Criar e publicar jogos próprios'],
    howToUse: 'A compra gera um código de resgate que deve ser inserido em roblox.com/redeem com a conta do usuário logada.',
    tip: 'O Roblox é uma plataforma com milhares de jogos diferentes — os Robux funcionam em todos eles.',
    ageNote: 'Indicado para todas as idades. A Roblox Corporation tem controles parentais disponíveis.',
  },
  fortnite: {
    whatFor: ['Comprar skins de personagens', 'Adquirir o Passe de Batalha da temporada', 'Comprar emotes e acessórios', 'Desbloquear armas cosméticas'],
    howToUse: 'Após a compra, os V-Bucks são creditados diretamente na conta Epic Games vinculada ao dispositivo.',
    tip: 'O Passe de Batalha custa 950 V-Bucks e permite ganhar dezenas de skins ao longo da temporada — melhor custo-benefício.',
    ageNote: 'Classificação livre, mas recomendado para maiores de 12 anos pelo conteúdo competitivo.',
  },
  minecraft: {
    whatFor: ['Comprar skins de personagens', 'Adquirir pacotes de textura', 'Desbloquear mundos de aventura', 'Acessar o Marketplace oficial'],
    howToUse: 'A compra gera um código de resgate que deve ser usado na loja do Minecraft dentro do jogo ou em minecraft.net/redeem.',
    tip: 'Os pacotes de textura transformam completamente a aparência do jogo — ótima forma de renovar a experiência.',
    ageNote: 'Indicado para todas as idades. Um dos jogos mais seguros para crianças.',
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Guide() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { images } = useImageStore()

  const section = searchParams.get('section') as Section | null
  const focusId = searchParams.get('id')
  const [expanded, setExpanded] = useState<string | null>(focusId)
  const [openStep, setOpenStep] = useState<number | null>(0)

  const setSection = (s: Section) => { setSearchParams({ section: s }); setExpanded(null); setOpenStep(0) }
  const clearSection = () => { setSearchParams({}); setExpanded(null) }

  // ── Landing ─────────────────────────────────────────────────────────────────
  if (!section) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <BookOpen size={24} className="text-brand-400" /> Guia Pouplay
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Tudo o que você precisa saber para usar a plataforma com segurança.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Como Fazer Repasses — sempre visível no MVP */}
          {!FEATURES.financialProducts && (
            <button
              onClick={() => setSection('repasses')}
              className="card hover:border-brand-600/60 hover:bg-dark-600 transition-all text-left group p-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-900/40 border border-brand-700/40 flex items-center justify-center mb-4">
                <Send size={28} className="text-brand-400" />
              </div>
              <h2 className="text-lg font-extrabold text-white mb-2">Como Fazer Repasses</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Aprenda a depositar, definir os <span className="text-brand-400 font-semibold">P$ Poins</span> do
                seu filho e transferir o valor líquido para a conta bancária de destino dentro do prazo.
              </p>
              <div className="flex items-center gap-1 text-brand-400 text-sm font-semibold mt-4 group-hover:gap-2 transition-all">
                Ver guia <ChevronRight size={16} />
              </div>
            </button>
          )}

          {/* Como Investir — visível apenas quando produtos financeiros estão ativos */}
          {FEATURES.financialProducts && (
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
                e como liberar <span className="text-brand-400 font-semibold">P$ Poins</span> para seu filho.
              </p>
              <div className="flex items-center gap-1 text-brand-400 text-sm font-semibold mt-4 group-hover:gap-2 transition-all">
                Ver produtos <ChevronRight size={16} />
              </div>
            </button>
          )}

          {/* Como Jogar */}
          <button
            onClick={() => setSection('jogos')}
            className="card hover:border-emerald-600/40 hover:bg-dark-600 transition-all text-left group p-6"
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

        {/* Como a Pouplay funciona */}
        <div className="card p-5 bg-brand-900/10 border-brand-700/30">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Como a Pouplay funciona</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Você define qual % do depósito vira{' '}
                <span className="text-brand-400 font-semibold">P$ Poins</span> (P$ 1,00 = R$ 1,00) para
                o seu filho, e transfere o valor líquido para a conta bancária que desejar. Os Poins ficam
                bloqueados e são liberados após a confirmação da transferência — transformando poupança em
                diversão! Você tem até 5 dias úteis para registrar cada transferência.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Seção: Como Fazer Repasses ────────────────────────────────────────────
  if (section === 'repasses') {
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
            <Send size={20} className="text-brand-400" /> Como Fazer Repasses
          </h1>
        </div>

        <div className="card p-4 bg-brand-900/10 border-brand-700/30 flex items-start gap-3 text-sm">
          <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-gray-300">
            Após confirmar o PIX, você tem{' '}
            <strong className="text-yellow-400">5 dias úteis</strong> para registrar a transferência
            do valor líquido. Passado o prazo, a Pouplay inicia o processo de devolução automática.
          </p>
        </div>

        <div className="space-y-3">
          {REPASSES_STEPS.map((step, i) => {
            const isOpen = openStep === i
            const Icon = step.icon
            return (
              <div key={i} className={clsx('card transition-all', isOpen && 'border-brand-600/40')}>
                <button
                  className="w-full flex items-center gap-4 text-left"
                  onClick={() => setOpenStep(isOpen ? null : i)}
                >
                  <div className={clsx('w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0', step.bg)}>
                    <Icon size={18} className={step.color} />
                  </div>
                  <span className="flex-1 font-bold text-white text-sm">{step.title}</span>
                  <ChevronRight size={16} className={clsx('text-gray-500 transition-transform flex-shrink-0', isOpen && 'rotate-90')} />
                </button>
                {isOpen && (
                  <ol className="mt-4 pt-4 border-t border-dark-500 space-y-2 list-decimal list-inside">
                    {step.items.map((item, j) => (
                      <li key={j} className="text-sm text-gray-300 leading-relaxed">{item}</li>
                    ))}
                  </ol>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={() => navigate('/depositar')}
          className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2"
        >
          <PiggyBank size={16} /> Fazer um depósito agora <ChevronRight size={14} />
        </button>
      </div>
    )
  }

  // ── Seção: Como Investir (visível apenas com FEATURES.financialProducts) ──
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
                    {FEATURES.financialProducts && (
                      <button
                        onClick={() => navigate(`/produtos?invest=${p.id}`)}
                        className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
                      >
                        Investir agora <ChevronRight size={14} />
                      </button>
                    )}
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
