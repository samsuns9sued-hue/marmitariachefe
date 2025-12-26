'use client'

import { useState, useEffect } from 'react'
import { getPedidosParaEntrega, iniciarRotaEntrega, finalizarEntrega } from '@/lib/actions'
import { MapPin, Navigation, CheckCircle, Package, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

export default function EntregadorPage() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [expandidos, setExpandidos] = useState<string[]>([])

  // Carrega pedidos
  const carregar = async () => {
    setLoading(true)
    const dados = await getPedidosParaEntrega()
    setPedidos(dados)
    setLoading(false)
  }

  // Atualiza a cada 30s
  useEffect(() => {
    carregar()
    const intervalo = setInterval(carregar, 30000)
    return () => clearInterval(intervalo)
  }, [])

  // Selecionar pedido para rota
  const toggleSelecao = (id: string) => {
    if (selecionados.includes(id)) {
      setSelecionados(prev => prev.filter(item => item !== id))
    } else {
      setSelecionados(prev => [...prev, id])
    }
  }

  // Expandir detalhes
  const toggleDetalhes = (id: string) => {
    if (expandidos.includes(id)) {
      setExpandidos(prev => prev.filter(item => item !== id))
    } else {
      setExpandidos(prev => [...prev, id])
    }
  }

  // --- AÇÃO PRINCIPAL: GERAR ROTA E SAIR ---
  const handleGerarRota = async () => {
    if (selecionados.length === 0) return toast.error('Selecione pelo menos um pedido')

    // 1. Atualiza status no banco
    toast.loading('Iniciando rota...')
    await iniciarRotaEntrega(selecionados)
    toast.dismiss()
    toast.success('Status atualizado para Saiu para Entrega!')

    // 2. Monta link do Google Maps
    // Formato: https://www.google.com/maps/dir/Minha+Localizacao/End1/End2/End3
    const pedidosRota = pedidos.filter(p => selecionados.includes(p.id))
    
    // Base do endereço para garantir que o Maps ache na cidade certa
    // DICA: Adicione a cidade/estado fixo aqui se o Maps se perder
    const enderecos = pedidosRota.map(p => 
      encodeURIComponent(`${p.cliente.endereco}, ${p.cliente.numero} - ${p.cliente.bairro}`)
    ).join('/')

    const urlMaps = `https://www.google.com/maps/dir/?api=1&destination=${enderecos}&travelmode=motorcycle`
    
    // Abre o App do Google Maps
    window.open(urlMaps, '_blank')
    
    // Limpa seleção e recarrega
    setSelecionados([])
    carregar()
  }

  // --- AÇÃO: ENTREGUE ---
  const handleEntregue = async (id: string) => {
    if(!confirm('Confirmar entrega realizada?')) return
    
    await finalizarEntrega(id)
    toast.success('Entrega baixada!')
    carregar()
  }

  // Separa listas
  const pendentes = pedidos.filter(p => p.status === 'EM_PREPARO')
  const emRota = pedidos.filter(p => p.status === 'SAIU_ENTREGA')

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <div>
          <h1 className="font-bold text-xl flex items-center gap-2">
            <Navigation className="text-yellow-400" /> Área do Entregador
          </h1>
          <p className="text-xs text-gray-400">Selecione para criar rota</p>
        </div>
        <button onClick={carregar} className="p-2 bg-gray-800 rounded-full">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="p-4 space-y-6">
        
        {/* LISTA 1: PEDIDOS PRONTOS (Para selecionar e sair) */}
        {pendentes.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Package size={18} /> Prontos para Retirada ({pendentes.length})
            </h2>
            <div className="space-y-3">
              {pendentes.map(pedido => (
                <div 
                  key={pedido.id} 
                  className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
                    selecionados.includes(pedido.id) ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                  }`}
                  onClick={() => toggleSelecao(pedido.id)}
                >
                  <div className="p-4 flex items-center gap-3">
                    {/* Checkbox Visual */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selecionados.includes(pedido.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                      {selecionados.includes(pedido.id) && <CheckCircle size={14} className="text-white" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-gray-800">#{pedido.numero} - {pedido.cliente.nome.split(' ')[0]}</h3>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold">Retirar</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{pedido.cliente.bairro}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LISTA 2: EM ROTA (Para dar baixa) */}
        {emRota.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 mb-2 flex items-center gap-2 mt-4">
              <Navigation size={18} /> Em Rota de Entrega ({emRota.length})
            </h2>
            <div className="space-y-3">
              {emRota.map(pedido => (
                <div key={pedido.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">#{pedido.numero} - {pedido.cliente.nome}</h3>
                      <p className="text-sm text-gray-600 font-medium">{pedido.cliente.endereco}</p>
                      <p className="text-xs text-gray-500">{pedido.cliente.bairro}</p>
                      
                      {/* Pagamento Info */}
                      <div className="mt-2 text-xs bg-gray-100 inline-block px-2 py-1 rounded">
                        Cobrar: <span className="font-bold text-red-600">R$ {pedido.total.toFixed(2)}</span> ({pedido.formaPagamento})
                        {pedido.trocoPara && <span> | Troco p/ {pedido.trocoPara}</span>}
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEntregue(pedido.id); }}
                      className="bg-green-600 text-white p-3 rounded-xl flex flex-col items-center gap-1 shadow-lg active:scale-95"
                    >
                      <CheckCircle size={24} />
                      <span className="text-[10px] font-bold">ENTREGUE</span>
                    </button>
                  </div>

                  {/* Botão Ver Detalhes */}
                  <button 
                    onClick={() => toggleDetalhes(pedido.id)}
                    className="w-full mt-3 pt-2 border-t flex items-center justify-center gap-1 text-xs text-gray-400"
                  >
                    {expandidos.includes(pedido.id) ? 'Ocultar itens' : 'Ver itens'} 
                    {expandidos.includes(pedido.id) ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                  </button>

                  {expandidos.includes(pedido.id) && (
                    <div className="mt-2 bg-gray-50 p-2 rounded text-sm space-y-1">
                      {pedido.itens.map((item: any) => (
                        <p key={item.id}>• {item.quantidade}x {item.produto.nome}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {pedidos.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-400">
            <Package size={64} className="mx-auto mb-4 opacity-20" />
            <p>Tudo entregue! Sem pedidos pendentes.</p>
          </div>
        )}
      </div>

      {/* FOOTER FLUTUANTE (Só aparece se tiver selecionado) */}
      {selecionados.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-20 animate-in slide-in-from-bottom">
          <div className="flex justify-between items-center mb-3 text-sm font-medium text-gray-600">
            <span>{selecionados.length} pedido(s) selecionado(s)</span>
            <button onClick={() => setSelecionados([])} className="text-red-500">Cancelar</button>
          </div>
          <button 
            onClick={handleGerarRota}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-blue-200 shadow-xl"
          >
            <Navigation /> GERAR ROTA E SAIR
          </button>
        </div>
      )}
    </div>
  )
}