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

  const totalItens = itens.reduce((total, item) => total + item.quantidade, 0)

  function animarAdicionar(event: React.MouseEvent<HTMLButtonElement>) {
    const carrinho = document.querySelector('.cart-floating') as HTMLElement
    if (!carrinho) return

    const origem = event.currentTarget.getBoundingClientRect()
    const destino = carrinho.getBoundingClientRect()

    const bolinha = document.createElement('div')
    bolinha.className = 'fly-item'

    document.body.appendChild(bolinha)

    bolinha.style.left = `${origem.left}px`
    bolinha.style.top = `${origem.top}px`

    requestAnimationFrame(() => {
      bolinha.style.transform = `translate(${destino.left - origem.left}px, ${destino.top - origem.top}px) scale(0.3)`
      bolinha.style.opacity = '0'
    })

    carrinho.classList.add('pulse')
    setTimeout(() => carrinho.classList.remove('pulse'), 400)

    setTimeout(() => bolinha.remove(), 600)
  }

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
    if (origem) localStorage.setItem('origemPedido', origem)
  }, [origem])

  if (loading) return <p style={{ padding: 20 }}>Carregando...</p>

  const produtosDisponiveis = produtos.filter((produto) => {
    switch (hoje) {
      case 0:
        return produto.disponivelDom
      case 1:
        return produto.disponivelSeg
      case 2:
        return produto.disponivelTer
      case 3:
        return produto.disponivelQua
      case 4:
        return produto.disponivelQui
      case 5:
        return produto.disponivelSex
      case 6:
        return produto.disponivelSab
      default:
        return true
    }
  })

  return (
    <div className="page">

      {/* 📅 BOTÃO CARDÁPIO SEMANA (SEMPRE VISÍVEL) */}
      <button
        className="btn-semana-floating"
        onClick={() => navigate('/cardapioSemana')}
      >
        📅
      </button>

      {/* 🛒 CARRINHO NOVO */}
      {totalItens > 0 && (
        <div className="cart-floating" onClick={() => navigate('/carrinho')}>
          🛒
          <span className="cart-badge">{totalItens}</span>
        </div>
      )}

      <div className="header">
        <h1 className="title"> Açaí & Co</h1>
        <p className="subtitle">Monte seu pedido </p>
      </div>

      <div className="cardapio-container">
        <div className="cardapio-list">
          {produtosDisponiveis.map((produto) => {
            const item = itens.find((i) => String(i.id) === String(produto.id))
            const quantidade = item?.quantidade || 0

            return (
              <div key={produto.id} className="produto-card">
                <div className="produto-info">
                  <div className="produto-header">
                    <div className="produto-nome">{produto.nome}</div>
                    <div className="produto-preco">
                      R$ {produto.preco.toFixed(2)}
                    </div>
                  </div>

                  {produto.descricao && (
                    <div className="produto-descricao">{produto.descricao}</div>
                  )}
                </div>

                <div className="produto-acoes">
                  <button
                    className={quantidade ? 'add-btn-added' : 'add-btn'}
                    onClick={(e) => {
                      animarAdicionar(e)
                      adicionarItem({
                        id: produto.id,
                        nome: produto.nome,
                        preco: produto.preco,
                      })
                    }}
                  >
                    {quantidade ? `✔ ${quantidade}` : '+ Adicionar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}