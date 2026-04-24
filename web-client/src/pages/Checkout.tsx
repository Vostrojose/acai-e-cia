import { useCart } from '../context/CartContext'
import api from '../services/api'
import { useState } from 'react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import '../assets/css/Checkout.css'

export default function Checkout() {
  const { itens, total } = useCart()

  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)

  const [tipoPedido, setTipoPedido] = useState<'retirada' | 'entrega'>('retirada')
  const [metodoPagamento, setMetodoPagamento] = useState<'PIX' | 'CHECKOUT'>('CHECKOUT')

  const [qrCode, setQrCode] = useState<string | null>(null)

  const [endereco, setEndereco] = useState({
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: ''
  })

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
      const origensValidas = ["QR_CODE", "APP", "ADMIN", "BALCAO"]

      let origem: string = origensValidas.includes(origemSalva ?? "")
        ? (origemSalva as string)
        : "APP"

      if (window.location.pathname.includes('/m/')) {
        origem = "QR_CODE"
      }

      const telefoneLimpo = telefone.replace(/\D/g, '')

      if (telefoneLimpo.length < 10) {
        alert('Digite um WhatsApp válido.')
        return
      }

      const enderecoString = tipoPedido === "entrega"
        ? `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.cep}`
        : null

      /* ============================= */
      /* 🔥 PAYLOAD CORRIGIDO          */
      /* ============================= */
      const payload = {
        telefone: telefoneLimpo,
        origem,
        endereco: enderecoString,
        itens: itens.map((item) => ({
          produtoId: item.id.split('-')[0], // ✔ ID real

          quantidade: item.quantidade,

          // 🔥 CORREÇÃO CRÍTICA
         // adicionais: item.adicionais?.map((a: any) => ({
          //  nome: a.nome,
          //  preco: Number(a.preco)
         // })) || []
        }))
      }

      console.log('📦 PAYLOAD ENVIADO:', payload)

      const pedidoResponse = await api.post('/pedidos', payload)
      const pedidoId = pedidoResponse?.data?.data?.id

      if (!pedidoId) {
        alert('Erro ao criar pedido')
        return
      }

      localStorage.setItem("pedidoId", pedidoId)

      if (metodoPagamento === "PIX") {
        const res = await api.post('/pagamento/pix', { pedidoId })
        setQrCode(res.data.data.qr_code_base64)
        return
      }

      const pagamentoResponse = await api.post('/pagamento/checkout', { pedidoId })
      const initPoint = pagamentoResponse?.data?.data?.init_point

      if (initPoint) {
        window.location.href = initPoint
      } else {
        alert('Erro ao iniciar pagamento')
      }

    } catch (error: any) {
      console.error('❌ ERRO COMPLETO:', error?.response?.data)
      alert(error?.response?.data?.message || 'Erro ao processar pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>

      <div className="checkout-container">

        <h1 className="checkout-title">💳 Checkout</h1>

        <div className="checkout-card">
          <h3>Resumo do pedido</h3>

          {itens.map(item => (
            <div key={item.id} className="checkout-item">

              <strong>
                {item.quantidade}x {item.nome}
              </strong>

              {item.adicionais?.map((add: any, i: number) => (
                <div key={i} className="checkout-adicional">
                  + {add.nome}
                </div>
              ))}

              <div>
                R$ {(item.preco * item.quantidade).toFixed(2)}
              </div>

            </div>
          ))}

          <hr />

          <h2>R$ {(Number(total) || 0).toFixed(2)}</h2>
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
            onChange={(e) => setTipoPedido(e.target.value as 'retirada' | 'entrega')}
            className="checkout-select"
          >
            <option value="retirada">Retirada no local</option>
            <option value="entrega">Entrega</option>
          </select>
        </div>

        {tipoPedido === 'entrega' && (
          <div className="checkout-card">
            <label>Endereço de entrega</label>

            <input className="checkout-input" placeholder="Rua" value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} />
            <input className="checkout-input" placeholder="Número" value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} />
            <input className="checkout-input" placeholder="Bairro" value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} />
            <input className="checkout-input" placeholder="Cidade" value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} />
            <input className="checkout-input" placeholder="CEP" value={endereco.cep} onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })} />
          </div>
        )}

        <div className="checkout-card">
          <label>Forma de pagamento</label>

          <select
            value={metodoPagamento}
            onChange={(e) => setMetodoPagamento(e.target.value as 'PIX' | 'CHECKOUT')}
            className="checkout-select"
          >
            <option value="CHECKOUT">Cartão / Mercado Pago</option>
            <option value="PIX">PIX</option>
          </select>
        </div>

        <div style={{ marginTop: 20 }}>
          <Button onClick={finalizarPedido}>
            {loading ? 'Processando...' : 'Confirmar Pedido'}
          </Button>
        </div>

        {qrCode && (
          <div className="checkout-card checkout-qr">
            <p>Escaneie o QR Code:</p>
            <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
          </div>
        )}

      </div>

    </Container>
  )
}