import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarData(data: Date | string): string {
  const d = typeof data === 'string' ? parseISO(data) : data
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatarDataCurta(data: Date | string): string {
  const d = typeof data === 'string' ? parseISO(data) : data
  return format(d, 'HH:mm', { locale: ptBR })
}

export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '')
  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
  }
  return telefone
}

export function limparTelefone(telefone: string): string {
  return telefone.replace(/\D/g, '')
}

export function gerarNumeroWhatsApp(telefone: string): string {
  const numeros = limparTelefone(telefone)
  // Adiciona código do Brasil se não tiver
  if (numeros.length === 11) {
    return `55${numeros}`
  }
  return numeros
}

export function getStatusColor(status: string): string {
  const cores: Record<string, string> = {
    PENDENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    CONFIRMADO: 'bg-blue-100 text-blue-800 border-blue-300',
    EM_PREPARO: 'bg-orange-100 text-orange-800 border-orange-300',
    PRONTO: 'bg-purple-100 text-purple-800 border-purple-300',
    SAIU_ENTREGA: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    ENTREGUE: 'bg-green-100 text-green-800 border-green-300',
    CANCELADO: 'bg-red-100 text-red-800 border-red-300',
  }
  return cores[status] || 'bg-gray-100 text-gray-800 border-gray-300'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDENTE: '🟡 Pendente',
    CONFIRMADO: '🔵 Confirmado',
    EM_PREPARO: '🟠 Em Preparo',
    PRONTO: '🟣 Pronto',
    SAIU_ENTREGA: '🔷 Saiu p/ Entrega',
    ENTREGUE: '🟢 Entregue',
    CANCELADO: '🔴 Cancelado',
  }
  return labels[status] || status
}

export function getFormaPagamentoLabel(forma: string): string {
  const labels: Record<string, string> = {
    PIX: '💠 PIX',
    DINHEIRO: '💵 Dinheiro',
    CARTAO_CREDITO: '💳 Cartão Crédito',
    CARTAO_DEBITO: '💳 Cartão Débito',
  }
  return labels[forma] || forma
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}