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
  // 🔥 Persistência com segurança
  const [itens, setItens] = useState<Item[]>(() => {
    try {
      const data = localStorage.getItem('carrinho')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  })

  // 🔥 Sempre salva quando mudar
  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(itens))
  }, [itens])

  /* ============================= */
  /* 🔥 ADICIONAR ITEM (CORRIGIDO) */
  /* ============================= */
  function adicionarItem(item: Omit<Item, 'quantidade'>) {
    const itemId = String(item.id)

    setItens((prevItens) => {
      const index = prevItens.findIndex(
        (i) => String(i.id) === itemId
      )

      if (index !== -1) {
        const novosItens = [...prevItens]

        novosItens[index] = {
          ...novosItens[index],
          quantidade: novosItens[index].quantidade + 1
        }

        return novosItens
      }

      return [
        ...prevItens,
        { ...item, id: itemId, quantidade: 1 }
      ]
    })
  }

  /* ============================= */
  /* ❌ REMOVER ITEM */
  /* ============================= */
  function removerItem(id: string) {
    const itemId = String(id)

    setItens((prev) =>
      prev.filter((item) => String(item.id) !== itemId)
    )
  }

  /* ============================= */
  /* 🧹 LIMPAR */
  /* ============================= */
  function limparCarrinho() {
    setItens([])
  }

  /* ============================= */
  /* 💰 TOTAL */
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