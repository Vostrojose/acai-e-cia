import { useEffect, useState } from 'react'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useNavigate, useParams } from 'react-router-dom'
import './Home.css'

interface Produto {
  id: string
  nome: string
  preco: number
  ativo: boolean
}

export default function Home() {

  const { origem } = useParams()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  const { adicionarItem, itens, total } = useCart()
  const navigate = useNavigate()

  const totalQuantidade = itens.reduce(
    (acc, item) => acc + item.quantidade,
    0
  )

  useEffect(() => {
    async function loadProdutos() {

      const response = await api.get('/produtos')

      const produtosAtivos = response.data.data.filter(
        (produto: Produto) => produto.ativo
      )

      setProdutos(produtosAtivos)
      setLoading(false)
    }

    loadProdutos()
  }, [])

  useEffect(() => {
    if (origem) {
      localStorage.setItem("origemPedido", origem)
    }
  }, [origem])

  if (loading) {
    return <p style={{ padding: 20 }}>Carregando produtos...</p>
  }

  return (
    <div className="page">
      <div className="cardapio-container"></div>

      <h1 className="title">Cardápio</h1>

      <div className="cardapio-list">

        {produtos.map((produto) => (

          <div key={produto.id} className="produto-card">

            <div className="produto-nome">
              {produto.nome}
            </div>

            <div className="produto-preco">
              R$ {produto.preco.toFixed(2)}
            </div>

            <button
              className="add-btn"
              onClick={() =>
                adicionarItem({
                  id: produto.id,
                  nome: produto.nome,
                  preco: produto.preco,
                })
              }
            >
              Adicionar
            </button>

          </div>

        ))}

      </div>

      {totalQuantidade > 0 && (
        <button
          onClick={() => navigate('/carrinho')}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            padding: '15px 20px',
            borderRadius: 50,
            backgroundColor: '#00c853',
            color: 'white',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          }}
        >
          🛒 {totalQuantidade} item{totalQuantidade > 1 ? 's' : ''} • R$ {total.toFixed(2)}
        </button>
      )}

    </div>
  )
}