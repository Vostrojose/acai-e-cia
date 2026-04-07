import { useEffect, useState } from 'react'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useParams, useNavigate } from 'react-router-dom'
import './Home.css'

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number
  ativo: boolean
  disponivelSeg: boolean
  disponivelTer: boolean
  disponivelQua: boolean
  disponivelQui: boolean
  disponivelSex: boolean
  disponivelSab: boolean
  disponivelDom: boolean
}

export default function Home() {
  const hoje = new Date().getDay()
  const { origem } = useParams()
  const navigate = useNavigate()

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  const { adicionarItem, itens } = useCart()

  useEffect(() => {
    async function loadProdutos() {
      try {
        const response = await api.get('/produtos')

        const produtosData = response.data?.data || []

        const produtosAtivos = produtosData
          .map((produto: Produto) => ({
            ...produto,
            preco: Number(produto.preco),
          }))
          .filter((produto: Produto) => produto.ativo)

        setProdutos(produtosAtivos)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
      } finally {
        setLoading(false)
      }
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

  const produtosDisponiveis = produtos.filter((produto: Produto) => {
    switch (hoje) {
      case 0: return produto.disponivelDom
      case 1: return produto.disponivelSeg
      case 2: return produto.disponivelTer
      case 3: return produto.disponivelQua
      case 4: return produto.disponivelQui
      case 5: return produto.disponivelSex
      case 6: return produto.disponivelSab
      default: return true
    }
  })

  const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0)

  return (
    <div className="page">

      {/* 🛒 CARRINHO FLUTUANTE */}
      {itens.length > 0 && (
        <div
          className="cart-floating"
          onClick={() => navigate('/carrinho')}
        >
          🛒
          <span className="cart-badge">{itens.length}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="header">
        <h1 className="title">🍧 Açaí & Cia</h1>
        <p className="subtitle">
          Monte seu pedido e retire na loja 🚀
        </p>
      </div>

      {/* LISTA */}
      <div className="cardapio-container">
        <div className="cardapio-list">

          {produtosDisponiveis.map((produto) => {
            const item = itens.find(i => i.id === produto.id)
            const quantidade = item?.quantidade || 0

            return (
              <div key={produto.id} className="produto-card">

                <div className="produto-info">

                  <div className="produto-header">
                    <div className="produto-nome">
                      {produto.nome}
                    </div>

                    <div className="produto-preco">
                      R$ {produto.preco.toFixed(2)}
                    </div>
                  </div>

                  {produto.descricao && (
                    <div className="produto-descricao">
                      {produto.descricao}
                    </div>
                  )}

                </div>

                <div className="produto-acoes">
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
                      + Adicionar
                    </button>
                  ) : (
                    <button
                      className="add-btn-added"
                      onClick={() =>
                        adicionarItem({
                          id: produto.id,
                          nome: produto.nome,
                          preco: produto.preco,
                        })
                      }
                    >
                      ✔ {quantidade} no pedido
                    </button>
                  )}
                </div>

              </div>
            )
          })}

        </div>
      </div>

      {/* BARRA INFERIOR (mantida para teste) */}
      {itens.length > 0 && (
        <div className="checkout-bar">
          <button
            className="checkout-btn"
            onClick={() => navigate('/carrinho')}
          >
            Ver pedido ({itens.length}) • R$ {total.toFixed(2)}
          </button>
        </div>
      )}

    </div>
  )
}