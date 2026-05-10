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
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<any[]>(
    [],
  )
  const agora = new Date()

  const horaAtual = agora.getHours() * 60 + agora.getMinutes()

  const abertura = 7 * 60 + 30 // 07:30
  const fechamentoPedidos = 19 * 60 // 19:00

  const antesDaAbertura = horaAtual < abertura

  const pedidosEncerrados = horaAtual >= fechamentoPedidos

  function abrirPopup(produto: Produto) {
    setProdutoSelecionado(produto)
    setAdicionaisSelecionados([])
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

  /* ============================= */
  /*  CORREÇÃO DEFINITIVA REAL   */
  /* ============================= */
  function confirmarProduto() {
    if (!produtoSelecionado) return

    //  CLONE REAL DOS ADICIONAIS (ESSENCIAL)
    const adicionaisClonados = (adicionaisSelecionados || []).map((a: any) => ({
      id: a.id,
      nome: a.nome,
      preco: Number(a.preco),
    }))

    console.log(' ENVIANDO ADICIONAIS:', adicionaisClonados)

    const idUnico = gerarIdItem(produtoSelecionado, adicionaisClonados)

    adicionarItem({
      id: idUnico,
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      preco: produtoSelecionado.preco,
      adicionais: adicionaisClonados,
    })

    // LIMPA SOMENTE DEPOIS
    setAdicionaisSelecionados([])

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

  return (
    <div className="page">
      <div
        className="cart-floating"
        onClick={() => {
          if (pedidosEncerrados) return

          navigate('/carrinho')
        }}
        style={{
          cursor: pedidosEncerrados ? 'not-allowed' : 'pointer',
          opacity: totalItens > 0 ? 1 : 0.6,
        }}
      >
        🛒
        {totalItens > 0 && <span className="cart-badge">{totalItens}</span>}
      </div>

      <div className="header">
        <div className="header-branding">
          <div className="header-logo">
            <img src="/logo.png" alt="Açaí & Co" />
          </div>

          <div className="header-texts">
            <h1 className="title">Açaí & Co</h1>

            <p className="subtitle">Pedidos em tempo real</p>

            <div className="online-status">
              <span className="status-dot" />
              Online agora
            </div>
          </div>
        </div>

        <button
          className="btn-semana"
          onClick={() => navigate(`/cardapio-semana/${origem || '1'}`)}
          title="Ver cardápio da semana"
        >
          📅
        </button>
        <button
          className="btn-home"
          onClick={() => navigate('/')}
          title="Voltar para home"
        >
          🏠
        </button>
      </div>
      {antesDaAbertura && (
        <div
          style={{
            background: 'rgba(255,193,7,0.12)',
            border: '1px solid rgba(255,193,7,0.35)',
            color: '#ffca28',

            padding: 14,

            borderRadius: 14,

            marginBottom: 18,

            fontWeight: 600,

            textAlign: 'center',
          }}
        >
          ⚠️ Pedidos realizados agora serão preparados após as 07:30.
        </div>
      )}
      {pedidosEncerrados && (
        <div
          style={{
            background: 'rgba(244,67,54,0.12)',
            border: '1px solid rgba(244,67,54,0.35)',
            color: '#ef5350',

            padding: 16,

            borderRadius: 14,

            marginBottom: 18,

            fontWeight: 700,

            textAlign: 'center',
          }}
        >
          🔒 Pedidos encerrados por hoje. Retornaremos amanhã às 07:30.
        </div>
      )}

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
                    <div className="produto-nome">{produto.nome}</div>

                    <div className="produto-preco">
                      R$ {produto.preco.toFixed(2)}
                    </div>
                  </div>

                  {produto.descricao && (
                    <div className="produto-descricao">{produto.descricao}</div>
                  )}
                </div>

                <button
                  disabled={pedidosEncerrados}
                  className={quantidade ? 'add-btn-added' : 'add-btn'}
                  style={{
                    opacity: pedidosEncerrados ? 0.5 : 1,
                    cursor: pedidosEncerrados ? 'not-allowed' : 'pointer',
                  }}
                  onClick={() => {
                    if (pedidosEncerrados) return

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
              .map((add) => (
                <label key={add.id}>
                  <input
                    type="checkbox"
                    checked={adicionaisSelecionados.some(
                      (a) => a.id === add.id,
                    )}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAdicionaisSelecionados((prev) => [...prev, add])
                      } else {
                        setAdicionaisSelecionados((prev) =>
                          prev.filter((a) => a.id !== add.id),
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
