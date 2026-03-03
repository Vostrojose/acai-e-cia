import { useEffect, useState } from 'react'
import {
  getProdutos,
  criarProduto,
  alterarStatusProduto,
} from '../services/api'

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number
  ativo: boolean
}

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadProdutos() {
    const response = await getProdutos()
    setProdutos(response.data)
    setLoading(false)
  }

  useEffect(() => {
    loadProdutos()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nome || !preco) {
      alert('Nome e preço são obrigatórios.')
      return
    }

    await criarProduto({
      nome,
      descricao,
      preco: Number(preco),
    })

    setNome('')
    setDescricao('')
    setPreco('')
    await loadProdutos()
  }

  async function handleToggle(produto: Produto) {
    await alterarStatusProduto(produto.id, !produto.ativo)
    await loadProdutos()
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <h1>Gestão de Produtos</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

        <button type="submit">Criar Produto</button>
      </form>

      <h2>Lista de Produtos</h2>

      <ul>
        {produtos.map((produto) => (
          <li key={produto.id}>
            {produto.nome} — R$ {produto.preco} —{' '}
            {produto.ativo ? 'Ativo' : 'Inativo'}

            <button
              onClick={() => handleToggle(produto)}
              style={{ marginLeft: 10 }}
            >
              {produto.ativo ? 'Desativar' : 'Ativar'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
