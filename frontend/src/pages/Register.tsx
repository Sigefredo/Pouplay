import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuthStore, type RegisterData } from '../store/authStore'
import clsx from 'clsx'

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function validateCpf(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(d[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(d[10])
}

function isAdult(birthDate: string): boolean {
  if (!birthDate) return false
  const birth = new Date(birthDate)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  return age > 18 || (age === 18 && (m > 0 || (m === 0 && today.getDate() >= birth.getDate())))
}

function maxBirthDate(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().split('T')[0]
}

type FormFields = {
  name: string
  email: string
  cpf: string
  phone: string
  birthDate: string
  password: string
  confirmPassword: string
}

type FormErrors = Partial<FormFields & { general: string }>

export default function Register() {
  const { isAuthenticated, register, login } = useAuthStore()

  const [form, setForm] = useState<FormFields>({
    name: '', email: '', cpf: '', phone: '', birthDate: '', password: '', confirmPassword: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const setField = (key: keyof FormFields) => (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (key === 'cpf') value = maskCpf(value)
    if (key === 'phone') value = maskPhone(value)
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(err => ({ ...err, [key]: undefined }))
  }

  const validate = (): FormErrors => {
    const errs: FormErrors = {}
    if (!form.name.trim() || form.name.trim().split(/\s+/).length < 2)
      errs.name = 'Informe nome e sobrenome.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'E-mail inválido.'
    if (!validateCpf(form.cpf))
      errs.cpf = 'CPF inválido (verifique os dígitos).'
    if (!form.birthDate)
      errs.birthDate = 'Informe sua data de nascimento.'
    else if (!isAdult(form.birthDate))
      errs.birthDate = 'É necessário ter 18 anos ou mais para criar uma conta.'
    if (form.password.length < 6)
      errs.password = 'A senha precisa ter pelo menos 6 caracteres.'
    if (form.confirmPassword !== form.password)
      errs.confirmPassword = 'As senhas não coincidem.'
    return errs
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 800))

    const data: RegisterData = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      cpf: form.cpf,
      phone: form.phone || undefined,
      birthDate: form.birthDate,
    }

    const result = register(data)
    if (!result.ok) {
      setErrors({ general: result.error })
      setLoading(false)
      return
    }

    setSuccess(true)
    await new Promise(r => setTimeout(r, 1000))
    login(data.email, data.password)
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-600 mb-3 shadow-lg shadow-brand-900/60">
            <span className="text-xl font-extrabold text-white">P$</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Pouplay</h1>
          <p className="text-gray-400 mt-1">Poupe hoje, jogue amanhã</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-1">Criar sua conta</h2>
          <p className="text-xs text-gray-500 mb-6">Conta de responsável · maiores de 18 anos</p>

          {success ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle size={48} className="text-emerald-400 mx-auto" />
              <p className="text-white font-bold text-lg">Conta criada!</p>
              <p className="text-gray-400 text-sm">Entrando automaticamente…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <Field label="Nome completo *" error={errors.name}>
                <input
                  type="text"
                  className={inputCls(!!errors.name)}
                  placeholder="João Silva"
                  value={form.name}
                  onChange={setField('name')}
                  autoComplete="name"
                />
              </Field>

              {/* E-mail */}
              <Field label="E-mail *" error={errors.email}>
                <input
                  type="email"
                  className={inputCls(!!errors.email)}
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={setField('email')}
                  autoComplete="email"
                />
              </Field>

              {/* CPF + Nascimento */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="CPF *" error={errors.cpf}>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={inputCls(!!errors.cpf)}
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={setField('cpf')}
                  />
                </Field>
                <Field label="Data de nascimento *" error={errors.birthDate}>
                  <input
                    type="date"
                    className={inputCls(!!errors.birthDate)}
                    max={maxBirthDate()}
                    value={form.birthDate}
                    onChange={setField('birthDate')}
                  />
                </Field>
              </div>

              {/* Telefone */}
              <Field label="Telefone (opcional)">
                <input
                  type="tel"
                  inputMode="numeric"
                  className={inputCls(false)}
                  placeholder="(00) 00000-0000"
                  value={form.phone}
                  onChange={setField('phone')}
                  autoComplete="tel"
                />
              </Field>

              {/* Senha */}
              <Field label="Senha *" error={errors.password}>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className={clsx(inputCls(!!errors.password), 'pr-11')}
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={setField('password')}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              {/* Confirmar senha */}
              <Field label="Confirmar senha *" error={errors.confirmPassword}>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={clsx(inputCls(!!errors.confirmPassword), 'pr-11')}
                    placeholder="Repita a senha"
                    value={form.confirmPassword}
                    onChange={setField('confirmPassword')}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              {errors.general && (
                <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-xl p-3 text-sm text-red-400">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {errors.general}
                </div>
              )}

              <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                {loading ? 'Criando conta…' : 'Criar conta'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Já tem conta?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

function inputCls(hasError: boolean) {
  return clsx('input-field', hasError && 'border-red-600/60 focus:border-red-500')
}

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )
}
