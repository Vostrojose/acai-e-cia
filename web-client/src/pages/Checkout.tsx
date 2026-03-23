import { useCart } from '../context/CartContext'
import api from '../services/api'
import { useState } from 'react'

export default function Checkout() {
  const { itens, total } = useCart()

  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const [tipoPedido, setTipoPedido] = useState<'retirada' | 'entrega'>('retirada')

  // Endereço como objeto para inputs
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

      const origem = localStorage.getItem('origemPedido') ?? "1"

      // remove caracteres não numéricos
      const telefoneLimpo = telefone.replace(/\D/g, '')

      if (telefoneLimpo.length < 10) {
        alert('Digite um WhatsApp válido.')
        return 
      }

      // monta endereco como string
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

      // 1️⃣ Criar pedido
      const pedidoResponse = await api.post('/pedidos', payload)
      const pedidoId = pedidoResponse?.data?.data?.id

      if (!pedidoId) {
        console.error('Resposta inesperada da API:', pedidoResponse.data)
        alert('Erro ao criar pedido')
        return
      }

      // 2️⃣ Gerar checkout do Mercado Pago
      const pagamentoResponse = await api.post('/pagamento/checkout', {
        pedidoId,
        telefone: telefoneLimpo
      })

      // 3️⃣ Redirecionar para o Mercado Pago
      if (pagamentoResponse?.data?.data?.init_point) {
        window.location.href = pagamentoResponse.data.data.init_point
      } else {
        console.error('Resposta inesperada do pagamento:', pagamentoResponse.data)
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
      <h2>R$ {(total ?? 0).toFixed(2)}</h2>

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

      {tipoPedido === 'entrega' && (
        <div style={{ marginTop: 20 }}>
          <label>Endereço de entrega</label>
          <input
            type="text"
            placeholder="Rua"
            value={endereco.rua}
            onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
            style={{ width: '100%', padding: 10, marginTop: 5 }}
          />
          <input
            type="text"
            placeholder="Número"
            value={endereco.numero}
            onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
            style={{ width: '100%', padding: 10, marginTop: 5 }}
          />
          <input
            type="text"
            placeholder="Bairro"
            value={endereco.bairro}
            onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
            style={{ width: '100%', padding: 10, marginTop: 5 }}
          />
          <input
            type="text"
            placeholder="Cidade"
            value={endereco.cidade}
            onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
            style={{ width: '100%', padding: 10, marginTop: 5 }}
          />
          <input
            type="text"
            placeholder="CEP"
            value={endereco.cep}
            onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
            style={{ width: '100%', padding: 10, marginTop: 5 }}
          />
        </div>
      )}

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
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Processando...' : 'Confirmar Pedido'}
      </button>
    </div>
  )
}