import { useEffect, useState } from 'react'
import api from '../services/api'
import './Home.css'

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number
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

  return (

    <div className="page">

      <h1 className="title">
        Cardápio da Semana
      </h1>

      <div className="cardapio-container">

        <div className="cardapio-list">

          {produtos.map(produto => (

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

    </div>

  )

}