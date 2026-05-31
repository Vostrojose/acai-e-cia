import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

export default function Balcao() {
  const [busca, setBusca] = useState('')

  const [produtos, setProdutos] = useState<any[]>([])

  const [itens, setItens] = useState<any[]>([])

  const [produtoSelecionado, setProdutoSelecionado] =
    useState<any | null>(null)

  const [variacaoSelecionada, setVariacaoSelecionada] =
    useState<any | null>(null)

  const [adicionaisSelecionados, setAdicionaisSelecionados] =
    useState<any[]>([])

  const [clienteNome, setClienteNome] =
    useState('')

  const [formaPagamento, setFormaPagamento] =
    useState('PAGO')

  const [salvando, setSalvando] =
    useState(false)

  useEffect(() => {
    carregarProdutos()
  }, [])

  async function carregarProdutos() {
    try {
      const response =
        await api.get('/produtos')

      setProdutos(response.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  function abrirProduto(produto: any) {
    setProdutoSelecionado(produto)

    setVariacaoSelecionada(null)

    setAdicionaisSelecionados([])
  }

  function alterarQuantidadePopup(
    add: any,
    delta: number,
  ) {
    setAdicionaisSelecionados((prev) => {
      const existente = prev.find(
        (a) => a.id === add.id,
      )

      if (!existente && delta > 0) {
        return [
          ...prev,

          {
            ...add,

            quantidade: 1,
          },
        ]
      }

      if (!existente) return prev

      const novaQuantidade =
        existente.quantidade + delta

      if (novaQuantidade <= 0) {
        return prev.filter(
          (a) => a.id !== add.id,
        )
      }

      return prev.map((a) =>
        a.id === add.id
          ? {
              ...a,

              quantidade: novaQuantidade,
            }
          : a,
      )
    })
  }

  function confirmarProduto() {
    if (!produtoSelecionado) return

    if (
      produtoSelecionado.variacoes?.length > 0 &&
      !variacaoSelecionada
    ) {
      alert('Selecione uma variação')
      return
    }

    const adicionaisClonados =
      adicionaisSelecionados.map(
        (a: any) => ({
          id: a.id,

          nome: a.nome,

          preco: Number(a.preco),

          quantidade: a.quantidade,
        }),
      )

    const novoItem = {
      uid: crypto.randomUUID(),

      produtoId: produtoSelecionado.id,

      nome: variacaoSelecionada
        ? `${produtoSelecionado.nome} - ${variacaoSelecionada.nome}`
        : produtoSelecionado.nome,

      preco: Number(
        variacaoSelecionada?.preco ??
          produtoSelecionado.preco,
      ),

      quantidade: 1,

      adicionais: adicionaisClonados,
    }

    setItens((prev) => [
      ...prev,
      novoItem,
    ])

    setProdutoSelecionado(null)

    setVariacaoSelecionada(null)

    setAdicionaisSelecionados([])
  }

  function alterarQuantidade(
    uid: string,
    delta: number,
  ) {
    if (salvando) return

    setItens((prev) =>
      prev.map((i) =>
        i.uid === uid
          ? {
              ...i,

              quantidade: Math.max(
                1,
                (i.quantidade || 1) + delta,
              ),
            }
          : i,
      ),
    )
  }

  function removerItem(uid: string) {
    if (salvando) return

    setItens((prev) =>
      prev.filter((i) => i.uid !== uid),
    )
  }

  const total = useMemo(() => {
    return itens.reduce(
      (acc: number, item: any) => {
        const adicionaisTotal =
          (item.adicionais || []).reduce(
            (soma: number, add: any) =>
              soma +
              Number(add.preco) *
                add.quantidade,
            0,
          )

        return (
          acc +
          (Number(item.preco) +
            adicionaisTotal) *
            item.quantidade
        )
      },

      0,
    )
  }, [itens])

  async function finalizarPedido() {
    try {
      setSalvando(true)

      const payload = {
        clienteNome,

        formaPagamento,

        itens: itens.map((i) => ({
          produtoId: i.produtoId,

          nomeProduto: i.nome,

          quantidade: i.quantidade,

          preco: i.preco,

          adicionais: i.adicionais,
        })),
      }

      await api.post(
        '/pedidos/balcao',
        payload,
      )

      alert('Pedido criado')

      setItens([])

      setClienteNome('')

      setProdutoSelecionado(null)

      setVariacaoSelecionada(null)

      setAdicionaisSelecionados([])
    } catch (err) {
      console.error(err)

      alert('Erro ao criar pedido')
    } finally {
      setSalvando(false)
    }
  }

  const produtosFiltrados =
    produtos.filter((p) =>
      p.nome
        .toLowerCase()
        .includes(busca.toLowerCase()),
    )

  return (
    <div
      style={{
        padding: 20,

        display: 'grid',

        gridTemplateColumns:
          window.innerWidth < 900
            ? '1fr'
            : '1fr 380px',

        gap: 20,
      }}
    >
      <div>
        <input
          value={busca}
          onChange={(e) =>
            setBusca(e.target.value)
          }
          placeholder="Buscar produto"
          style={{
            width: '100%',

            padding: 16,

            borderRadius: 16,

            border: '1px solid #ddd',

            marginBottom: 20,
          }}
        />

        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(auto-fill,minmax(220px,1fr))',

            gap: 16,
          }}
        >
          {produtosFiltrados.map((p) => {
            const menorPreco =
              p.variacoes?.length > 0
                ? Math.min(
                    ...p.variacoes.map(
                      (v: any) =>
                        Number(v.preco),
                    ),
                  )
                : Number(p.preco)

            return (
              <div
                key={p.id}
                onClick={() =>
                  abrirProduto(p)
                }
                style={{
                  background: '#111827',

                  color: '#fff',

                  padding: 20,

                  borderRadius: 20,

                  cursor: 'pointer',
                }}
              >
                <h3>{p.nome}</h3>

                <div>
                  A partir de R${' '}
                  {menorPreco.toFixed(2)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        style={{
          background: '#111827',

          color: '#fff',

          borderRadius: 24,

          padding: 20,

          maxHeight:
            window.innerWidth < 900
              ? 'auto'
              : 'calc(100vh - 40px)',

          display: 'flex',

          flexDirection: 'column',
        }}
      >
        <h2>Resumo do Pedido</h2>

        <div
          style={{
            flex: 1,

            overflowY: 'auto',

            marginTop: 20,
          }}
        >
          {itens.map((i) => (
            <div
              key={i.uid}
              style={{
                background:
                  'rgba(255,255,255,0.05)',

                padding: 16,

                borderRadius: 16,

                marginBottom: 14,
              }}
            >
              <strong>{i.nome}</strong>

              {(i.adicionais || []).map(
                (a: any) => (
                  <div key={a.id}>
                    + {a.quantidade}x{' '}
                    {a.nome}
                  </div>
                ),
              )}

              <div
                style={{
                  display: 'flex',

                  gap: 10,

                  marginTop: 14,
                }}
              >
                <button
                  onClick={() =>
                    alterarQuantidade(
                      i.uid,
                      -1,
                    )
                  }
                >
                  -
                </button>

                <span>{i.quantidade}</span>

                <button
                  onClick={() =>
                    alterarQuantidade(
                      i.uid,
                      1,
                    )
                  }
                >
                  +
                </button>

                <button
                  onClick={() =>
                    removerItem(i.uid)
                  }
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 20,
          }}
        >
          <input
            placeholder="Nome cliente"
            value={clienteNome}
            onChange={(e) =>
              setClienteNome(
                e.target.value,
              )
            }
            style={{
              width: '100%',

              padding: 14,

              borderRadius: 14,

              marginBottom: 14,
            }}
          />

          <select
            value={formaPagamento}
            onChange={(e) =>
              setFormaPagamento(
                e.target.value,
              )
            }
            style={{
              width: '100%',

              padding: 14,

              borderRadius: 14,

              marginBottom: 14,
            }}
          >
            <option value="PAGO">
              Pago
            </option>

            <option value="DINHEIRO">
              Dinheiro
            </option>

            <option value="PIX">
              Pix
            </option>

            <option value="CARTAO">
              Cartão
            </option>
          </select>

          <h2>
            Total: R${' '}
            {total.toFixed(2)}
          </h2>

          <button
            onClick={finalizarPedido}
            disabled={
              itens.length === 0 ||
              salvando
            }
            style={{
              width: '100%',

              padding: 18,

              borderRadius: 16,

              border: 'none',

              background: '#22c55e',

              color: '#fff',

              fontWeight: 'bold',

              fontSize: 18,

              cursor: 'pointer',
            }}
          >
            Finalizar Pedido
          </button>
        </div>
      </div>

      {produtoSelecionado && (
        <div
          onClick={() =>
            setProdutoSelecionado(null)
          }
          style={{
            position: 'fixed',

            inset: 0,

            background:
              'rgba(0,0,0,0.7)',

            display: 'flex',

            justifyContent:
              'center',

            alignItems: 'center',

            zIndex: 99999,

            padding: 20,
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              background: '#111827',

              width: '100%',

              maxWidth: 500,

              maxHeight: '90vh',

              borderRadius: 24,

              color: '#fff',

              display: 'flex',

              flexDirection: 'column',

              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: 24,

                borderBottom:
                  '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h2>
                {
                  produtoSelecionado.nome
                }
              </h2>
            </div>

            <div
              style={{
                flex: 1,

                overflowY: 'auto',

                padding: 24,
              }}
            >
              {produtoSelecionado.variacoes
                ?.length > 0 && (
                <div
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <h3>
                    Escolha o tamanho
                  </h3>

                  {produtoSelecionado.variacoes
                    .filter(
                      (v: any) =>
                        v.ativo,
                    )
                    .map((v: any) => (
                      <label
                        key={v.id}
                        style={{
                          display: 'flex',

                          gap: 10,

                          marginBottom: 12,
                        }}
                      >
                        <input
                          type="radio"
                          checked={
                            variacaoSelecionada?.id ===
                            v.id
                          }
                          onChange={() =>
                            setVariacaoSelecionada(
                              v,
                            )
                          }
                        />

                        <span>
                          {v.nome} — R${' '}
                          {Number(
                            v.preco,
                          ).toFixed(2)}
                        </span>
                      </label>
                    ))}
                </div>
              )}

              {produtoSelecionado.adicionais
                ?.filter(
                  (a: any) => a.ativo,
                )
                .map((add: any) => {
                  const selecionado =
                    adicionaisSelecionados.find(
                      (a) =>
                        a.id === add.id,
                    )

                  const quantidade =
                    selecionado?.quantidade ||
                    0

                  const gratis =
                    Number(add.preco) ===
                    0

                  return (
                    <div
                      key={add.id}
                      style={{
                        display: 'flex',

                        justifyContent:
                          'space-between',

                        alignItems:
                          'center',

                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <strong>
                          {add.nome}
                        </strong>

                        <div>
                          {gratis
                            ? 'GRÁTIS'
                            : `+R$ ${Number(
                                add.preco,
                              ).toFixed(2)}`}
                        </div>
                      </div>

                      {gratis ? (
                        <input
                          type="checkbox"
                          checked={
                            quantidade > 0
                          }
                          onChange={(
                            e,
                          ) => {
                            if (
                              e.target
                                .checked
                            ) {
                              alterarQuantidadePopup(
                                add,
                                1,
                              )
                            } else {
                              alterarQuantidadePopup(
                                add,
                                -1,
                              )
                            }
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display:
                              'flex',

                            gap: 10,

                            alignItems:
                              'center',
                          }}
                        >
                          <button
                            onClick={() =>
                              alterarQuantidadePopup(
                                add,
                                -1,
                              )
                            }
                          >
                            -
                          </button>

                          <span>
                            {quantidade}
                          </span>

                          <button
                            onClick={() =>
                              alterarQuantidadePopup(
                                add,
                                1,
                              )
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

            <div
              style={{
                padding: 24,

                borderTop:
                  '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <button
                onClick={
                  confirmarProduto
                }
                style={{
                  width: '100%',

                  background:
                    '#22c55e',

                  border: 'none',

                  padding: 18,

                  borderRadius: 16,

                  color: '#fff',

                  fontWeight: 'bold',

                  fontSize: 18,

                  cursor: 'pointer',
                }}
              >
                ✅ Confirmar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



/* ============================= */
/* ESTILOS                       */
/* ============================= */

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.82)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  padding: 20,
}

const modal: React.CSSProperties = {
  background: '#111827',
  borderRadius: 24,
  width: '100%',
  maxWidth: 950,
  color: '#fff',
  maxHeight: '92vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
  border: '1px solid rgba(255,255,255,0.06)',
}

const header: React.CSSProperties = {
  padding: '24px 28px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const closeBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: 28,
  cursor: 'pointer',
}

const body: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: 20,
  padding: 20,
  overflow: 'hidden',
}

const coluna: React.CSSProperties = {
  overflowY: 'auto',
  maxHeight: '72vh',
  paddingRight: 4,
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 14,
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.06)',
  background: '#1f2937',
  color: '#fff',
  fontSize: 15,
  outline: 'none',
  marginBottom: 14,
}

const produtoCard = (ativo: boolean): React.CSSProperties => ({
  background: ativo ? '#312e81' : '#1f2937',
  border: ativo ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.05)',
  borderRadius: 18,
  padding: 16,
  marginBottom: 14,
  cursor: 'pointer',
})

const produtoTopo: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const produtoNome: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: 17,
}

const produtoPreco: React.CSSProperties = {
  color: '#4ade80',
  marginTop: 4,
  fontWeight: 'bold',
}

const checkCircle: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
}

const adicionalTag = (ativo: boolean): React.CSSProperties => ({
  padding: '8px 12px',
  borderRadius: 999,
  background: ativo ? '#4c1d95' : '#111827',
  border: ativo ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.05)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  cursor: 'pointer',
  fontSize: 13,
})

const resumoCard: React.CSSProperties = {
  background: '#1f2937',
  borderRadius: 18,
  padding: 16,
  marginBottom: 14,
  border: '1px solid rgba(255,255,255,0.05)',
}

const resumoTopo: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
}

const resumoNome: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: 16,
}

const resumoAdicionais: React.CSSProperties = {
  marginTop: 8,
  fontSize: 13,
  opacity: 0.8,
}

const resumoPreco: React.CSSProperties = {
  color: '#4ade80',
  fontWeight: 'bold',
}

const quantidadeBox: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginTop: 10,
}

const btnTouch: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 12,
  border: 'none',
  background: '#111827',
  color: '#fff',
  fontSize: 20,
  cursor: 'pointer',
  fontWeight: 'bold',
}

const btnDelete: React.CSSProperties = {
  width: 42,

  height: 42,

  borderRadius: 12,

  border: 'none',

  background: '#7f1d1d',

  color: '#fff',

  fontSize: 18,

  cursor: 'pointer',

  fontWeight: 'bold',
}
const qtdNumero: React.CSSProperties = {
  minWidth: 40,
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: 18,
}

const checkboxLabel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginTop: 10,
}

const emptyState: React.CSSProperties = {
  opacity: 0.6,
  textAlign: 'center',
  marginTop: 40,
}

const totalBox: React.CSSProperties = {
  position: 'sticky',
  bottom: 0,
  background: '#111827',
  paddingTop: 16,
  marginTop: 16,
  borderTop: '1px solid rgba(255,255,255,0.06)',
}

const totalLabel: React.CSSProperties = {
  opacity: 0.7,
  marginBottom: 4,
}

const totalValor: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 'bold',
  color: '#4ade80',
}

const btn: React.CSSProperties = {
  width: '100%',
  background: '#22c55e',
  color: '#fff',
  padding: 16,
  marginTop: 16,
  border: 'none',
  borderRadius: 16,
  fontWeight: 'bold',
  fontSize: 16,
  cursor: 'pointer',
}

const btnDanger: React.CSSProperties = {
  width: '100%',
  background: '#ef4444',
  color: '#fff',
  padding: 14,
  marginTop: 10,
  border: 'none',
  borderRadius: 16,
  fontWeight: 'bold',
  fontSize: 15,
  cursor: 'pointer',
}
