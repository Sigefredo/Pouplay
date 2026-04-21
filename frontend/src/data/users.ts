export interface User {
  id: string
  name: string
  email: string
  role: 'responsavel' | 'menor'
  avatar: string
  cpf: string
  phone?: string
  birthDate: string
  linkedTo?: string
}

export const MOCK_USERS: User[] = [
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
    name: 'Lucas Silva',
    email: 'lucas.silva@email.com',
    role: 'menor',
    avatar: 'LS',
    cpf: '987.654.321-00',
    birthDate: '2010-07-22',
    linkedTo: 'u1',
  },
]

export const CREDENTIALS = [
  { email: 'joao.silva@email.com', password: '123456', userId: 'u1' },
  { email: 'lucas.silva@email.com', password: '123456', userId: 'u2' },
]
