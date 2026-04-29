import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../assets/css/SplashMenu.css'

export default function SplashMenu() {
  const navigate = useNavigate()

  useEffect(() => {
    const pedidoId = localStorage.getItem('pedidoId')
    const status = localStorage.getItem('pedidoStatus')

    // 🔥 só redireciona se NÃO estiver finalizado
    if (pedidoId && status !== 'ENTREGUE') {
      navigate(`/acompanhamento/${pedidoId}`, { replace: true })
    }
  }, [navigate])

  function irParaAcompanhamento() {
    const pedidoId = localStorage.getItem('pedidoId')

    if (pedidoId) {
      navigate(`/acompanhamento/${pedidoId}`)
    } else {
      alert('Nenhum pedido encontrado')
    }
  }

  return (
    <div className="splash-container">
      <img src="/splash.png" className="splash-bg" />

      <div className="splash-overlay">
        <button onClick={() => navigate('/m/1')}>
          🍓 Fazer pedido
        </button>

        <button onClick={() => navigate('/cardapio-semana/1')}>
          📅 Cardápio da semana
        </button>

        <button onClick={irParaAcompanhamento}>
          📦 Acompanhar pedido
        </button>
      </div>
    </div>
  )
}