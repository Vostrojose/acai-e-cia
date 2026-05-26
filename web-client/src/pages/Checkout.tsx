import { useCart } from '../context/CartContext'
import api from '../services/api'
import { useState } from 'react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import '../assets/css/Checkout.css'

export default function Checkout() {
  const { itens } = useCart()

  const [coordenadas, setCoordenadas] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const [erroLocalizacao, setErroLocalizacao] = useState<string | null>(null)

  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)

  const [tipoPedido, setTipoPedido] = useState<'retirada' | 'entrega'>(
    'retirada',
  )
  const [metodoPagamento, setMetodoPagamento] = useState<'PIX' | 'CHECKOUT'>(
    'CHECKOUT',
  )

  //  NOVO
  const [foraDaArea, setForaDaArea] = useState(false)

  const [endereco, setEndereco] = useState({
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: '',
  })

  async function capturarLocalizacao() {
    if (!navigator.geolocation) {
      setErroLocalizacao('Seu navegador não suporta localização')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setCoordenadas({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })

        setErroLocalizacao(null)

        console.log('📍 LOCALIZAÇÃO:', pos.coords)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
            {
              headers: {
                Accept: 'application/json',
              },
            },
          )
          const data = await response.json()

          const address = data.address || {}

          setEndereco({
            rua: address.road || address.pedestrian || '',

            numero: address.house_number || '',

            bairro: address.suburb || address.neighbourhood || '',

            cidade: address.city || address.town || address.village || '',

            cep: address.postcode || '',
          })
        } catch (err) {
          console.error('Erro ao buscar endereço:', err)
        }
      },

      (error) => {
        console.error('Erro localização:', error)
        setErroLocalizacao('Não foi possível obter sua localização')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  async function finalizarPedido() {
    try {
      if (!telefone || telefone.trim() === '') {
        alert('Informe seu WhatsApp para confirmação do pedido.')
        return
      }

      if (!itens || itens.length === 0) {
        alert('Seu carrinho está vazio.')
        return
      }

      setLoading(true)

      const origemSalva = localStorage.getItem('origemPedido')
      const origensValidas = ['QR_CODE', 'APP', 'ADMIN', 'BALCAO']

      let origem: string = origensValidas.includes(origemSalva ?? '')
        ? (origemSalva as string)
        : 'APP'

      if (window.location.pathname.includes('/m/')) {
        origem = 'QR_CODE'
      }

      const telefoneLimpo = telefone.replace(/\D/g, '')

      if (telefoneLimpo.length < 10) {
        alert('Digite um WhatsApp válido.')
        return
      }
      if (
        tipoPedido === 'entrega' &&
        (!endereco.rua || !endereco.numero || !endereco.bairro)
      ) {
        alert('Preencha o endereço completo.')
        return
      }

      const enderecoString =
        tipoPedido === 'entrega'
          ? `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.cep}`
          : null

      if (tipoPedido === 'entrega' && !coordenadas) {
        alert('Por favor, use sua localização para entrega')
        return
      }

      const itensFormatados = itens.map((item) => {
        const adicionaisSeguro = Array.isArray(item.adicionais)
          ? item.adicionais
          : []

        return {
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          adicionais: adicionaisSeguro.map((a: any) => ({
            nome: a?.nome ?? '',
            preco: Number(a?.preco ?? 0),
          })),
        }
      })

      const payload = {
        telefone: telefoneLimpo,
        origem,
        endereco: enderecoString,
        itens: itensFormatados,
        coordenadas,
      }

      const pedidoResponse = await api.post('/pedidos', payload)

      // 🔥 NOVO (integra backend)
      if (pedidoResponse.data.foraDaArea) {
        setForaDaArea(true)
        setTipoPedido('retirada')

        alert(
          'Você está fora da área de entrega. O pedido será feito para retirada no balcão.',
        )
      } else {
        setForaDaArea(false)
      }

      const pedidoId = pedidoResponse?.data?.data?.id

      if (!pedidoId) {
        alert('Erro ao criar pedido')
        return
      }

      localStorage.setItem('pedidoId', pedidoId)

      const pagamentoResponse = await api.post('/pagamento/checkout', {
        pedidoId,
      })

      const initPoint = pagamentoResponse?.data?.data?.init_point

      if (initPoint) {
        window.location.href = initPoint
      } else {
        alert('Erro ao iniciar pagamento')
      }
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO:', error)
      alert(error?.response?.data?.message || 'Erro ao processar pedido')
    } finally {
      setLoading(false)
    }
  }

  const totalReal = itens.reduce((acc, item) => {
    const adicionaisTotal = (item.adicionais || []).reduce(
      (soma: number, add: any) => soma + Number(add.preco),
      0,
    )

    const precoExibicao = Number(item.preco) + adicionaisTotal

    return acc + precoExibicao * item.quantidade
  }, 0)

  return (
    <Container
      background="
    radial-gradient(
      circle at top,
      #2a003f,
      #12001c 60%,
      #09000f 100%
    )
  "
    >
      <div className="checkout-container">
        <h1 className="checkout-title">💳 Checkout</h1>

        <div className="checkout-card">
          <h3>Resumo do pedido</h3>

          {itens.map((item) => {
            const adicionaisTotal = (item.adicionais || []).reduce(
              (soma: number, add: any) => soma + Number(add.preco),
              0,
            )

            const precoExibicao = Number(item.preco) + adicionaisTotal

            return (
              <div key={item.id} className="checkout-item">
                <strong>
                  {item.quantidade}x {item.nome}
                </strong>

                {item.adicionais?.map((add: any, i: number) => (
                  <div key={i} className="checkout-adicional">
                    + {add.nome} (R$ {Number(add.preco).toFixed(2)})
                  </div>
                ))}

                <div>R$ {(precoExibicao * item.quantidade).toFixed(2)}</div>
              </div>
            )
          })}

          <hr />
          <h2>R$ {(Number(totalReal) || 0).toFixed(2)}</h2>
        </div>

        <div className="checkout-card">
          <label>WhatsApp para confirmação</label>
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="checkout-input"
          />
        </div>

        <div className="checkout-card">
          <label>Tipo de pedido</label>
          <select
            value={tipoPedido}
            onChange={(e) =>
              setTipoPedido(e.target.value as 'retirada' | 'entrega')
            }
            className="checkout-select"
          >
            <option value="retirada">Retirada no local</option>
            <option value="entrega" disabled={foraDaArea}>
              Entrega
            </option>
          </select>
        </div>

        {tipoPedido === 'entrega' && (
          <div className="checkout-card">
            <label>Endereço de entrega</label>

            {foraDaArea && (
              <p style={{ color: 'orange', fontWeight: 'bold' }}>
                ⚠️ Fora da área de entrega. Apenas retirada disponível.
              </p>
            )}

            {erroLocalizacao && (
              <p style={{ color: 'red' }}>{erroLocalizacao}</p>
            )}

            <Button onClick={capturarLocalizacao}>
              📍 Usar minha localização
            </Button>

            {coordenadas && (
              <p style={{ color: 'green' }}>
                ✔ Localização capturada com sucesso
              </p>
            )}

            <input
              className="checkout-input"
              placeholder="Rua"
              value={endereco.rua}
              onChange={(e) =>
                setEndereco({
                  ...endereco,
                  rua: e.target.value,
                })
              }
            />
            <input
              className="checkout-input"
              placeholder="Número"
              value={endereco.numero}
              onChange={(e) =>
                setEndereco({
                  ...endereco,
                  numero: e.target.value,
                })
              }
            />
            <input
              className="checkout-input"
              placeholder="Bairro"
              value={endereco.bairro}
              onChange={(e) =>
                setEndereco({
                  ...endereco,
                  bairro: e.target.value,
                })
              }
            />
            <input
              className="checkout-input"
              placeholder="Cidade"
              value={endereco.cidade}
              onChange={(e) =>
                setEndereco({
                  ...endereco,
                  cidade: e.target.value,
                })
              }
            />
            <input
              className="checkout-input"
              placeholder="CEP"
              value={endereco.cep}
              onChange={(e) =>
                setEndereco({
                  ...endereco,
                  cep: e.target.value,
                })
              }
            />
          </div>
        )}

        <div className="checkout-card">
          <label>Forma de pagamento</label>

          <select
            value={metodoPagamento}
            onChange={(e) =>
              setMetodoPagamento(e.target.value as 'PIX' | 'CHECKOUT')
            }
            className="checkout-select"
          >
            <option value="CHECKOUT">Ir para pagamento</option>

          </select>
        </div>
        <div className="checkout-acoes">
          <Button onClick={finalizarPedido} disabled={loading}>
            {loading
              ? 'Redirecionando para pagamento...'
              : 'Ir para pagamento seguro'}
          </Button>
        </div>
        <p className="checkout-seguro">
          🔒 Pagamento 100% seguro via Mercado Pago
        </p>
        <p className="checkout-info">
          Após confirmar o pedido, você será redirecionado para o ambiente
          seguro do Mercado Pago.
        </p>
      </div>
    </Container>
  )
}
