import { useEffect, useState } from 'react'
import api from '../services/api'

export default function BalcaoModal({ onClose, onSuccess }: any) {
  const [busca, setBusca] = useState('')
  const [produtos, setProdutos] = useState<any[]>([])
  const [itens, setItens] = useState<any[]>([])

  const [formaPagamento, setFormaPagamento] = useState('PAGO')
  const [clienteNome, setClienteNome] = useState('')

  const [pularPreparo, setPularPreparo] = useState(true)

  //  NOVO (PROTEÇÃO DUPLICAÇÃO)
  const [salvando, setSalvando] = useState(false)

  /* ============================= */
  /*  BUSCAR PRODUTOS            */
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
  /*  SELECIONAR ITEM (SAFE)     */
  /* ============================= */
  function toggleItem(produto: any) {
    setItens((prev) => {
      const existente = prev.find((i) => i.id === produto.id)

      if (existente) {
        return prev.filter((i) => i.id !== produto.id)
      }

      return [
        ...prev,
        {
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
  /*  ALTERAR QTD ITEM           */
  /* ============================= */
  function alterarQuantidade(id: string, delta: number) {
    if (salvando) return
    setItens((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantidade: Math.max(1, (i.quantidade || 1) + delta) }
          : i,
      ),
    )
  }

  /* ============================= */
  /*  ADICIONAL                  */
  /* ============================= */
  function toggleAdicional(itemId: string, adicional: any) {
    if (salvando) return
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item

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
  /*  QTD ADICIONAL              */
  /* ============================= */
  function alterarQtdAdicional(
    itemId: string,
    adicionalId: string,
    delta: number,
  ) {
    if (salvando) return
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item

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
  /* SALVAR (PRODUÇÃO REAL)     */
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
        <h2>🧾 Venda Balcão</h2>

        <input
          placeholder="🔍 Buscar produto"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={input}
        />

        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {produtosFiltrados.map((p) => {
            const selecionado = itens.find((i) => i.id === p.id)

            return (
              <div key={p.id} style={linha}>
                <input
                  type="checkbox"
                  checked={!!selecionado}
                  onChange={() => toggleItem(p)}
                />
                {p.nome} - R$ {p.preco}
                {selecionado && p.adicionais?.length > 0 && (
                  <div style={{ marginLeft: 20, marginTop: 5 }}>
                    {p.adicionais.map((add: any) => {
                      const item = itens.find((i) => i.id === p.id)
                      const ativo = item?.adicionais?.find(
                        (a: any) => a.id === add.id,
                      )

                      return (
                        <div key={add.id}>
                          <input
                            type="checkbox"
                            checked={!!ativo}
                            onChange={() => toggleAdicional(p.id, add)}
                          />
                          + {add.nome} (R$ {add.preco})
                          {ativo && (
                            <div
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              <button
                                style={btnTouch}
                                onClick={() =>
                                  alterarQtdAdicional(p.id, add.id, -1)
                                }
                                disabled={salvando}
                              >
                                -
                              </button>

                              <span
                                style={{ minWidth: 30, textAlign: 'center' }}
                              >
                                {ativo.quantidade}
                              </span>

                              <button
                                style={btnTouch}
                                onClick={() =>
                                  alterarQtdAdicional(p.id, add.id, 1)
                                }
                                disabled={salvando}
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <h3>Itens selecionados</h3>

        {itens.map((i) => (
          <div key={i.id} style={linha}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{i.nome}</strong>

              {/*  SUBTOTAL DO ITEM */}
              <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                R$ {(i.preco * i.quantidade).toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                style={btnTouch}
                onClick={() => alterarQuantidade(i.id, -1)}
                disabled={salvando}
              >
                -
              </button>

              {/*  QUANTIDADE VISÍVEL */}
              <span
                style={{
                  minWidth: 40,
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                  background: '#000',
                  borderRadius: 6,
                  padding: '5px 10px',
                }}
              >
                {i.quantidade}
              </span>

              <button
                style={btnTouch}
                onClick={() => alterarQuantidade(i.id, +1)}
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
          style={{ width: '100%', padding: 10, marginTop: 10 }}
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

        <label>
          <input
            type="checkbox"
            checked={pularPreparo}
            onChange={(e) => setPularPreparo(e.target.checked)}
          />
          Pedido já pronto
        </label>
        <div style={{ marginTop: 15, fontSize: 18, fontWeight: 'bold' }}>
          Total:{' '}
          <span style={{ color: '#4caf50' }}>
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
          </span>
        </div>

        <button
          onClick={salvar}
          disabled={salvando}
          style={{
            ...btn,
            opacity: salvando ? 0.6 : 1,
            cursor: salvando ? 'not-allowed' : 'pointer',
          }}
        >
          {salvando ? 'Salvando...' : '💾 Salvar venda'}
        </button>

        <button onClick={onClose} style={btnDanger}>
          Cancelar
        </button>
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
  background: 'rgba(0,0,0,0.8)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  paddingTop: 20,
}

const modal: React.CSSProperties = {
  background: '#111',
  padding: 20,
  borderRadius: 10,
  width: 400,
  color: '#fff',
  maxHeight: '90vh',
  overflowY: 'auto',
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 10,
  marginBottom: 10,
}

const linha: React.CSSProperties = {
  marginBottom: 8,
}

const btn: React.CSSProperties = {
  background: '#4caf50',
  color: '#fff',
  padding: 10,
  marginTop: 10,
  border: 'none',
}

const btnDanger: React.CSSProperties = {
  background: '#e53935',
  color: '#fff',
  padding: 10,
  marginTop: 10,
  border: 'none',
}

const btnTouch: React.CSSProperties = {
  width: 50,
  height: 50,
  fontSize: 22,
  borderRadius: 10,
  border: 'none',
  margin: '0 8px',
  cursor: 'pointer',
  background: '#222',
  color: '#fff',
}
