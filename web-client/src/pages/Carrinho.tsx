import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Container from '../components/ui/Container'

export default function Carrinho() {
  const { itens, total, removerItem, limparCarrinho } = useCart()
  const navigate = useNavigate()

  if (itens.length === 0) {
    return (
      <Container>
        <h1 style={titulo}>🛒 Carrinho</h1>

        <p style={{ color: '#666', textAlign: 'center' }}>
          Seu carrinho está vazio.
        </p>

        <div style={{ marginTop: 20 }}>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Voltar ao Cardápio
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <h1 style={titulo}>🛒 Carrinho</h1>

      <div style={{ marginTop: 20 }}>
        {itens.map((item) => (
          <Card key={item.id}>
            <div style={linhaItem}>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 16 }}>{item.nome}</strong>

                <p style={{ color: '#555', marginTop: 4 }}>
                  {item.quantidade}x R$ {item.preco.toFixed(2)}
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={() => removerItem(item.id)}
              >
                Remover
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={resumo}>
          <h3>Total</h3>
          <h2>R$ {total.toFixed(2)}</h2>
        </div>
      </Card>

      <div style={acoes}>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Continuar Comprando
        </Button>

        <Button variant="primary" onClick={() => navigate('/checkout')}>
          Finalizar Pedido
        </Button>

        <Button variant="danger" onClick={limparCarrinho}>
          Limpar Carrinho
        </Button>
      </div>
    </Container>
  )
}

/* ========================= */
/* ESTILOS LOCAIS (LEVE)     */
/* ========================= */

const titulo = {
  fontSize: 28,
  fontWeight: 'bold',
  textAlign: 'center' as const,
}

const linhaItem = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const resumo = {
  textAlign: 'center' as const,
}

const acoes = {
  marginTop: 20,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
}