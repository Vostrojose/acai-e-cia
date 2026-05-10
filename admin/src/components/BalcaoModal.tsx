import { useEffect, useState } from 'react'
import api from '../services/api'

export default function BalcaoModal({ onClose, onSuccess }: any) {
  const [busca, setBusca] = useState('')
  const [produtos, setProdutos] = useState<any[]>([])
  const [itens, setItens] = useState<any[]>([])

  const [formaPagamento, setFormaPagamento] = useState('PAGO')
  const [clienteNome, setClienteNome] = useState('')

  const [pularPreparo, setPularPreparo] = useState(true)

  // 🔥 PROTEÇÃO DUPLICIDADE
  const [salvando, setSalvando] = useState(false)

  /* ============================= */
  /* BUSCAR PRODUTOS              */
  /* ============================= */

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get('/produtos')
        setProdutos(res.data.data || [])
      } catch (err) {
        console.error('Erro ao carregar produtos', err)
      }
    }

    carregar()

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()),
  )

  /* ============================= */
  /* ITEM                          */
  /* ============================= */

  function toggleItem(produto: any) {
    setItens((prev) => {
      return [
        ...prev,
        {
          uid: crypto.randomUUID(),
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: 1,
          adicionais: [],
        },
      ]
    })
  }

  /* ============================= */
  /* QUANTIDADE                    */
  /* ============================= */
  function alterarQuantidade(uid: string, delta: number) {
    if (salvando) return

    setItens((prev) =>
      prev.map((i) =>
        i.uid === uid
          ? {
              ...i,
              quantidade: Math.max(1, (i.quantidade || 1) + delta),
            }
          : i,
      ),
    )
  }

  /* ============================= */
  /* ADICIONAL                     */
  /* ============================= */

  function toggleAdicional(uid: string, adicional: any) {
    if (salvando) return

    setItens((prev) =>
      prev.map((item) => {
        if (item.uid !== uid) return item

        const existente = item.adicionais?.find(
          (a: any) => a.id === adicional.id,
        )

        if (existente) {
          return {
            ...item,
            adicionais: item.adicionais.filter(
              (a: any) => a.id !== adicional.id,
            ),
          }
        }

        return {
          ...item,
          adicionais: [
            ...(item.adicionais || []),
            {
              id: adicional.id,
              nome: adicional.nome,
              preco: adicional.preco,
              quantidade: 1,
            },
          ],
        }
      }),
    )
  }

  /* ============================= */
  /* QTD ADICIONAL                 */
  /* ============================= */

  function alterarQtdAdicional(
    uid: string,
    adicionalId: string,
    delta: number,
  ) {
    if (salvando) return

    setItens((prev) =>
      prev.map((item) => {
        if (item.uid !== uid) return item

        return {
          ...item,
          adicionais: (item.adicionais || []).map((a: any) =>
            a.id === adicionalId
              ? {
                  ...a,
                  quantidade: Math.max(1, (a.quantidade || 1) + delta),
                }
              : a,
          ),
        }
      }),
    )
  }

  /* ============================= */
  /* SALVAR                        */
  /* ============================= */

  async function salvar() {
    if (salvando) return

    if (itens.length === 0) {
      alert('Selecione pelo menos um item')
      return
    }

    const nomeNormalizado = clienteNome
      ? clienteNome.toUpperCase().replace(/\s+/g, ' ').trim()
      : null

    if (formaPagamento !== 'PAGO' && !nomeNormalizado) {
      alert('Informe o nome do cliente')
      return
    }

    try {
      setSalvando(true)

      const res = await api.post('/balcao', {
        itens,
        forma: formaPagamento,
        clienteNome: formaPagamento !== 'PAGO' ? nomeNormalizado : null,
        pularPreparo,
      })

      const { creditoUsado, valorRestante } = res.data

      if (creditoUsado > 0) {
        alert(`💳 Crédito usado: R$ ${creditoUsado.toFixed(2)}`)
      }

      if (valorRestante > 0) {
        alert(`💵 Pagar no caixa: R$ ${valorRestante.toFixed(2)}`)
      }

      onSuccess?.()
      onClose?.()
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar venda')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* HEADER */}

        <div style={header}>
          <div>
            <h2 style={{ margin: 0 }}>🧾 Venda Balcão</h2>

            <p
              style={{
                marginTop: 6,
                opacity: 0.7,
                fontSize: 14,
              }}
            >
              Operação rápida de pedidos
            </p>
          </div>

          <button onClick={onClose} style={closeBtn}>
            ×
          </button>
        </div>

        {/* BODY */}

        <div style={body}>
          {/* PRODUTOS */}

          <div style={coluna}>
            <input
              placeholder="🔍 Buscar produto"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={input}
            />

            {produtosFiltrados.map((p) => {
              const selecionado = itens.some((i) => i.id === p.id)

              return (
                <div
                  key={p.id}
                  style={produtoCard(!!selecionado)}
                  onClick={() => toggleItem(p)}
                >
                  <div style={produtoTopo}>
                    <div>
                      <div style={produtoNome}>{p.nome}</div>

                      <div style={produtoPreco}>
                        R$ {Number(p.preco).toFixed(2)}
                      </div>
                    </div>

                    <div
                      style={{
                        ...checkCircle,
                        background: selecionado ? '#22c55e' : '#374151',
                      }}
                    >
                      {selecionado ? '✓' : ''}
                    </div>
                  </div>

                  {selecionado && p.adicionais?.length > 0 && (
                    <div
                      style={{
                        marginTop: 14,
                      }}
                    >
                      <div
                        style={{
                          marginBottom: 10,
                          fontSize: 13,
                          opacity: 0.7,
                        }}
                      >
                        Adicionais
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        {p.adicionais.map((add: any) => {
                          const item = [...itens]
                            .reverse()
                            .find((i) => i.id === p.id)

                          const ativo = item?.adicionais?.find(
                            (a: any) => a.id === add.id,
                          )

                          return (
                            <div
                              key={add.id}
                              style={adicionalTag(!!ativo)}
                              onClick={(e) => {
                                e.stopPropagation()

                                if (!item) return

                                toggleAdicional(item.uid, add)
                              }}
                            >
                              {ativo ? '✓' : '+'}

                              {add.nome}

                              <strong>R$ {Number(add.preco).toFixed(2)}</strong>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* RESUMO */}

          <div style={coluna}>
            <h3 style={{ marginTop: 0 }}>🛒 Itens selecionados</h3>

            {itens.length === 0 && (
              <div style={emptyState}>Nenhum item selecionado</div>
            )}

            {itens.map((i) => (
              <div key={i.uid} style={resumoCard}>
                <div style={resumoTopo}>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>🥙</span>

                      <div style={resumoNome}>{i.nome}</div>
                    </div>

                    {i.adicionais?.length > 0 && (
                      <div style={resumoAdicionais}>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            marginTop: 10,
                          }}
                        >
                          {i.adicionais.map((a: any) => (
                            <div
                              key={a.id}
                              style={{
                                background: 'rgba(168,85,247,0.18)',
                                border: '1px solid rgba(168,85,247,0.35)',
                                color: '#e9d5ff',
                                borderRadius: 999,
                                padding: '6px 10px',
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              + {a.quantidade}x {a.nome}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={resumoPreco}>
                    R${' '}
                    {(
                      (i.preco +
                        (i.adicionais || []).reduce(
                          (s: number, a: any) => s + a.preco * a.quantidade,
                          0,
                        )) *
                      i.quantidade
                    ).toFixed(2)}
                  </div>
                </div>

                <div style={quantidadeBox}>
                  <button
                    style={btnTouch}
                    onClick={() => alterarQuantidade(i.uid, -1)}
                    disabled={salvando}
                  >
                    -
                  </button>

                  <div style={qtdNumero}>{i.quantidade}</div>

                  <button
                    style={btnTouch}
                    onClick={() => alterarQuantidade(i.uid, +1)}
                    disabled={salvando}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              style={input}
            >
              <option value="PAGO">💵 Pago</option>

              <option value="FIADO">🧾 Fiado</option>

              <option value="CREDITO">💳 Usar Crédito</option>
            </select>

            {formaPagamento !== 'PAGO' && (
              <input
                placeholder="Nome do cliente"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value.toUpperCase())}
                style={input}
              />
            )}

            <label style={checkboxLabel}>
              <input
                type="checkbox"
                checked={pularPreparo}
                onChange={(e) => setPularPreparo(e.target.checked)}
              />
              Pedido já pronto
            </label>

            <div style={totalBox}>
              <div style={totalLabel}>Total da venda</div>

              <div style={totalValor}>
                R${' '}
                {itens
                  .reduce((total, i) => {
                    const adicionais = (i.adicionais || []).reduce(
                      (s: number, a: any) => s + a.preco * a.quantidade,
                      0,
                    )

                    return total + (i.preco + adicionais) * i.quantidade
                  }, 0)
                  .toFixed(2)}
              </div>

              <button
                onClick={salvar}
                disabled={salvando}
                style={{
                  ...btn,
                  opacity: salvando ? 0.6 : 1,
                }}
              >
                {salvando ? 'Salvando venda...' : '💾 Salvar venda'}
              </button>

              <button onClick={onClose} style={btnDanger}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
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
  background: 'linear-gradient(180deg,#1f2937 0%,#111827 100%)',
  borderRadius: 20,
  padding: 18,
  marginBottom: 16,
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
  transition: 'all 0.2s ease',
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
  fontSize: 22,
  textShadow: '0 0 12px rgba(74,222,128,0.25)',
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
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.06)',
  background:
    'linear-gradient(180deg,#1f2937,#111827)',
  color: '#fff',
  fontSize: 20,
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow:
    '0 6px 20px rgba(0,0,0,0.25)',
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
