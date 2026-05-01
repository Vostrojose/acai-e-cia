import { useEffect, useState } from 'react'
import api from '../services/api'

export default function BalcaoModal({ onClose, onSuccess }: any) {
  const [busca, setBusca] = useState('')
  const [produtos, setProdutos] = useState<any[]>([])
  const [itens, setItens] = useState<any[]>([])

  const [formaPagamento, setFormaPagamento] = useState('PAGO')
  const [clienteNome, setClienteNome] = useState('')

  const [pularPreparo, setPularPreparo] = useState(false)

  /* ============================= */
  /* 🔍 BUSCAR PRODUTOS + SCROLL FIX */
  /* ============================= */
  useEffect(() => {
    async function carregar() {
      const res = await api.get('/produtos')
      setProdutos(res.data.data || [])
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
  /* ➕ SELECIONAR ITEM            */
  /* ============================= */
  function toggleItem(produto: any) {
    const existente = itens.find((i) => i.id === produto.id)

    if (existente) {
      setItens(itens.filter((i) => i.id !== produto.id))
    } else {
      setItens([
        ...itens,
        {
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: 1,
          adicionais: [],
        },
      ])
    }
  }

  /* ============================= */
  /* 🔢 ALTERAR QUANTIDADE ITEM    */
  /* ============================= */
  function alterarQuantidade(id: string, delta: number) {
    setItens((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantidade: Math.max(1, (i.quantidade || 1) + delta) }
          : i,
      ),
    )
  }

  /* ============================= */
  /* ➕ TOGGLE ADICIONAL           */
  /* ============================= */
  function toggleAdicional(itemId: string, adicional: any) {
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
  /* 🔢 ALTERAR QTD ADICIONAL      */
  /* ============================= */
  function alterarQtdAdicional(
    itemId: string,
    adicionalId: string,
    delta: number,
  ) {
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
  /* 💾 SALVAR VENDA               */
  /* ============================= */
  async function salvar() {
    if (itens.length === 0) {
      alert('Selecione pelo menos um item')
      return
    }

    const nomeNormalizado = clienteNome
      ? clienteNome
          .toUpperCase()
          .replace(/\s+/g, ' ')
          .trim()
      : null

    if (formaPagamento !== 'PAGO' && !nomeNormalizado) {
      alert('Informe o nome do cliente')
      return
    }

    try {
      await api.post('/balcao', {
        itens,
        forma: formaPagamento,
        clienteNome: formaPagamento !== 'PAGO' ? nomeNormalizado : null,
        pularPreparo,
      })

      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar venda')
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

        {/* PRODUTOS + ADICIONAIS */}
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

                {/* 🔥 ADICIONAIS */}
                {selecionado && p.adicionais?.length > 0 && (
                  <div style={{ marginLeft: 20, marginTop: 5 }}>
                    {p.adicionais.map((add: any) => {
                      const item = itens.find((i) => i.id === p.id)
                      const ativo = item?.adicionais?.find(
                        (a: any) => a.id === add.id
                      )

                      return (
                        <div key={add.id} style={{ marginTop: 4 }}>
                          <input
                            type="checkbox"
                            checked={!!ativo}
                            onChange={() => toggleAdicional(p.id, add)}
                          />

                          + {add.nome} (R$ {add.preco})

                          {ativo && (
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                              <button
                                style={btnTouch}
                                onClick={() => alterarQtdAdicional(p.id, add.id, -1)}
                              >
                                −
                              </button>

                              <span style={{ minWidth: 30, textAlign: 'center' }}>
                                {ativo.quantidade}
                              </span>

                              <button
                                style={btnTouch}
                                onClick={() => alterarQtdAdicional(p.id, add.id, 1)}
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

        {/* ITENS */}
        <h3>Itens selecionados</h3>

        {itens.map((i) => (
          <div key={i.id} style={linha}>
            <strong>{i.nome}</strong>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: 5 }}>
              <button style={btnTouch} onClick={() => alterarQuantidade(i.id, -1)}>−</button>
              <span style={{ fontSize: 18, minWidth: 30, textAlign: 'center' }}>{i.quantidade}</span>
              <button style={btnTouch} onClick={() => alterarQuantidade(i.id, 1)}>+</button>
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
            placeholder="Nome do cliente (ex: JOÃO SILVA)"
            value={clienteNome}
            onChange={(e) => setClienteNome(e.target.value.toUpperCase())}
            style={input}
          />
        )}

        <label style={{ marginTop: 10, display: 'block' }}>
          <input
            type="checkbox"
            checked={pularPreparo}
            onChange={(e) => setPularPreparo(e.target.checked)}
          />
          Pedido já pronto
        </label>

        <button onClick={salvar} style={btn}>💾 Salvar venda</button>
        <button onClick={onClose} style={btnDanger}>Cancelar</button>
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