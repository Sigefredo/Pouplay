import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, Gamepad2, Wallet, User, LogOut, BarChart2, BookOpen, HelpCircle, PiggyBank,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '../store/authStore'
import { useWalletStore } from '../store/walletStore'
import { useDepositStore } from '../store/depositStore'
import { PoinsDisplay } from './PoinsDisplay'
import { Avatar } from './Avatar'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'         },
  { to: '/depositar',     icon: PiggyBank,        label: 'Depositar'         },
  { to: '/produtos',      icon: TrendingUp,       label: 'Produtos'          },
  { to: '/investimentos', icon: BarChart2,         label: 'Meus Investimentos'},
  { to: '/jogos',         icon: Gamepad2,          label: 'Jogos'             },
  { to: '/guia',          icon: BookOpen,          label: 'Guia'              },
  { to: '/carteira',      icon: Wallet,            label: 'Carteira'          },
  { to: '/ajuda',         icon: HelpCircle,        label: 'Ajuda'             },
  { to: '/perfil',        icon: User,              label: 'Perfil'            },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { balance } = useWalletStore()
  const { pendingInvestmentsCount } = useDepositStore()

  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 bg-dark-800 border-r border-dark-500 flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-dark-500">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center font-extrabold text-white text-sm">
            P$
          </div>
          <span className="text-xl font-extrabold text-white">Pouplay</span>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-12">Poupe hoje, jogue amanhã</p>
      </div>

      {/* Saldo */}
      <div className="mx-4 mt-4 p-4 bg-gradient-to-br from-brand-700/30 to-brand-900/20 border border-brand-700/30 rounded-xl">
        <p className="text-xs text-gray-400 mb-1">Saldo em Poins</p>
        <PoinsDisplay amount={balance} size="lg" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 mt-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50'
                  : 'text-gray-400 hover:text-white hover:bg-dark-600'
              )
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {to === '/investimentos' && pendingInvestmentsCount() > 0 && (
              <span className="bg-yellow-500 text-dark-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingInvestmentsCount()}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-dark-500">
        <div className="flex items-center gap-3 mb-3">
          <Avatar initials={user?.avatar ?? '?'} role={user?.role} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500">
              {user?.role === 'responsavel' ? 'Responsável' : 'Perfil menor'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-dark-600"
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  )
}
