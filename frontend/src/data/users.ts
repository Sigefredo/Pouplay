export interface User {
  id: string
  name: string
  email: string
  role: 'responsavel' | 'menor' | 'admin'
  avatar: string
  cpf: string
  phone?: string
  birthDate: string
  linkedTo?: string
}

export const MOCK_USERS: User[] = [
  {
    id: 'u0',
    name: 'Administrador',
    email: 'admin@pouplay.com.br',
    role: 'admin',
    avatar: 'AD',
    cpf: '000.000.000-00',
    birthDate: '1990-01-01',
  },
  {
    id: 'u1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    role: 'responsavel',
    avatar: 'JS',
    cpf: '123.456.789-00',
    phone: '(11) 99876-5432',
    birthDate: '1986-03-15',
  },
  {
    id: 'u2',
    name: 'Mateus Gamer',
    email: 'mateus.gamer@email.com',
    role: 'menor',
    avatar: 'MG',
    cpf: '987.654.321-00',
    birthDate: '2010-07-22',
    linkedTo: 'u1',
  },
]

export const CREDENTIALS = [
  { email: 'admin@pouplay.com.br',   password: 'admin2026', userId: 'u0' },
  { email: 'joao.silva@email.com',   password: '123456',    userId: 'u1' },
  { email: 'mateus.gamer@email.com', password: '123456',    userId: 'u2' },
]
