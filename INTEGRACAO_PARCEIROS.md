# Pouplay — Guia de Integração para Parceiros Técnicos

Este documento descreve o fluxo operacional atual da plataforma e lista todas as configurações que precisam ser realizadas para a integração com parceiros em produção. Está organizado por tipo de parceiro e indica exatamente **qual arquivo**, **qual trecho de código** e **o que substituir**.

---

## 1. Integração com Instituições Financeiras (Bancos e Corretoras)

### Como funciona o fluxo de investimento

1. O responsável realiza um depósito via PIX para a conta de garantia da Pouplay.
2. A Pouplay bloqueia os P$ Poins do filho e disponibiliza o valor líquido para investimento.
3. O responsável escolhe um produto financeiro na plataforma e preenche a **chave PIX** da conta no banco/corretora parceiro.
4. A plataforma gera um **código de rastreio único** no formato `POI-AAAAMMDD-XXXXXX`.
5. O responsável realiza, manualmente no seu banco, uma **transferência PIX** para a chave informada, incluindo o código de rastreio na **descrição** da transferência.
6. A instituição parceira identifica a transferência pelo código de rastreio e confirma o investimento chamando o **webhook** da Pouplay.
7. A Pouplay libera automaticamente os Poins do filho.

> **Importante:** A transferência PIX de saída é realizada pelo próprio responsável no seu banco. A Pouplay não inicia transferências — atua como plataforma de gestão e rastreio.

---

### 1.1 — Código de Rastreio (Tracking ID)

O código de rastreio é gerado automaticamente pelo frontend no momento da confirmação do investimento:

**Arquivo:** `frontend/src/pages/Products.tsx`

```ts
function generateTrackingId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `POI-${date}-${rand}`
  // Exemplo: POI-20260424-A3B7KZ
}
```

O código é armazenado no campo `trackingId` do registro de investimento (`depositStore.ts`) e exibido ao usuário na tela de confirmação, com instruções para incluí-lo na descrição do PIX.

**O parceiro deve:**
- Capturar o `trackingId` da descrição da transferência PIX recebida
- Devolvê-lo no webhook de confirmação (ver seção 1.3)

---

### 1.2 — Dados do Beneficiário (Filho)

Cada investimento registrado na plataforma inclui os dados do filho como beneficiário:

| Campo | Descrição |
|---|---|
| `beneficiaryName` | Nome completo do filho |
| `beneficiaryCpf` | CPF do filho |
| `pixKey` | Chave PIX informada pelo responsável |
| `trackingId` | Código de rastreio único |
| `amount` | Valor a ser transferido |

Esses dados ficam armazenados em `depositStore.ts` (interface `Investment`) e devem ser usados pelo parceiro para vincular o investimento ao produto em nome do filho.

---

### 1.3 — Configurar o Segredo do Webhook

O webhook é o mecanismo pelo qual a instituição financeira avisa a Pouplay que um investimento foi confirmado e os Poins devem ser liberados.

**Arquivo:** `backend/src/index.js`

**Trecho atual (linha ~13):**
```js
const WEBHOOK_SECRET = 'pouplay-webhook-secret-2026'
```

**O que fazer:**
1. Gerar uma string aleatória e longa (mínimo 32 caracteres) para produção
2. Substituir o valor acima pela nova string
3. Compartilhar com o time técnico de cada parceiro — eles enviam no header `x-pouplay-signature`

---

### 1.4 — Endpoint do Webhook (para enviar ao parceiro financeiro)

A instituição parceira chama este endpoint após confirmar o recebimento e a efetivação do investimento:

```
Método:  POST
URL:     https://[domínio-da-pouplay]/api/webhook/bank-cashback
Header:  x-pouplay-signature: [WEBHOOK_SECRET]

Corpo (JSON):
{
  "trackingId": "POI-20260424-A3B7KZ",
  "investedAmount": 500.00,
  "commissionAmount": 25.00
}
```

| Campo | Obrigatório | Descrição |
|---|---|---|
| `trackingId` | Sim | Código de rastreio extraído da descrição do PIX recebido |
| `investedAmount` | Sim | Valor efetivamente investido na conta do produto |
| `commissionAmount` | Não | Valor da comissão a ser paga à Pouplay (conforme contrato) |

O campo `trackingId` é a chave de correlação entre a transferência PIX e o investimento registrado na plataforma.

---

### 1.5 — Comissão por Produto

Cada produto financeiro tem um campo de comissão que deve refletir o acordado em contrato com cada instituição:

**Arquivo:** `frontend/src/data/products.ts`

```ts
{
  institution: 'Banco Digital Plus',
  cashbackPoins:   50,   // ← Poins liberados ao filho na confirmação
  cashbackPercent:  5,   // ← Percentual informativo exibido na tela
}
```

> **Nota:** `cashbackPoins` e `cashbackPercent` serão renomeados para `commissionPoins` e `commissionPercent` em uma próxima versão, refletindo que são comissões pagas pelo parceiro e não cashback gerado por afiliação.

---

### 1.6 — Integração com PSP para Recebimento de Depósitos (Roadmap)

Atualmente o depósito do responsável na conta de garantia da Pouplay é confirmado manualmente (simulação de demo). Em produção, será necessário integrar com um **Provedor de Serviços de Pagamento (PSP)** habilitado pelo Banco Central para:

- Gerar QR Codes PIX dinâmicos para cada depósito
- Receber notificações automáticas de pagamento via webhook do PSP
- Conciliar automaticamente os depósitos recebidos com os registros na plataforma

**PSPs recomendados:** Gerencianet/Efí, Asaas, Juno, Pagar.me, Mercado Pago Business

**Arquivo a modificar:** `frontend/src/pages/Deposit.tsx` (função `handleConfirm`) e `backend/src/index.js` (novo endpoint de webhook do PSP)

---

## 2. Integração com Distribuidores de Jogos

### Como funciona
Quando um usuário compra um pacote de moedas, o backend da Pouplay chama a API de um **distribuidor autorizado** (como Razer Gold ou UniPin). O distribuidor entrega as moedas diretamente na conta do usuário no jogo, ou gera um código de resgate.

---

### 2.1 — Substituir a função mock pelo SDK real do distribuidor

**Arquivo:** `backend/src/index.js`

**Trecho atual (linhas ~44 a 68):**
```js
async function callDistributorAPI(gameId, { coins, coinName }) {
  // Simula latência real de uma API de distribuidor (~1.5s)
  await new Promise(r => setTimeout(r, 1500))

  const txId = `DIST-${randomBytes(5).toString('hex').toUpperCase()}`

  const usesCode = gameId === 'roblox' || gameId === 'minecraft'

  return {
    success: true,
    transactionId: txId,
    deliveryMethod: usesCode ? 'code' : 'account_credit',
    code: usesCode ? '...' : null,
    deliveryMessage: '...',
  }
}
```

**O que fazer:** Substituir o corpo desta função pela chamada real à API do distribuidor contratado. A função deve continuar retornando o mesmo formato de resposta (`success`, `transactionId`, `deliveryMethod`, `code`, `deliveryMessage`).

**Exemplo com Razer Gold (estrutura de referência):**
```js
async function callDistributorAPI(gameId, { coins, coinName }) {
  const response = await fetch('https://api.razergold.com/v1/topup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RAZER_GOLD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: DISTRIBUTOR_PRODUCT_IDS[gameId],
      quantity: coins,
    }),
  })
  const data = await response.json()
  return {
    success: data.status === 'success',
    transactionId: data.transaction_id,
    deliveryMethod: data.delivery_method,
    code: data.redeem_code ?? null,
    deliveryMessage: data.message,
  }
}
```

---

### 2.2 — Mapeamento de IDs de produtos por jogo

**Arquivo:** `backend/src/index.js` (adicionar junto às constantes de configuração)

```js
const DISTRIBUTOR_PRODUCT_IDS = {
  'ff1': 'GARENA_FF_100',
  'ff2': 'GARENA_FF_310',
  'ff3': 'GARENA_FF_520',
  'ff4': 'GARENA_FF_1060',
  'ff5': 'GARENA_FF_2180',
  'rx1': 'ROBLOX_80',
  'rx2': 'ROBLOX_400',
  // ... demais pacotes conforme catálogo do distribuidor
}
```

---

### 2.3 — Credenciais de API (variáveis de ambiente)

Em produção, **nunca** inserir chaves de API diretamente no código.

**Criar o arquivo** `backend/.env`:
```
RAZER_GOLD_API_KEY=sua_chave_aqui
RAZER_GOLD_MERCHANT_ID=seu_id_aqui
JWT_SECRET=string_aleatoria_longa_para_producao
WEBHOOK_SECRET=string_aleatoria_longa_para_producao
PSP_API_KEY=chave_do_psp_aqui
PSP_WEBHOOK_SECRET=segredo_webhook_psp_aqui
```

**Adicionar no topo de** `backend/src/index.js`:
```js
import 'dotenv/config'
```

---

## 3. Checklist de Integração por Parceiro

### Instituição Financeira (Banco ou Corretora)

- [ ] Fornecer à Pouplay a chave PIX da conta que receberá os investimentos
- [ ] Receber e configurar o `WEBHOOK_SECRET` no sistema interno
- [ ] Implementar leitura do código de rastreio `POI-*` na descrição dos PIX recebidos
- [ ] Implementar a chamada ao webhook da Pouplay após confirmação do investimento, enviando `trackingId`, `investedAmount` e `commissionAmount`
- [ ] Definir o valor de comissão por produto (em Poins e em percentual), conforme contrato
- [ ] Confirmar o processo para registrar investimentos em nome do beneficiário filho (CPF + nome)
- [ ] Realizar testes com o endpoint de homologação antes de ir a produção

### Distribuidor de Jogos (Razer Gold / UniPin / outro)

- [ ] Fornecer à Pouplay as credenciais de API (chave e merchant ID)
- [ ] Fornecer o catálogo de IDs de produtos por jogo
- [ ] Definir método de entrega por jogo: código resgatável ou crédito em conta
- [ ] Confirmar quais jogos suportam crédito direto via Player ID
- [ ] Realizar testes de compra em ambiente de sandbox antes de produção

### PSP (Provedor de Serviços de Pagamento — para depósitos)

- [ ] Criar conta empresarial no PSP escolhido
- [ ] Obter credenciais de API (chave de produção e sandbox)
- [ ] Integrar geração de QR Code PIX dinâmico em `Deposit.tsx`
- [ ] Configurar webhook do PSP para confirmação automática de depósitos
- [ ] Testar conciliação entre depósito recebido e registro no `depositStore`

---

## 4. Painel Administrativo — Configuração de Parceiros

O Painel Administrativo (`/admin`) é a interface interna da Pouplay para configurar todas as integrações sem necessidade de alterar código. Está disponível apenas para contas com `role: 'admin'`.

---

### 4.1 — Aba: Parceiros Financeiros

Gerencie as instituições financeiras e seus produtos diretamente pela interface.

**Dados configuráveis por instituição:**

| Campo | Descrição |
|---|---|
| Nome | Nome da instituição exibido na plataforma |
| CNPJ | CNPJ da instituição (apenas informativo) |
| Chave PIX | Chave PIX da conta que receberá as transferências dos responsáveis |
| Comissão % | Percentual de comissão acordado em contrato |

**Dados calculados automaticamente:**

- **1ª operação:** exibida no card expandido da instituição; calculada a partir do primeiro investimento confirmado registrado com o nome daquela instituição. Não requer configuração manual.

**Dados configuráveis por produto:**

| Campo | Descrição |
|---|---|
| Nome | Nome completo do produto (exibido na tela de Produtos) |
| Tipo | CDB / LCA / LCI / Tesouro Direto / Fundo DI / Poupança+ |
| Taxa | Rentabilidade descritiva (ex: "120% CDI") |
| Valor mínimo | Valor mínimo de investimento em R$ |
| Tag | Texto de destaque opcional (ex: "Mais rentável") |
| Cor da tag | verde / azul / roxo / laranja / rosa |
| Popular | Marca o produto com badge "Popular" na listagem |

> **Fluxo recomendado:** cadastre a instituição → adicione os produtos → forneça a chave PIX ao parceiro financeiro para que ele configure o recebimento das transferências.

---

### 4.2 — Aba: Parceiros de Jogos

Configure os distribuidores de moedas e seus pacotes pela interface administrativa.

**Dados configuráveis por parceiro:**

| Campo | Descrição |
|---|---|
| Nome | Nome do distribuidor (ex: Garena, Roblox Corporation) |
| API Key | Chave de autenticação da API do distribuidor |
| Merchant ID | Identificador do lojista na plataforma do distribuidor |

> A API Key é exibida mascarada no painel após salva (apenas os 6 primeiros caracteres visíveis). Para alterá-la, use o botão de edição do parceiro.

**Dados configuráveis por pacote:**

| Campo | Descrição |
|---|---|
| ID do jogo | Identificador interno usado na chamada da API (ex: `freefire`) |
| Nome do jogo | Nome exibido ao usuário (ex: `Free Fire`) |
| Nome do pacote | Descrição do pacote (ex: `100 Diamantes`) |
| Quantidade | Número de moedas incluídas |
| Moeda | Nome da moeda do jogo (ex: `Diamantes`, `Robux`) |
| Preço (R$) | Preço em reais descontado dos Poins do usuário |
| Método de entrega | `account_credit` (crédito na conta do jogo) ou `redeem_code` (código resgatável) |
| Ativo | Toggle para ativar/desativar sem excluir o pacote |

> Pacotes inativos são ocultados da tela de Jogos para os usuários. Use o toggle diretamente na listagem — sem necessidade de abrir o modal de edição.

---

### 4.3 — Aba: Usuários

Listagem somente leitura de todos os usuários cadastrados, com role, CPF, data de nascimento e vinculação entre responsáveis e dependentes. Não permite edição — serve como consulta rápida para suporte.

---

## 5. Contato para Dúvidas Técnicas

Para dúvidas sobre a implementação do webhook, do código de rastreio ou da API de jogos:

- **WhatsApp:** (86) 99921-3970
- **E-mail:** sigefredo@gmail.com

O status do sistema e a URL do webhook estão disponíveis em:

```
GET https://[domínio-da-pouplay]/api/health
```
