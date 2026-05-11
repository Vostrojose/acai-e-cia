import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import api from '../services/api'
import '../assets/css/Sucesso.css'

export default function Sucesso() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { limparCarrinho } = useCart()

  const [codigo, setCodigo] = useState<number | null>(null)

  /* LIMPAR CARRINHO */

  useEffect(() => {
    limparCarrinho()

    //  MANTER pedidoId para fluxo inteligente
    if (id) {
      localStorage.setItem('pedidoId', id)
      localStorage.setItem('pedidoStatus', 'RECEBIDO')
    }
  }, [limparCarrinho, id])

  /*  BUSCAR PEDIDO */

  useEffect(() => {
    if (!id) return

    async function carregarPedido() {
      try {
        const res = await api.get(`/pedidos/${id}`)
        setCodigo(res.data.data.codigo)
      } catch (err) {
        console.error('Erro ao buscar pedido:', err)
      }
    }

    carregarPedido()
  }, [id])

  return (
    <div className="sucesso-page">
      <div className="sucesso-card">
        <h1 className="sucesso-title">Pedido confirmado!</h1>

        <p className="sucesso-subtitle">Obrigado pela sua compra 💜</p>

        <p className="sucesso-label">Número do pedido</p>

        <div className="sucesso-codigo">
          {codigo ? `#${codigo.toString().padStart(4, '0')}` : 'Carregando...'}
        </div>

        <div className="sucesso-actions">
          <button
            onClick={() => navigate(`/acompanhamento/${id}`)}
            className="sucesso-btn"
          >
            📡 Acompanhar pedido
          </button>

          <button onClick={() => navigate('/m/1')} className="sucesso-btn">
            ◫ Cardápio do dia
          </button>

          <button
            onClick={() => navigate('/cardapio-semana/1')}
            className="sucesso-btn"
          >
            📅 Cardápio da semana
          </button>
        </div>
      </div>
    </div>
  )
}
