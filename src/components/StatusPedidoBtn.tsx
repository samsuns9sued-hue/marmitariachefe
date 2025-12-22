'use client'

import { useState, useEffect } from 'react'
import { buscarPedidosDoCliente } from '@/lib/actions'
import { ClipboardList, X, RefreshCw, ChevronDown, ChevronUp, ChefHat, Truck, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function StatusPedidoBtn() {
  const [isOpen, setIsOpen] = useState(false)
  const [pedidos, setPedidos] = useState<any[]>([])
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)

  // Tenta carregar o telefone salvo no navegador ao abrir o site
  useEffect(() => {
    const telSalvo = localStorage.getItem('marmitaria_telefone')
    if (telSalvo) {
      setTelefone(telSalvo)
      carregarPedidos(telSalvo)
    }
  }, [])

  // Auto-atualização a cada 15s se a janela estiver aberta
  useEffect(() => {
    let intervalo: any
    if (isOpen && telefone) {
      intervalo = setInterval(() => carregarPedidos(telefone, false), 15000)
    }
    return () => clearInterval(intervalo)
  }, [isOpen, telefone])

  const carregarPedidos = async (tel: string, mostrarLoading = true) => {
    if (!tel) return
    if (mostrarLoading) setLoading(true)
    const dados = await buscarPedidosDoCliente(tel)
    setPedidos(dados)
    if (mostrarLoading) setLoading(false)
  }

  // Cores e Ícones por Status
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDENTE': return { cor: 'bg-yellow-100 text-yellow-700', icone: <Clock size={16}/>, texto: 'Aguardando Confirmação' }
      case 'EM_PREPARO': return { cor: 'bg-blue-100 text-blue-700', icone: <ChefHat size={16}/>, texto: 'Cozinha Preparando' }
      case 'SAIU_ENTREGA': return { cor: 'bg-orange-100 text-orange-700', icone: <Truck size={16}/>, texto: 'Saiu para Entrega' }
      case 'ENTREGUE': return { cor: 'bg-green-100 text-green-700', icone: <CheckCircle size={16}/>, texto: 'Entregue' }
      default: return { cor: 'bg-gray-100', icone: <Clock/>, texto: status }
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 bg-white text-red-600 p-3 rounded-full shadow-lg border border-red-100 flex items-center gap-2 font-bold text-xs hover:scale-105 transition-transform animate-in fade-in"
      >
        <ClipboardList size={20} />
        <span className="hidden sm:inline">Meus Pedidos</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-right flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-red-600 text-white flex justify-between items-center shadow-md">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ClipboardList /> Meus Pedidos
          </h2>
          <button onClick={() => setIsOpen(false)} className="bg-white/20 p-1 rounded-full hover:bg-white/30">
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          
          {/* Se não tiver telefone salvo, pede pra digitar */}
          {!telefone && (
            <div className="text-center mt-10">
              <p className="mb-2 text-gray-600">Digite seu WhatsApp para ver seus pedidos:</p>
              <input 
                type="tel" 
                placeholder="Seu número..." 
                className="p-3 border rounded-xl w-full mb-2"
                onBlur={(e) => {
                  const val = e.target.value
                  setTelefone(val)
                  localStorage.setItem('marmitaria_telefone', val)
                  carregarPedidos(val)
                }}
              />
            </div>
          )}

          {loading ? (
            <div className="flex justify-center mt-10"><RefreshCw className="animate-spin text-red-600"/></div>
          ) : (
            <div className="space-y-4">
              {pedidos.length === 0 && telefone && (
                <p className="text-center text-gray-500 mt-10">Nenhum pedido encontrado para este número.</p>
              )}

              {pedidos.map((pedido) => {
                const statusInfo = getStatusInfo(pedido.status)
                return (
                  <div key={pedido.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-800">#{pedido.numero}</span>
                      <span className="text-xs text-gray-400">{format(new Date(pedido.createdAt), 'dd/MM HH:mm')}</span>
                    </div>
                    
                    {/* Badge de Status Animado */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold mb-3 ${statusInfo.cor} transition-colors duration-500`}>
                      {statusInfo.icone}
                      {statusInfo.texto}
                    </div>

                    {/* Resumo dos Itens */}
                    <div className="text-sm text-gray-600 border-t pt-2 space-y-1">
                      {pedido.itens.map((item: any) => (
                        <div key={item.id} className="flex justify-between">
                          <span>{item.quantidade}x {item.produto.nome}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-2 pt-2 border-t flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span>R$ {pedido.total.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-white border-t text-center text-xs text-gray-400">
          Atualiza automaticamente...
        </div>
      </div>
    </div>
  )
}