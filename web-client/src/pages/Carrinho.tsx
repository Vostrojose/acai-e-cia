import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function Carrinho() {
  const { itens, total, removerItem, limparCarrinho } = useCart()
  const navigate = useNavigate()

  return (
    <div style={container}>

      <h1 style={titulo}>🛒 Seu Pedido</h1>

      {itens.length === 0 ? (
        <>
          <p style={{ color: '#666' }}>Seu carrinho está vazio.</p>

          <button style={botaoSecundario} onClick={() => navigate('/')}>
            Voltar
          </button>
        </>
      ) : (
        <>
          {itens.map(item => (
            <div key={item.id} style={card}>
              <div>
                <strong>{item.nome}</strong>
                <p>{item.quantidade}x R$ {item.preco.toFixed(2)}</p>
              </div>

              <button
                style={botaoRemover}
                onClick={() => removerItem(item.id)}
              >
                Remover
              </button>
            </div>
          ))}

          <div style={resumo}>
            <h3>Total</h3>
            <h2>R$ {total.toFixed(2)}</h2>
          </div>

          <div style={acoes}>
            <button style={botaoPrincipal} onClick={() => navigate('/checkout')}>
              Finalizar Pedido
            </button>

            <button style={botaoPerigo} onClick={limparCarrinho}>
              Limpar
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* estilos */

const container = {
  maxWidth: 600,
  margin: '0 auto',
  padding: 20,
  background: '#f9f9f9',
  minHeight: '100vh'
}

const titulo = {
  textAlign: 'center' as const
}

const card = {
  background: '#fff',
  padding: 15,
  marginBottom: 10,
  borderRadius: 12,
  display: 'flex',
  justifyContent: 'space-between'
}

const resumo = {
  marginTop: 20,
  padding: 15,
  background: '#fff',
  borderRadius: 12,
  textAlign: 'center' as const
}

const acoes = {
  marginTop: 20,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10
}

const botaoPrincipal = {
  background: '#00c853',
  color: '#fff',
  padding: 12,
  borderRadius: 10,
  border: 'none'
}

const botaoSecundario = {
  background: '#333',
  color: '#fff',
  padding: 12,
  borderRadius: 10,
  border: 'none'
}

const botaoPerigo = {
  background: '#f44336',
  color: '#fff',
  padding: 12,
  borderRadius: 10,
  border: 'none'
}

const botaoRemover = {
  background: '#eee',
  padding: 8,
  borderRadius: 8,
  border: 'none'
}