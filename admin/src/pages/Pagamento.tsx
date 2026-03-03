import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { criarCheckout } from '../services/api'

export default function Pagamento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const carregado = useRef(false)

  useEffect(() => {
    async function gerarCheckout() {
      try {
        if (!id) return

        const response = await criarCheckout(id)

        const { init_point } = response.data

        window.location.href = init_point

      } catch (error) {
        console.error(error)
        alert('Erro ao iniciar pagamento')
        navigate('/')
      }
    }

    if (id && !carregado.current) {
      carregado.current = true
      gerarCheckout()
    }
  }, [id, navigate])

  return (
    <div style={{ padding: 20 }}>
      <h1>Redirecionando para pagamento...</h1>
    </div>
  )
}