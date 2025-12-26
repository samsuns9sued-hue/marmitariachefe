'use client'

import { useState, useEffect } from 'react'
import { buscarPedidosDoCliente } from '@/lib/actions'
import { 
  ClipboardList, X, RefreshCw, ChefHat, Truck, 
  CheckCircle, Clock, Search, LogOut, User, ChevronRight 
} from 'lucide-react'
import { format } from 'date-fns'

export default function HeaderMeusPedidos() {
  const [isOpen, setIsOpen] = useState(false)
  const [pedidos, setPedidos] = useState<any[]>([])
  
  const [telefone, setTelefone] = useState('')
  const [inputTel, setInputTel] = useState('')
  
  const [loading, setLoading] = useState(false)

  // Carrega telefone salvo ao abrir
  useEffect(() => {
    const telSalvo = localStorage.getItem('marmitaria_telefone')
    if (telSalvo) {
      setTelefone(telSalvo)
      carregarPedidos(telSalvo)
    }
  }, [])

  // Auto-atualização (Polling)
  useEffect(() => {
    let intervalo: any
    if (isOpen && telefone) {
      intervalo = setInterval(() => carregarPedidos(telefone, false), 15000)
    }
    return () => clearInterval(intervalo)
  }, [isOpen, telefone])

  // --- CORREÇÃO 1: TRAVAR O SCROLL DA PÁGINA DE FUNDO ---
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])
  // -------------------------------------------------------

  const carregarPedidos = async (tel: string, mostrarLoading = true) => {
    if (!tel) return
    if (mostrarLoading) setLoading(true)
    const dados = await buscarPedidosDoCliente(tel)
    setPedidos(dados)
    if (mostrarLoading) setLoading(false)
  }

  const handleEntrar = () => {
    if (inputTel.length < 8) return
    setTelefone(inputTel)
    localStorage.setItem('marmitaria_telefone', inputTel)
    carregarPedidos(inputTel)
  }

  const handleSair = () => {
    setTelefone('')
    setInputTel('')
    setPedidos([])
    localStorage.removeItem('marmitaria_telefone')
  }

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
        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-sm hover:bg-white/20 transition-all active:scale-95 group"
      >
        <ClipboardList size={18} className="text-yellow-300" />
        <span className="text-xs font-bold text-white uppercase tracking-wide">
          Meus Pedidos
        </span>
      </button>
    )
  }

  return (
    // --- CORREÇÃO 2: Z-INDEX 100 PARA FICAR ACIMA DE TUDO ---
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-right flex flex-col">
        
        <div className="p-4 bg-red-600 text-white flex justify-between items-center shadow-md">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ClipboardList /> Meus Pedidos
          </h2>
          <button onClick={() => setIsOpen(false)} className="bg-white/20 p-1 rounded-full hover:bg-white/30">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          
          {!telefone ? (
            <div className="p-6 flex flex-col justify-center h-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Acompanhar Pedido</h3>
                <p className="text-sm text-gray-500">Digite seu WhatsApp para ver o status.</p>
              </div>

              <label className="text-xs font-bold text-gray-500 mb-1 ml-1">WhatsApp</label>
              <input 
                type="tel" 
                value={inputTel}
                onChange={(e) => setInputTel(e.target.value)}
                placeholder="(00) 00000-0000" 
                className="p-4 border-2 border-gray-200 rounded-xl w-full mb-4 focus:border-red-500 outline-none text-lg"
              />
              
              <button onClick={handleEntrar} className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors">
                Ver Histórico
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} className="text-red-600"/>
                  <span>Cliente: <strong>{telefone}</strong></span>
                </div>
                <button onClick={handleSair} className="text-xs font-bold text-red-600 border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 flex items-center gap-1">
                  <LogOut size={12} /> Sair
                </button>
              </div>

              <div className="p-4">
                {loading ? (
                  <div className="flex justify-center mt-10"><RefreshCw className="animate-spin text-red-600"/></div>
                ) : (
                  <div className="space-y-4">
                    {pedidos.length === 0 && (
                      <div className="text-center py-10 text-gray-400">
                        <p>Nenhum pedido encontrado para este número.</p>
                      </div>
                    )}

                    {pedidos.map((pedido) => {
                      const statusInfo = getStatusInfo(pedido.status)
                      return (
                        <div key={pedido.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-800">#{pedido.numero}</span>
                            <span className="text-xs text-gray-400">{format(new Date(pedido.createdAt), 'dd/MM HH:mm')}</span>
                          </div>
                          
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold mb-3 ${statusInfo.cor} transition-colors duration-500`}>
                            {statusInfo.icone}
                            {statusInfo.texto}
                          </div>

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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}