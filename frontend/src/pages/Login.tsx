import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const { login, isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const ok = login(email, password)
    if (!ok) setError('E-mail ou senha incorretos. Tente: joao.silva@email.com / 123456')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-600 mb-4 shadow-lg shadow-brand-900/60">
            <span className="text-2xl font-extrabold text-white">P$</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Pouplay</h1>
          <p className="text-gray-400 mt-1">Poupe hoje, jogue amanhã</p>
        </div>

        {/* Form */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">Entrar na sua conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail</label>
              <input
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-xl p-3 text-sm text-red-400">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <div className="mt-6 p-4 bg-dark-700/50 border border-dark-500 rounded-xl text-sm text-gray-400">
          <p className="font-semibold text-gray-300 mb-2">🔑 Contas de demonstração:</p>
          <div className="space-y-1">
            <p><span className="text-brand-400">Responsável:</span> joao.silva@email.com / 123456</p>
            <p><span className="text-brand-400">Filho:</span> lucas.silva@email.com / 123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}
