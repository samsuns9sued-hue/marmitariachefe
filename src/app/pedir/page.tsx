// src/app/pedir/page.tsx
import { getCardapio } from '@/lib/actions'
import LojaView from '@/components/LojaView'
import { Star, ChefHat, Flame, Heart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PedirPage() {
  const dados = await getCardapio()
  const config = dados.config as any

  // --- LÓGICA DE HORÁRIO CUIABÁ/MT ---
  const agora = new Date()
  const horaCuiaba = parseInt(agora.toLocaleTimeString('pt-BR', { 
    timeZone: 'America/Cuiaba', 
    hour: '2-digit', 
    hour12: false 
  }))

  let statusContent

  if (!config?.aceitaPedidos) {
    statusContent = (
      <div className="flex items-center gap-2 text-red-400 animate-pulse">
        <div className="h-2 w-2 rounded-full bg-red-500"></div>
        <span className="font-bold text-sm uppercase tracking-wide">Fechado Temporariamente</span>
      </div>
    )
  } 
  else if (horaCuiaba >= 10 && horaCuiaba < 13) {
    statusContent = (
      <div className="flex items-center gap-2 text-green-400">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="font-bold text-sm uppercase tracking-wide">Aberto agora</span>
      </div>
    )
  } 
  else if (horaCuiaba === 13) {
    statusContent = (
      <div className="flex items-center gap-2 text-orange-400">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
        </span>
        <span className="font-bold text-sm tracking-wide">Aberto agora • Peça até as 14hrs</span>
      </div>
    )
  } 
  else {
    statusContent = (
      <div className="flex items-center gap-2 text-gray-400">
        <div className="h-2 w-2 rounded-full bg-gray-500"></div>
        <span className="font-bold text-sm uppercase tracking-wide">Fechado agora (10h às 14h)</span>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-100">
      
      <header className="relative overflow-hidden flex flex-col">
        {/* Background com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-red-600 z-0" />
        
        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-50%] right-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-30%] left-[-20%] w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute top-8 right-8 w-24 h-24 border-4 border-white/10 rounded-full" />
          <div className="absolute top-6 left-6 grid grid-cols-3 gap-1.5 opacity-20">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-white rounded-full" />
            ))}
          </div>
        </div>
        
        {/* CONTEÚDO PRINCIPAL */}
        <div className="relative z-10 px-4 pt-6 pb-4 flex-1 flex flex-col items-center">
          
          {/* Badge Topo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              <Flame size={14} className="text-yellow-300" />
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                Comida Caseira de Verdade
              </span>
              <Flame size={14} className="text-yellow-300" />
            </div>
          </div>

          {/* ÁREA CENTRAL: LOGO + TÍTULO (Lado a Lado) */}
          <div className="flex flex-row items-center justify-center gap-5 mb-4">
            
            {/* Logo (Esquerda) */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl scale-110" />
              <div className="relative w-20 h-20 bg-white rounded-3xl shadow-2xl shadow-black/20 flex items-center justify-center overflow-hidden ring-4 ring-white/30">
                {config?.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 w-full h-full flex items-center justify-center">
                    <ChefHat size={40} className="text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1.5 shadow-lg">
                <Star size={12} className="text-yellow-800 fill-yellow-800" />
              </div>
            </div>
            
            {/* Título (Direita) */}
            <div className="flex flex-col items-start text-left">
              <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1 shadow-black/10 drop-shadow-sm">
                Marmitaria
              </h1>
              <h2 className="text-2xl font-black text-yellow-300 tracking-tight leading-none flex items-center gap-2 shadow-black/10 drop-shadow-sm">
                do Chefe <span className="text-xl">👨‍🍳</span>
              </h2>
            </div>
          </div>

          {/* Avaliação e Delivery (Abaixo da Logo/Titulo) */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-white">4.8</span>
              <span className="text-white/70 text-sm">(127)</span>
            </div>
            <span className="text-white/60">•</span>
            <span className="text-white/90 text-sm font-medium flex items-center gap-1">
              🛵 Delivery
            </span>
          </div>

          {/* Linha do Coração (Entre Avaliação e Status) */}
          <div className="flex items-center gap-2 mb-2 w-full max-w-xs justify-center opacity-80">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/50" />
            <Heart size={14} className="text-red-200 fill-red-200" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/50" />
          </div>

        </div>

        {/* BARRA PRETA DE STATUS */}
        <div className="relative z-10 w-full bg-black/85 backdrop-blur-md border-t border-white/10 py-3 flex justify-center items-center shadow-lg">
          {statusContent}
        </div>

        {/* Curva decorativa (Colada na barra preta) */}
        <div className="relative h-6 bg-black/85"> 
          <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-amber-50 to-gray-100 rounded-t-[2rem]" />
        </div>
      </header>

      {/* Componente da Loja */}
      <LojaView 
        produtos={dados.produtos} 
        tamanhos={dados.tamanhos} 
        config={config} 
      />
    </main>
  )
}