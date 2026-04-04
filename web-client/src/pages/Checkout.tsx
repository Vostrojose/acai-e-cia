import { useCart } from '../context/CartContext'
import api from '../services/api'
import { useState } from 'react'

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

      // 🔥 ORIGEM INTELIGENTE
      const origemSalva = localStorage.getItem('origemPedido')
      const origensValidas = ["QR_CODE", "APP", "ADMIN", "BALCAO"]

      let origem: string = origensValidas.includes(origemSalva ?? "")
        ? (origemSalva as string)
        : "APP"

      if (window.location.pathname.includes('/m/')) {
        origem = "QR_CODE"
      }

      // 🔥 TELEFONE
      const telefoneLimpo = telefone.replace(/\D/g, '')

      if (telefoneLimpo.length < 10) {
        alert('Digite um WhatsApp válido.')
        return
      }

      // 🔥 ENDEREÇO
      const enderecoString = tipoPedido === "entrega"
        ? `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.cep}`
        : null

      // 🔥 PAYLOAD
      const payload = {
        telefone: telefoneLimpo,
        origem,
        endereco: enderecoString,
        itens: itens.map((item) => ({
          produtoId: item.id,
          quantidade: item.quantidade
        }))
      }

      // ✅ CRIAR PEDIDO
      const pedidoResponse = await api.post('/pedidos', payload)
      const pedidoId = pedidoResponse?.data?.data?.id

      if (!pedidoId) {
        alert('Erro ao criar pedido')
        return
      }

      // ✅ PIX
      if (metodoPagamento === "PIX") {
        const res = await api.post('/pagamento/pix', { pedidoId })

        setQrCode(res.data.data.qr_code_base64)
        return
      }

      // ✅ CHECKOUT (CARTÃO / BOLETO / ETC)
      const pagamentoResponse = await api.post('/pagamento/checkout', {
        pedidoId
      })

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
    <div style={{ padding: 20, maxWidth: 500, margin: 'auto' }}>
      <h1>💳 Checkout</h1>

      <p>Total do pedido:</p>
      <h2>R$ {(Number(total) || 0).toFixed(2)}</h2>

      {/* TELEFONE */}
      <div style={{ marginTop: 20 }}>
        <label>WhatsApp para confirmação</label>
        <input
          type="tel"
          placeholder="(11) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            marginTop: 5,
            borderRadius: 6,
            border: '1px solid #ccc'
          }}
        />
      </div>

      {/* TIPO PEDIDO */}
      <div style={{ marginTop: 20 }}>
        <label>Tipo de pedido</label>
        <select
          value={tipoPedido}
          onChange={(e) => setTipoPedido(e.target.value as 'retirada' | 'entrega')}
          style={{
            width: '100%',
            padding: 10,
            marginTop: 5,
            borderRadius: 6,
            border: '1px solid #ccc'
          }}
        >
          <option value="retirada">Retirada no local</option>
          <option value="entrega">Entrega</option>
        </select>
      </div>

      {/* ENDEREÇO */}
      {tipoPedido === 'entrega' && (
        <div style={{ marginTop: 20 }}>
          <label>Endereço de entrega</label>

          <input
            type="text"
            placeholder="Rua"
            value={endereco.rua}
            onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
          />

          <input
            type="text"
            placeholder="Número"
            value={endereco.numero}
            onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
          />

          <input
            type="text"
            placeholder="Bairro"
            value={endereco.bairro}
            onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
          />

          <input
            type="text"
            placeholder="Cidade"
            value={endereco.cidade}
            onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
          />

          <input
            type="text"
            placeholder="CEP"
            value={endereco.cep}
            onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
          />
        </div>
      )}

      {/* PAGAMENTO */}
      <div style={{ marginTop: 20 }}>
        <label>Forma de pagamento</label>

        <select
          value={metodoPagamento}
          onChange={(e) => setMetodoPagamento(e.target.value as 'PIX' | 'CHECKOUT')}
          style={{
            width: '100%',
            padding: 10,
            marginTop: 5
          }}
        >
          <option value="CHECKOUT">Cartão / Outros</option>
          <option value="PIX">PIX</option>
        </select>
      </div>

      {/* BOTÃO */}
      <button
        onClick={finalizarPedido}
        disabled={loading}
        style={{
          marginTop: 25,
          width: '100%',
          padding: 15,
          backgroundColor: '#00c853',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Processando...' : 'Confirmar Pedido'}
      </button>

      {/* QR CODE */}
      {qrCode && (
        <div style={{ marginTop: 20 }}>
          <p>Escaneie o QR Code:</p>
          <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
        </div>
      )}
    </div>
  )
}