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

// ── Manual de Utilização ─────────────────────────────────────────────────────
const manualSteps = [
  {
    title: '1. Acesse e faça login',
    steps: [
      'Abra a plataforma Pouplay no navegador do celular ou computador.',
      'Na tela de login, informe seu e-mail e senha cadastrados.',
      'Clique em "Entrar". Você será direcionado ao Dashboard principal.',
      'Caso esqueça a senha, entre em contato pelo WhatsApp ou e-mail de suporte.',
    ],
  },
  {
    title: '2. Conheça o Dashboard',
    steps: [
      'O Dashboard é a tela inicial. Nele você vê seu saldo atual em P$ Poins.',
      'São exibidos os últimos investimentos realizados e compras de moedas.',
      'Use o menu lateral (desktop) ou a barra inferior (celular) para navegar.',
    ],
  },
  {
    title: '3. Deposite via PIX e defina os Poins do seu filho',
    steps: [
      'Acesse "Depositar" pelo menu lateral.',
      'Informe o valor que deseja depositar (mínimo R$ 50,00).',
      'Use o slider para definir o percentual do depósito que será convertido em P$ Poins para o seu filho.',
      'A plataforma calcula automaticamente: Poins gerados, taxa de serviço (5% sobre os Poins) e valor líquido disponível para investir.',
      'Clique em "Gerar chave PIX", copie a chave e realize a transferência no seu banco.',
      'Após a confirmação do PIX, os Poins são creditados na conta do seu filho em status bloqueado e o valor líquido fica disponível na conta de garantia.',
    ],
  },
  {
    title: '4. Invista o valor disponível em produtos financeiros',
    steps: [
      'Com o saldo disponível na conta de garantia, acesse "Produtos" pelo menu.',
      'A lista exibe primeiro os produtos cujo valor mínimo é igual ou inferior ao seu saldo — coloridos e com o botão "Investir agora" ativo.',
      'Produtos com valor mínimo superior ao saldo aparecem logo abaixo, acinzentados e com o botão desabilitado — ficam visíveis para planejamento futuro.',
      'Use os filtros (instituição, tipo, faixa de valor) para encontrar o produto ideal. Clique em "Saiba mais" para ler detalhes completos.',
      'Clique em "Investir agora". O modal de confirmação exibe automaticamente os dados do beneficiário: nome completo, CPF e data de nascimento do filho vinculado à sua conta.',
      'Verifique e ajuste o valor a investir. O campo vem pré-preenchido com o saldo total disponível; você pode digitar qualquer valor, desde que seja igual ou superior ao mínimo do produto.',
      'No campo "Chave PIX da conta no banco/corretora", informe a chave PIX da conta onde o investimento será realizado em nome do seu filho.',
      'Clique em "Confirmar". A plataforma registra o investimento e gera um código de rastreio único no formato POI-AAAAMMDD-XXXXXX.',
      'A tela de sucesso exibe a chave PIX destino, o valor e o código de rastreio. Copie o código — você precisará incluí-lo na descrição da transferência PIX.',
      'Realize a transferência PIX no seu banco (aplicativo ou internet banking) para a chave informada, incluindo o código de rastreio na descrição da transferência.',
      'Quando o banco/corretora confirmar o recebimento e a efetivação do investimento, os Poins do seu filho são liberados automaticamente.',
    ],
  },
  {
    title: '5. Acompanhe depósitos e investimentos',
    steps: [
      'Acesse "Meus Investimentos" pelo menu.',
      'Na aba "Investimentos": veja cada produto investido e seu status (Aguardando / Confirmado).',
      'Na aba "Depósitos": veja o histórico de depósitos PIX e o saldo restante de cada um.',
      'O badge amarelo no menu indica investimentos aguardando confirmação bancária.',
      'Quando confirmado, os Poins saem de bloqueados e ficam disponíveis para uso.',
    ],
  },
  {
    title: '6. Compre moedas nos jogos',
    steps: [
      'Acesse "Jogos" pelo menu.',
      'Veja o saldo disponível em P$ Poins no topo da tela.',
      'Escolha o jogo desejado: Free Fire, Roblox, Fortnite ou Minecraft.',
      'Clique em "Saiba mais" para entender como cada moeda funciona no jogo.',
      'Selecione o pacote de moedas e clique em "Comprar".',
      'Confirme os valores incluindo a taxa de serviço (5%) e clique em "Confirmar".',
      'Para Roblox e Minecraft: um código de resgate será exibido. Copie e use na loja do jogo.',
      'Para Free Fire e Fortnite: as moedas são creditadas diretamente na conta do jogo.',
    ],
  },
  {
    title: '7. Verifique seu saldo e histórico',
    steps: [
      'Acesse "Carteira" pelo menu para ver o saldo completo em P$ Poins.',
      'O histórico mostra todas as transações: cashbacks recebidos e compras realizadas.',
      'Cada transação exibe data, valor, tipo e status.',
    ],
  },
  {
    title: '8. Gerencie seu perfil',
    steps: [
      'Acesse "Perfil" para ver seus dados cadastrais.',
      'Perfis do tipo "Responsável" podem gerenciar perfis menores vinculados.',
      'Perfis menores (abaixo de 18 anos) têm acesso restrito e supervisionado.',
    ],
  },
]

function Manual() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400">
        Siga os passos abaixo para aprender a usar todas as funcionalidades da Pouplay.
      </p>
      {manualSteps.map((section, i) => (
        <div key={i} className={clsx('card transition-all', open === i && 'border-brand-600/50')}>
          <button
            className="w-full flex items-center justify-between text-left gap-3"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-bold text-white text-sm">{section.title}</span>
            <ChevronRight size={16} className={clsx('text-gray-500 transition-transform flex-shrink-0', open === i && 'rotate-90')} />
          </button>
          {open === i && (
            <ol className="mt-4 pt-4 border-t border-dark-500 space-y-2 list-decimal list-inside">
              {section.steps.map((s, j) => (
                <li key={j} className="text-sm text-gray-300 leading-relaxed">{s}</li>
              ))}
            </ol>
          )}
        </div>
      ))}
    </div>
  )
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  {
    category: 'Sobre a Pouplay',
    items: [
      { q: 'O que é a Pouplay?', a: 'A Pouplay é uma plataforma que conecta investimentos financeiros ao universo dos jogos digitais. O pai deposita um valor via PIX, define um percentual que será convertido em P$ Poins para o filho, e investe o valor líquido em produtos financeiros de instituições parceiras. Os Poins ficam bloqueados até o investimento ser confirmado pelo banco — garantindo que o filho só use as moedas após o investimento ser efetivado.' },
      { q: 'O que são P$ Poins?', a: 'Poins (P$) é a moeda virtual da Pouplay. Cada P$ 1,00 equivale a R$ 1,00. Eles são gerados no momento do depósito PIX, ficam bloqueados enquanto o investimento aguarda confirmação bancária e são liberados automaticamente após a confirmação. Podem ser usados exclusivamente para comprar moedas em jogos disponíveis na plataforma. Poins não podem ser sacados em dinheiro.' },
      { q: 'A Pouplay é segura?', a: 'Sim. O valor depositado via PIX fica custodiado na conta de garantia da Pouplay e só é transferido para a instituição financeira parceira (banco ou corretora regulamentada pelo Banco Central) quando o pai confirma o investimento na plataforma. Os Poins do filho são liberados somente após a confirmação oficial do banco, garantindo que o dinheiro foi efetivamente investido.' },
    ],
  },
  {
    category: 'Conta e Cadastro',
    items: [
      { q: 'Menores de 18 anos podem usar a plataforma?', a: 'Sim, mas de forma supervisionada. Menores de 18 anos precisam ter um perfil vinculado a um responsável legal (pai, mãe ou guardião). O responsável realiza os investimentos, recebe os Poins e pode autorizar as compras de moedas de jogos. O menor acessa a plataforma com um perfil próprio, mas com funcionalidades restritas.' },
      { q: 'Como um responsável cadastra um menor?', a: 'Após criar sua conta como responsável, acesse "Perfil" e utilize a opção de adicionar um perfil vinculado. Informe os dados do menor e ele receberá acesso com as permissões adequadas à faixa etária.' },
      { q: 'Um menor pode investir sozinho?', a: 'Não. Apenas o perfil responsável pode realizar investimentos e acumular Poins. O perfil menor pode navegar pela plataforma, acompanhar o saldo e solicitar compras de moedas de jogos, mas a autorização final fica com o responsável.' },
      { q: 'Posso ter mais de um perfil menor vinculado?', a: 'Sim. Um responsável pode vincular múltiplos perfis menores à sua conta, por exemplo, para diferentes filhos. Cada perfil tem seu histórico de compras separado.' },
    ],
  },
  {
    category: 'Investimentos e Cashback',
    items: [
      { q: 'Como os Poins são gerados?', a: 'Ao realizar um depósito via PIX, você define o percentual do valor que será convertido em Poins para o filho. Por exemplo: depositando R$ 1.000 com 10% para Poins, são gerados P$ 100 — que ficam bloqueados. O valor líquido (R$ 895 após a taxa de 5% sobre os Poins) fica disponível na conta de garantia para você investir.' },
      { q: 'Quando os Poins ficam disponíveis para o filho usar?', a: 'Os Poins são gerados no depósito mas ficam bloqueados. Eles são liberados automaticamente assim que o banco ou corretora confirmar que o investimento foi efetivado. O prazo de confirmação depende da instituição — em geral de alguns minutos a 2 dias úteis.' },
      { q: 'Onde vejo meus investimentos e depósitos?', a: 'Acesse "Meus Investimentos" pelo menu. A aba "Investimentos" mostra cada produto investido e o status (Aguardando confirmação ou Confirmado). A aba "Depósitos" mostra o histórico de depósitos PIX e o saldo disponível de cada um. O extrato completo também está em "Carteira".' },
      { q: 'Os Poins têm prazo de validade?', a: 'Não. Os Poins creditados na conta não expiram enquanto a conta estiver ativa na plataforma.' },
      { q: 'Posso fazer mais de um depósito?', a: 'Sim. Não há limite de depósitos. Cada depósito gera seu próprio lote de Poins bloqueados e saldo disponível para investir. O sistema controla o saldo de cada depósito separadamente.' },
      { q: 'Como a plataforma indica quais produtos posso investir com meu saldo atual?', a: 'A lista de Produtos Financeiros é ordenada automaticamente conforme o seu saldo disponível: os produtos cujo valor mínimo é igual ou inferior ao saldo aparecem no topo, coloridos e com o botão "Investir agora" habilitado. Produtos com valor mínimo superior ao saldo aparecem logo abaixo, levemente acinzentados e com o botão desabilitado — eles continuam visíveis para planejamento futuro.' },
      { q: 'Posso investir um valor parcial do meu saldo disponível?', a: 'Sim. Ao clicar em "Investir agora", o modal de confirmação exibe um campo onde você digita o valor exato que deseja aplicar. O campo vem pré-preenchido com o saldo total disponível, mas você pode alterar para qualquer valor, desde que seja igual ou superior ao mínimo do produto e não ultrapasse o saldo disponível. Enquanto o valor digitado estiver fora dos limites, o botão "Confirmar" fica desabilitado e uma mensagem de erro é exibida.' },
      { q: 'O que é a Chave PIX solicitada no modal de investimento?', a: 'É a chave PIX da conta no banco ou corretora parceira para onde você transferirá o valor do investimento. Essa conta será associada ao produto financeiro escolhido em nome do seu filho. A chave pode ser CPF, e-mail, telefone ou chave aleatória — conforme fornecida pela instituição parceira.' },
      { q: 'O que é o código de rastreio e para que serve?', a: 'O código de rastreio (formato POI-AAAAMMDD-XXXXXX) é gerado automaticamente pela plataforma ao confirmar o investimento. Ele deve ser incluído na descrição da transferência PIX que você realiza no seu banco. Com ele, o banco/corretora parceiro consegue identificar a origem do investimento e comunicar a confirmação para a Pouplay, que libera automaticamente os Poins do seu filho.' },
      { q: 'O que acontece se eu esquecer de incluir o código de rastreio na transferência PIX?', a: 'Sem o código de rastreio na descrição, o banco/corretora parceiro pode não conseguir associar a transferência ao investimento registrado na plataforma. Nesse caso, entre em contato com o suporte da Pouplay pelo WhatsApp ou e-mail informando o ID do investimento e o comprovante da transferência PIX para regularização manual.' },
    ],
  },
  {
    category: 'Jogos e Compras',
    items: [
      { q: 'Como compro moedas de jogos com meus Poins?', a: 'Acesse "Jogos" no menu, escolha o jogo desejado, selecione o pacote de moedas e clique em "Comprar". Confirme a compra e o sistema processará automaticamente. Para Roblox e Minecraft você receberá um código de resgate; para Free Fire e Fortnite as moedas são creditadas diretamente na conta do jogo.' },
      { q: 'Existe taxa para comprar moedas de jogos?', a: 'Sim. É cobrada uma taxa de serviço de 5% sobre o valor do pacote. Por exemplo, um pacote de P$ 39,90 terá uma taxa de P$ 2,00, totalizando P$ 41,90 descontados do seu saldo. O valor exato sempre é mostrado na tela de confirmação antes de você concluir a compra.' },
      { q: 'Onde ficam registradas minhas compras de moedas?', a: 'Em "Carteira", no histórico de transações. Cada compra aparece com o nome do jogo, quantidade de moedas, valor descontado e data da transação.' },
      { q: 'O que fazer se o código de resgate não funcionar?', a: 'Primeiro, certifique-se de digitá-lo exatamente como exibido, sem espaços extras. Se o problema persistir, entre em contato com o suporte pela aba "Fale Conosco" informando o ID da transação (exibido na tela de confirmação da compra).' },
    ],
  },
  {
    category: 'Poins e Saldo',
    items: [
      { q: 'Posso transferir Poins para outra pessoa?', a: 'Não. Os Poins são pessoais e intransferíveis. Eles só podem ser utilizados na conta em que foram creditados, para compra de moedas dos jogos disponíveis na plataforma.' },
      { q: 'Posso converter Poins de volta para dinheiro (saque)?', a: 'Não. Os P$ Poins são uma moeda virtual interna e só podem ser usados para comprar moedas nos jogos da plataforma. Eles não têm valor monetário resgatável em dinheiro.' },
      { q: 'Como acompanho meu saldo de Poins?', a: 'O saldo disponível aparece no topo da tela em todas as páginas. O Dashboard também mostra um aviso quando há Poins bloqueados aguardando confirmação. O extrato completo, com cada depósito, liberação de Poins e compra de moedas está em "Carteira".' },
    ],
  },
  {
    category: 'Privacidade e Segurança',
    items: [
      { q: 'A Pouplay tem acesso aos meus dados bancários?', a: 'Não. A Pouplay não coleta nem armazena dados bancários. O depósito é feito via PIX para a conta de garantia da plataforma. A transferência para o banco/corretora parceiro é iniciada pela Pouplay somente após sua confirmação na plataforma. A Pouplay recebe do banco apenas a confirmação da efetivação do investimento.' },
      { q: 'Como a Pouplay trata meus dados pessoais?', a: 'Em conformidade com a Lei Geral de Proteção de Dados (LGPD). Coletamos apenas os dados necessários para o funcionamento da plataforma e não os compartilhamos com terceiros além das instituições parceiras envolvidas na transação. Consulte nossos Termos de Uso para mais detalhes.' },
    ],
  },
]

function FAQ() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        Clique em qualquer pergunta para ver a resposta.
      </p>
      {faqs.map((cat, ci) => (
        <div key={ci} className="space-y-2">
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider px-1">
            {cat.category}
          </p>
          {cat.items.map((item, ii) => {
            const id = `${ci}-${ii}`
            return (
              <div key={id} className={clsx('card transition-all', open === id && 'border-brand-600/40')}>
                <button
                  className="w-full flex items-start justify-between gap-3 text-left"
                  onClick={() => setOpen(open === id ? null : id)}
                >
                  <span className="text-sm font-semibold text-white leading-relaxed">{item.q}</span>
                  <ChevronRight size={15} className={clsx('text-gray-500 transition-transform mt-0.5 flex-shrink-0', open === id && 'rotate-90')} />
                </button>
                {open === id && (
                  <p className="mt-3 pt-3 border-t border-dark-500 text-sm text-gray-300 leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Termos de Uso ─────────────────────────────────────────────────────────────
function Termos() {
  return (
    <div className="card p-6 space-y-6 text-sm text-gray-300 leading-relaxed">
      <div>
        <h2 className="text-lg font-extrabold text-white mb-1">Termos de Uso e Política de Privacidade</h2>
        <p className="text-xs text-gray-500">Última atualização: abril de 2026</p>
      </div>

      {[
        {
          title: '1. Das Partes e Aceitação',
          text: 'Estes Termos de Uso regulam o acesso e a utilização da plataforma Pouplay ("Plataforma"), de titularidade de Pouplay Tecnologia Ltda. ("Pouplay", "nós"). Ao criar uma conta ou utilizar a Plataforma, você ("Usuário") declara ter lido, compreendido e concordado integralmente com estes Termos. Se não concordar, interrompa o uso imediatamente.',
        },
        {
          title: '2. Descrição do Serviço',
          text: 'A Pouplay é uma plataforma de gestão financeira familiar que permite ao responsável depositar valores via PIX em uma conta de garantia, definir um percentual a ser convertido em P$ Poins para uso do filho em jogos digitais, e investir o valor líquido em produtos financeiros de instituições parceiras (bancos e corretoras regulamentados pelo Banco Central do Brasil). O investimento é operacionalizado pelo próprio responsável, que realiza uma transferência PIX diretamente para a conta da instituição parceira indicada no produto escolhido, utilizando um código de rastreio único gerado pela plataforma. A Pouplay custodia temporariamente os valores depositados na conta de garantia até a efetivação do investimento. A Pouplay não é uma instituição financeira e não oferece qualquer garantia de rentabilidade dos produtos investidos.',
        },
        {
          title: '3. Cadastro e Perfis',
          text: 'O cadastro é permitido a maiores de 18 anos. Menores de 18 anos somente podem utilizar a Plataforma mediante cadastro e supervisão de um responsável legal (pai, mãe ou tutor), que assume total responsabilidade pelas atividades realizadas no perfil vinculado. O Usuário é responsável pela veracidade das informações fornecidas e pela segurança de suas credenciais de acesso.',
        },
        {
          title: '4. Poins e Cashback',
          text: 'Os P$ Poins são uma moeda virtual interna da Plataforma, sem valor monetário resgatável em espécie. São gerados no momento do depósito PIX, com base no percentual definido pelo responsável, e ficam bloqueados até que o investimento correspondente seja confirmado pela instituição financeira parceira. Após a confirmação, ficam disponíveis para uso exclusivo na aquisição de moedas de jogos na Plataforma. Cada P$ 1,00 equivale a R$ 1,00 para esse fim. Os Poins são pessoais, intransferíveis e não possuem prazo de validade enquanto a conta estiver ativa.',
        },
        {
          title: '5. Responsabilidades do Usuário',
          text: 'O Usuário compromete-se a: (a) fornecer informações verdadeiras no cadastro; (b) não utilizar a Plataforma para fins ilícitos; (c) manter sigilo de suas credenciais; (d) responder por todas as atividades realizadas em sua conta; (e) supervisionar o uso por menores vinculados à sua conta.',
        },
        {
          title: '6. Limitação de Responsabilidade',
          text: 'A Pouplay não se responsabiliza por: (a) perdas decorrentes de investimentos realizados nas instituições parceiras; (b) indisponibilidade temporária da Plataforma; (c) problemas técnicos nos sistemas das instituições parceiras ou distribuidoras de jogos; (d) uso não autorizado das credenciais do Usuário por terceiros.',
        },
        {
          title: '7. Tratamento de Dados Pessoais — LGPD',
          text: 'Em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD), informamos: (a) Controlador: Pouplay Tecnologia Ltda.; (b) Dados coletados: nome, e-mail, data de nascimento, dados de navegação na Plataforma; (c) Finalidade: prestação dos serviços descritos nestes Termos, prevenção a fraudes e comunicações sobre a Plataforma; (d) Base legal: execução de contrato (art. 7º, V) e legítimo interesse (art. 7º, IX); (e) Compartilhamento: somente com instituições parceiras envolvidas nas transações do Usuário; (f) Retenção: pelo período necessário à prestação dos serviços e cumprimento de obrigações legais; (g) Direitos: o Usuário pode, a qualquer momento, solicitar acesso, correção, exclusão, portabilidade ou revogação do consentimento dos seus dados pelo e-mail de contato.',
        },
        {
          title: '8. Direitos do Titular (LGPD)',
          text: 'Nos termos dos arts. 17 a 22 da LGPD, o Usuário tem direito a: confirmar a existência de tratamento; acessar seus dados; corrigir dados incompletos ou desatualizados; solicitar a anonimização, bloqueio ou eliminação de dados desnecessários; solicitar a portabilidade dos dados; obter informações sobre compartilhamento; revogar o consentimento. Para exercer esses direitos, entre em contato pelo e-mail sigefredo@gmail.com.',
        },
        {
          title: '9. Segurança dos Dados',
          text: 'A Pouplay adota medidas técnicas e organizacionais adequadas para proteger os dados pessoais contra acessos não autorizados, destruição, perda, alteração ou divulgação. Em caso de incidente de segurança que possa acarretar risco aos titulares, a Pouplay comunicará a ocorrência à Autoridade Nacional de Proteção de Dados (ANPD) e aos usuários afetados nos prazos legais.',
        },
        {
          title: '10. Cookies e Dados de Navegação',
          text: 'A Plataforma utiliza armazenamento local (localStorage) para manter a sessão do usuário e preferências da interface. Não utilizamos cookies de rastreamento publicitário de terceiros.',
        },
        {
          title: '11. Alterações nos Termos',
          text: 'A Pouplay reserva-se o direito de atualizar estes Termos a qualquer momento. Alterações relevantes serão comunicadas por e-mail ou notificação na Plataforma com antecedência mínima de 15 dias. O uso continuado da Plataforma após essa comunicação implica aceitação das novas condições.',
        },
        {
          title: '12. Foro e Lei Aplicável',
          text: 'Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de Teresina — PI para resolução de quaisquer litígios decorrentes deste instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.',
        },
      ].map((section, i) => (
        <div key={i}>
          <p className="font-bold text-white mb-1">{section.title}</p>
          <p>{section.text}</p>
        </div>
      ))}

      <div className="border-t border-dark-500 pt-4">
        <p className="text-xs text-gray-500">
          Dúvidas sobre estes Termos ou sobre o tratamento de dados pessoais: <span className="text-brand-400">sigefredo@gmail.com</span>
        </p>
      </div>
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
