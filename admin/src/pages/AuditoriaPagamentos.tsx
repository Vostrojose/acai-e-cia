import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

export default function AuditoriaPagamentos() {
  const navigate = useNavigate()

  const [codigoPedido, setCodigoPedido] = useState('')
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function consultar() {
    try {
      setErro('')
      setLoading(true)

      const response = await api.get(`/pagamento/conciliacao/${codigoPedido}`)

      setDados(response.data)
    } catch (err: any) {
      console.error(err)

      setErro(err?.response?.data?.message || 'Erro ao consultar pagamento.')

      setDados(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={theme.page}>
      <CardMenu navigate={navigate} />

      <h1 style={{ ...theme.title, textAlign: 'center' }}>
        🧾 Auditoria de Pagamentos
      </h1>

      <div style={box}>
        <input
          style={input}
          placeholder="Número do pedido"
          value={codigoPedido}
          onChange={(e) => setCodigoPedido(e.target.value)}
        />

        <button style={botao} onClick={consultar} disabled={loading}>
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      {erro && <div style={erroBox}>{erro}</div>}

      {dados && (
        <div style={resultadoBox}>
          <h2>Pedido #{dados.pedido.codigo}</h2>

          <div style={linha}>
            <strong>Status Pedido:</strong>
            <span>{dados.pedido.status}</span>
          </div>

          <div style={linha}>
            <strong>Status Banco:</strong>
            <span>{dados.pedido.statusPagamento}</span>
          </div>

          <div style={linha}>
            <strong>Status Mercado Pago:</strong>
            <span>{dados.mercadoPago?.status}</span>
          </div>

          <div style={linha}>
            <strong>Total Banco:</strong>
            <span>R$ {Number(dados.pedido.total).toFixed(2)}</span>
          </div>

          <div style={linha}>
            <strong>Total Mercado Pago:</strong>
            <span>
              R$ {Number(dados.mercadoPago?.transaction_amount || 0).toFixed(2)}
            </span>
          </div>

          <div style={linha}>
            <strong>Data Pedido:</strong>

            <span>
              {new Date(dados.pedido.criadoEm).toLocaleString('pt-BR')}
            </span>
          </div>

          <div
            style={{
              ...statusBox,
              background: dados.analise.divergenciaStatus
                ? '#ff5252'
                : '#4caf50',
            }}
          >
            Divergência Status:{' '}
            {dados.analise.divergenciaStatus ? 'SIM' : 'NÃO'}
          </div>

          <div
            style={{
              ...statusBox,
              background: dados.analise.divergenciaValor
                ? '#ff5252'
                : '#4caf50',
            }}
          >
            Divergência Valor: {dados.analise.divergenciaValor ? 'SIM' : 'NÃO'}
          </div>
        </div>
      )}
    </div>
  )
}

function CardMenu({ navigate }: any) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 20,
      }}
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
        <button style={btnMenu} onClick={() => navigate('/cozinha')}>
          👨‍🍳
        </button>

        <button style={btnMenu} onClick={() => navigate('/pedidos')}>
          📦
        </button>

        <button style={btnMenu} onClick={() => navigate('/produtos')}>
          🛒
        </button>

        <button style={btnMenu} onClick={() => navigate('/dashboard')}>
          📊
        </button>

        <button
          style={btnMenu}
          onClick={() => navigate('/auditoria-pagamentos')}
        >
          🧾
        </button>
      </div>
    </div>
  )
}

const box: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  marginBottom: 20,
}

const input: React.CSSProperties = {
  flex: 1,
  padding: 12,
  borderRadius: 8,
  border: '1px solid #333',
  background: '#1e1e1e',
  color: '#fff',
}

const botao: React.CSSProperties = {
  background: '#6c5ce7',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '12px 20px',
  cursor: 'pointer',
}

const resultadoBox: React.CSSProperties = {
  background: '#1a1a1a',
  padding: 20,
  borderRadius: 12,
  color: '#fff',
}

const linha: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 10,
}

const statusBox: React.CSSProperties = {
  padding: 12,
  borderRadius: 8,
  marginTop: 12,
  color: '#fff',
  fontWeight: 'bold',
}

const erroBox: React.CSSProperties = {
  background: '#ff5252',
  color: '#fff',
  padding: 12,
  borderRadius: 8,
  marginBottom: 20,
}

const btnMenu: React.CSSProperties = {
  background: '#333',
  color: '#fff',
  border: 'none',
  padding: '10px 12px',
  borderRadius: 6,
  fontSize: 16,
  cursor: 'pointer',
}
