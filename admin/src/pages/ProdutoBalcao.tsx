import { useEffect, useMemo, useState } from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import api from '../services/api'

import { theme } from '../assets/styles/adminTheme'

type AdicionalSelecionado = {
  id: string

  nome: string

  preco: number

  quantidade: number
}

export default function ProdutoBalcao() {
  const navigate = useNavigate()

  const { id, uid } = useParams()

  const isEdicao = !!uid

  const [produto, setProduto] =
    useState<any>(null)

  const [variacaoSelecionada,
    setVariacaoSelecionada] =
    useState<any>(null)

  const [adicionaisSelecionados,
    setAdicionaisSelecionados] =
    useState<
      AdicionalSelecionado[]
    >([])

  const [quantidade,
    setQuantidade] =
    useState(1)

  const [observacao,
    setObservacao] =
    useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    try {
      if (isEdicao) {
        carregarItemEdicao()
        return
      }

      const response =
        await api.get(`/produtos/${id}`)

      setProduto(response.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  async function carregarItemEdicao() {
    const pedido =
      JSON.parse(
        localStorage.getItem(
          'pedido-balcao',
        ) || '[]',
      )

    const item = pedido.find(
      (i: any) => i.uid === uid,
    )

    if (!item) {
      navigate('/balcao')
      return
    }

    const response =
      await api.get(
        `/produtos/${item.produtoId}`,
      )

    setProduto(response.data.data)

    setVariacaoSelecionada(
      item.variacao || null,
    )

    setAdicionaisSelecionados(
      item.adicionais || [],
    )

    setQuantidade(
      item.quantidade || 1,
    )

    setObservacao(
      item.observacao || '',
    )
  }

  function alterarQuantidadeAdicional(
    add: any,
    delta: number,
  ) {
    setAdicionaisSelecionados(
      (prev) => {
        const existente =
          prev.find(
            (a) => a.id === add.id,
          )

        if (
          !existente &&
          delta > 0
        ) {
          return [
            ...prev,

            {
              id: add.id,

              nome: add.nome,

              preco: Number(
                add.preco,
              ),

              quantidade: 1,
            },
          ]
        }

        if (!existente)
          return prev

        const novaQuantidade =
          existente.quantidade +
          delta

        if (novaQuantidade <= 0) {
          return prev.filter(
            (a) => a.id !== add.id,
          )
        }

        return prev.map((a) =>
          a.id === add.id
            ? {
                ...a,

                quantidade:
                  novaQuantidade,
              }
            : a,
        )
      },
    )
  }

  const total = useMemo(() => {
    const precoBase =
      Number(
        variacaoSelecionada?.preco ??
          produto?.preco ??
          0,
      )

    const adicionais =
      adicionaisSelecionados.reduce(
        (acc, add) =>
          acc +
          Number(add.preco) *
            add.quantidade,
        0,
      )

    return (
      (precoBase + adicionais) *
      quantidade
    )
  }, [
    produto,
    variacaoSelecionada,
    adicionaisSelecionados,
    quantidade,
  ])

  function salvarItem() {
    if (!produto) return

    if (
      produto.variacoes
        ?.length > 0 &&
      !variacaoSelecionada
    ) {
      alert(
        'Selecione uma variação',
      )

      return
    }

    const item = {
      uid:
        uid ??
        crypto.randomUUID(),

      produtoId: produto.id,

      nome: produto.nome,

      quantidade,

      precoBase: Number(
        produto.preco,
      ),

      variacao:
        variacaoSelecionada,

      adicionais:
        adicionaisSelecionados,

      observacao,

      totalItem: total,
    }

    const pedido =
      JSON.parse(
        localStorage.getItem(
          'pedido-balcao',
        ) || '[]',
      )

    let atualizado = [...pedido]

    if (isEdicao) {
      atualizado =
        atualizado.map(
          (i: any) =>
            i.uid === uid
              ? item
              : i,
        )
    } else {
      atualizado.push(item)
    }

    localStorage.setItem(
      'pedido-balcao',
      JSON.stringify(atualizado),
    )

    navigate('/balcao')
  }

  if (!produto) {
    return (
      <div style={theme.page}>
        <h1>Carregando...</h1>
      </div>
    )
  }

  return (
    <div style={theme.page}>
      <div style={container}>
        <button
          onClick={() =>
            navigate('/balcao')
          }
          style={btnVoltar}
        >
          ← Voltar
        </button>

        <h1 style={titulo}>
          {produto.nome}
        </h1>

        {produto.variacoes
          ?.length > 0 && (
          <div style={bloco}>
            <h2>
              Escolha a variação
            </h2>

            {produto.variacoes
              .filter(
                (v: any) =>
                  v.ativo,
              )
              .map((v: any) => (
                <label
                  key={v.id}
                  style={
                    variacaoCard(
                      variacaoSelecionada?.id ===
                        v.id,
                    )
                  }
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

        <div style={bloco}>
          <h2>Adicionais</h2>

          {produto.adicionais
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
                  style={
                    adicionalCard
                  }
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
                          alterarQuantidadeAdicional(
                            add,
                            1,
                          )
                        } else {
                          alterarQuantidadeAdicional(
                            add,
                            -1,
                          )
                        }
                      }}
                    />
                  ) : (
                    <div
                      style={
                        qtdBox
                      }
                    >
                      <button
                        onClick={() =>
                          alterarQuantidadeAdicional(
                            add,
                            -1,
                          )
                        }
                      >
                        -
                      </button>

                      <span>
                        {
                          quantidade
                        }
                      </span>

                      <button
                        onClick={() =>
                          alterarQuantidadeAdicional(
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

        <div style={bloco}>
          <h2>Quantidade</h2>

          <div style={qtdBox}>
            <button
              onClick={() =>
                setQuantidade(
                  (q) =>
                    Math.max(
                      1,
                      q - 1,
                    ),
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
                setQuantidade(
                  (q) => q + 1,
                )
              }
            >
              +
            </button>
          </div>
        </div>

        <div style={bloco}>
          <h2>Observação</h2>

          <textarea
            value={observacao}
            onChange={(e) =>
              setObservacao(
                e.target.value,
              )
            }
            style={textarea}
            placeholder="Ex: sem granola"
          />
        </div>

        <div style={footer}>
          <h1>
            Total: R${' '}
            {total.toFixed(2)}
          </h1>

          <button
            onClick={salvarItem}
            style={btnSalvar}
          >
            {isEdicao
              ? 'Salvar Alterações'
              : 'Adicionar Pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}

const container: React.CSSProperties =
  {
    maxWidth: 900,

    margin: '0 auto',

    display: 'flex',

    flexDirection: 'column',

    gap: 24,
  }

const titulo: React.CSSProperties =
  {
    color: '#fff',

    fontSize: 36,

    fontWeight: 800,
  }

const bloco: React.CSSProperties =
  {
    background:
      'linear-gradient(135deg,#1e1e1e,#2a2a2a)',

    borderRadius: 20,

    padding: 24,

    color: '#fff',
  }

const variacaoCard = (
  ativo: boolean,
): React.CSSProperties => ({
  display: 'flex',

  gap: 12,

  padding: 16,

  borderRadius: 14,

  border: ativo
    ? '2px solid #22c55e'
    : '1px solid #333',

  marginTop: 14,

  cursor: 'pointer',
})

const adicionalCard: React.CSSProperties =
  {
    display: 'flex',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginTop: 18,

    paddingBottom: 18,

    borderBottom:
      '1px solid rgba(255,255,255,0.08)',
  }

const qtdBox: React.CSSProperties =
  {
    display: 'flex',

    alignItems: 'center',

    gap: 12,
  }

const textarea: React.CSSProperties =
  {
    width: '100%',

    minHeight: 120,

    borderRadius: 16,

    border: '1px solid #333',

    background: '#111',

    color: '#fff',

    padding: 16,
  }

const footer: React.CSSProperties =
  {
    position: 'sticky',

    bottom: 0,

    background:
      'rgba(15,15,15,0.95)',

    backdropFilter: 'blur(10px)',

    padding: 20,

    borderRadius: 20,

    display: 'flex',

    justifyContent:
      'space-between',

    alignItems: 'center',

    gap: 20,
  }

const btnSalvar: React.CSSProperties =
  {
    padding:
      '18px 28px',

    borderRadius: 16,

    border: 'none',

    background: '#22c55e',

    color: '#fff',

    fontWeight: 700,

    fontSize: 18,

    cursor: 'pointer',
  }

const btnVoltar: React.CSSProperties =
  {
    width: 140,

    padding: 14,

    borderRadius: 14,

    border: 'none',

    background: '#333',

    color: '#fff',

    cursor: 'pointer',
  }