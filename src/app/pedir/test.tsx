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

  let statusBadge

  // Regras de Horário
  if (horaCuiaba >= 10 && horaCuiaba < 13) {
    statusBadge = (
      <div className="flex items-center gap-2 bg-green-500 text-white px-6 py-2.5 rounded-full shadow-lg shadow-green-900/20 animate-in zoom-in border border-white/20">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <span className="font-bold text-sm uppercase tracking-wide">Aberto agora</span>
      </div>
    )
  } 
  else if (horaCuiaba === 13) {
    statusBadge = (
      <div className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-full shadow-lg shadow-orange-900/20 animate-in zoom-in border border-white/20">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <span className="font-bold text-sm tracking-wide">Aberto agora • Peça até as 14hrs</span>
      </div>
    )
  } 
  else {
    statusBadge = (
      <div className="flex items-center gap-2 bg-gray-800 text-white/90 px-6 py-2.5 rounded-full shadow-lg border border-white/10">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
        <span className="font-bold text-sm uppercase tracking-wide">Fechado agora</span>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-100">
      
      {/* Hero Header Premium (Visual Mantido) */}
      <header className="relative overflow-hidden">
        {/* Background com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-red-600" />
        
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-50%] right-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-30%] left-[-20%] w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute top-8 right-8 w-24 h-24 border-4 border-white/10 rounded-full" />
          <div className="absolute top-16 right-16 w-16 h-16 border-4 border-white/10 rounded-full" />
          <div className="absolute bottom-20 left-6 w-20 h-20 border-4 border-white/10 rounded-full" />
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
          <div className="flex flex-col items-center text-center mb-2">
            {/* Logo/Avatar da Loja */}
            <div className="relative mb-4">
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
            <div className="flex items-center gap-2 mt-2 mb-6">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/40" />
              <Heart size={12} className="text-red-200 fill-red-200" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/40" />
            </div>

            {/* --- NOVO STATUS DE FUNCIONAMENTO --- */}
            <div className="flex justify-center w-full">
              {!config?.aceitaPedidos ? (
                // Se fechado manualmente no Admin
                <div className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-full shadow-lg border border-white/20">
                  <span className="font-bold text-sm uppercase">Fechado Temporariamente</span>
                </div>
              ) : (
                // Se aberto, usa a lógica de horário
                statusBadge
              )}
            </div>
            {/* ------------------------------------ */}
          </div>
        </div>

        {/* Curva decorativa elegante */}
        <div className="relative h-6">
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-amber-50 to-gray-100 rounded-t-[2rem]" />
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