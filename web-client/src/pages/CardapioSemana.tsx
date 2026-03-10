import { useEffect, useState } from 'react'
import api from '../services/api'
import './Home.css'

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number

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

  useEffect(() => {

    async function loadProdutos() {

      const res = await api.get('/produtos')

      setProdutos(res.data.data)

    }

    loadProdutos()

  }, [])

  const dias = [
    { nome: "Segunda", key: "disponivelSeg" },
    { nome: "Terça", key: "disponivelTer" },
    { nome: "Quarta", key: "disponivelQua" },
    { nome: "Quinta", key: "disponivelQui" },
    { nome: "Sexta", key: "disponivelSex" },
    { nome: "Sábado", key: "disponivelSab" },
    { nome: "Domingo", key: "disponivelDom" }
  ]

  return (

    <div className="page">

      <h1 className="title">
        Cardápio da Semana
      </h1>

      <div className="cardapio-container">

        {dias.map((dia) => {

          const produtosDoDia = produtos.filter(
            (produto: any) => produto[dia.key]
          )

          if (produtosDoDia.length === 0) return null

          return (

            <div key={dia.nome} style={{ marginBottom: 30 }}>

              <h2 style={{ color: "white", marginBottom: 10 }}>
                {dia.nome}
              </h2>

              <div className="cardapio-list">

                {produtosDoDia.map((produto) => (

                  <div key={produto.id} className="produto-card">

                    <div className="produto-info">

                      <div className="produto-nome">
                        {produto.nome}
                      </div>

                      {produto.descricao && (
                        <div className="produto-descricao">
                          {produto.descricao}
                        </div>
                      )}

                      <div className="produto-preco">
                        R$ {produto.preco.toFixed(2)}
                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )

        })}

      </div>

    </div>

  )

}