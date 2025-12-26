'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getPedidosHoje, atualizarStatusPedido, logout } from '@/lib/actions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Printer, RefreshCw, CheckCircle, Truck, Clock, LogOut, MapPin, Utensils, Ruler, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
// 1. Importação do componente de impressão
import ImpressaoRecibo from '@/components/ImpressaoRecibo'

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  
  // 2. Estado para guardar qual pedido vai ser impresso
  const [pedidoParaImprimir, setPedidoParaImprimir] = useState<any>(null)

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

  // 3. Função que aciona a impressão
  const handleImprimir = (pedido: any) => {
    setPedidoParaImprimir(pedido)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  // --- NOVA FUNÇÃO: GERAR MENSAGEM WHATSAPP PADRONIZADA ---
  const gerarLinkZapConfirmacao = (pedido: any) => {
    const telefone = pedido.cliente.telefone.replace(/\D/g, '')
    const primeiroNome = pedido.cliente.nome.split(' ')[0]
    
    // Lista os itens para a mensagem
    const itensMsg = pedido.itens.map((i: any) => {
      let itemTexto = `▪️ ${i.quantidade}x ${i.produto.nome}`
      if (i.tamanho) itemTexto += ` (${i.tamanho.nome})`
      return itemTexto
    }).join('\n')

    const mensagem = 
`Olá *${primeiroNome}*! Tudo bem? 👋😃
Aqui é da *Marmitaria do Chefe*.

Recebemos seu pedido com sucesso! ✅
Já estamos preparando com todo carinho. 🥘❤️

*📝 RESUMO DO PEDIDO #${pedido.numero}:*
${itensMsg}

*💰 Total:* R$ ${pedido.total.toFixed(2)}
*📍 Entrega em:* ${pedido.cliente.endereco}

Assim que sair para entrega te avisamos! 🛵💨`

    return `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`
  }
  // --------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      
      {/* 4. Componente Invisível que só aparece na impressão */}
      <ImpressaoRecibo pedido={pedidoParaImprimir} />

      {/* Cabeçalho (some na impressão) */}
      <div className="flex justify-between items-center mb-4 print:hidden">
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

      {/* Menu de Navegação (some na impressão) */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide print:hidden">
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

      {/* Lista de Pedidos (some na impressão) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print:hidden">
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
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg leading-tight">
                    #{pedido.numero} - {pedido.cliente.nome}
                  </h3>
                  {/* --- ATUALIZAÇÃO 1: HORÁRIO DO PEDIDO --- */}
                  <span className="text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    {format(new Date(pedido.createdAt), 'HH:mm')}
                  </span>
                </div>

                {/* --- ATUALIZAÇÃO 2: BOTÃO WHATSAPP PROFISSIONAL --- */}
                <a 
                  href={gerarLinkZapConfirmacao(pedido)} 
                  target="_blank" 
                  className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1 mt-1 bg-green-50 w-fit px-2 py-1 rounded-full border border-green-100 transition-colors hover:bg-green-100"
                >
                  <MessageCircle size={14} />
                  Confirmar no WhatsApp
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
                <button 
                  onClick={() => handleImprimir(pedido)}
                  title="Imprimir" 
                  className="flex items-center justify-center p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                >
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
                 {pedido.status === 'ENTREGUE' && (
                  <div className="col-span-3 flex items-center justify-center text-green-600 font-bold text-sm bg-green-50 rounded border border-green-200">
                    Concluído
                  </div>
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