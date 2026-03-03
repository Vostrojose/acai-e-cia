import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function Pagamento() {
  const { id } = useParams()
  const navigate = useNavigate()

  const pagamentoCriado = useRef(false)

  useEffect(() => {
    async function criarPagamento() {
      try {
        const response = await api.post('/pagamento/checkout', {
          pedidoId: id,
        })

        const initPoint = response.data.data.init_point
        window.location.href = initPoint
      } catch (error) {
        console.error('Erro ao criar pagamento:', error)
        alert('Erro ao gerar pagamento')
        navigate('/')
      }
    }

    if (id && !pagamentoCriado.current) {
      pagamentoCriado.current = true
      criarPagamento()
    }
  }, [id, navigate])

  return (
    <div style={{ padding: 20 }}>
      <h1>💰 Redirecionando para o Mercado Pago...</h1>
    </div>
  )
}