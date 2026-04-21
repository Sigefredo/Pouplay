import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Investments from './pages/Investments'
import Games from './pages/Games'
import Wallet from './pages/Wallet'
import Profile from './pages/Profile'

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
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
