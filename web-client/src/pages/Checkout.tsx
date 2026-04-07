import { useCart } from '../context/CartContext'
import api from '../services/api'
import { useState } from 'react'

import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

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

      const payload = {
        telefone: telefoneLimpo,
        origem,
        endereco: enderecoString,
        itens: itens.map((item) => ({
          produtoId: item.id,
          quantidade: item.quantidade
        }))
      }

      const pedidoResponse = await api.post('/pedidos', payload)
      const pedidoId = pedidoResponse?.data?.data?.id

      if (!pedidoId) {
        alert('Erro ao criar pedido')
        return
      }

      if (metodoPagamento === "PIX") {
        const res = await api.post('/pagamento/pix', { pedidoId })
        setQrCode(res.data.data.qr_code_base64)
        return
      }

      const pagamentoResponse = await api.post('/pagamento/checkout', { pedidoId })

      if (pagamentoResponse?.data?.data?.init_point) {
        window.location.href = pagamentoResponse.data.data.init_point
      } else {
        alert('Erro ao iniciar pagamento')
      }

    } catch (error: any) {
      console.error('Erro ao finalizar pedido:', error?.response?.data || error)
      alert('Erro ao processar pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <h1 style={titulo}>💳 Checkout</h1>

      <Card>
        <p>Total do pedido</p>
        <h2>R$ {(Number(total) || 0).toFixed(2)}</h2>
      </Card>

      <Card>
        <label>WhatsApp para confirmação</label>
        <input
          type="tel"
          placeholder="(11) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={input}
        />
      </Card>

      <Card>
        <label>Tipo de pedido</label>
        <select
          value={tipoPedido}
          onChange={(e) => setTipoPedido(e.target.value as 'retirada' | 'entrega')}
          style={input}
        >
          <option value="retirada">Retirada no local</option>
          <option value="entrega">Entrega</option>
        </select>
      </Card>

      {tipoPedido === 'entrega' && (
        <Card>
          <label>Endereço de entrega</label>

          <input placeholder="Rua" value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} style={input} />
          <input placeholder="Número" value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} style={input} />
          <input placeholder="Bairro" value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} style={input} />
          <input placeholder="Cidade" value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} style={input} />
          <input placeholder="CEP" value={endereco.cep} onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })} style={input} />
        </Card>
      )}

      <Card>
        <label>Forma de pagamento</label>

        <select
          value={metodoPagamento}
          onChange={(e) => setMetodoPagamento(e.target.value as 'PIX' | 'CHECKOUT')}
          style={input}
        >
          <option value="CHECKOUT">Cartão / Outros</option>
          <option value="PIX">PIX</option>
        </select>
      </Card>

      <div style={{ marginTop: 20 }}>
        <Button variant="primary" onClick={finalizarPedido}>
          {loading ? 'Processando...' : 'Confirmar Pedido'}
        </Button>
      </div>

      {qrCode && (
        <Card>
          <p>Escaneie o QR Code:</p>
          <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
        </Card>
      )}
    </Container>
  )
}

/* ========================= */
/* ESTILOS                   */
/* ========================= */

const titulo = {
  textAlign: 'center' as const,
  fontSize: 28,
  fontWeight: 'bold',
}

const input = {
  width: '100%',
  padding: 10,
  marginTop: 8,
  borderRadius: 6,
  border: '1px solid #ccc',
  marginBottom: 10,
}