import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import '../assets/css/Carrinho.css'

export default function Carrinho() {
  const { itens, total, removerItem, limparCarrinho } = useCart()
  const navigate = useNavigate()

  return (
    <div className="carrinho-container">

      <h1 className="carrinho-title">🛒 Seu Pedido</h1>

      {itens.length === 0 ? (
        <>
          <p className="carrinho-vazio">
            Seu carrinho está vazio.
          </p>

          <button
            className="carrinho-btn-secundario"
            onClick={() => navigate('/')}
          >
            Voltar ao cardápio
          </button>
        </>
      ) : (
        <>
          {itens.map(item => (
            <div key={item.id} className="carrinho-card">

              <div>
                <strong>{item.nome}</strong>
                <p>
                  {item.quantidade}x R$ {item.preco.toFixed(2)}
                </p>
              </div>

              <button
                className="carrinho-btn-remover"
                onClick={() => removerItem(item.id)}
              >
                Remover
              </button>

            </div>
          ))}

          <div className="carrinho-resumo">
            <h3>Total</h3>
            <h2>R$ {total.toFixed(2)}</h2>
          </div>

          <div className="carrinho-acoes">

            <button
              className="carrinho-btn-secundario"
              onClick={() => navigate('/')}
            >
              ← Continuar comprando
            </button>

            <button
              className="carrinho-btn-principal"
              onClick={() => navigate('/checkout')}
            >
              Finalizar Pedido
            </button>

            <button
              className="carrinho-btn-perigo"
              onClick={limparCarrinho}
            >
              Limpar carrinho
            </button>

          </div>
        </>
      )}

    </div>
  )
}