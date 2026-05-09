import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Sucesso() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { limparCarrinho } = useCart()

  const [codigo, setCodigo] = useState<number | null>(null)

  /* ============================= */
  /*  LIMPAR CARRINHO */
  /* ============================= */
  useEffect(() => {
    limparCarrinho()

    //  MANTER pedidoId para fluxo inteligente
    if (id) {
      localStorage.setItem('pedidoId', id)
      localStorage.setItem('pedidoStatus', 'RECEBIDO')
    }
  }, [limparCarrinho, id])

  /* ============================= */
  /* 🔎 BUSCAR PEDIDO */
  /* ============================= */
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }}>
      <div style={{
        background: '#fff',
        color: '#333',
        padding: 30,
        borderRadius: 16,
        width: '90%',
        maxWidth: 400,
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>

        <h1 style={{ fontSize: 28 }}> Pedido confirmado!</h1>

        <p style={{ marginTop: 10 }}>
          Obrigado pela sua compra 💜
        </p>

        <p style={{ marginTop: 20, fontSize: 14 }}>
          Número do pedido:
        </p>

        <h2 style={{ wordBreak: 'break-all' }}>
          {codigo
            ? `#${codigo.toString().padStart(4, '0')}`
            : 'Carregando...'}
        </h2>

        <div style={{ marginTop: 30 }}>

          <button
            onClick={() => navigate(`/acompanhamento/${id}`)}
            style={btn('#333')}
          >
            📡 Acompanhar pedido
          </button>

          <button
            onClick={() => navigate('/m/1')}
            style={btn('#4CAF50')}
          >
            🛒 Cardápio de hoje
          </button>

          <button
            onClick={() => navigate('/cardapio-semana/1')}
            style={btn('#FF9800')}
          >
            📅 Cardápio da semana
          </button>

        </div>

      </div>
    </div>
  )
}

/*  botão padrão */
function btn(color: string) {
  return {
    width: '100%',
    padding: '14px',
    marginTop: 10,
    background: color,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer'
  }
}