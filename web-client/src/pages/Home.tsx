import { useEffect, useState } from 'react'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

interface Produto {
  id: string
  nome: string
  preco: number
  ativo: boolean
}

export default function Home() {
  console.log('HOME ESTÁ RENDERIZANDO')

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  const { adicionarItem, itens, total } = useCart()
  const navigate = useNavigate()

  // 🔢 Calcula quantidade total de unidades
  const totalQuantidade = itens.reduce(
    (acc, item) => acc + item.quantidade,
    0
  )

  useEffect(() => {
    async function loadProdutos() {
      try {
        console.log('ENTROU NO LOADPRODUTOS')

        const response = await api.get('/produtos')

        console.log('RESPOSTA DA API:', response.data)

        // Apenas produtos ativos
        const produtosAtivos = response.data.data.filter(
          (produto: Produto) => produto.ativo
        )

        setProdutos(produtosAtivos)
      } catch (error) {
        console.error('ERRO NA REQUISIÇÃO:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProdutos()
  }, [])

  if (loading) {
    return <p style={{ padding: 20 }}>Carregando produtos...</p>
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🍧 Cardápio</h1>

      {produtos.length === 0 && <p>Nenhum produto disponível.</p>}

      {produtos.map((produto) => (
        <div
          key={produto.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 15,
            marginBottom: 10,
          }}
        >
          <h3>{produto.nome}</h3>
          <p>R$ {produto.preco.toFixed(2)}</p>

          <button
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

      {/* 🔥 Botão flutuante inteligente */}
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
