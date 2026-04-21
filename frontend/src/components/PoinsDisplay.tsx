import clsx from 'clsx'

interface Props {
  amount: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showSign?: boolean
  className?: string
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
  xl: 'text-4xl font-extrabold',
}

export function PoinsDisplay({ amount, size = 'md', showSign, className }: Props) {
  const isPositive = amount >= 0
  const sign = showSign ? (isPositive ? '+' : '') : ''
  const colorClass = showSign
    ? isPositive ? 'text-emerald-400' : 'text-red-400'
    : 'text-brand-400'

  return (
    <span className={clsx('font-bold tabular-nums', sizes[size], colorClass, className)}>
      <span className="opacity-75">P$ </span>
      {sign}{Math.abs(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  )
}
