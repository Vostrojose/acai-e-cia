import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function Carrinho() {
  const { itens, total, removerItem, limparCarrinho } = useCart()
  const navigate = useNavigate()

  if (itens.length === 0) {
    return (
      <div style={container}>
        <h1 style={titulo}>🛒 Carrinho</h1>
        <p style={{ color: '#666' }}>Seu carrinho está vazio.</p>

        <button style={botaoSecundario} onClick={() => navigate('/')}>
          Voltar ao Cardápio
        </button>
      </div>
    )
  }

  return (
    <div style={container}>
      <h1 style={titulo}>🛒 Carrinho</h1>

      <div style={{ marginTop: 20 }}>
        {itens.map((item) => (
          <div key={item.id} style={card}>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 16 }}>{item.nome}</strong>

              <p style={{ color: '#555', marginTop: 4 }}>
                {item.quantidade}x R$ {item.preco.toFixed(2)}
              </p>
            </div>

            <button
              style={botaoRemover}
              onClick={() => removerItem(item.id)}
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <div style={resumo}>
        <h3>Total</h3>
        <h2>R$ {total.toFixed(2)}</h2>
      </div>

      <div style={acoes}>
        <button style={botaoSecundario} onClick={() => navigate('/')}>
          Continuar Comprando
        </button>

        <button
          style={botaoPrincipal}
          onClick={() => navigate('/checkout')}
        >
          Finalizar Pedido
        </button>

        <button style={botaoPerigo} onClick={limparCarrinho}>
          Limpar
        </button>
      </div>
    </div>
  )
}

/* ========================= */
/* ESTILOS                   */
/* ========================= */

const container = {
  maxWidth: 600,
  margin: '0 auto',
  padding: 20,
  minHeight: '100vh',
  background: '#f9f9f9',
}

const titulo = {
  fontSize: 28,
  fontWeight: 'bold',
  textAlign: 'center' as const,
}

const card = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#fff',
  borderRadius: 10,
  padding: 15,
  marginBottom: 12,
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
}

const resumo = {
  marginTop: 20,
  padding: 15,
  background: '#fff',
  borderRadius: 10,
  textAlign: 'center' as const,
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
}

const acoes = {
  marginTop: 20,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
}

const botaoBase = {
  padding: '12px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: 14,
}

const botaoPrincipal = {
  ...botaoBase,
  background: '#4caf50',
  color: '#fff',
}

const botaoSecundario = {
  ...botaoBase,
  background: '#333',
  color: '#fff',
}

const botaoPerigo = {
  ...botaoBase,
  background: '#f44336',
  color: '#fff',
}

const botaoRemover = {
  ...botaoBase,
  background: '#e0e0e0',
  color: '#333',
  padding: '8px 12px',
}