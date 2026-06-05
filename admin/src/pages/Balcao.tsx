import { useEffect, useMemo, useRef, useState } from 'react'

import { io } from 'socket.io-client'

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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const [produtos, setProdutos] = useState<any[]>([])

  const [busca, setBusca] = useState('')

  const [itens, setItens] = useState<PedidoItem[]>([])

  const [clienteNome, setClienteNome] = useState('')

  const [formaPagamento, setFormaPagamento] = useState('PAGO')
  const [pendentePagamento, setPendentePagamento] = useState(false)
  const [pendentes, setPendentes] = useState<any[]>([])
  const [novos, setNovos] = useState<any[]>([])
  const [preparo, setPreparo] = useState<any[]>([])
  const [prontos, setProntos] = useState<any[]>([])
  const [piscarNovos, setPiscarNovos] = useState(false)

  const [salvando, setSalvando] = useState(false)

  const [mostrarLogin, setMostrarLogin] = useState(false)

  const [email, setEmail] = useState('')

  const [senha, setSenha] = useState('')

  const [acaoPendente, setAcaoPendente] = useState<null | (() => void)>(null)

  const [ultimoLoginSensivel, setUltimoLoginSensivel] = useState<number | null>(
    null,
  )

  const TEMPO_REAUTENTICACAO = 5 * 60 * 1000

  const timeoutRef = useRef<any>(null)
  const itensRef = useRef<PedidoItem[]>([])
  const novosRef = useRef(0)
  const wakeLockRef = useRef<any>(null)
  useEffect(() => {
    async function ativarWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch (err) {
        console.error('WakeLock error:', err)
      }
    }

    ativarWakeLock()

    const handleVisibility = async () => {
      if (document.visibilityState === 'visible' && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch (err) {
          console.error(err)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)

      wakeLockRef.current?.release()
    }
  }, [])

  useEffect(() => {
    carregarProdutos()

    carregarPedido()

    carregarPendentes()

    carregarPainelCozinha()
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
  useEffect(() => {
    itensRef.current = itens
  }, [itens])

  useEffect(() => {
    novosRef.current = novos.length
  }, [novos])
  useEffect(() => {
    const socket = io('https://api.acaiecompanhia.com.br', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    const atualizarPainel = async () => {
      const quantidadeAnterior = novosRef.current

      await carregarPainelCozinha()

      await carregarPendentes()

      setTimeout(() => {
        if (novos.length > quantidadeAnterior) {
          setPiscarNovos(true)

          setTimeout(() => {
            setPiscarNovos(false)
          }, 5000)
        }
      }, 300)
    }

    socket.on('novo_pedido', atualizarPainel)

    socket.on('pedido_atualizado', atualizarPainel)

    return () => {
      socket.off('novo_pedido', atualizarPainel)

      socket.off('pedido_atualizado', atualizarPainel)

      socket.disconnect()
    }
  }, [])
  async function login() {
    try {
      const res = await api.post('/auth/login', {
        email,
        senha,
      })

      const token = res.data.data.token
      console.log(res.data)

      sessionStorage.setItem('token', token)

      api.defaults.headers.Authorization = `Bearer ${token}`

      setEmail('')
      setSenha('')
      setMostrarLogin(false)

      setUltimoLoginSensivel(Date.now())

      if (acaoPendente) {
        const acao = acaoPendente

        setAcaoPendente(null)

        Promise.resolve().then(() => {
          acao()
        })
      }
    } catch {
      alert('Credenciais inválidas')
    }
  }
  function exigirReautenticacao(callback: () => void) {
    const agora = Date.now()

    if (
      ultimoLoginSensivel &&
      agora - ultimoLoginSensivel < TEMPO_REAUTENTICACAO
    ) {
      callback()

      return
    }

    setAcaoPendente(() => callback)

    setMostrarLogin(true)
  }

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
  async function carregarPendentes() {
    try {
      const response = await api.get('/balcao/pendentes')

      const pedidosValidos = (response.data.data || []).filter(
        (p: any) => p.status !== 'CANCELADO',
      )

      setPendentes(pedidosValidos)
    } catch (err) {
      console.error(err)
    }
  }
  async function quitarPedido(id: string) {
    try {
      await api.patch(`/balcao/quitar/${id}`)

      carregarPendentes()
    } catch (err) {
      console.error(err)

      alert('Erro ao quitar pedido')
    }
  }

  async function carregarPainelCozinha() {
    try {
      const response = await api.get('/pedidos?limit=200')

      const pedidos = response.data.data || []

      setNovos(pedidos.filter((p: any) => p.status === 'RECEBIDO'))

      setPreparo(pedidos.filter((p: any) => p.status === 'EM_PREPARO'))

      setProntos(pedidos.filter((p: any) => p.status === 'PRONTO'))
    } catch (err) {
      console.error(err)
    }
  }
  async function cancelarPedido(id: string) {
    exigirReautenticacao(async () => {
      const confirmar = confirm('Deseja realmente cancelar este pedido?')

      if (!confirmar) return

      try {
        const token = sessionStorage.getItem('token')

        await api.patch(
          `/balcao/${id}/cancelar`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        carregarPendentes()

        carregarPainelCozinha()

        alert('Pedido cancelado')
      } catch (err) {
        console.error(err)

        alert('Erro ao cancelar pedido')
      }
    })
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
      setPendentePagamento(false)

      carregarPendentes()
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
    <>
      <style>{pulseStyle}</style>

      <div style={theme.page}>
        <div style={headerWrapper}>
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

          <div style={statusGrid}>
            <div
              style={{
                ...statusCard('#ef4444'),

                animation: piscarNovos ? 'pulseNovo 1s infinite' : 'none',
              }}
            >
              🆕 {novos.length} NOVOS
            </div>

            <div style={statusCard('#f59e0b')}>👨‍🍳 {preparo.length} PREPARO</div>

            <div style={statusCard('#22c55e')}>✅ {prontos.length} PRONTOS</div>

            <div style={statusCard('#a855f7')}>
              💰 {pendentes.length} PENDENTES
            </div>
          </div>
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
                    <button
                      style={btnAcao}
                      onClick={() => alterarQuantidade(item.uid, -1)}
                    >
                      -
                    </button>

                    <span>{item.quantidade}</span>

                    <button
                      style={btnAcao}
                      onClick={() => alterarQuantidade(item.uid, 1)}
                    >
                      +
                    </button>

                    <button
                      style={btnAcao}
                      onClick={() => navigate(`/balcao/item/${item.uid}`)}
                    >
                      ✏️
                    </button>

                    <button
                      style={btnAcao}
                      onClick={() => removerItem(item.uid)}
                    >
                      🗑
                    </button>
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
              {pendentes.length > 0 && (
                <div
                  style={{
                    marginTop: 20,
                  }}
                >
                  <h2
                    style={{
                      color: '#ef4444',
                      marginBottom: 14,
                    }}
                  >
                    Pendentes de Pagamento
                  </h2>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      maxHeight: 300,
                      overflowY: 'auto',
                    }}
                  >
                    {pendentes.map((pedido) => (
                      <div
                        key={pedido.id}
                        style={{
                          background: 'rgba(239,68,68,0.12)',
                          border: '1px solid rgba(239,68,68,0.35)',
                          borderRadius: 16,
                          padding: 14,
                          color: '#fff',
                        }}
                      >
                        <strong>
                          {pedido.clienteNome || 'Consumidor sem identificação'}
                        </strong>

                        <div
                          style={{
                            marginTop: 8,
                            opacity: 0.8,
                          }}
                        >
                          {pedido.itens.length} item(ns)
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            fontWeight: 700,
                            color: '#fca5a5',
                          }}
                        >
                          R$ {Number(pedido.total).toFixed(2)}
                        </div>

                        <button
                          onClick={() => quitarPedido(pedido.id)}
                          style={{
                            marginTop: 12,
                            width: '100%',
                            padding: 12,
                            borderRadius: 12,
                            border: 'none',
                            background: '#22c55e',
                            color: '#fff',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          QUITAR
                        </button>
                        <button
                          onClick={() => cancelarPedido(pedido.id)}
                          style={{
                            marginTop: 10,
                            width: '100%',
                            padding: 12,
                            borderRadius: 12,
                            border: 'none',
                            background: '#b91c1c',
                            color: '#fff',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          🛑 CANCELAR
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {mostrarLogin && (
        <div style={overlay}>
          <div style={modal}>
            <h2>🔐 Login Admin</h2>

            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={input}
            />

            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={input}
            />

            <button onClick={login} style={btnVoltar}>
              Entrar
            </button>

            <button
              onClick={() => setMostrarLogin(false)}
              style={{
                ...btnVoltar,
                background: '#b91c1c',
                marginTop: 10,
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
const btnAcao: React.CSSProperties = {
  minWidth: 44,
  minHeight: 44,
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

  gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))',

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

  padding: 10,

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

  justifyContent: 'space-between',

  gap: 16,

  flexWrap: 'wrap',
}
const statusGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
  gap: 12,
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
const statusCard = (cor: string): React.CSSProperties => ({
  background: '#1e1e1e',

  border: `1px solid ${cor}`,

  color: '#fff',

  padding: '12px 18px',

  borderRadius: 14,

  fontWeight: 700,

  minWidth: 0,

  textAlign: 'center',

  boxShadow: `0 0 10px ${cor}33`,
})
const headerWrapper: React.CSSProperties = {
  display: 'flex',

  flexDirection: 'column',

  gap: 18,

  marginBottom: 24,
}

const pulseStyle = `
@keyframes pulseNovo {

  0% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(239,68,68,0.2);
  }

  50% {
    transform: scale(1.08);
    box-shadow: 0 0 24px rgba(239,68,68,0.7);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(239,68,68,0.2);
  }
}
`
export {}

const overlay: React.CSSProperties = {
  position: 'fixed',

  inset: 0,

  background: 'rgba(0,0,0,0.85)',

  display: 'flex',

  alignItems: 'center',

  justifyContent: 'center',

  zIndex: 999999,
}

const modal: React.CSSProperties = {
  width: '90%',
  maxWidth: 320,

  background: '#111',

  borderRadius: 18,

  padding: 24,

  color: '#fff',

  border: '1px solid #333',

  boxShadow: '0 0 24px rgba(0,0,0,.45)',
}
