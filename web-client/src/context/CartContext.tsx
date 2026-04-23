import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

/* ============================= */
/* 🔥 NOVO: TIPO ADICIONAL       */
/* ============================= */
interface Adicional {
  nome: string
  preco: number
}

interface Item {
  id: string
  nome: string
  preco: number
  quantidade: number
  adicionais?: Adicional[] // 🔥 NOVO (opcional → não quebra nada)
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

  /* ============================= */
  /* 🔥 Persistência segura         */
  /* ============================= */
  const [itens, setItens] = useState<Item[]>(() => {
    try {
      const data = localStorage.getItem('carrinho')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  })

  /* ============================= */
  /* 💾 SALVAR NO LOCALSTORAGE     */
  /* ============================= */
  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(itens))
  }, [itens])

  /* ============================= */
  /* 🔥 ADICIONAR ITEM (ATUALIZADO)*/
  /* ============================= */
  function adicionarItem(item: Omit<Item, 'quantidade'>) {
    const itemId = String(item.id)

    setItens((prevItens) => {
      const index = prevItens.findIndex(
        (i) => String(i.id) === itemId
      )

      /* ============================= */
      /* 🔁 ITEM JÁ EXISTE             */
      /* ============================= */
      if (index !== -1) {
        const novosItens = [...prevItens]

        novosItens[index] = {
          ...novosItens[index],
          quantidade: novosItens[index].quantidade + 1,

          // 🔥 NOVO: preserva adicionais
          adicionais:
            item.adicionais && item.adicionais.length > 0
              ? item.adicionais
              : novosItens[index].adicionais || []
        }

        return novosItens
      }

      /* ============================= */
      /* 🆕 NOVO ITEM                 */
      /* ============================= */
      return [
        ...prevItens,
        {
          ...item,
          id: itemId,
          quantidade: 1,
          adicionais: item.adicionais || [] // 🔥 NOVO
        }
      ]
    })
  }

  /* ============================= */
  /* ❌ REMOVER ITEM               */
  /* ============================= */
  function removerItem(id: string) {
    const itemId = String(id)

    setItens((prev) =>
      prev.filter((item) => String(item.id) !== itemId)
    )
  }

  /* ============================= */
  /* 🧹 LIMPAR CARRINHO            */
  /* ============================= */
  function limparCarrinho() {
    setItens([])
  }

  /* ============================= */
  /* 💰 TOTAL                     */
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