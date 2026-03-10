import { useEffect, useState } from 'react'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useParams } from 'react-router-dom'
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

  const { adicionarItem, removerItem, itens } = useCart()

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

      <h1 className="title">Açaí & Cia</h1>

      <div className="cardapio-container">

        <div className="cardapio-list">

          {produtos.map((produto) => {

            const item = itens.find(i => i.id === produto.id)
            const quantidade = item?.quantidade || 0

            return (

              <div key={produto.id} className="produto-card">

                <div className="produto-info">

                  <div className="produto-nome">
                    {produto.nome}
                  </div>

                  <div className="produto-preco">
                    R$ {produto.preco.toFixed(2)}
                  </div>

                </div>

                {quantidade === 0 ? (

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

                ) : (

                  <div className="quantidade-control">

                    <button
                      className="qtd-btn"
                      onClick={() => removerItem(produto.id)}
                    >
                      -
                    </button>

                    <span className="qtd-num">
                      {quantidade}
                    </span>

                    <button
                      className="qtd-btn"
                      onClick={() =>
                        adicionarItem({
                          id: produto.id,
                          nome: produto.nome,
                          preco: produto.preco,
                        })
                      }
                    >
                      +
                    </button>

                  </div>

                )}

              </div>

            )
          })}

        </div>

      </div>

    </div>
  )
}