import { useEffect, useMemo, useRef, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import api from '../services/api'

import { theme } from '../assets/styles/adminTheme'

type PedidoAdicional = {
  id: string

  nome: string

  preco: number

  quantidade: number
}

type PedidoVariacao = {
  id: string

  nome: string

  preco: number
}

type PedidoItem = {
  uid: string

  produtoId: string

  nome: string

  quantidade: number

  precoBase: number

  variacao?: PedidoVariacao | null

  adicionais: PedidoAdicional[]

  observacao?: string

  totalItem: number
}

export default function Balcao() {
  const navigate = useNavigate()

  const isMobile = window.matchMedia('(max-width: 700px)').matches

  const [produtos, setProdutos] = useState<any[]>([])

  const [busca, setBusca] = useState('')

  const [itens, setItens] = useState<PedidoItem[]>([])

  const [clienteNome, setClienteNome] = useState('')

  const [formaPagamento, setFormaPagamento] = useState('PAGO')
  const [pendentePagamento, setPendentePagamento] = useState(false)

  const [salvando, setSalvando] = useState(false)

  const timeoutRef = useRef<any>(null)
  const itensRef = useRef<PedidoItem[]>([])

  useEffect(() => {
    carregarProdutos()

    carregarPedido()
  }, [])

  useEffect(() => {
    resetarTimeout()
    window.addEventListener('pointerdown', resetarTimeout)

    window.addEventListener('keydown', resetarTimeout)

    window.addEventListener('click', resetarTimeout)

    window.addEventListener('touchstart', resetarTimeout)

    return () => {
      clearTimeout(timeoutRef.current)

      window.removeEventListener('pointerdown', resetarTimeout)

      window.removeEventListener('keydown', resetarTimeout)

      window.removeEventListener('click', resetarTimeout)

      window.removeEventListener('touchstart', resetarTimeout)
    }
  }, [])

  function resetarTimeout() {
    clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(
      () => {
        if (itensRef.current.length === 0) {
          navigate('/cozinha')
        }
      },
      3 * 60 * 1000,
    )
  }
  function carregarPedido() {
    try {
      const pedido = JSON.parse(localStorage.getItem('pedido-balcao') || '[]')

      setItens(pedido)
    } catch {
      setItens([])
    }
  }

  async function carregarProdutos() {
    try {
      const response = await api.get('/produtos')

      setProdutos(response.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  function removerItem(uid: string) {
    const confirmar = confirm('Remover item do pedido?')

    if (!confirmar) return

    const atualizado = itens.filter((i) => i.uid !== uid)

    setItens(atualizado)

    localStorage.setItem('pedido-balcao', JSON.stringify(atualizado))
  }

  function alterarQuantidade(uid: string, delta: number) {
    const atualizado = itens.map((i) => {
      if (i.uid !== uid) return i

      const novaQuantidade = Math.max(1, i.quantidade + delta)

      const valorUnitario = i.totalItem / i.quantidade

      return {
        ...i,

        quantidade: novaQuantidade,

        totalItem: valorUnitario * novaQuantidade,
      }
    })

    setItens(atualizado)

    localStorage.setItem('pedido-balcao', JSON.stringify(atualizado))
  }

  const total = useMemo(() => {
    return itens.reduce(
      (acc, item) => acc + item.totalItem,

      0,
    )
  }, [itens])

  async function finalizarPedido() {
    try {
      setSalvando(true)

      await api.post('/balcao', {
        itens: itens.map((i) => ({
          pago: !pendentePagamento,

          id: i.produtoId,

          nome: i.nome,

          preco: i.variacao?.preco ?? i.precoBase,

          quantidade: i.quantidade,

          variacaoId: i.variacao?.id ?? null,

          variacaoNome: i.variacao?.nome ?? null,

          adicionais: i.adicionais,
        })),

        forma: formaPagamento,

        pago: !pendentePagamento,

        clienteNome: clienteNome.toUpperCase().trim(),

        pularPreparo: true,
      })
      alert('Pedido criado')

      localStorage.removeItem('pedido-balcao')

      setItens([])

      setClienteNome('')
    } catch (err: any) {
      console.error(err)

      console.log(err?.response?.data)

      alert(JSON.stringify(err?.response?.data || 'Erro ao criar pedido'))
    } finally {
      setSalvando(false)
    }
  }

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <div style={theme.page}>
      <div style={headerTop}>
        <button
          onClick={() => {
            if (itens.length > 0) {
              const confirmar = confirm(
                'Existem itens no pedido. Deseja sair mesmo?',
              )

              if (!confirmar) {
                return
              }
            }

            navigate('/cozinha')
          }}
          style={btnVoltar}
        >
          ← Cozinha
        </button>

        <h1 style={title}>🧾 Vendas Balcão</h1>
      </div>

      <div
        style={{
          ...layout,

          gridTemplateColumns: isMobile ? '1fr' : '1fr 380px',
        }}
      >
        <div>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto"
            style={inputBusca}
          />

          <div style={gridProdutos}>
            {produtosFiltrados.map((produto) => {
              const menorPreco =
                produto.variacoes?.length > 0
                  ? Math.min(
                      ...produto.variacoes.map((v: any) => Number(v.preco)),
                    )
                  : Number(produto.preco)

              return (
                <div
                  key={produto.id}
                  onClick={() => navigate(`/balcao/produto/${produto.id}`)}
                  style={produtoCard}
                >
                  <h3>{produto.nome}</h3>

                  <div>A partir de R$ {menorPreco.toFixed(2)}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          style={{
            ...sidebar,

            height: isMobile ? 'auto' : 'calc(100vh - 40px)',
          }}
        >
          <h2>Resumo Pedido</h2>

          <div style={pedidoLista}>
            {itens.map((item) => (
              <div key={item.uid} style={pedidoCard}>
                <strong>{item.nome}</strong>

                {item.variacao && (
                  <div
                    style={{
                      marginTop: 6,

                      opacity: 0.8,
                    }}
                  >
                    🥤 {item.variacao.nome}
                  </div>
                )}

                {(item.adicionais || []).map((add) => (
                  <div key={add.id}>
                    + {add.quantidade}x {add.nome}
                  </div>
                ))}

                {item.observacao && (
                  <div
                    style={{
                      marginTop: 8,

                      fontStyle: 'italic',

                      opacity: 0.7,
                    }}
                  >
                    📝 {item.observacao}
                  </div>
                )}

                <div style={acoesQtd}>
                  <button onClick={() => alterarQuantidade(item.uid, -1)}>
                    -
                  </button>

                  <span>{item.quantidade}</span>

                  <button onClick={() => alterarQuantidade(item.uid, 1)}>
                    +
                  </button>

                  <button onClick={() => navigate(`/balcao/item/${item.uid}`)}>
                    ✏️
                  </button>

                  <button onClick={() => removerItem(item.uid)}>🗑</button>
                </div>

                <div
                  style={{
                    marginTop: 10,

                    fontWeight: 700,
                  }}
                >
                  R$ {item.totalItem.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={footerPedido}>
            <input
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Cliente"
              style={input}
            />
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              style={input}
            >
              <option value="PAGO">Pago</option>

              <option value="FIADO">Fiado</option>

              <option value="CREDITO">Crédito</option>
            </select>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
                color: '#fff',
              }}
            >
              <input
                type="checkbox"
                checked={pendentePagamento}
                onChange={(e) => setPendentePagamento(e.target.checked)}
              />
              Consumo local / pagar depois
            </label>

            <h2>Total: R$ {total.toFixed(2)}</h2>
            <button
              onClick={finalizarPedido}
              disabled={itens.length === 0 || salvando}
              style={btnFinalizar}
            >
              {salvando ? 'Finalizando...' : 'Finalizar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const header: React.CSSProperties = {
  marginBottom: 20,
}

const title: React.CSSProperties = {
  color: '#fff',

  fontSize: 32,

  fontWeight: 800,
}

const layout: React.CSSProperties = {
  display: 'grid',

  gap: 20,
}

const inputBusca: React.CSSProperties = {
  width: '100%',

  padding: 18,

  borderRadius: 16,

  border: '1px solid #333',

  background: '#1e1e1e',

  color: '#fff',

  marginBottom: 20,
}

const gridProdutos: React.CSSProperties = {
  display: 'grid',

  gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',

  gap: 18,
}

const produtoCard: React.CSSProperties = {
  background: 'linear-gradient(135deg,#1e1e1e,#2a2a2a)',

  padding: 20,

  borderRadius: 18,

  border: '1px solid #333',

  color: '#fff',

  cursor: 'pointer',

  transition: '0.2s',
}

const sidebar: React.CSSProperties = {
  background: 'linear-gradient(135deg,#1e1e1e,#2a2a2a)',

  borderRadius: 20,

  padding: 20,

  display: 'flex',

  flexDirection: 'column',
}

const pedidoLista: React.CSSProperties = {
  flex: 1,

  overflowY: 'auto',

  marginTop: 20,
}

const pedidoCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',

  padding: 16,

  borderRadius: 16,

  marginBottom: 14,

  color: '#fff',

  border: '1px solid rgba(255,255,255,0.05)',
}

const acoesQtd: React.CSSProperties = {
  display: 'flex',

  gap: 10,

  marginTop: 12,

  alignItems: 'center',
}

const footerPedido: React.CSSProperties = {
  marginTop: 20,
}

const input: React.CSSProperties = {
  width: '100%',

  padding: 14,

  borderRadius: 14,

  border: '1px solid #333',

  background: '#111',

  color: '#fff',

  marginBottom: 14,
}

const btnFinalizar: React.CSSProperties = {
  width: '100%',

  padding: 18,

  borderRadius: 16,

  border: 'none',

  background: '#22c55e',

  color: '#fff',

  fontWeight: 'bold',

  fontSize: 18,

  cursor: 'pointer',
}
const headerTop: React.CSSProperties = {
  display: 'flex',

  alignItems: 'center',

  gap: 16,

  marginBottom: 20,
}

const btnVoltar: React.CSSProperties = {
  padding: '12px 18px',

  borderRadius: 14,

  border: 'none',

  background: '#333',

  color: '#fff',

  cursor: 'pointer',

  fontWeight: 700,
}
