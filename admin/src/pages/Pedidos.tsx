import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

type ItemPedido = {
  id: string
  quantidade: number
  precoUnit: number
  pedidoId: string
  produtoId: string
}

type Pedido = {
  id: string
  codigo: number
  status: string
  tipo: string
  total: number
  telefone: string | null
  origem: string | null
  endereco: string | null
  criadoEm: string
  atualizadoEm: string
  entregueEm: string | null
  itens: ItemPedido[]
}

export default function Pedidos() {
  const navigate = useNavigate()

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  async function carregarPedidos() {
    setCarregando(true)
    setErro(null)

    try {
      const res = await api.get(`/pedidos?horas=36&page=${page}&limit=10`)

      if (res.data?.success && Array.isArray(res.data.data)) {
        setPedidos(res.data.data)
        setTotalPages(res.data.pagination?.totalPages || 1)
      } else {
        setErro('Resposta inesperada do servidor.')
      }
    } catch (e: any) {
      setErro(e?.message || 'Erro ao carregar pedidos.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarPedidos()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  return (
    <div style={theme.page}>
      <CardMenu navigate={navigate} />

      <h1 style={{ ...theme.title, textAlign: 'center' }}>📦 Pedidos</h1>

      {carregando && <p>Carregando pedidos...</p>}

      {erro && <p style={{ color: '#ff5252', marginBottom: 16 }}>❌ {erro}</p>}

      {!carregando && !erro && pedidos.length === 0 && (
        <p>Nenhum pedido encontrado.</p>
      )}

      {!carregando && !erro && pedidos.length > 0 && (
        <div style={gridPedidos}>
          {pedidos
            .filter((pedido) => pedido.status !== 'CANCELADO')
            .map((pedido) => (
              <div key={pedido.id} style={theme.card}>
                <div style={linha}>
                  <strong>Pedido:</strong>{' '}
                  {pedido.origem === 'BALCAO'
                    ? 'Balcão'
                    : pedido.codigo
                      ? `#${pedido.codigo}`
                      : '—'}
                </div>

                <div style={linha}>
                  <strong>Status:</strong>{' '}
                  <span style={badgeStatus(pedido.status)}>
                    {pedido.status}
                  </span>
                </div>

                <div style={linha}>
                  <strong>Total:</strong> R$ {pedido.total.toFixed(2)}
                </div>
                <div style={linha}>
                  <strong>Criado:</strong>{' '}
                  {new Date(pedido.criadoEm).toLocaleString('pt-BR')}
                </div>

                {pedido.entregueEm && (
                  <div style={linha}>
                    <strong>Entregue:</strong>{' '}
                    {new Date(pedido.entregueEm).toLocaleString('pt-BR')}
                  </div>
                )}

                {pedido.telefone && (
                  <div style={linha}>
                    <strong>Telefone:</strong> {pedido.telefone}
                  </div>
                )}

                {pedido.endereco && (
                  <div style={linha}>
                    <strong>Endereço:</strong> {pedido.endereco}
                  </div>
                )}

                <div style={{ marginTop: 10 }}>
                  <strong>Itens:</strong>

                  <ul style={listaItens}>
                    {pedido.itens.map((item) => (
                      <li key={item.id}>
                        {item.quantidade} × R$ {item.precoUnit.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>
      )}
      <div style={paginacao}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          style={btnPaginacao}
        >
          ⬅ Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          style={btnPaginacao}
        >
          Próxima ➡
        </button>
      </div>
    </div>
  )
}

function CardMenu({ navigate }: any) {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
    >
      <div
        style={{
          background: '#000',
          padding: 10,
          borderRadius: 10,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <button onClick={() => navigate('/cozinha')} style={btnMenu}>
          👨‍🍳
        </button>
        <button onClick={() => navigate('/produtos')} style={btnMenu}>
          🛒
        </button>
        <button onClick={() => navigate('/dashboard')} style={btnMenu}>
          📋 
        </button>
        <button onClick={() => navigate('/auditoria')} style={btnMenu}>
          📊
        </button>
      </div>
    </div>
  )
}
const gridPedidos = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 20,
}

const linha = {
  marginBottom: 6,
  fontSize: 15,
}

const listaItens = {
  marginTop: 6,
  paddingLeft: 16,
}

const btnMenu = {
  background: '#333',
  color: '#fff',
  border: 'none',
  padding: '10px 12px',
  borderRadius: 6,
  fontSize: 16,
  cursor: 'pointer',
}
function badgeStatus(status: string) {
  switch (status) {
    case 'RECEBIDO':
      return { background: '#e53935', padding: '4px 8px', borderRadius: 6 }
    case 'EM_PREPARO':
      return { background: '#fb8c00', padding: '4px 8px', borderRadius: 6 }
    case 'PRONTO':
      return { background: '#43a047', padding: '4px 8px', borderRadius: 6 }
    case 'ENTREGUE':
      return { background: '#2196f3', padding: '4px 8px', borderRadius: 6 }
    default:
      return { background: '#777', padding: '4px 8px', borderRadius: 6 }
  }
}

const paginacao = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 16,
  marginTop: 20,
}

const btnPaginacao = {
  background: '#333',
  color: '#fff',
  border: 'none',
  padding: '8px 14px',
  borderRadius: 6,
  cursor: 'pointer',
}
