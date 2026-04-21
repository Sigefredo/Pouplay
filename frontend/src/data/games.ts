export interface GamePackage {
  id: string
  coins: number
  coinName: string
  pricePoins: number
  bonus?: string
  popular?: boolean
}

export interface Game {
  id: string
  name: string
  logo: string
  company: string
  description: string
  color: string
  packages: GamePackage[]
}

export const GAMES: Game[] = [
  {
    id: 'freefire',
    name: 'Free Fire',
    logo: 'FF',
    company: 'Garena',
    description: 'O battle royale mais popular do Brasil. Compre diamantes e desbloqueie skins exclusivas.',
    color: '#ff6b00',
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
    description: 'A plataforma de jogos favorita das crianças. Use Robux para personalizar seu avatar.',
    color: '#00b06f',
    packages: [
      { id: 'rx1', coins: 80,   coinName: 'Robux', pricePoins: 8.90  },
      { id: 'rx2', coins: 400,  coinName: 'Robux', pricePoins: 39.90, popular: true },
      { id: 'rx3', coins: 800,  coinName: 'Robux', pricePoins: 74.90, bonus: '+50 bônus' },
      { id: 'rx4', coins: 2000, coinName: 'Robux', pricePoins: 174.90, bonus: '+200 bônus' },
    ],
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    logo: 'FN',
    company: 'Epic Games',
    description: 'O battle royale da Epic Games. Use V-Bucks para comprar skins e passes de batalha.',
    color: '#1a8fff',
    packages: [
      { id: 'fn1', coins: 1000, coinName: 'V-Bucks', pricePoins: 39.90  },
      { id: 'fn2', coins: 2800, coinName: 'V-Bucks', pricePoins: 99.90, popular: true, bonus: '+300 bônus' },
      { id: 'fn3', coins: 5000, coinName: 'V-Bucks', pricePoins: 159.90, bonus: '+1000 bônus' },
      { id: 'fn4', coins: 13500, coinName: 'V-Bucks', pricePoins: 399.90, bonus: '+3500 bônus' },
    ],
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    logo: 'MC',
    company: 'Microsoft / Mojang',
    description: 'Explore mundos infinitos. Compre Minecoins para personagens e pacotes de textura.',
    color: '#8fbc34',
    packages: [
      { id: 'mc1', coins: 320,  coinName: 'Minecoins', pricePoins: 14.90  },
      { id: 'mc2', coins: 840,  coinName: 'Minecoins', pricePoins: 34.90, popular: true },
      { id: 'mc3', coins: 1720, coinName: 'Minecoins', pricePoins: 64.90, bonus: '+160 bônus' },
    ],
  },
]

export const GAME_COMPANIES = [...new Set(GAMES.map(g => g.company))]
export const GAME_PRICE_RANGES = [
  { label: 'Até P$ 20', min: 0, max: 20 },
  { label: 'P$ 20 – P$ 50', min: 20, max: 50 },
  { label: 'P$ 50 – P$ 100', min: 50, max: 100 },
  { label: 'Acima de P$ 100', min: 100, max: Infinity },
]
