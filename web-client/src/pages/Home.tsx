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

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<any[]>([])

  function abrirPopup(produto: Produto) {
    setProdutoSelecionado(produto)
    setAdicionaisSelecionados([])
  }

  function fecharPopup() {
    setProdutoSelecionado(null)
  }

  function gerarIdItem(produto: Produto, adicionais: any[]) {
    const adicionaisOrdenados = [...adicionais].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    )

    return produto.id + '-' + JSON.stringify(adicionaisOrdenados.map(a => a.id))
  }

  function adicionarDireto(produto: Produto) {
    const idUnico = gerarIdItem(produto, [])

    adicionarItem({
      id: idUnico,
      produtoId: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      adicionais: []
    })
  }

  /* ============================= */
  /* 🔥 CORREÇÃO PRINCIPAL AQUI     */
  /* ============================= */
  function confirmarProduto() {
    if (!produtoSelecionado) return

    const idUnico = gerarIdItem(produtoSelecionado, adicionaisSelecionados)

    const totalAdicionais = adicionaisSelecionados.reduce(
      (soma, add) => soma + Number(add.preco),
      0
    )

    const precoFinal = Number(produtoSelecionado.preco) + totalAdicionais

    adicionarItem({
      id: idUnico,
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      preco: precoFinal, // 🔥 AGORA SOMA CORRETAMENTE
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

            const quantidade = itens
              .filter(i => i.produtoId === produto.id)
              .reduce((acc, item) => acc + item.quantidade, 0)

            return (
              <div key={produto.id} className="produto-card">

                <div className="produto-info">

                  {/* 🔥 CORREÇÃO VISUAL MOBILE */}
                  <div className="produto-header">
                    <span className="produto-nome">{produto.nome}</span>
                    <span className="produto-preco">
                      R$ {produto.preco.toFixed(2)}
                    </span>
                  </div>

                  {produto.descricao && (
                    <div className="produto-descricao">
                      {produto.descricao}
                    </div>
                  )}

                </div>

                {!produto.temAdicionais ? (
                  <button className="add-btn" onClick={() => adicionarDireto(produto)}>
                    + Adicionar
                  </button>
                ) : (
                  <button
                    className={quantidade ? "add-btn-added" : "add-btn"}
                    onClick={() => abrirPopup(produto)}
                  >
                    {quantidade ? `✔ ${quantidade}` : 'Escolher'}
                  </button>
                )}

              </div>
            )
          })}

        </div>
      </div>

      {produtoSelecionado && (
        <div className="popup-overlay" onClick={fecharPopup}>
          <div className="popup-adicionais" onClick={(e) => e.stopPropagation()}>

            <h3>{produtoSelecionado.nome}</h3>

            {produtoSelecionado.adicionais?.filter(a => a.ativo).map((add) => (
              <label key={add.id}>
                <input
                  type="checkbox"
                  checked={adicionaisSelecionados.some(a => a.id === add.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAdicionaisSelecionados(prev => [...prev, add])
                    } else {
                      setAdicionaisSelecionados(prev =>
                        prev.filter(a => a.id !== add.id)
                      )
                    }
                  }}
                />
                {add.nome} (+R$ {Number(add.preco).toFixed(2)})
              </label>
            ))}

            <button onClick={confirmarProduto}>Confirmar</button>
            <button onClick={fecharPopup}>Cancelar</button>

          </div>
        </div>
      )}
    </div>
  )
}