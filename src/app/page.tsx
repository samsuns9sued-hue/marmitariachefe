import Link from 'next/link'
import { 
  ChefHat, 
  ChevronRight, 
  Clock, 
  Calendar, 
  Flame,
  Star,
  Heart
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Círculos decorativos */}
        <div className="absolute top-[-20%] right-[-15%] w-96 h-96 bg-gradient-to-br from-orange-200 to-amber-100 rounded-full opacity-60 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-15%] w-96 h-96 bg-gradient-to-tr from-red-200 to-orange-100 rounded-full opacity-60 blur-3xl" />
        <div className="absolute top-[30%] left-[10%] w-32 h-32 bg-yellow-200 rounded-full opacity-40 blur-2xl" />
        
        {/* Padrão de pontos decorativos */}
        <div className="absolute top-20 right-20 grid grid-cols-3 gap-2 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-orange-400 rounded-full" />
          ))}
        </div>
        <div className="absolute bottom-32 left-16 grid grid-cols-3 gap-2 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-red-400 rounded-full" />
          ))}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg animate-in slide-in-from-bottom-10 duration-700 fade-in">
        
        {/* Badge de destaque */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6 border border-orange-100">
          <Flame size={16} className="text-orange-500" />
          <span className="text-sm font-medium text-gray-700">Comida Caseira de Verdade</span>
          <Flame size={16} className="text-orange-500" />
        </div>

        {/* Logo / Ícone do Chefe */}
        <div className="relative mb-8">
          {/* Anel decorativo externo */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-xl opacity-40 scale-110" />
          
          {/* Container do ícone */}
          <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-red-600 p-8 rounded-full shadow-2xl shadow-red-200/50 transform hover:scale-105 hover:rotate-3 transition-all duration-500 group">
            {/* Brilho interno */}
            <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
            <ChefHat size={72} className="text-white relative z-10 group-hover:animate-bounce" />
          </div>
          
          {/* Estrelas decorativas */}
          <Star size={20} className="absolute -top-2 -right-2 text-yellow-400 fill-yellow-400 animate-pulse" />
          <Star size={14} className="absolute -bottom-1 -left-3 text-yellow-400 fill-yellow-400 animate-pulse delay-300" />
        </div>

        {/* Nome do Restaurante */}
        <div className="mb-2">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-red-700 to-orange-600 tracking-tight leading-tight">
            Marmitaria
          </h1>
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-red-700 tracking-tight -mt-2">
            do Chefe
          </h2>
        </div>

        {/* Linha decorativa */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-300" />
          <Heart size={16} className="text-red-400 fill-red-400" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-300" />
        </div>
        
        {/* Descrição */}
        <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-md leading-relaxed font-medium">
          Sabor de comida caseira com o capricho de um chef. 
          <span className="block mt-1">Feita com amor, entregue quentinha! 🍲👨‍🍳</span>
        </p>

        {/* Cards de Informação */}
        <div className="flex flex-wrap justify-center gap-4 mb-10 w-full max-w-sm">
          {/* Card de Dias */}
          <div className="flex-1 min-w-[140px] bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-orange-100/50 border border-orange-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="bg-gradient-to-br from-orange-100 to-amber-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar size={24} className="text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Dias</p>
            <p className="text-gray-800 font-bold text-sm mt-1">Segunda a Sábado</p>
          </div>
          
          {/* Card de Horário */}
          <div className="flex-1 min-w-[140px] bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-orange-100/50 border border-orange-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="bg-gradient-to-br from-red-100 to-orange-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock size={24} className="text-red-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Horário</p>
            <p className="text-gray-800 font-bold text-sm mt-1">10h às 14h</p>
          </div>
        </div>

        {/* Botão de Pedido Principal */}
        <Link 
          href="/pedir"
          className="group relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white font-bold py-5 px-12 rounded-full shadow-2xl shadow-red-300/50 hover:shadow-red-400/60 hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center gap-4 text-lg"
        >
          {/* Brilho animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          <span className="relative z-10 tracking-wide">FAZER MEU PEDIDO</span>
          <div className="relative z-10 bg-white/25 rounded-full p-2 group-hover:translate-x-1 group-hover:bg-white/30 transition-all duration-300">
            <ChevronRight size={22} strokeWidth={3} />
          </div>
        </Link>

        {/* Indicador de chamada */}
        <div className="mt-6 flex items-center gap-2 text-gray-500 animate-pulse">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm font-medium">Estamos abertos agora!</span>
        </div>

        {/* Rodapé com informações */}
        <div className="mt-12 pt-6 border-t border-orange-100/50 w-full max-w-xs">
          <p className="text-sm text-gray-400 font-medium">
            📍 Delivery e Retirada no Local
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Peça já e receba sua marmita quentinha!
          </p>
        </div>
      </div>

      {/* Decoração inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400" />
    </main>
  )
}