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

  /*  FUNÇÃO BLINDADA BOOLEAN    */

  function toBoolean(value: any): boolean {
    return value === true || value === 'true' || value === 1 || value === '1'
  }

  /*  DIAS DA SEMANA             */

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

  const diasOrdenados = [...dias.slice(indexHoje), ...dias.slice(0, indexHoje)]

  /*  CARREGAR PRODUTOS          */

  useEffect(() => {
    async function loadProdutos() {
      const res = await api.get('/produtos')

      const produtosTratados = res.data.data.map((p: any) => ({
        ...p,
        ativo: toBoolean(p.ativo),
        disponivelSeg: toBoolean(p.disponivelSeg),
        disponivelTer: toBoolean(p.disponivelTer),
        disponivelQua: toBoolean(p.disponivelQua),
        disponivelQui: toBoolean(p.disponivelQui),
        disponivelSex: toBoolean(p.disponivelSex),
        disponivelSab: toBoolean(p.disponivelSab),
        disponivelDom: toBoolean(p.disponivelDom),
      }))

      setProdutos(produtosTratados)
    }

    loadProdutos()
  }, [])

  /*  DESTAQUE                  */

  const destaque = produtos.find((p) => p.destaque && p.ativo)

  /*  INTERESSE                 */

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

  /*  RENDER                    */

  return (
    <div className="cardapio-semana-page">
      <div className="acoes-flutuantes-semana">
        <button
          className="btn-floating"
          onClick={() => navigate('/')}
          title="Ir para Home"
        >
          ☰
        </button>

        <button
          className="btn-floating"
          onClick={() => navigate('/cardapio')}
          title="Cardápio do dia"
        >
          ◫
        </button>
      </div>

      <div className="header">
        <div className="header-branding">
          <div className="header-logo">
            <img src="/logo.png" alt="Açaí & Co" />
          </div>

          <div className="header-texts">
            <h1 className="title">Cardápio da Semana</h1>

            <p className="subtitle">Descubra os sabores da semana</p>

            <div className="online-status">
              <span className="status-dot" />
              Atualizado em tempo real
            </div>
          </div>
        </div>
      </div>

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
        const produtosDoDia = produtos.filter((p: Produto) => {
          switch (dia.key) {
            case 'disponivelDom':
              return p.ativo && p.disponivelDom === true

            case 'disponivelSeg':
              return p.ativo && p.disponivelSeg === true

            case 'disponivelTer':
              return p.ativo && p.disponivelTer === true

            case 'disponivelQua':
              return p.ativo && p.disponivelQua === true

            case 'disponivelQui':
              return p.ativo && p.disponivelQui === true

            case 'disponivelSex':
              return p.ativo && p.disponivelSex === true

            case 'disponivelSab':
              return p.ativo && p.disponivelSab === true

            default:
              return false
          }
        })

        if (produtosDoDia.length === 0) return null

        return (
          <div key={dia.nome} style={{ width: '100%', maxWidth: 700 }}>
            <div
              className={`dia-card ${hoje === dia.numero ? 'dia-hoje' : ''}`}
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
                      onClick={() => registrarInteresse(produto, dia.nome)}
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
