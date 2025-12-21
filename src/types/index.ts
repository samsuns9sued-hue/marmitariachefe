import { Prisma } from '@prisma/client'

// Tipos para Produto
export type ProdutoComRelacoes = Prisma.ProdutoGetPayload<{}>

// Tipos para Pedido com todas as relações
export type PedidoCompleto = Prisma.PedidoGetPayload<{
  include: {
    cliente: true
    itens: {
      include: {
        produto: true
        tamanho: true
      }
    }
  }
}>

// Tipo para item do carrinho
export interface ItemCarrinho {
  id: string
  tamanhoId: string
  tamanhoNome: string
  tamanhoPreco: number
  produtoId: string
  produtoNome: string
  complementos: {
    id: string
    nome: string
    preco: number
  }[]
  quantidade: number
  observacao: string
  precoTotal: number
}

// Tipo para dados do cliente no formulário
export interface DadosCliente {
  nome: string
  telefone: string
  endereco: string
  bairro: string
  referencia: string
}

// Tipo para criar pedido
export interface CriarPedidoPayload {
  cliente: DadosCliente
  itens: {
    tamanhoId: string
    produtoId: string
    quantidade: number
    precoUnit: number
    observacao?: string
  }[]
  formaPagamento: string
  trocoPara?: number
  observacoes?: string
  total: number
  taxaEntrega: number
}