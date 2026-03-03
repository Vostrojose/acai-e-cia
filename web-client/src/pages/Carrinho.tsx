import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function Carrinho() {
  const { itens, total, removerItem, limparCarrinho } = useCart()
  const navigate = useNavigate()

  if (itens.length === 0) {
    return (
      <div style={{ padding: 20 }}>
        <h1>🛒 Carrinho</h1>
        <p>Seu carrinho está vazio.</p>
        <button onClick={() => navigate('/')}>Voltar ao Cardápio</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🛒 Carrinho</h1>

      {itens.map((item) => (
        <div
          key={item.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <strong>{item.nome}</strong>
          <p>
            {item.quantidade}x R$ {item.preco.toFixed(2)}
          </p>

          <button onClick={() => removerItem(item.id)}>Remover</button>
        </div>
      ))}

      <hr />

      <h3>Total: R$ {total.toFixed(2)}</h3>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate('/')}>Continuar Comprando</button>

        <button
          style={{ marginLeft: 10 }}
          onClick={() => navigate('/checkout')}
        >
          Finalizar Pedido
        </button>

        <button style={{ marginLeft: 10 }} onClick={limparCarrinho}>
          Limpar Carrinho
        </button>
      </div>
    </div>
  )
}
