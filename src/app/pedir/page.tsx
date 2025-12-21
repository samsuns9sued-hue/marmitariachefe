// src/app/pedir/page.tsx
import { getCardapio } from '@/lib/actions'
import LojaView from '@/components/LojaView'
import { 
  Clock, 
  MapPin, 
  Star, 
  ChefHat, 
  Calendar,
  Flame,
  Phone,
  Heart
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PedirPage() {
  const dados = await getCardapio()

  // Truque: transformamos em 'any' para o TypeScript não reclamar que falta a logoUrl
  const config = dados.config as any

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-100">
      {/* Hero Header Premium */}
      <header className="relative overflow-hidden">
        {/* Background com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-red-600" />
        
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Círculos decorativos */}
          <div className="absolute top-[-50%] right-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-30%] left-[-20%] w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" />
          
          {/* Padrão de círculos */}
          <div className="absolute top-8 right-8 w-24 h-24 border-4 border-white/10 rounded-full" />
          <div className="absolute top-16 right-16 w-16 h-16 border-4 border-white/10 rounded-full" />
          <div className="absolute bottom-20 left-6 w-20 h-20 border-4 border-white/10 rounded-full" />
          
          {/* Padrão de pontos */}
          <div className="absolute top-6 left-6 grid grid-cols-3 gap-1.5 opacity-20">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-white rounded-full" />
            ))}
          </div>
        </div>
        
        <div className="relative px-4 pt-6 pb-8">
          {/* Topo com badge */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
              <Flame size={14} className="text-yellow-300" />
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                Comida Caseira de Verdade
              </span>
              <Flame size={14} className="text-yellow-300" />
            </div>
          </div>

          {/* Logo e Nome Principal */}
          <div className="flex flex-col items-center text-center mb-6">
            {/* Logo/Avatar da Loja */}
            <div className="relative mb-4">
              {/* Brilho de fundo */}
              <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl scale-110" />
              
              <div className="relative w-24 h-24 bg-white rounded-3xl shadow-2xl shadow-black/20 flex items-center justify-center overflow-hidden ring-4 ring-white/30">
                {config?.logoUrl ? (
                  <img 
                    src={config.logoUrl} 
                    alt="Marmitaria do Chefe"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 w-full h-full flex items-center justify-center">
                    <ChefHat size={48} className="text-white" />
                  </div>
                )}
              </div>
              
              {/* Estrela decorativa */}
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1.5 shadow-lg">
                <Star size={14} className="text-yellow-800 fill-yellow-800" />
              </div>
            </div>
            
            {/* Nome do Restaurante */}
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              Marmitaria
            </h1>
            <h2 className="text-2xl font-black text-yellow-300 tracking-tight -mt-1 flex items-center gap-2">
              do Chefe
              <span className="text-2xl">👨‍🍳</span>
            </h2>
            
            {/* Linha decorativa */}
            <div className="flex items-center gap-2 mt-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/40" />
              <Heart size={12} className="text-red-200 fill-red-200" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/40" />
            </div>
              
            {/* Avaliação */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-white">4.8</span>
                <span className="text-white/70 text-sm">(127)</span>
              </div>
              <span className="text-white/60">•</span>
              <span className="text-white/90 text-sm font-medium">🛵 Delivery</span>
            </div>
          </div>

          {/* Cards de Informação Horizontais */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {/* Status Aberto/Fechado */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap shadow-lg ${
              config?.aceitaPedidos 
                ? 'bg-green-500 text-white shadow-green-500/30' 
                : 'bg-gray-700 text-white shadow-gray-700/30'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                config?.aceitaPedidos ? 'bg-white animate-pulse' : 'bg-gray-400'
              }`} />
              {config?.aceitaPedidos ? 'Aberto Agora' : 'Fechado'}
            </div>

            {/* Dias de Funcionamento */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl text-sm whitespace-nowrap border border-white/10">
              <Calendar size={16} className="text-yellow-300" />
              <span className="text-white font-medium">Seg a Sáb</span>
            </div>

            {/* Horário */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl text-sm whitespace-nowrap border border-white/10">
              <Clock size={16} className="text-yellow-300" />
              <span className="text-white font-medium">10h às 14h</span>
            </div>

            {/* Tempo de Entrega */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl text-sm whitespace-nowrap border border-white/10">
              <span className="text-lg">🚀</span>
              <span className="text-white font-medium">30-45 min</span>
            </div>

            {/* Taxa de Entrega */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl text-sm whitespace-nowrap border border-white/10">
              <MapPin size={16} className="text-yellow-300" />
              <span className="text-white font-medium">
                {config?.taxaEntrega === 0 
                  ? 'Entrega Grátis! 🎉' 
                  : `Taxa: R$ ${config?.taxaEntrega?.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Mensagem de boas-vindas */}
          <div className="mt-4 text-center">
            <p className="text-white/80 text-sm font-medium">
              ✨ Escolha sua marmita favorita abaixo!
            </p>
          </div>
        </div>

        {/* Curva decorativa elegante */}
        <div className="relative h-6">
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-amber-50 to-gray-100 rounded-t-[2rem]" />
          {/* Sombra sutil */}
          <div className="absolute inset-x-0 -top-4 h-8 bg-gradient-to-b from-black/5 to-transparent rounded-t-[2rem]" />
        </div>
      </header>

      {/* Componente da Loja - MANTIDO ORIGINAL */}
      <LojaView 
        produtos={dados.produtos} 
        tamanhos={dados.tamanhos} 
        config={config} 
      />
    </main>
  )
}