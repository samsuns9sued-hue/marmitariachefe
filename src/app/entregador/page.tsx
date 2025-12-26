'use client'

import { useState, useEffect } from 'react'
import { getPedidosParaEntrega, iniciarRotaEntrega, finalizarEntrega } from '@/lib/actions'
import { MapPin, Navigation, CheckCircle, Package, RefreshCw, ChevronDown, ChevronUp, Map } from 'lucide-react'
import { toast } from 'sonner'

// --- ⚠️ MUDANÇA ESTRATÉGICA: USAR APENAS O ESTADO ---
// Isso permite que o Google decida se é Cuiabá ou Várzea Grande pelo Bairro
const ESTADO_PADRAO = "Mato Grosso, Brasil" 
// ---------------------------------------------------

export default function EntregadorPage() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [expandidos, setExpandidos] = useState<string[]>([])

  const carregar = async () => {
    setLoading(true)
    const dados = await getPedidosParaEntrega()
    setPedidos(dados)
    setLoading(false)
  }

  useEffect(() => {
    carregar()
    const intervalo = setInterval(carregar, 30000)
    return () => clearInterval(intervalo)
  }, [])

  const toggleSelecao = (id: string) => {
    if (selecionados.includes(id)) {
      setSelecionados(prev => prev.filter(item => item !== id))
    } else {
      setSelecionados(prev => [...prev, id])
    }
  }

  const toggleDetalhes = (id: string) => {
    if (expandidos.includes(id)) {
      setExpandidos(prev => prev.filter(item => item !== id))
    } else {
      setExpandidos(prev => [...prev, id])
    }
  }

  // --- FUNÇÃO DE MAPAS CORRIGIDA (VERSÃO BLINDADA) ---
  const abrirGoogleMaps = (listaPedidos: any[]) => {
    if (listaPedidos.length === 0) return

    const destinos = listaPedidos.map(p => {
      // Endereço Bruto: "Rua Fagundes Santiago, Nº 492 - CEP: 78120510"
      
      let ruaENumero = p.cliente.endereco
        // Remove CEP e o número do cep (ex: CEP: 12345-678 ou CEP 12345678)
        .replace(/CEP[:\s]*\d{5}[-]?\d{3}/gi, '')
        .replace(/CEP[:\s]*\d+/gi, '') 
        // Remove "Nº" ou "nº"
        .replace(/Nº/gi, '')
        // Remove traços soltos
        .replace(/-/g, ' ')
        // Remove espaços duplos
        .replace(/\s+/g, ' ')
        .trim()
      
      // Remove vírgula final se tiver
      if (ruaENumero.endsWith(',')) ruaENumero = ruaENumero.slice(0, -1)

      // MONTAGEM INTELIGENTE: Rua 123, Bairro, Estado
      // O Google acha melhor a cidade pelo bairro do que forçar uma cidade errada
      return `${ruaENumero}, ${p.cliente.bairro}, ${ESTADO_PADRAO}`
    })

    // Separa o último (Destino) dos outros (Paradas)
    const destinoFinal = encodeURIComponent(destinos.pop() || "")
    const paradas = destinos.map(e => encodeURIComponent(e)).join('|')

    let urlMaps = `https://www.google.com/maps/dir/?api=1&destination=${destinoFinal}&travelmode=motorcycle`

    if (paradas.length > 0) {
      urlMaps += `&waypoints=${paradas}`
    }
    
    window.open(urlMaps, '_blank')
  }

  const handleGerarRota = async () => {
    if (selecionados.length === 0) return toast.error('Selecione pelo menos um pedido')

    const pedidosRota = pedidos.filter(p => selecionados.includes(p.id))
    
    toast.loading('Iniciando rota...')
    await iniciarRotaEntrega(selecionados)
    toast.dismiss()
    toast.success('Rota iniciada!')

    abrirGoogleMaps(pedidosRota)
    
    setSelecionados([])
    carregar()
  }

  const handleReabrirRota = () => {
    const emRota = pedidos.filter(p => p.status === 'SAIU_ENTREGA')
    abrirGoogleMaps(emRota)
  }

  const handleEntregue = async (id: string) => {
    if(!confirm('Confirmar entrega realizada?')) return
    await finalizarEntrega(id)
    toast.success('Entrega baixada!')
    carregar()
  }

  const pendentes = pedidos.filter(p => p.status === 'EM_PREPARO')
  const emRota = pedidos.filter(p => p.status === 'SAIU_ENTREGA')

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      <header className="bg-gray-900 text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <div>
          <h1 className="font-bold text-xl flex items-center gap-2">
            <Navigation className="text-yellow-400" /> Entregas
          </h1>
          <p className="text-xs text-gray-400">Região: {ESTADO_PADRAO}</p>
        </div>
        <button onClick={carregar} className="p-2 bg-gray-800 rounded-full">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="p-4 space-y-6">
        
        {/* LISTA 1: PENDENTES */}
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

        {/* LISTA 2: EM ROTA */}
        {emRota.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 mb-2 flex items-center gap-2 mt-4">
              <Navigation size={18} /> Em Rota ({emRota.length})
            </h2>
            <div className="space-y-3">
              {emRota.map(pedido => (
                <div key={pedido.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">#{pedido.numero} - {pedido.cliente.nome}</h3>
                      
                      {/* Endereço Visual Limpo */}
                      <p className="text-sm text-gray-600 font-medium">
                        {pedido.cliente.endereco.replace('CEP:', '').split('-')[0]}
                      </p>
                      
                      <p className="text-xs text-gray-500">{pedido.cliente.bairro}</p>
                      <div className="mt-2 text-xs bg-gray-100 inline-block px-2 py-1 rounded">
                        Cobrar: <span className="font-bold text-red-600">R$ {pedido.total.toFixed(2)}</span> ({pedido.formaPagamento})
                        {pedido.trocoPara && <span> | Troco: {pedido.trocoPara}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEntregue(pedido.id); }}
                      className="bg-green-600 text-white p-3 rounded-xl flex flex-col items-center gap-1 shadow-lg active:scale-95"
                    >
                      <CheckCircle size={24} />
                      <span className="text-[10px] font-bold">BAIXAR</span>
                    </button>
                  </div>
                  <button onClick={() => toggleDetalhes(pedido.id)} className="w-full mt-3 pt-2 border-t flex items-center justify-center gap-1 text-xs text-gray-400">
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
            <p>Tudo entregue por enquanto!</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 flex flex-col gap-2">
        {selecionados.length > 0 && (
          <button 
            onClick={handleGerarRota}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-bottom"
          >
            <Navigation /> INICIAR {selecionados.length} ENTREGAS
          </button>
        )}

        {emRota.length > 0 && selecionados.length === 0 && (
          <button 
            onClick={handleReabrirRota}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
            <Map /> REABRIR MAPA DA ROTA
          </button>
        )}
      </div>
    </div>
  )
}