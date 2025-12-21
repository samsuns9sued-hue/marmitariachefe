'use client'

import { useState, useEffect } from 'react'
import { getPedidosHoje, atualizarStatusPedido, logout } from '@/lib/actions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Printer, RefreshCw, CheckCircle, Truck, Clock, LogOut } from 'lucide-react'
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
    toast.promise(atualizarStatusPedido(id, status), {
      loading: 'Atualizando...',
      success: () => {
        carregarPedidos()
        return 'Status atualizado!'
      },
      error: 'Erro ao atualizar'
    })
  }

  // Gera o link do WhatsApp
  const linkZap = (telefone: string) => `https://wa.me/55${telefone.replace(/\D/g, '')}`

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cozinha & Pedidos</h1>
          <p className="text-sm text-gray-500">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregarPedidos} className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
            <RefreshCw size={20} />
          </button>
          <button onClick={() => logout()} className="p-2 bg-red-100 text-red-600 rounded-full shadow hover:bg-red-200">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pedidos.length === 0 && !carregando && (
          <p className="col-span-full text-center text-gray-500 py-10">Nenhum pedido hoje ainda.</p>
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
                <h3 className="font-bold text-lg">#{pedido.numero} - {pedido.cliente.nome.split(' ')[0]}</h3>
                <a href={linkZap(pedido.cliente.telefone)} target="_blank" className="text-xs text-green-600 font-medium hover:underline">
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
            <div className="space-y-2 mb-4">
              {pedido.itens.map((item: any) => (
                <div key={item.id} className="text-sm border-b pb-1 last:border-0">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">
                      {item.quantidade}x {item.produto.nome} {item.tamanho ? `(${item.tamanho.nome})` : ''}
                    </span>
                  </div>
                  {item.complementos && (
                    <p className="text-xs text-gray-500">+ {item.complementos}</p>
                  )}
                  {item.observacao && (
                    <p className="text-xs text-red-500 font-medium">Obs: {item.observacao}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Rodapé e Ações */}
            <div className="mt-4 pt-3 border-t">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-500">Total:</span>
                <span className="font-bold">R$ {pedido.total.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {pedido.cliente.endereco}, {pedido.cliente.bairro}
                <div className="font-medium text-gray-700">Pagamento: {pedido.formaPagamento} (Troco: {pedido.trocoPara || '-'})</div>
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