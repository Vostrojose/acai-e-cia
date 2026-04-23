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

  // 🔥 CORREÇÃO AQUI
  adicionais?: {
    id: string
    nome: string
    preco: number
    ativo: boolean
  }[]

  temAdicionais?: boolean
}

export default function Home() {
  const hoje = new Date().getDay()
  const { origem } = useParams()
  const navigate = useNavigate()

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  const { adicionarItem, itens } = useCart()

  const totalItens = itens.reduce((total, item) => total + item.quantidade, 0)

  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<any[]>([])

  function abrirPopup(produto: any) {
    setProdutoSelecionado(produto)
    setAdicionaisSelecionados([])
  }

  function fecharPopup() {
    setProdutoSelecionado(null)
  }

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

  function adicionarDireto(produto: any) {
    const idUnico = gerarIdItem(produto, [])

    adicionarItem({
      id: idUnico,
      nome: produto.nome,
      preco: produto.preco,
      adicionais: []
    })
  }

  function confirmarProduto() {
    const adicionaisTotal = adicionaisSelecionados.reduce(
      (acc, item) => acc + item.preco,
      0
    )

    const idUnico = gerarIdItem(produtoSelecionado, adicionaisSelecionados)

    adicionarItem({
      id: idUnico,
      nome: produtoSelecionado.nome,
      preco: produtoSelecionado.preco + adicionaisTotal,
      adicionais: adicionaisSelecionados
    })

    fecharPopup()
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

            // 🔥 CORREÇÃO SEGURA
            temAdicionais: (produto.adicionais?.length ?? 0) > 0
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
        <h1 className="title">Açaí & Co</h1>
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

                  {!produto.temAdicionais && (
                    <button
                      className="add-btn"
                      onClick={() => adicionarDireto(produto)}
                    >
                      + Adicionar
                    </button>
                  )}

                  {produto.temAdicionais && (
                    <button
                      className={quantidade ? 'add-btn-added' : 'add-btn'}
                      onClick={() => abrirPopup(produto)}
                    >
                      {quantidade ? `✔ ${quantidade}` : 'Escolher adicionais'}
                    </button>
                  )}

                </div>

              </div>
            )
          })}
        </div>
      </div>

      {produtoSelecionado && (
        <div className="popup-adicionais">

          <h3>{produtoSelecionado.nome}</h3>

          {[
            { nome: 'Ovo', preco: 2 },
            { nome: 'Queijo coalho', preco: 6 },
            { nome: 'Orégano', preco: 1 }
          ].map((add, i) => (
            <label key={i}>
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

          <button onClick={fecharPopup}>
            Fechar
          </button>

        </div>
      )}

    </div>
  )
}