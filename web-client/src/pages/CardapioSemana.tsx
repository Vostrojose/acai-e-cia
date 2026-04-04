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

  return (
    <div className="cardapio-semana-page">

      <h1 className="titulo-semana">
        Cardápio da Semana
      </h1>

      {destaque && (
        <div className="destaque-card">

          <div className="destaque-label">
            Especial da Semana
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

      {dias.map((dia) => {

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

                <div key={produto.id} className="produto-card-semana">

                  <div className="produto-nome">
                    {produto.nome}
                  </div>

                  {produto.descricao && (
                    <div className="produto-descricao">
                      {produto.descricao}
                    </div>
                  )}

                  <div className="produto-preco">
                    R$ {Number(produto.preco || 0).toFixed(2)}
                  </div>

                </div>

              ))}

            </div>

          </div>
        )

      })}

    </div>
  )
}