import { ShieldCheck } from 'lucide-react'

export default function Admin() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-brand-700/30 border border-brand-600/40 flex items-center justify-center">
        <ShieldCheck size={32} className="text-brand-400" />
      </div>
      <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
      <p className="text-gray-400 max-w-md">
        Área restrita para administradores da plataforma. Em breve: gestão de parceiros financeiros, parceiros de jogos e usuários.
      </p>
    </div>
  )
}
