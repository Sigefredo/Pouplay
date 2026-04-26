import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, Gamepad2, User, HelpCircle, ShieldCheck, BarChart2 } from 'lucide-react'
import clsx from 'clsx'
import { useWalletStore } from '../store/walletStore'
import { useDepositStore } from '../store/depositStore'
import { useAuthStore } from '../store/authStore'
import { PoinsDisplay } from './PoinsDisplay'

const parentNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Início'   },
  { to: '/produtos',  icon: TrendingUp,      label: 'Produtos' },
  { to: '/jogos',     icon: Gamepad2,        label: 'Jogos'    },
  { to: '/ajuda',     icon: HelpCircle,      label: 'Ajuda'    },
  { to: '/perfil',    icon: User,            label: 'Perfil'   },
]

const childNavItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Início'     },
  { to: '/investimentos', icon: BarChart2,       label: 'Investidos' },
  { to: '/jogos',         icon: Gamepad2,        label: 'Jogos'      },
  { to: '/ajuda',         icon: HelpCircle,      label: 'Ajuda'      },
  { to: '/perfil',        icon: User,            label: 'Perfil'     },
]

export function BottomNav() {
  const { user } = useAuthStore()
  const navItems = user?.role === 'menor' ? childNavItems : parentNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-800 border-t border-dark-500 flex md:hidden">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors',
              isActive ? 'text-brand-400' : 'text-gray-500'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </>
          )}
        </NavLink>
      ))}
      {user?.role === 'admin' && (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            clsx(
              'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors',
              isActive ? 'text-brand-400' : 'text-gray-500'
            )
          }
        >
          {({ isActive }) => (
            <>
              <ShieldCheck size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              Admin
            </>
          )}
        </NavLink>
      )}
    </nav>
  )
}

export function MobileHeader() {
  const { user } = useAuthStore()
  const { balance } = useWalletStore()
  const { investments } = useDepositStore()

  const displayBalance = user?.role === 'menor'
    ? investments
        .filter(inv => inv.childId === user.id && inv.status === 'confirmed')
        .reduce((s, inv) => s + inv.poinsReleased, 0)
    : balance

  return (
    <header className="md:hidden sticky top-0 z-40 bg-dark-800 border-b border-dark-500 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center font-extrabold text-white text-xs">
          P$
        </div>
        <span className="font-extrabold text-white">Pouplay</span>
      </div>
      <div className="flex items-center gap-1.5 bg-brand-900/30 border border-brand-700/30 rounded-full px-3 py-1">
        <PoinsDisplay amount={displayBalance} size="sm" />
      </div>
    </header>
  )
}
