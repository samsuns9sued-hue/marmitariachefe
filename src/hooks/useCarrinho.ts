import { create } from 'zustand'

export interface ItemCarrinho {
  id: string // ID único do item no carrinho (timestamp)
  produtoId: string
  nome: string
  quantidade: number
  precoUnit: number
  tamanhoId?: string | null
  tamanhoNome?: string
  complementos?: string // "Fritas, Farofa"
  observacao?: string
}

interface CarrinhoStore {
  itens: ItemCarrinho[]
  adicionar: (item: ItemCarrinho) => void
  remover: (id: string) => void
  limpar: () => void
  total: () => number
}

export const useCarrinho = create<CarrinhoStore>((set, get) => ({
  itens: [],
  
  adicionar: (item) => set((state) => ({ 
    itens: [...state.itens, item] 
  })),

  remover: (id) => set((state) => ({ 
    itens: state.itens.filter((i) => i.id !== id) 
  })),

  limpar: () => set({ itens: [] }),

  total: () => {
    return get().itens.reduce((acc, item) => acc + (item.precoUnit * item.quantidade), 0)
  }
}))