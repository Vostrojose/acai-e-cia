import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface Item {
  id: string
  produtoId: string
  nome: string
  preco: number // 🔥 AGORA É O PREÇO FINAL (produto + adicionais)
  quantidade: number
  adicionais?: {
    id: string
    nome: string
    preco: number
  }[]
}

interface CartContextData {
  itens: Item[]
  adicionarItem: (item: Omit<Item, 'quantidade'>) => void
  removerItem: (id: string) => void
  limparCarrinho: () => void
  total: number
}

const CartContext = createContext({} as CartContextData)

export function CartProvider({ children }: { children: ReactNode }) {

  const [itens, setItens] = useState<Item[]>(() => {
    try {
      const data = localStorage.getItem('carrinho')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(itens))
  }, [itens])

  /* ============================= */
  /* 🔥 ADICIONAR ITEM CORRIGIDO   */
  /* ============================= */
  function adicionarItem(item: Omit<Item, 'quantidade'>) {
    setItens((prev) => {

      /* 🔥 CALCULAR PREÇO FINAL COM ADICIONAIS */
      const totalAdicionais = (item.adicionais || []).reduce(
        (soma, add) => soma + Number(add.preco),
        0
      )

      const precoFinal = Number(item.preco) + totalAdicionais

      const itemComPreco = {
        ...item,
        preco: precoFinal // 🔥 agora inclui adicionais
      }

      const index = prev.findIndex(i => i.id === item.id)

      if (index !== -1) {
        const novos = [...prev]
        novos[index].quantidade += 1
        return novos
      }

      return [...prev, { ...itemComPreco, quantidade: 1 }]
    })
  }

  function removerItem(id: string) {
    setItens((prev) => prev.filter(i => i.id !== id))
  }

  function limparCarrinho() {
    setItens([])
  }

  /* ============================= */
  /* 🔥 TOTAL CORRETO              */
  /* ============================= */
  const total = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  )

  return (
    <CartContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        limparCarrinho,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}