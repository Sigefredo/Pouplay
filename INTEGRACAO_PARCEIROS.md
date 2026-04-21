# Pouplay — Guia de Integração para Parceiros Técnicos

Este documento lista todas as configurações que precisam ser alteradas após a assinatura dos contratos comerciais. Está organizado por tipo de parceiro e indica exatamente **qual arquivo**, **qual trecho de código** e **o que substituir**.

---

## 1. Integração com Instituições Financeiras (Bancos e Corretoras)

### Como funciona
Quando um usuário clica em "Investir agora" na plataforma, ele é redirecionado para o site da instituição parceira com um **código de rastreio único** na URL. Após o investimento ser confirmado, a instituição chama um **webhook** da Pouplay, que credita automaticamente os Poins na conta do usuário.

---

### 1.1 — Configurar a URL de destino de cada produto

**Arquivo:** `backend/src/index.js`

**Trecho atual (linhas ~23 a 32):**
```js
const INSTITUTION_URLS = {
  'Banco Digital Plus': 'https://www.bancodigitalplus.com.br/investimentos/cdb-premium',
  'Corretora Investe+':  'https://www.corretoraeinveste.com.br/produtos/tesouro-direto',
  'BancoFlex':           'https://www.bancoflex.com.br/investimentos/lca-agronegocio',
  'XFinance':            'https://www.xfinance.com.br/produtos/cdb-flex',
  'SafeBank':            'https://www.safebank.com.br/conta/poupanca-plus',
  'Broker360':           'https://www.broker360.com.br/fundos/fundo-di-master',
}
```

**O que fazer:** Substituir cada URL fictícia pela URL real da página do produto no site da instituição parceira. O nome da chave (ex: `'Banco Digital Plus'`) deve ser idêntico ao nome cadastrado nos produtos financeiros do frontend.

**Mesma configuração também existe no frontend** (`frontend/src/pages/Products.tsx`, objeto `INSTITUTION_URLS`). As duas listas devem estar sincronizadas.

---

### 1.2 — Configurar o segredo do Webhook

O webhook é o mecanismo pelo qual a instituição financeira avisa a Pouplay que um investimento foi confirmado e o cashback deve ser creditado.

**Arquivo:** `backend/src/index.js`

**Trecho atual (linha ~13):**
```js
const WEBHOOK_SECRET = 'pouplay-webhook-secret-2026'
```

**O que fazer:**
1. Gerar uma string secreta aleatória e longa (mínimo 32 caracteres) para uso em produção
2. Substituir o valor acima pela nova string
3. Compartilhar essa mesma string com o time técnico de cada instituição parceira — eles precisarão enviá-la no header `x-pouplay-signature` em toda chamada ao webhook

---

### 1.3 — Endpoint do Webhook (para enviar ao parceiro financeiro)

A instituição parceira precisará chamar este endpoint quando um investimento for confirmado:

```
Método:  POST
URL:     https://[domínio-da-pouplay]/api/webhook/bank-cashback
Header:  x-pouplay-signature: [WEBHOOK_SECRET]

Corpo (JSON):
{
  "referralCode": "código único gerado no redirecionamento",
  "investedAmount": 1000.00,
  "cashbackAmount": 50.00
}
```

O campo `referralCode` estará presente na URL de redirecionamento do usuário como o parâmetro `ref=`. A instituição deve capturá-lo no momento do cadastro/investimento e devolvê-lo neste webhook.

---

### 1.4 — Prazo e percentual de cashback por produto

**Arquivo:** `frontend/src/data/products.ts`

Cada produto financeiro tem os campos `cashbackPoins` e `cashbackPercent`. Esses valores devem refletir exatamente o acordado em contrato com cada instituição.

```ts
{
  institution: 'Banco Digital Plus',
  cashbackPoins: 50,       // ← valor em Poins que o usuário recebe
  cashbackPercent: 5,      // ← percentual informativo exibido na tela
}
```

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
  const code = usesCode ? /* gera código mock */ : null

  return {
    success: true,
    transactionId: txId,
    deliveryMethod: usesCode ? 'code' : 'account_credit',
    code,
    deliveryMessage: ...,
  }
}
```

**O que fazer:** Substituir o corpo desta função pela chamada real à API do distribuidor contratado. A função deve continuar retornando o mesmo formato de resposta (`success`, `transactionId`, `deliveryMethod`, `code`, `deliveryMessage`) para que o restante do sistema funcione sem alteração.

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
      product_id: RAZER_PRODUCT_IDS[gameId],
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

Cada distribuidor usa seus próprios IDs internos para cada pacote de moedas. Será necessário criar um mapeamento entre os IDs da Pouplay e os IDs do distribuidor.

**Arquivo:** `backend/src/index.js` (adicionar após a linha do `INSTITUTION_URLS`)

```js
// IDs dos pacotes conforme cadastro no portal do distribuidor
const DISTRIBUTOR_PRODUCT_IDS = {
  'ff1': 'GARENA_FF_100',    // 100 diamantes Free Fire
  'ff2': 'GARENA_FF_310',    // 310 diamantes
  'ff3': 'GARENA_FF_520',
  'ff4': 'GARENA_FF_1060',
  'ff5': 'GARENA_FF_2180',
  'rx1': 'ROBLOX_80',        // 80 Robux
  'rx2': 'ROBLOX_400',
  // ... demais pacotes
}
```

Os IDs exatos serão fornecidos pelo distribuidor após o contrato.

---

### 2.3 — Credenciais de API do distribuidor (variáveis de ambiente)

Em produção, **nunca** inserir chaves de API diretamente no código. Usar variáveis de ambiente.

**Criar o arquivo** `backend/.env` com:
```
RAZER_GOLD_API_KEY=sua_chave_aqui
RAZER_GOLD_MERCHANT_ID=seu_id_aqui
JWT_SECRET=string_aleatoria_longa_para_producao
WEBHOOK_SECRET=string_aleatoria_longa_para_producao
```

**Instalar o pacote dotenv:**
```
npm install dotenv
```

**Adicionar no topo de** `backend/src/index.js`:
```js
import 'dotenv/config'
// Usar process.env.RAZER_GOLD_API_KEY no lugar dos valores fixos
```

---

## 3. Checklist de Integração por Parceiro

### Instituição Financeira

- [ ] Fornecer à Pouplay a URL da página de cada produto contratado
- [ ] Receber e configurar o `WEBHOOK_SECRET` no sistema interno
- [ ] Implementar captura do parâmetro `ref=` na URL de entrada do usuário
- [ ] Implementar a chamada ao webhook da Pouplay após confirmação do investimento
- [ ] Definir o valor de cashback (em Poins) por produto, conforme contrato
- [ ] Realizar testes com o endpoint de homologação antes de ir a produção

### Distribuidor de Jogos (Razer Gold / UniPin / outro)

- [ ] Fornecer à Pouplay as credenciais de API (chave e merchant ID)
- [ ] Fornecer o catálogo de IDs de produtos por jogo
- [ ] Definir método de entrega por jogo: código resgatável ou crédito em conta
- [ ] Confirmar quais jogos suportam crédito direto via Player ID
- [ ] Realizar testes de compra em ambiente de sandbox antes de produção

---

## 4. Contato para Dúvidas Técnicas

Para dúvidas sobre a implementação do webhook ou da API de jogos, o time técnico da Pouplay pode ser acionado diretamente. Todas as rotas estão documentadas no endpoint:

```
GET https://[domínio-da-pouplay]/api/health
```

Que retorna o status do sistema, estatísticas e a URL do webhook bancário.
