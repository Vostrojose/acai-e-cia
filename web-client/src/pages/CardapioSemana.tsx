import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import '../assets/css/CardapioSemana.css'

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number | string
  destaque: boolean
  ativo?: boolean

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
  const navigate = useNavigate()

  const hoje = new Date().getDay()

  /* ============================= */
  /* 🔥 DIAS DA SEMANA             */
  /* ============================= */

  const dias = [
    { nome: 'Segunda', key: 'disponivelSeg', numero: 1 },
    { nome: 'Terça', key: 'disponivelTer', numero: 2 },
    { nome: 'Quarta', key: 'disponivelQua', numero: 3 },
    { nome: 'Quinta', key: 'disponivelQui', numero: 4 },
    { nome: 'Sexta', key: 'disponivelSex', numero: 5 },
    { nome: 'Sábado', key: 'disponivelSab', numero: 6 },
    { nome: 'Domingo', key: 'disponivelDom', numero: 0 },
  ]

  const indexHoje = dias.findIndex((d) => d.numero === hoje)

  const diasOrdenados = [
    ...dias.slice(indexHoje),
    ...dias.slice(0, indexHoje),
  ]

  /* ============================= */
  /* 🔥 CARREGAR PRODUTOS          */
  /* ============================= */

  useEffect(() => {
    async function loadProdutos() {
      const res = await api.get('/produtos')

      const produtosTratados = res.data.data.map((p: any) => ({
        ...p,
        disponivelSeg: p.disponivelSeg === true || p.disponivelSeg === 'true',
        disponivelTer: p.disponivelTer === true || p.disponivelTer === 'true',
        disponivelQua: p.disponivelQua === true || p.disponivelQua === 'true',
        disponivelQui: p.disponivelQui === true || p.disponivelQui === 'true',
        disponivelSex: p.disponivelSex === true || p.disponivelSex === 'true',
        disponivelSab: p.disponivelSab === true || p.disponivelSab === 'true',
        disponivelDom: p.disponivelDom === true || p.disponivelDom === 'true',
      }))

      setProdutos(produtosTratados)
    }

    loadProdutos()
  }, [])

  /* ============================= */
  /* 🔥 DESTAQUE                  */
  /* ============================= */

  const destaque = produtos.find((p) => p.destaque && p.ativo)

  /* ============================= */
  /* 🔥 INTERESSE                 */
  /* ============================= */

  function registrarInteresse(produto: Produto, dia: string) {
    const interesses = JSON.parse(localStorage.getItem('interesses') || '[]')

    const novo = {
      produtoId: produto.id,
      nome: produto.nome,
      dia,
      data: new Date().toISOString(),
    }

    interesses.push(novo)

    localStorage.setItem('interesses', JSON.stringify(interesses))

    console.log('📌 Interesse registrado:', novo)
  }

  /* ============================= */
  /* 🔥 RENDER                    */
  /* ============================= */

  return (
    <div className="cardapio-semana-page">
      <button className="btn-voltar" onClick={() => navigate('/')}>
        📅
      </button>

      <h1 className="titulo-semana">🍽️ Cardápio da Semana</h1>

      {destaque && (
        <div className="destaque-card">
          <div className="destaque-label">⭐ Especial da Semana</div>

          <div className="destaque-nome">{destaque.nome}</div>

          {destaque.descricao && (
            <div className="destaque-desc">{destaque.descricao}</div>
          )}

          <div className="destaque-preco">
            R$ {Number(destaque.preco || 0).toFixed(2)}
          </div>
        </div>
      )}

      {diasOrdenados.map((dia, index) => {
        const produtosDoDia = produtos.filter((produto) => {
          const disponivel = produto[dia.key as keyof Produto]

          return (
            produto.ativo === true &&
            (disponivel === true || disponivel === 'true')
          )
        })

        if (produtosDoDia.length === 0) return null

        return (
          <div key={dia.nome} style={{ width: '100%', maxWidth: 700 }}>
            <div
              className={`dia-card ${
                hoje === dia.numero ? 'dia-hoje' : ''
              }`}
            >
              <h2 className="dia-titulo">
                📅 {dia.nome}
                {hoje === dia.numero && (
                  <span className="badge-hoje">HOJE</span>
                )}
              </h2>

              <div className="produtos-dia">
                {produtosDoDia.map((produto) => (
                  <div key={produto.id} className="produto-card">
                    <div className="produto-info">
                      <div className="produto-header">
                        <div className="produto-nome">{produto.nome}</div>

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
                      onClick={() =>
                        registrarInteresse(produto, dia.nome)
                      }
                    >
                      Tenho interesse
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {index !== diasOrdenados.length - 1 && (
              <div className="linha-divisoria" />
            )}
          </div>
        )
      })}
    </div>
  )
}