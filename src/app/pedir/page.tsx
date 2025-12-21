// src/app/pedir/page.tsx
import { getCardapio } from '@/lib/actions'
import LojaView from '@/components/LojaView'
import { Clock, MapPin, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PedirPage() {
  const dados = await getCardapio()

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Hero Header com Gradiente */}
      <header className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white">
        {/* Padrão decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute bottom-4 right-4 w-24 h-24 border-4 border-white rounded-full" />
        </div>
        
        <div className="relative px-4 pt-8 pb-6">
          {/* Logo/Avatar da Loja */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {dados.config?.logoUrl ? (
                <img 
                  src={dados.config.logoUrl} 
                  alt={dados.config?.nomeLoja}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">🍽️</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">
                {dados.config?.nomeLoja || 'Restaurante'}
              </h1>
              
              {/* Avaliação */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-sm">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.8</span>
                </div>
                <span className="text-white/80 text-sm">• Delivery</span>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-1 -mx-4 px-4">
            {/* Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              dados.config?.aceitaPedidos 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-800 text-white'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                dados.config?.aceitaPedidos ? 'bg-white animate-pulse' : 'bg-gray-400'
              }`} />
              {dados.config?.aceitaPedidos ? 'Aberto agora' : 'Fechado'}
            </div>

            {/* Tempo de Entrega */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm whitespace-nowrap">
              <Clock size={16} />
              <span>30-45 min</span>
            </div>

            {/* Taxa de Entrega */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm whitespace-nowrap">
              <MapPin size={16} />
              <span>
                {dados.config?.taxaEntrega === 0 
                  ? 'Entrega Grátis' 
                  : `R$ ${dados.config?.taxaEntrega?.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Curva decorativa */}
        <div className="h-4 bg-gray-100 rounded-t-3xl" />
      </header>

      {/* Componente da Loja */}
      <LojaView 
        produtos={dados.produtos} 
        tamanhos={dados.tamanhos} 
        config={dados.config} 
      />
    </main>
  )
}