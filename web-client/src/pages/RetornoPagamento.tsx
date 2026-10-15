import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import '../assets/css/Sucesso.css'

type TipoRetorno = 'erro' | 'pendente'

export default function RetornoPagamento({
  tipo,
}: {
  tipo: TipoRetorno
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [consultando, setConsultando] = useState(true)
  const [mensagem, setMensagem] = useState(
    'Estamos verificando a situação do seu pedido.',
  )
  const [codigo, setCodigo] = useState<number | null>(null)

  useEffect(() => {
    let ativo = true

    async function verificarPedido() {
      const pedidoId =
        searchParams.get('external_reference') ||
        searchParams.get('pedidoId') ||
        localStorage.getItem('pedidoId')

      if (!pedidoId) {
        if (ativo) {
          setMensagem(
            'Não encontramos o identificador do pedido neste navegador. Consulte seus pedidos antes de tentar pagar novamente.',
          )
          setConsultando(false)
        }
        return
      }

      // Preserva o identificador para permitir a recuperação posterior.
      localStorage.setItem('pedidoId', pedidoId)

      try {
        const response = await api.get(`/pedidos/${pedidoId}`)

        if (!ativo) return

        const pedido = response.data?.data

        if (!pedido) {
          setMensagem(
            'Não foi possível localizar o pedido agora. O identificador foi preservado para uma nova tentativa.',
          )
          setConsultando(false)
          return
        }

        setCodigo(pedido.codigo ?? null)
        localStorage.setItem('pedidoStatus', pedido.status)

        if (pedido.statusPagamento === 'APROVADO') {
          navigate(`/sucesso/${pedidoId}`, { replace: true })
          return
        }

        if (pedido.statusPagamento === 'RECUSADO') {
          setMensagem(
            'O Mercado Pago informa que o pagamento não foi aprovado. Confira o status do pedido antes de iniciar outra tentativa.',
          )
        } else if (tipo === 'pendente') {
          setMensagem(
            'O pagamento ainda está pendente. Não faça outro pagamento antes de conferir a situação atual do pedido.',
          )
        } else {
          setMensagem(
            'Você retornou sem concluir a confirmação do pagamento. Isso não significa, por si só, que o pagamento foi recusado.',
          )
        }
      } catch {
        if (!ativo) return

        setMensagem(
          'Não conseguimos consultar o pedido por enquanto. Ele foi preservado e você pode tentar novamente.',
        )
      } finally {
        if (ativo) setConsultando(false)
      }
    }

    verificarPedido()

    return () => {
      ativo = false
    }
  }, [navigate, searchParams, tipo])

  return (
    <div className="sucesso-page">
      <div className="sucesso-card">
        <h1 className="sucesso-title">
          {consultando
            ? '⏳ Consultando pedido...'
            : tipo === 'pendente'
              ? '⏳ Pagamento pendente'
              : '⚠️ Retorno do pagamento'}
        </h1>

        <p className="sucesso-subtitle">{mensagem}</p>

        {codigo !== null && (
          <>
            <p className="sucesso-label">Número do pedido</p>
            <div className="sucesso-codigo">
              #{codigo.toString().padStart(4, '0')}
            </div>
          </>
        )}

        <div className="sucesso-actions">
          <button
            className="sucesso-btn"
            onClick={() => {
              const pedidoId = localStorage.getItem('pedidoId')

              if (pedidoId) {
                navigate(`/sucesso/${pedidoId}`)
              } else {
                navigate('/m/1')
              }
            }}
          >
            Verificar pagamento
          </button>

          <button
            className="sucesso-btn"
            onClick={() => navigate('/m/1')}
          >
            Cardápio do dia
          </button>
        </div>
      </div>
    </div>
  )
}