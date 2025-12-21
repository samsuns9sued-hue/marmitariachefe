import { gerarNumeroWhatsApp } from './utils'

interface DadosPedido {
  numero: number
  cliente: {
    nome: string
    telefone: string
    endereco: string
    bairro?: string | null
  }
  itens: {
    quantidade: number
    tamanho?: { nome: string } | null
    produto: { nome: string }
    observacao?: string | null
  }[]
  formaPagamento: string
  trocoPara?: number | null
  observacoes?: string | null
  total: number
}

export function gerarMensagemPedido(pedido: DadosPedido): string {
  const itensTexto = pedido.itens
    .map((item) => {
      let texto = `${item.quantidade}x`
      if (item.tamanho) {
        texto += ` ${item.tamanho.nome}`
      }
      texto += ` ${item.produto.nome}`
      if (item.observacao) {
        texto += ` (${item.observacao})`
      }
      return texto
    })
    .join('\n')

  const formaPgto = {
    PIX: 'PIX',
    DINHEIRO: 'Dinheiro',
    CARTAO_CREDITO: 'Cartão de Crédito',
    CARTAO_DEBITO: 'Cartão de Débito',
  }[pedido.formaPagamento] || pedido.formaPagamento

  let mensagem = `🍱 *PEDIDO #${pedido.numero}*\n\n`
  mensagem += `👤 *Cliente:* ${pedido.cliente.nome}\n`
  mensagem += `📍 *Endereço:* ${pedido.cliente.endereco}`
  if (pedido.cliente.bairro) {
    mensagem += ` - ${pedido.cliente.bairro}`
  }
  mensagem += `\n\n`
  mensagem += `📦 *Itens:*\n${itensTexto}\n\n`
  mensagem += `💰 *Total:* R$ ${pedido.total.toFixed(2)}\n`
  mensagem += `💳 *Pagamento:* ${formaPgto}`
  
  if (pedido.formaPagamento === 'DINHEIRO' && pedido.trocoPara) {
    mensagem += `\n💵 *Troco para:* R$ ${pedido.trocoPara.toFixed(2)}`
  }
  
  if (pedido.observacoes) {
    mensagem += `\n\n📝 *Obs:* ${pedido.observacoes}`
  }

  return mensagem
}

export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const numero = gerarNumeroWhatsApp(telefone)
  const texto = encodeURIComponent(mensagem)
  return `https://wa.me/${numero}?text=${texto}`
}

export function gerarMensagemSaiuEntrega(nome: string): string {
  return `Olá ${nome}! 🛵\n\nSua marmita acabou de sair para entrega!\n\nBom apetite! 🍱`
}

export function gerarMensagemLinkCardapio(nomeLoja: string, url: string): string {
  return `Olá! 👋\n\n🍱 *${nomeLoja}*\n\nHoje tem comida boa! Faça seu pedido:\n${url}\n\nBom apetite! 😋`
}