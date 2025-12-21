'use client'

import { useState } from 'react'
import {
  Clock,
  MapPin,
  Phone,
  ChefHat,
  Truck,
  Check,
  Copy,
  Printer,
  MessageCircle,
  X,
} from 'lucide-react'
import { PedidoCompleto } from '@/types'
import {
  formatarMoeda,
  formatarDataCurta,
  getStatusColor,
  getStatusLabel,
  getFormaPagamentoLabel,
  formatarTelefone,
} from '@/lib/utils'
import { gerarMensagemPedido, gerarLinkWhatsApp, gerarMensagemSaiuEntrega } from '@/lib/whatsapp'
import { toast } from 'sonner'

interface PedidoCardProps {
  pedido: PedidoCompleto
  onAtualizarStatus: (id: string, status: string) => void
}

export default function PedidoCard({
  pedido,
  onAtualizarStatus,
}: PedidoCardProps) {
  const [expandido, setExpandido] = useState(false)

  const proximoStatus: Record<string, string> = {
    PENDENTE: 'CONFIRMADO',
    CONFIRMADO: 'EM_PREPARO',
    EM_PREPARO: 'PRONTO',
    PRONTO: 'SAIU_ENTREGA',
    SAIU_ENTREGA: 'ENTREGUE',
  }

  const acaoLabel: Record<string, string> = {
    PENDENTE: '✓ Confirmar',
    CONFIRMADO: '👨‍🍳 Preparar',
    EM_PREPARO: '✓ Pronto',
    PRONTO: '🛵 Saiu Entrega',
    SAIU_ENTREGA: '✓ Entregue',
  }

  const copiarResumo = () => {
    const mensagem = gerarMensagemPedido({
      numero: pedido.numero,
      cliente: pedido.cliente,
      itens: pedido.itens,
      formaPagamento: pedido.formaPagamento,
      trocoPara: pedido.trocoPara,
      observacoes: pedido.observacoes,
      total: pedido.total,
    })

    navigator.clipboard.writeText(mensagem)
    toast.success('Resumo copiado!')
  }

  const enviarWhatsAppCliente = () => {
    const mensagem = gerarMensagemSaiuEntrega(pedido.cliente.nome)
    const link = gerarLinkWhatsApp(pedido.cliente.telefone, mensagem)
    window.open(link, '_blank')
  }

  const handleAvancarStatus = () => {
    const novoStatus = proximoStatus[pedido.status]
    if (novoStatus) {
      onAtualizarStatus(pedido.id, novoStatus)

      // Se saiu para entrega, oferece enviar mensagem
      if (novoStatus === 'SAIU_ENTREGA') {
        toast.success('Pedido saiu para entrega!', {
          action: {
            label: 'Avisar Cliente',
            onClick: enviarWhatsAppCliente,
          },
        })
      }
    }
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${getStatusColor(pedido.status)}`}
    >
      {/* Header */}
      <div
        onClick={() => setExpandido(!expandido)}
        className="p-4 cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-2xl font-bold">#{pedido.numero}</span>
            <p className="text-sm font-medium">{pedido.cliente.nome}</p>
          </div>
          <div className="text-right">
            <span className="text-sm px-2 py-1 rounded-full bg-white/50">
              {getStatusLabel(pedido.status)}
            </span>
            <p className="text-xs mt-1 flex items-center justify-end gap-1">
              <Clock size={12} />
              {formatarDataCurta(pedido.createdAt)}
            </p>
          </div>
        </div>

        {/* Itens resumidos */}
        <div className="text-sm space-y-1">
          {pedido.itens.slice(0, 2).map((item, i) => (
            <p key={i}>
              {item.quantidade}x {item.tamanho?.nome} {item.produto.nome}
            </p>
          ))}
          {pedido.itens.length > 2 && (
            <p className="text-gray-500">
              +{pedido.itens.length - 2} item(ns)
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-current/20">
          <span className="text-lg font-bold">
            {formatarMoeda(pedido.total)}
          </span>
          <span className="text-sm">{getFormaPagamentoLabel(pedido.formaPagamento)}</span>
        </div>
      </div>

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="border-t border-current/20 p-4 space-y-4 bg-white/50">
          {/* Endereço */}
          <div className="flex items-start gap-2">
            <MapPin size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{pedido.cliente.endereco}</p>
              {pedido.cliente.bairro && (
                <p className="text-sm text-gray-600">{pedido.cliente.bairro}</p>
              )}
            </div>
          </div>

          {/* Telefone */}
          <a
            href={`tel:${pedido.cliente.telefone}`}
            className="flex items-center gap-2 text-blue-600"
          >
            <Phone size={18} />
            {formatarTelefone(pedido.cliente.telefone)}
          </a>

          {/* Itens completos */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <h4 className="font-semibold text-sm">Itens do Pedido:</h4>
            {pedido.itens.map((item, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium">
                  {item.quantidade}x {item.tamanho?.nome} {item.produto.nome}
                </span>
                {item.observacao && (
                  <p className="text-gray-500 italic ml-4">
                    → {item.observacao}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Observações */}
          {pedido.observacoes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800">
                📝 {pedido.observacoes}
              </p>
            </div>
          )}

          {/* Troco */}
          {pedido.formaPagamento === 'DINHEIRO' && pedido.trocoPara && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800">
                💵 Troco para: {formatarMoeda(pedido.trocoPara)}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copiarResumo}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Copy size={16} />
              <span className="text-sm">Copiar</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer size={16} />
              <span className="text-sm">Imprimir</span>
            </button>
          </div>

          {/* Botão de ação principal */}
          {pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAvancarStatus}
                className="py-3 px-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                {acaoLabel[pedido.status]}
              </button>
              <button
                onClick={() => onAtualizarStatus(pedido.id, 'CANCELADO')}
                className="py-3 px-4 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors"
              >
                ✕ Cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}