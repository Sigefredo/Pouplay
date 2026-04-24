import clsx from 'clsx'

interface Props {
  initials: string
  size?: 'sm' | 'md' | 'lg'
  role?: 'responsavel' | 'menor' | 'admin'
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

export function Avatar({ initials, size = 'md', role }: Props) {
  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-bold flex-shrink-0',
        sizes[size],
        role === 'menor'
          ? 'bg-gradient-to-br from-brand-500 to-brand-700'
          : 'bg-gradient-to-br from-brand-600 to-brand-900'
      )}
    >
      {initials}
    </div>
  )
}
