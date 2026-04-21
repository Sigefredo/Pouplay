export type InvestmentType = 'CDB' | 'LCA' | 'LCI' | 'Tesouro Direto' | 'Fundo DI' | 'Poupança+'
export type ValueRange = '10-50' | '50-100' | '100-500' | '500-1000' | '1000+'

export interface FinancialProduct {
  id: string
  institution: string
  institutionLogo: string
  type: InvestmentType
  name: string
  description: string
  rate: string
  minValue: number
  maxValue?: number
  cashbackPoins: number
  cashbackPercent: number
  valueRange: ValueRange
  tag?: string
  tagColor?: string
  popular?: boolean
}

export const FINANCIAL_PRODUCTS: FinancialProduct[] = [
  {
    id: 'fp1',
    institution: 'Banco Digital Plus',
    institutionLogo: 'BD',
    type: 'CDB',
    name: 'CDB Premium 120% CDI',
    description: 'Rendimento superior ao CDI com liquidez diária após 90 dias.',
    rate: '120% CDI',
    minValue: 1000,
    cashbackPoins: 50,
    cashbackPercent: 5,
    valueRange: '1000+',
    tag: 'Mais rentável',
    tagColor: 'green',
    popular: true,
  },
  {
    id: 'fp2',
    institution: 'Corretora Investe+',
    institutionLogo: 'CI',
    type: 'Tesouro Direto',
    name: 'Tesouro Selic 2029',
    description: 'Segurança do governo federal com rentabilidade atrelada à taxa Selic.',
    rate: '100% Selic',
    minValue: 100,
    cashbackPoins: 15,
    cashbackPercent: 3,
    valueRange: '100-500',
    tag: 'Mais seguro',
    tagColor: 'blue',
  },
  {
    id: 'fp3',
    institution: 'BancoFlex',
    institutionLogo: 'BF',
    type: 'LCA',
    name: 'LCA Agronegócio 95% CDI',
    description: 'Isento de Imposto de Renda para pessoa física. Prazo de 12 meses.',
    rate: '95% CDI',
    minValue: 500,
    cashbackPoins: 30,
    cashbackPercent: 4,
    valueRange: '500-1000',
    tag: 'Isento IR',
    tagColor: 'purple',
  },
  {
    id: 'fp4',
    institution: 'XFinance',
    institutionLogo: 'XF',
    type: 'CDB',
    name: 'CDB Flex 115% CDI',
    description: 'Liquidez diária a partir do primeiro dia. Ideal para reserva de emergência.',
    rate: '115% CDI',
    minValue: 200,
    cashbackPoins: 20,
    cashbackPercent: 4,
    valueRange: '100-500',
    popular: true,
  },
  {
    id: 'fp5',
    institution: 'SafeBank',
    institutionLogo: 'SB',
    type: 'Poupança+',
    name: 'Poupança Turbinada',
    description: 'A facilidade da poupança tradicional com rendimento superior.',
    rate: '70% CDI',
    minValue: 50,
    cashbackPoins: 5,
    cashbackPercent: 2,
    valueRange: '50-100',
    tag: 'Para começar',
    tagColor: 'orange',
  },
  {
    id: 'fp6',
    institution: 'Broker360',
    institutionLogo: 'B3',
    type: 'Fundo DI',
    name: 'Fundo DI Master',
    description: 'Diversificação automática em ativos de renda fixa de alta qualidade.',
    rate: '110% CDI',
    minValue: 1000,
    cashbackPoins: 45,
    cashbackPercent: 4.5,
    valueRange: '1000+',
  },
  {
    id: 'fp7',
    institution: 'Corretora Investe+',
    institutionLogo: 'CI',
    type: 'LCI',
    name: 'LCI Imobiliário 92% CDI',
    description: 'Isento de IR, lastreado em crédito imobiliário. Prazo de 9 meses.',
    rate: '92% CDI',
    minValue: 500,
    cashbackPoins: 28,
    cashbackPercent: 3.5,
    valueRange: '500-1000',
    tag: 'Isento IR',
    tagColor: 'purple',
  },
  {
    id: 'fp8',
    institution: 'BancoFlex',
    institutionLogo: 'BF',
    type: 'CDB',
    name: 'CDB Infantil 108% CDI',
    description: 'Produto especial para pais que investem pensando no futuro dos filhos.',
    rate: '108% CDI',
    minValue: 50,
    cashbackPoins: 8,
    cashbackPercent: 3,
    valueRange: '50-100',
    tag: 'Para famílias',
    tagColor: 'pink',
    popular: true,
  },
]

export const INSTITUTIONS = [...new Set(FINANCIAL_PRODUCTS.map(p => p.institution))]
export const INVESTMENT_TYPES: InvestmentType[] = ['CDB', 'LCA', 'LCI', 'Tesouro Direto', 'Fundo DI', 'Poupança+']
export const VALUE_RANGES: { label: string; value: ValueRange }[] = [
  { label: 'R$ 10 – R$ 50', value: '10-50' },
  { label: 'R$ 50 – R$ 100', value: '50-100' },
  { label: 'R$ 100 – R$ 500', value: '100-500' },
  { label: 'R$ 500 – R$ 1.000', value: '500-1000' },
  { label: 'Acima de R$ 1.000', value: '1000+' },
]
