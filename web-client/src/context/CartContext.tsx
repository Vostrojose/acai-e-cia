import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface Item {
  id: string
  nome: string
  preco: number
  quantidade: number
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
  // 🔥 Agora persiste no localStorage
  const [itens, setItens] = useState<Item[]>(() => {
    const data = localStorage.getItem('carrinho')
    return data ? JSON.parse(data) : []
  })

  // 🔥 Sempre salva quando mudar
  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(itens))
  }, [itens])

  function adicionarItem(item: Omit<Item, 'quantidade'>) {
    setItens((prevItens) => {
      const itemExistente = prevItens.find(
        (i) => i.id === item.id
      )

      if (itemExistente) {
        return prevItens.map((i) =>
          i.id === item.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      }

      return [...prevItens, { ...item, quantidade: 1 }]
    })
  }

  function removerItem(id: string) {
    setItens((prev) => prev.filter((item) => item.id !== id))
  }

  function limparCarrinho() {
    setItens([])
  }

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