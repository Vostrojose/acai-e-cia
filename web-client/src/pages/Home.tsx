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

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null,
  )
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<{
    [key: string]: {
      id: string
      nome: string
      preco: number
      quantidade: number
    }
  }>({})

  function incrementarAdicional(add: any) {
    setAdicionaisSelecionados((prev) => {
      const atual = prev[add.id]

      return {
        ...prev,
        [add.id]: {
          id: add.id,
          nome: add.nome,
          preco: Number(add.preco),
          quantidade: atual ? atual.quantidade + 1 : 1,
        },
      }
    })
  }

  function decrementarAdicional(add: any) {
    setAdicionaisSelecionados((prev) => {
      const atual = prev[add.id]
      if (!atual) return prev

      if (atual.quantidade === 1) {
        const copy = { ...prev }
        delete copy[add.id]
        return copy
      }

      return {
        ...prev,
        [add.id]: {
          ...atual,
          quantidade: atual.quantidade - 1,
        },
      }
    })
  }

  function abrirPopup(produto: Produto) {
    setProdutoSelecionado(produto)
    setAdicionaisSelecionados({})
  }

  function fecharPopup() {
    setProdutoSelecionado(null)
  }

  function gerarIdItem(produto: Produto, adicionais: any[]) {
    const adicionaisOrdenados = [...adicionais].sort((a, b) =>
      a.nome.localeCompare(b.nome),
    )

    return (
      produto.id + '-' + JSON.stringify(adicionaisOrdenados.map((a) => a.id))
    )
  }

  function adicionarDireto(produto: Produto) {
    const idUnico = gerarIdItem(produto, [])

    adicionarItem({
      id: idUnico,
      produtoId: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      adicionais: [],
    })
  }

  function confirmarProduto() {
    if (!produtoSelecionado) return

    const adicionaisClonados = Object.values(adicionaisSelecionados).flatMap(
      (a) =>
        Array.from({ length: a.quantidade }).map(() => ({
          id: a.id,
          nome: a.nome,
          preco: Number(a.preco),
        })),
    )

    console.log('🔥 ENVIANDO ADICIONAIS:', adicionaisClonados)

    const idUnico = gerarIdItem(produtoSelecionado, adicionaisClonados)

    adicionarItem({
      id: idUnico,
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      preco: produtoSelecionado.preco,
      adicionais: adicionaisClonados,
    })

    setAdicionaisSelecionados({})
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
            temAdicionais: (produto.adicionais?.length ?? 0) > 0,
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

  const totalAdicionais = Object.values(adicionaisSelecionados)
    .reduce((acc, a) => acc + a.preco * a.quantidade, 0)

  const totalFinal =
    (produtoSelecionado?.preco || 0) + totalAdicionais

  return (
    <div className="page">
      <div
        className="cart-floating"
        onClick={() => navigate('/carrinho')}
        style={{ opacity: totalItens > 0 ? 1 : 0.6 }}
      >
        🛒
        {totalItens > 0 && <span className="cart-badge">{totalItens}</span>}
      </div>

      <div className="header">
        <h1 className="title">Açaí & Co</h1>
        <p className="subtitle">Monte seu pedido</p>

        <button
          className="btn-semana"
          onClick={() => navigate(`/cardapio-semana/${origem || '1'}`)}
          title="Ver cardápio da semana"
        >
          📅
        </button>
      </div>

      <div className="cardapio-container">
        <div className="cardapio-list">
          {produtosDisponiveis.map((produto) => {
            const quantidade = itens
              .filter((i) => i.produtoId === produto.id)
              .reduce((acc, item) => acc + item.quantidade, 0)

            return (
              <div key={produto.id} className="produto-card">
                <div className="produto-info">
                  <div className="produto-header">
                    <span className="produto-nome">{produto.nome}</span>
                    <span className="produto-preco">
                      R$ {produto.preco.toFixed(2)}
                    </span>
                  </div>

                  {produto.descricao && (
                    <div className="produto-descricao">{produto.descricao}</div>
                  )}
                </div>

                <button
                  className={quantidade ? 'add-btn-added' : 'add-btn'}
                  onClick={() => {
                    if (produto.temAdicionais) {
                      abrirPopup(produto)
                    } else {
                      adicionarDireto(produto)
                    }
                  }}
                >
                  {quantidade ? `✔ ${quantidade} no carrinho` : 'Adicionar'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {produtoSelecionado && (
        <div className="popup-overlay" onClick={fecharPopup}>
          <div
            className="popup-adicionais"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{produtoSelecionado.nome}</h3>

            {produtoSelecionado.adicionais
              ?.filter((a) => a.ativo)
              .map((add) => {
                const quantidade =
                  adicionaisSelecionados[add.id]?.quantidade || 0

                return (
                  <div key={add.id} style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        {add.nome} (+R$ {Number(add.preco).toFixed(2)})
                      </span>

                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                        }}
                      >
                        <button
                          disabled={quantidade === 0}
                          onClick={() => decrementarAdicional(add)}
                          style={{ width: 30, height: 30 }}
                        >
                          -
                        </button>

                        <span>{quantidade}</span>

                        <button
                          onClick={() => incrementarAdicional(add)}
                          style={{ width: 30, height: 30 }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

            <div style={{ marginTop: 15, fontWeight: 'bold' }}>
              Adicionais: R$ {totalAdicionais.toFixed(2)}
            </div>

            <div style={{ marginTop: 5, fontWeight: 'bold', fontSize: 16 }}>
              Total: R$ {totalFinal.toFixed(2)}
            </div>

            <button onClick={confirmarProduto}>Confirmar</button>
            <button onClick={fecharPopup}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}