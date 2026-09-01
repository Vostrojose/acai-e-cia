import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import api from '../services/api'
import '../assets/css/Sucesso.css'

type StatusPagamento =
  | 'APROVADO'
  | 'PENDENTE'
  | 'RECUSADO'
  | string
  | null

export default function Sucesso() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { limparCarrinho } = useCart()

  const [codigo, setCodigo] = useState<number | null>(null)
  const [statusPagamento, setStatusPagamento] =
    useState<StatusPagamento>(null)

  const [carregando, setCarregando] = useState(true)
  const [tentativas, setTentativas] = useState(0)
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

    const MAX_TENTATIVAS = 15
    const INTERVALO = 2000

    async function carregarPedido() {
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
         * atualizou o pedido, aguardamos alguns segundos.
         */
        if (
          status === 'PENDENTE' ||
          status === null ||
          status === 'AGUARDANDO_PAGAMENTO'
        ) {
          if (tentativas < MAX_TENTATIVAS) {
            setTentativas(prev => prev + 1)

            timer = setTimeout(
              carregarPedido,
              INTERVALO,
            )

            return
          }
        }

        setCarregando(false)
      } catch (err) {
        console.error(
          'Erro ao consultar pagamento:',
          err,
        )

        if (cancelado) return

        /*
         * Se ainda houver tentativas disponíveis,
         * continuamos tentando.
         */
        if (tentativas < MAX_TENTATIVAS) {
          setTentativas(prev => prev + 1)

          timer = setTimeout(
            carregarPedido,
            INTERVALO,
          )

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
  }, [id, tentativas, limparCarrinho])

  /* ===================================================== */
  /* TELA                                                   */
  /* ===================================================== */

  if (carregando) {
    return (
      <div className="sucesso-page">
        <div className="sucesso-card">

          <h1 className="sucesso-title">
            ⏳ Confirmando pagamento...
          </h1>

          <p className="sucesso-subtitle">
            Estamos aguardando a confirmação do Mercado Pago.
          </p>

          <p className="sucesso-label">
            Aguarde alguns instantes.
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

          <h1 className="sucesso-title">
            ⚠️ Não foi possível confirmar
          </h1>

          <p className="sucesso-subtitle">
            Não conseguimos confirmar o pagamento neste momento.
          </p>

          {codigo && (
            <>
              <p className="sucesso-label">
                Número do pedido
              </p>

              <div className="sucesso-codigo">
                #{codigo.toString().padStart(4, '0')}
              </div>
            </>
          )}

          <div className="sucesso-actions">

            {id && (
              <button
                onClick={() =>
                  navigate(`/acompanhamento/${id}`)
                }
                className="sucesso-btn"
              >
                📡 Acompanhar pedido
              </button>
            )}

            <button
              onClick={() => navigate('/m/1')}
              className="sucesso-btn"
            >
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

          <h1 className="sucesso-title">
            Pedido confirmado!
          </h1>

          <p className="sucesso-subtitle">
            Obrigado pela sua compra 💜
          </p>

          <p className="sucesso-label">
            Número do pedido
          </p>

          <div className="sucesso-codigo">
            {codigo
              ? `#${codigo.toString().padStart(4, '0')}`
              : 'Carregando...'}
          </div>

          <div className="sucesso-actions">

            <button
              onClick={() =>
                navigate(`/acompanhamento/${id}`)
              }
              className="sucesso-btn"
            >
              📡 Acompanhar pedido
            </button>

            <button
              onClick={() => navigate('/m/1')}
              className="sucesso-btn"
            >
              ◫ Cardápio do dia
            </button>

            <button
              onClick={() =>
                navigate('/cardapio-semana/1')
              }
              className="sucesso-btn"
            >
              📅 Cardápio da semana
            </button>

          </div>

        </div>
      </div>
    )
  }

  /* ===================================================== */
  /* PAGAMENTO NÃO CONFIRMADO                              */
  /* ===================================================== */

  return (
    <div className="sucesso-page">
      <div className="sucesso-card">

        <h1 className="sucesso-title">
          ⏳ Pagamento ainda não confirmado
        </h1>

        <p className="sucesso-subtitle">
          O Mercado Pago ainda não confirmou o pagamento.
        </p>

        <p className="sucesso-label">
          Número do pedido
        </p>

        <div className="sucesso-codigo">
          {codigo
            ? `#${codigo.toString().padStart(4, '0')}`
            : 'Carregando...'}
        </div>

        <div className="sucesso-actions">

          {id && (
            <button
              onClick={() =>
                navigate(`/acompanhamento/${id}`)
              }
              className="sucesso-btn"
            >
              📡 Acompanhar pedido
            </button>
          )}

          <button
            onClick={() => navigate('/m/1')}
            className="sucesso-btn"
          >
            ◫ Cardápio do dia
          </button>

        </div>

      </div>
    </div>
  )
}
