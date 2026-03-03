const API_URL = 'http://localhost:3000/api'

/* ============================= */
/* TOKEN */
/* ============================= */

function getToken(): string | null {
  return localStorage.getItem('acai_token')
}

/* ============================= */
/* REQUEST BASE */
/* ============================= */

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: HeadersInit = {
    ...(options.body && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Evita erro caso resposta venha vazia
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.error || 'Erro na requisição.')
  }

  return data
}

/* ============================= */
/* AUTH */
/* ============================= */

export async function login(email: string, senha: string) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })
}

/* ============================= */
/* PRODUTOS */
/* ============================= */

export async function getProdutos() {
  return request('/produtos')
}

export async function criarProduto(data: {
  nome: string
  descricao?: string
  preco: number
}) {
  return request('/produto', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function alterarStatusProduto(
  id: string,
  ativo: boolean
) {
  return request(`/produto/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ ativo }),
  })
}

/* ============================= */
/* PEDIDOS */
/* ============================= */

export async function getPedidos(status?: string) {
  const query = status ? `?status=${status}` : ''
  return request(`/pedidos${query}`)
}

export async function atualizarStatusPedido(
  id: string,
  status: string
) {
  return request(`/pedido/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function getDashboardPedidos() {
  return request('/pedidos/dashboard')
}
/* ============================= */
/* PAGAMENTO */
/* ============================= */

export async function criarCheckout(pedidoId: string) {
  return request('/pagamento/checkout', {
    method: 'POST',
    body: JSON.stringify({ pedidoId }),
  })
}