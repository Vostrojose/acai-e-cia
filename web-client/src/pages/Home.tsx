import { useEffect, useState } from 'react'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useParams, useNavigate } from 'react-router-dom'
import '../assets/css/Home.css'

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

  /* ============================= */
  /* 🔥 MODAL ADICIONAIS           */
  /* ============================= */

  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<any[]>([])

  function abrirModalProduto(produto: any, event: any) {
    animarAdicionar(event)
    setProdutoSelecionado(produto)
    setAdicionaisSelecionados([])
  }

  /* ============================= */
  /* 🔥 NOVO: ID ÚNICO POR ITEM    */
  /* ============================= */
  function gerarIdItem(produto: any, adicionais: any[]) {
    const adicionaisOrdenados = [...adicionais].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    )

    return (
      produto.id +
      '-' +
      JSON.stringify(adicionaisOrdenados.map(a => a.nome))
    )
  }

  function confirmarProduto() {
    const adicionaisTotal = adicionaisSelecionados.reduce(
      (acc, item) => acc + item.preco,
      0
    )

    const idUnico = gerarIdItem(produtoSelecionado, adicionaisSelecionados)

    adicionarItem({
      id: idUnico, // 🔥 CORREÇÃO PRINCIPAL
      nome: produtoSelecionado.nome,
      preco: produtoSelecionado.preco + adicionaisTotal,
      adicionais: adicionaisSelecionados
    })

    setProdutoSelecionado(null)
  }

  /* ============================= */

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

  return (
    <div className="page">

      <button
        className="btn-semana-floating"
        onClick={() => navigate('/cardapio')}
      >
        📅
      </button>

      {totalItens > 0 && (
        <div className="cart-floating" onClick={() => navigate('/carrinho')}>
          🛒
          <span className="cart-badge">{totalItens}</span>
        </div>
      )}

      <div className="header">
        <h1 className="title"> Açaí & Co</h1>
        <p className="subtitle">Monte seu pedido</p>
      </div>

      <div className="cardapio-container">
        <div className="cardapio-list">
          {produtosDisponiveis.map((produto) => {

            const itensMesmoProduto = itens.filter(i =>
              String(i.id).includes(produto.id)
            )

            const quantidade = itensMesmoProduto.reduce(
              (acc, item) => acc + item.quantidade,
              0
            )

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
                    <div className="produto-descricao">
                      {produto.descricao}
                    </div>
                  )}
                </div>

                <div className="produto-acoes">
                  <button
                    className={quantidade ? 'add-btn-added' : 'add-btn'}
                    onClick={(e) => abrirModalProduto(produto, e)}
                  >
                    {quantidade ? `✔ ${quantidade}` : '+ Adicionar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {produtoSelecionado && (
        <div className="modal">
          <div className="modal-content">

            <h2>{produtoSelecionado.nome}</h2>

            <p>Escolha adicionais:</p>

            {[
              { nome: 'Ovo', preco: 2 },
              { nome: 'Queijo coalho', preco: 6 },
              { nome: 'Orégano', preco: 1 }
            ].map((add, i) => (
              <label key={i} style={{ display: 'block', marginTop: 8 }}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAdicionaisSelecionados(prev => [...prev, add])
                    } else {
                      setAdicionaisSelecionados(prev =>
                        prev.filter(a => a.nome !== add.nome)
                      )
                    }
                  }}
                />
                {add.nome} (+R$ {add.preco})
              </label>
            ))}

            <button onClick={confirmarProduto}>
              Confirmar
            </button>

            <button onClick={() => setProdutoSelecionado(null)}>
              Cancelar
            </button>

          </div>
        </div>
      )}

    </div>
  )
}