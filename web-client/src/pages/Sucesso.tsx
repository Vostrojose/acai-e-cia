import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import api from '../services/api'
import '../assets/css/Sucesso.css'

type StatusPagamento =
  | 'APROVADO'
  | 'PENDENTE'
  | 'RECUSADO'
  | 'AGUARDANDO_PAGAMENTO'
  | string
  | null

export default function Sucesso() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { limparCarrinho } = useCart()

  const [codigo, setCodigo] = useState<number | null>(null)
  const [statusPagamento, setStatusPagamento] = useState<StatusPagamento>(null)

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  /* ===================================================== */
  /* CONFIRMAR PAGAMENTO                                    */
  /* ===================================================== */

  useEffect(() => {
    if (!id) {
      setCarregando(false)
      setErro(true)
      return
    }

    let cancelado = false
    let timer: ReturnType<typeof setTimeout> | null = null

    /*
     * Mantemos uma janela de aproximadamente 60 segundos
     * para dar tempo ao webhook do Mercado Pago confirmar
     * o pagamento.
     */
    const MAX_TENTATIVAS = 30
    const INTERVALO = 2000

    let tentativasAtuais = 0

    async function carregarPedido() {
      if (cancelado) return

      try {
        const res = await api.get(`/pedidos/${id}`)

        if (cancelado) return

        const pedido = res.data?.data

        if (!pedido) {
          throw new Error('Pedido não encontrado')
        }

        setCodigo(pedido.codigo ?? null)

        const status = pedido.statusPagamento ?? null

        setStatusPagamento(status)

        /*
         * O pagamento só é considerado confirmado quando
         * o backend informar APROVADO.
         */
        if (status === 'APROVADO') {
          limparCarrinho()

          localStorage.setItem('pedidoId', id!)
          localStorage.setItem('pedidoStatus', 'RECEBIDO')

          setCarregando(false)
          return
        }

        /*
         * Enquanto o webhook do Mercado Pago ainda não
         * atualizou o pedido, continuamos consultando.
         */
        if (
          status === 'PENDENTE' ||
          status === null ||
          status === 'AGUARDANDO_PAGAMENTO'
        ) {
          tentativasAtuais += 1

          if (tentativasAtuais < MAX_TENTATIVAS) {
            timer = setTimeout(carregarPedido, INTERVALO)
            return
          }
        }

        /*
         * Depois da janela de consulta, mostramos uma mensagem
         * informando que a confirmação ainda não chegou.
         */
        setCarregando(false)
      } catch (err) {
        console.error('Erro ao consultar pagamento:', err)

        if (cancelado) return

        tentativasAtuais += 1

        /*
         * Mesmo que uma consulta falhe temporariamente,
         * continuamos tentando dentro da janela definida.
         */
        if (tentativasAtuais < MAX_TENTATIVAS) {
          timer = setTimeout(carregarPedido, INTERVALO)
          return
        }

        setErro(true)
        setCarregando(false)
      }
    }

    carregarPedido()

    return () => {
      cancelado = true

      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [id, limparCarrinho])

  /* ===================================================== */
  /* CONFIRMANDO PAGAMENTO                                  */
  /* ===================================================== */

  if (carregando) {
    return (
      <div className="sucesso-page">
        <div className="sucesso-card">
          <h1 className="sucesso-title">⏳ Confirmando seu pagamento...</h1>

          <p className="sucesso-subtitle">
            Estamos verificando automaticamente a confirmação do Mercado Pago.
          </p>

          <p className="sucesso-label">
            Não feche esta página. A confirmação aparecerá automaticamente.
          </p>
        </div>
      </div>
    )
  }

  /* ===================================================== */
  /* ERRO                                                   */
  /* ===================================================== */

  if (erro) {
    return (
      <div className="sucesso-page">
        <div className="sucesso-card">
          <h1 className="sucesso-title">⚠️ Não foi possível confirmar</h1>

          <p className="sucesso-subtitle">
            Não conseguimos consultar o status do pagamento neste momento.
          </p>

          {codigo && (
            <>
              <p className="sucesso-label">Número do pedido</p>

              <div className="sucesso-codigo">
                #{codigo.toString().padStart(4, '0')}
              </div>
            </>
          )}

          <div className="sucesso-actions">
            {id && (
              <button
                onClick={() => navigate(`/acompanhamento/${id}`)}
                className="sucesso-btn"
              >
                📡 Acompanhar pedido
              </button>
            )}

            <button onClick={() => navigate('/m/1')} className="sucesso-btn">
              ◫ Cardápio do dia
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ===================================================== */
  /* PAGAMENTO APROVADO                                    */
  /* ===================================================== */

  if (statusPagamento === 'APROVADO') {
    return (
      <div className="sucesso-page">
        <div className="sucesso-card">
          <h1 className="sucesso-title">✅ Pagamento confirmado!</h1>

          <p className="sucesso-subtitle">
            Seu pedido foi recebido e já foi enviado para preparo. 💜
          </p>

          <p className="sucesso-label">Número do pedido</p>

          <div className="sucesso-codigo">
            {codigo
              ? `#${codigo.toString().padStart(4, '0')}`
              : 'Carregando...'}
          </div>

          <div className="sucesso-actions">
            <button
              onClick={() => navigate(`/acompanhamento/${id}`)}
              className="sucesso-btn"
            >
              📡 Acompanhar meu pedido
            </button>

            <button onClick={() => navigate('/m/1')} className="sucesso-btn">
              ◫ Cardápio do dia
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ===================================================== */
  /* PAGAMENTO AINDA NÃO CONFIRMADO                        */
  /* ===================================================== */

  return (
    <div className="sucesso-page">
      <div className="sucesso-card">
        <h1 className="sucesso-title">⏳ Ainda aguardando confirmação</h1>

        <p className="sucesso-subtitle">
          O pagamento ainda não foi confirmado pelo Mercado Pago.
        </p>

        <p className="sucesso-label">
          Isso pode levar alguns instantes. Você pode continuar acompanhando o
          pedido.
        </p>

        <p className="sucesso-label">Número do pedido</p>

        <div className="sucesso-codigo">
          {codigo ? `#${codigo.toString().padStart(4, '0')}` : 'Carregando...'}
        </div>

        <div className="sucesso-actions">
          {id && (
            <button
              onClick={() => navigate(`/acompanhamento/${id}`)}
              className="sucesso-btn"
            >
              📡 Acompanhar pedido
            </button>
          )}

          <button onClick={() => navigate('/m/1')} className="sucesso-btn">
            ◫ Cardápio do dia
          </button>
        </div>
      </div>
    </div>
  )
}
