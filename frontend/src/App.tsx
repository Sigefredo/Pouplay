import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
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

function AdminRoute() {
  const { user } = useAuthStore()
  return user?.role === 'admin' ? <Admin /> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard"     element={<Dashboard />}    />
          <Route path="/produtos"      element={<Products />}     />
          <Route path="/investimentos" element={<Investments />}  />
          <Route path="/jogos"         element={<Games />}        />
          <Route path="/carteira"      element={<Wallet />}       />
          <Route path="/perfil"        element={<Profile />}      />
          <Route path="/guia"          element={<Guide />}        />
          <Route path="/ajuda"         element={<Help />}         />
          <Route path="/depositar"     element={<Deposit />}      />
          <Route path="/admin"         element={<AdminRoute />}   />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
