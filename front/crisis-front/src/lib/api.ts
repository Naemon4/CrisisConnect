const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Volunteer ─────────────────────────────────────────────────────────────

export const volunteerApi = {
  register: (data: {
    fullName: string
    email: string
    password: string
    cpf: string
    state: string
    city: string
    skills: string[]
  }) => request('/volunteer', { method: 'POST', body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    request<{ token: string; user: VolunteerUser }>('/volunteer/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  findOne: (id: number) => request<Volunteer>(`/volunteer/${id}`),

  update: (id: number, data: Partial<Volunteer>) =>
    request<Volunteer>(`/volunteer/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: 'ativo' | 'inativo') =>
    request<Volunteer>(`/volunteer/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  delete: (id: number) =>
    request(`/volunteer/${id}`, { method: 'DELETE' }),
}

// ─── Enterprise ────────────────────────────────────────────────────────────

export const enterpriseApi = {
  register: (data: {
    name: string
    email: string
    password: string
    cnpj: string
    contactEmail: string
    contactPhone: string
  }) => request('/enterprise', { method: 'POST', body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    request<{ token: string; user: EnterpriseUser }>('/enterprise/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  findOne: (id: number) => request<Enterprise>(`/enterprise/${id}`),

  update: (id: number, data: Partial<Enterprise>) =>
    request<Enterprise>(`/enterprise/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request(`/enterprise/${id}`, { method: 'DELETE' }),
}

// ─── Ações de Crise ────────────────────────────────────────────────────────

export const acaoApi = {
  criar: (data: {
    empresa_id: number
    habilidades_necessarias: string[]
    numero_voluntarios_necessarios: number
  }) => request<AcaoCrise>('/acoes', { method: 'POST', body: JSON.stringify(data) }),

  buscarPorId: (id: number) => request<AcaoCrise>(`/acoes/${id}`),

  buscarPorEmpresa: (empresa_id: number) =>
    request<AcaoCrise[]>(`/acoes/empresa/${empresa_id}`),

  atualizar: (id: number, data: Partial<AcaoCrise>) =>
    request<AcaoCrise>(`/acoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletar: (id: number) => request(`/acoes/${id}`, { method: 'DELETE' }),

  orquestrar: (id: number) =>
    request<{ resultado: any }>(`/acoes/${id}/orchestrate`, { method: 'POST' }),

  sairDaAcao: (acao_id: number, voluntario_id: number) =>
    request(`/acoes/${acao_id}/sair`, {
      method: 'POST',
      body: JSON.stringify({ voluntario_id }),
    }),
}

// ─── Notificações ──────────────────────────────────────────────────────────

export const notificacaoApi = {
  criar: (voluntario_id: number, acao_id: number) =>
    request<Notificacao>('/notificacao', {
      method: 'POST',
      body: JSON.stringify({ voluntario_id, acao_id }),
    }),

  buscarPorVoluntario: (voluntario_id: number) =>
    request<Notificacao[]>(`/notificacao/volunteer/${voluntario_id}`),

  responder: (id: number, status: 'aceito' | 'recusado') =>
    request<Notificacao>(`/notificacao/${id}/responder`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  deletar: (id: number) =>
    request(`/notificacao/${id}`, { method: 'DELETE' }),
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Volunteer {
  id: number
  fullName: string
  email: string
  cpf: string
  state: string
  city: string
  skills: string[]
  status: 'ATIVO' | 'INATIVO'
}

export interface VolunteerUser extends Omit<Volunteer, 'cpf' | 'state' | 'city'> { }

export interface Enterprise {
  id: number
  name: string
  email: string
  cnpj: string
  contactEmail: string
  contactPhone: string
}

export interface EnterpriseUser extends Enterprise { }

export interface AcaoCrise {
  id: number
  empresa_id: number
  habilidades_necessarias: string[]
  numero_voluntarios_necessarios: number
  voluntarios_ativos: number
  voluntarios_ids: number[]
  status: 'aberta' | 'em_andamento' | 'concluida'
  createdAt?: string
}

export interface Notificacao {
  id: number
  voluntario_id: number
  acao_id: number
  status: 'pendente' | 'aceito' | 'recusado'
  createdAt?: string
}