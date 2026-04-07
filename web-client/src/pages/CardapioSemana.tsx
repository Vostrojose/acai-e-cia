import { useEffect, useState } from 'react'
import api from '../services/api'
import './CardapioSemana.css'

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number | string
  destaque: boolean

  disponivelSeg: boolean
  disponivelTer: boolean
  disponivelQua: boolean
  disponivelQui: boolean
  disponivelSex: boolean
  disponivelSab: boolean
  disponivelDom: boolean
}

export default function CardapioSemana() {

  const [produtos, setProdutos] = useState<Produto[]>([])

  const hoje = new Date().getDay()
  const destaque = produtos.find(p => p.destaque)

  useEffect(() => {
    async function loadProdutos() {
      const res = await api.get('/produtos')
      setProdutos(res.data.data)
    }

    loadProdutos()
  }, [])

  const dias = [
    { nome: "Segunda", key: "disponivelSeg", numero: 1 },
    { nome: "Terça", key: "disponivelTer", numero: 2 },
    { nome: "Quarta", key: "disponivelQua", numero: 3 },
    { nome: "Quinta", key: "disponivelQui", numero: 4 },
    { nome: "Sexta", key: "disponivelSex", numero: 5 },
    { nome: "Sábado", key: "disponivelSab", numero: 6 },
    { nome: "Domingo", key: "disponivelDom", numero: 0 }
  ]

  /* 🔥 ORDENA DIA ATUAL NO TOPO */
  const diasOrdenados = [...dias].sort((a, b) => {
    if (a.numero === hoje) return -1
    if (b.numero === hoje) return 1
    return a.numero - b.numero
  })

  /* 🔥 INTERESSE (SAFE - SEM BACKEND) */
  function registrarInteresse(produto: Produto, dia: string) {
    const interesses = JSON.parse(localStorage.getItem('interesses') || '[]')

    const novo = {
      produtoId: produto.id,
      nome: produto.nome,
      dia,
      data: new Date().toISOString()
    }

    interesses.push(novo)

    localStorage.setItem('interesses', JSON.stringify(interesses))

    console.log('📌 Interesse registrado:', novo)
  }

  return (
    <div className="cardapio-semana-page">

      <h1 className="titulo-semana">
        🍽️ Cardápio da Semana
      </h1>

      {/* 🔥 DESTAQUE MELHORADO */}
      {destaque && (
        <div className="destaque-card">

          <div className="destaque-label">
            ⭐ Especial da Semana
          </div>

          <div className="destaque-nome">
            {destaque.nome}
          </div>

          {destaque.descricao && (
            <div className="destaque-desc">
              {destaque.descricao}
            </div>
          )}

          <div className="destaque-preco">
            R$ {Number(destaque.preco || 0).toFixed(2)}
          </div>

        </div>
      )}

      {/* 🔥 DIAS ORDENADOS */}
      {diasOrdenados.map((dia) => {

        const produtosDoDia = produtos.filter(
          (produto) => produto[dia.key as keyof Produto]
        )

        if (produtosDoDia.length === 0) return null

        return (
          <div
            key={dia.nome}
            className={`dia-card ${hoje === dia.numero ? 'dia-hoje' : ''}`}
          >

            <h2 className="dia-titulo">
              {dia.nome}

              {hoje === dia.numero && (
                <span className="badge-hoje">
                  HOJE
                </span>
              )}
            </h2>

            <div className="produtos-dia">

              {produtosDoDia.map(produto => (

                <div key={produto.id} className="produto-card">

                  <div className="produto-info">

                    <div className="produto-header">
                      <div className="produto-nome">
                        {produto.nome}
                      </div>

                      <div className="produto-preco">
                        R$ {Number(produto.preco || 0).toFixed(2)}
                      </div>
                    </div>

                    {produto.descricao && (
                      <div className="produto-descricao">
                        {produto.descricao}
                      </div>
                    )}

                  </div>

                  <button
                    className="add-btn"
                    onClick={() => registrarInteresse(produto, dia.nome)}
                  >
                    Tenho interesse
                  </button>

                </div>

              ))}

            </div>

          </div>
        )

      })}

    </div>
  )
}