import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useAuthStore } from './store/authStore'
import { useWalletStore } from './store/walletStore'
import { useDepositStore } from './store/depositStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Investments from './pages/Investments'
import Games from './pages/Games'
import Wallet from './pages/Wallet'
import Profile from './pages/Profile'
import Guide from './pages/Guide'
import Help from './pages/Help'
import Deposit from './pages/Deposit'
import Admin from './pages/Admin'

// Loads the correct per-user data whenever the active user changes (e.g. profile switch)
function UserLoader() {
  const userId   = useAuthStore(s => s.user?.id)
  const userRole = useAuthStore(s => s.user?.role)
  const loadWallet   = useWalletStore(s => s.loadUser)
  const loadDeposits = useDepositStore(s => s.loadUser)
  const creditPoins  = useWalletStore(s => s.creditPoins)

  useEffect(() => {
    if (!userId) return
    // Deposits must load first so child investments are aggregated before wallet init
    loadDeposits(userId)
    loadWallet(userId)

    if (userRole === 'menor') {
      const { wallets } = useWalletStore.getState()
      const childWallet = wallets[userId]
      const uninitialised = !childWallet ||
        (childWallet.balance === 0 && childWallet.transactions.length === 0)

      if (uninitialised) {
        const confirmedPoins = useDepositStore.getState().investments
          .filter(inv => inv.childId === userId && inv.status === 'confirmed')
          .reduce((sum, inv) => sum + inv.poinsReleased, 0)
        if (confirmedPoins > 0) {
          creditPoins(
            confirmedPoins,
            'Poins liberados — investimentos confirmados',
            'Saldo consolidado dos investimentos anteriores'
          )
        }
      }
    }
  }, [userId])
  return null
}

function AdminRoute() {
  const { user } = useAuthStore()
  return user?.role === 'admin' ? <Admin /> : <Navigate to="/dashboard" replace />
}

function ParentOnlyRoute({ element }: { element: React.ReactNode }) {
  const { user } = useAuthStore()
  return user?.role === 'menor' ? <Navigate to="/dashboard" replace /> : <>{element}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <UserLoader />
      <Routes>
        <Route path="/login"     element={<Login />}    />
        <Route path="/cadastrar" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/dashboard"     element={<Dashboard />}    />
          <Route path="/produtos"      element={<ParentOnlyRoute element={<Products />} />}  />
          <Route path="/depositar"     element={<ParentOnlyRoute element={<Deposit />} />}   />
          <Route path="/investimentos" element={<Investments />}  />
          <Route path="/jogos"         element={<Games />}        />
          <Route path="/carteira"      element={<Wallet />}       />
          <Route path="/perfil"        element={<Profile />}      />
          <Route path="/guia"          element={<Guide />}        />
          <Route path="/ajuda"         element={<Help />}         />
          <Route path="/admin"         element={<AdminRoute />}   />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
