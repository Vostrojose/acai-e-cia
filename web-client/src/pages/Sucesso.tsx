import { useParams, useNavigate } from 'react-router-dom'

export default function Sucesso() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>🎉 Pagamento confirmado!</h1>

      <p>Obrigado pela sua compra 💜</p>
      <p>Seu pedido foi recebido com sucesso.</p>

      <p style={{ marginTop: 20 }}>Número do pedido:</p>
      <h2>{id}</h2>

      <div style={{ marginTop: 30 }}>
        
        {/* VER PEDIDO */}
        <button
          onClick={() => navigate(`/acompanhamento/${id}`)}
          style={{
            padding: '12px 20px',
            margin: 10,
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 6
          }}
        >
          📡 Ver pedido
        </button>

        {/* CARDÁPIO */}
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 20px',
            margin: 10,
            background: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 6
          }}
        >
          🛒 Voltar ao cardápio
        </button>

        {/* CARDÁPIO DA SEMANA */}
        <button
          onClick={() => navigate('/CardapioSemana')}
          style={{
            padding: '12px 20px',
            margin: 10,
            background: '#FF9800',
            color: '#fff',
            border: 'none',
            borderRadius: 6
          }}
        >
          📅 Ver cardápio da semana
        </button>

      </div>
    </div>
  )
}