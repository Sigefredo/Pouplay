export interface GamePackage {
  id: string
  coins: number
  coinName: string
  pricePoins: number
  bonus?: string
  popular?: boolean
  label?: string  // overrides "coins coinName" display (used for gift cards)
}

export interface Game {
  id: string
  name: string
  logo: string
  company: string
  description: string
  color: string
  category: 'moeda' | 'gift_card'
  deliveryMethod: 'code' | 'account_credit'
  redeemUrl?: string
  packages: GamePackage[]
}

export const GAMES: Game[] = [
  // ── Moedas in-game ─────────────────────────────────────────────────────────
  {
    id: 'freefire',
    name: 'Free Fire',
    logo: 'FF',
    company: 'Garena',
    description: 'O battle royale mais popular do Brasil. Compre Diamantes e desbloqueie skins exclusivas.',
    color: '#ff6b00',
    category: 'moeda',
    deliveryMethod: 'account_credit',
    packages: [
      { id: 'ff1', coins: 100,  coinName: 'Diamantes', pricePoins: 8.90  },
      { id: 'ff2', coins: 310,  coinName: 'Diamantes', pricePoins: 24.90, popular: true },
      { id: 'ff3', coins: 520,  coinName: 'Diamantes', pricePoins: 39.90, bonus: '+20 bônus' },
      { id: 'ff4', coins: 1060, coinName: 'Diamantes', pricePoins: 74.90, bonus: '+60 bônus' },
      { id: 'ff5', coins: 2180, coinName: 'Diamantes', pricePoins: 149.90, bonus: '+180 bônus' },
    ],
  },
  {
    id: 'roblox',
    name: 'Roblox',
    logo: 'RX',
    company: 'Roblox Corporation',
    description: 'A plataforma favorita das crianças. Use Robux para personalizar seu avatar e jogar.',
    color: '#00b06f',
    category: 'moeda',
    deliveryMethod: 'code',
    redeemUrl: 'roblox.com/redeem',
    packages: [
      { id: 'rx1', coins: 80,   coinName: 'Robux', pricePoins: 8.90  },
      { id: 'rx2', coins: 400,  coinName: 'Robux', pricePoins: 39.90, popular: true },
      { id: 'rx3', coins: 800,  coinName: 'Robux', pricePoins: 74.90, bonus: '+50 bônus' },
      { id: 'rx4', coins: 2000, coinName: 'Robux', pricePoins: 174.90, bonus: '+200 bônus' },
    ],
  },
  {
    id: 'lol',
    name: 'League of Legends',
    logo: 'LoL',
    company: 'Riot Games',
    description: 'O MOBA mais jogado do Brasil. Use Riot Points para campeões, skins e passes.',
    color: '#c89b3c',
    category: 'moeda',
    deliveryMethod: 'code',
    redeemUrl: 'prepaid.riotgames.com',
    packages: [
      { id: 'lol1', coins: 575,  coinName: 'RP', pricePoins: 19.90  },
      { id: 'lol2', coins: 1380, coinName: 'RP', pricePoins: 44.90, popular: true },
      { id: 'lol3', coins: 2800, coinName: 'RP', pricePoins: 84.90, bonus: '+160 bônus' },
      { id: 'lol4', coins: 5000, coinName: 'RP', pricePoins: 149.90, bonus: '+500 bônus' },
    ],
  },
  {
    id: 'easportsfc',
    name: 'EA Sports FC',
    logo: 'FC',
    company: 'Electronic Arts',
    description: 'O futebol virtual mais popular do Brasil. Compre FC Points para o Ultimate Team.',
    color: '#f04e23',
    category: 'moeda',
    deliveryMethod: 'code',
    redeemUrl: 'ea.com/pt_br/redeem',
    packages: [
      { id: 'fc1', coins: 500,  coinName: 'FC Points', pricePoins: 24.90  },
      { id: 'fc2', coins: 1050, coinName: 'FC Points', pricePoins: 44.90, popular: true },
      { id: 'fc3', coins: 2200, coinName: 'FC Points', pricePoins: 84.90, bonus: '+200 bônus' },
      { id: 'fc4', coins: 4600, coinName: 'FC Points', pricePoins: 164.90, bonus: '+600 bônus' },
    ],
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    logo: 'FN',
    company: 'Epic Games',
    description: 'O battle royale da Epic Games. Use V-Bucks para skins e o Passe de Batalha.',
    color: '#1a8fff',
    category: 'moeda',
    deliveryMethod: 'account_credit',
    packages: [
      { id: 'fn1', coins: 1000,  coinName: 'V-Bucks', pricePoins: 39.90  },
      { id: 'fn2', coins: 2800,  coinName: 'V-Bucks', pricePoins: 99.90, popular: true, bonus: '+300 bônus' },
      { id: 'fn3', coins: 5000,  coinName: 'V-Bucks', pricePoins: 159.90, bonus: '+1000 bônus' },
      { id: 'fn4', coins: 13500, coinName: 'V-Bucks', pricePoins: 399.90, bonus: '+3500 bônus' },
    ],
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    logo: 'MC',
    company: 'Microsoft / Mojang',
    description: 'Explore mundos infinitos. Compre Minecoins para skins e pacotes de textura.',
    color: '#8fbc34',
    category: 'moeda',
    deliveryMethod: 'code',
    redeemUrl: 'minecraft.net/redeem',
    packages: [
      { id: 'mc1', coins: 320,  coinName: 'Minecoins', pricePoins: 14.90  },
      { id: 'mc2', coins: 840,  coinName: 'Minecoins', pricePoins: 34.90, popular: true },
      { id: 'mc3', coins: 1720, coinName: 'Minecoins', pricePoins: 64.90, bonus: '+160 bônus' },
    ],
  },

  // ── Gift Cards ──────────────────────────────────────────────────────────────
  {
    id: 'googleplay',
    name: 'Google Play',
    logo: 'GP',
    company: 'Google',
    description: 'Gift card para a loja Google Play. Use em apps, jogos, filmes e livros Android.',
    color: '#34a853',
    category: 'gift_card',
    deliveryMethod: 'code',
    redeemUrl: 'play.google.com/redeem',
    packages: [
      { id: 'gp1', coins: 15,  coinName: 'R$', pricePoins: 17.90,  label: 'R$ 15,00'  },
      { id: 'gp2', coins: 25,  coinName: 'R$', pricePoins: 28.90,  label: 'R$ 25,00', popular: true },
      { id: 'gp3', coins: 50,  coinName: 'R$', pricePoins: 56.90,  label: 'R$ 50,00'  },
      { id: 'gp4', coins: 100, coinName: 'R$', pricePoins: 109.90, label: 'R$ 100,00' },
    ],
  },
  {
    id: 'appstore',
    name: 'Apple App Store',
    logo: 'AS',
    company: 'Apple',
    description: 'Gift card para a App Store e iTunes. Use em apps, jogos, músicas e séries Apple.',
    color: '#0071e3',
    category: 'gift_card',
    deliveryMethod: 'code',
    redeemUrl: 'redeem.apple.com',
    packages: [
      { id: 'as1', coins: 15,  coinName: 'R$', pricePoins: 17.90,  label: 'R$ 15,00'  },
      { id: 'as2', coins: 50,  coinName: 'R$', pricePoins: 56.90,  label: 'R$ 50,00', popular: true },
      { id: 'as3', coins: 100, coinName: 'R$', pricePoins: 109.90, label: 'R$ 100,00' },
    ],
  },
]

// Games not yet in catalog — used by the "Não encontrei meu jogo" modal
export const WISH_LIST_GAMES = [
  'Valorant',
  'PUBG Mobile',
  'Call of Duty Mobile',
  'Brawl Stars',
  'Clash of Clans / Clash Royale',
  'Pokémon GO',
  'GTA V Online (Shark Cards)',
  'PlayStation Store Gift Card',
  'Xbox Gift Card',
  'Nintendo eShop Gift Card',
  'Steam Wallet',
  'Outro jogo',
]

export const GAME_CATEGORIES = [
  { id: 'all',       label: 'Todos'       },
  { id: 'moeda',     label: 'Moedas'      },
  { id: 'gift_card', label: 'Gift Cards'  },
] as const

export const GAME_COMPANIES = [...new Set(GAMES.map(g => g.company))]
export const GAME_PRICE_RANGES = [
  { label: 'Até P$ 20',       min: 0,   max: 20       },
  { label: 'P$ 20 – P$ 50',   min: 20,  max: 50       },
  { label: 'P$ 50 – P$ 100',  min: 50,  max: 100      },
  { label: 'Acima de P$ 100', min: 100, max: Infinity  },
]
