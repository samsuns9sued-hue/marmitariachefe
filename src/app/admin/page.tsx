'use client'

import Link from 'next/link' // <--- IMPORTAÇÃO ADICIONADA AQUI
import { useState, useEffect } from 'react'
import { getPedidosHoje, atualizarStatusPedido, logout } from '@/lib/actions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Printer, RefreshCw, CheckCircle, Truck, Clock, LogOut, MapPin, Utensils, Ruler } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)

  // Função para buscar pedidos
  const carregarPedidos = async () => {
    try {
      const dados = await getPedidosHoje()
      setPedidos(dados)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar pedidos")
    } finally {
      setCarregando(false)
    }
  }

  // Atualiza a cada 15 segundos
  useEffect(() => {
    carregarPedidos()
    const intervalo = setInterval(carregarPedidos, 15000)
    return () => clearInterval(intervalo)
  }, [])

  const mudarStatus = async (id: string, status: string) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    
    toast.promise(atualizarStatusPedido(id, status), {
      loading: 'Atualizando...',
      success: 'Status atualizado!',
      error: 'Erro ao atualizar'
    })
  }

  // Gera o link do WhatsApp
  const linkZap = (telefone: string) => `https://wa.me/55${telefone.replace(/\D/g, '')}`

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Painel do Chefe</h1>
          <p className="text-sm text-gray-500">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregarPedidos} className="p-2 bg-white rounded-full shadow hover:bg-gray-100" title="Atualizar">
            <RefreshCw size={20} />
          </button>
          <button onClick={() => logout()} className="p-2 bg-red-100 text-red-600 rounded-full shadow hover:bg-red-200" title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* --- MENU DE NAVEGAÇÃO NOVO --- */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Link 
          href="/admin" 
          className="px-4 py-3 bg-gray-800 text-white rounded-xl shadow-md font-bold flex items-center gap-2 whitespace-nowrap"
        >
          📋 Pedidos
        </Link>
        <Link 
          href="/admin/produtos" 
          className="px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl shadow-sm font-bold flex items-center gap-2 hover:bg-gray-50 whitespace-nowrap"
        >
          <Utensils size={18} className="text-orange-500" /> Cardápio
        </Link>
        <Link 
          href="/admin/tamanhos" 
          className="px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl shadow-sm font-bold flex items-center gap-2 hover:bg-gray-50 whitespace-nowrap"
        >
          <Ruler size={18} className="text-blue-500" /> Tamanhos
        </Link>
      </div>
      {/* ----------------------------- */}

      {/* Lista de Pedidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pedidos.length === 0 && !carregando && (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400">
            <ClipboardListIcon className="w-16 h-16 mb-2 opacity-20" />
            <p>Nenhum pedido hoje ainda.</p>
          </div>
        )}

        {pedidos.map((pedido) => (
          <div key={pedido.id} className={`bg-white rounded-lg shadow border-l-4 p-4 ${
            pedido.status === 'PENDENTE' ? 'border-yellow-400' :
            pedido.status === 'EM_PREPARO' ? 'border-blue-500' :
            pedido.status === 'SAIU_ENTREGA' ? 'border-green-500' : 'border-gray-300'
          }`}>
            
            {/* Cabeçalho do Card */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  #{pedido.numero} - {pedido.cliente.nome}
                </h3>
                <a href={linkZap(pedido.cliente.telefone)} target="_blank" className="text-xs text-green-600 font-medium hover:underline flex items-center gap-1 mt-1">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  {pedido.cliente.telefone}
                </a>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                pedido.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                pedido.status === 'EM_PREPARO' ? 'bg-blue-100 text-blue-800' :
                pedido.status === 'SAIU_ENTREGA' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
              }`}>
                {pedido.status.replace('_', ' ')}
              </span>
            </div>

            {/* Itens */}
            <div className="space-y-2 mb-4 bg-gray-50 p-2 rounded">
              {pedido.itens.map((item: any) => (
                <div key={item.id} className="text-sm border-b border-gray-200 pb-1 last:border-0">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">
                      {item.quantidade}x {item.produto.nome} {item.tamanho ? `(${item.tamanho.nome})` : ''}
                    </span>
                  </div>
                  {item.complementos && (
                    <p className="text-xs text-gray-600">+ {item.complementos}</p>
                  )}
                  {item.observacao && (
                    <p className="text-xs text-red-600 font-bold bg-red-50 inline-block px-1 rounded">Obs: {item.observacao}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Rodapé e Ações */}
            <div className="mt-2">
              <div className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                <p className="font-semibold flex items-center gap-1">
                  <MapPin size={14} /> {pedido.cliente.endereco}, {pedido.cliente.bairro}
                </p>
                {pedido.cliente.referencia && (
                   <p className="text-blue-600 font-medium text-xs mt-1 ml-4 border-l-2 border-blue-400 pl-2">
                     Ref: {pedido.cliente.referencia}
                   </p>
                )}
                <div className="font-medium text-gray-800 mt-2 border-t pt-1">
                  Pagamento: {pedido.formaPagamento.replace('_', ' ')} 
                  {pedido.trocoPara && <span className="text-red-600 font-bold ml-1">(Troco p/ {pedido.trocoPara})</span>}
                </div>
                <div className="flex justify-between mt-1 text-lg">
                   <span>Total:</span>
                   <span className="font-bold text-green-700">R$ {pedido.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-2">
                <button title="Imprimir" className="flex items-center justify-center p-2 bg-gray-100 rounded hover:bg-gray-200">
                  <Printer size={18} />
                </button>
                
                {pedido.status === 'PENDENTE' && (
                  <button 
                    onClick={() => mudarStatus(pedido.id, 'EM_PREPARO')}
                    className="col-span-3 flex items-center justify-center gap-2 bg-blue-600 text-white rounded hover:bg-blue-700 py-2 text-sm font-medium"
                  >
                    <Clock size={16} /> Aceitar / Preparar
                  </button>
                )}

                {pedido.status === 'EM_PREPARO' && (
                  <button 
                    onClick={() => mudarStatus(pedido.id, 'SAIU_ENTREGA')}
                    className="col-span-3 flex items-center justify-center gap-2 bg-orange-500 text-white rounded hover:bg-orange-600 py-2 text-sm font-medium"
                  >
                    <Truck size={16} /> Despachar Moto
                  </button>
                )}

                {pedido.status === 'SAIU_ENTREGA' && (
                  <button 
                    onClick={() => mudarStatus(pedido.id, 'ENTREGUE')}
                    className="col-span-3 flex items-center justify-center gap-2 bg-green-600 text-white rounded hover:bg-green-700 py-2 text-sm font-medium"
                  >
                    <CheckCircle size={16} /> Finalizar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ClipboardListIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  )
}