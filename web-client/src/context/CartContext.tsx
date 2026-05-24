import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface Item {
  id: string
  produtoId: string
  nome: string
  preco: number 
  quantidade: number
  adicionais?: {
    id: string
    nome: string
    preco: number
    quantidade: number
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

  function adicionarItem(item: Omit<Item, 'quantidade'>) {
    setItens((prev) => {
      const index = prev.findIndex((i) => i.id === item.id)

      if (index !== -1) {
        const novos = [...prev]
        novos[index] = {
          ...novos[index],
          quantidade: novos[index].quantidade + 1,
        }

        return novos
      }

      return [...prev, { ...item, quantidade: 1 }]
    })
  }

  function removerItem(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id))
  }

  function limparCarrinho() {
    setItens([])
  }

  const total = itens.reduce((acc, item) => {
    const adicionaisTotal = (item.adicionais || []).reduce(
      (soma, add) => soma + Number(add.preco) * add.quantidade,
      0,
    )

    return acc + (item.preco + adicionaisTotal) * item.quantidade
  }, 0)

  return (
    <CartContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        limparCarrinho,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
