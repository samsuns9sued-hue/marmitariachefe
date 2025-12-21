import Link from 'next/link'
import { Utensils, ChevronRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Círculos decorativos de fundo */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-red-100 rounded-full opacity-50 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-orange-100 rounded-full opacity-50 blur-3xl" />

      {/* Conteúdo Central */}
      <div className="relative z-10 flex flex-col items-center text-center animate-in slide-in-from-bottom-10 duration-700 fade-in">
        
        {/* Logo / Ícone */}
        <div className="bg-gradient-to-br from-red-600 to-orange-500 p-6 rounded-3xl shadow-xl mb-8 transform hover:scale-105 transition-transform duration-300">
          <Utensils size={64} className="text-white" />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-800 mb-3 tracking-tight">
          Marmitaria da Mãe
        </h1>
        
        <p className="text-gray-500 text-lg mb-10 max-w-xs leading-relaxed">
          Comida caseira de verdade, feita com amor e entregue quentinha na sua porta. 🥘❤️
        </p>

        {/* Botão de Pedido (Corrigido para Vermelho com Texto Branco) */}
        <Link 
          href="/pedir"
          className="group relative bg-red-600 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-red-300 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 text-lg"
        >
          <span>FAZER MEU PEDIDO</span>
          <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
            <ChevronRight size={20} />
          </div>
        </Link>

        {/* Rodapé simples */}
        <p className="mt-12 text-sm text-gray-400">
          Atendemos todos os dias para o almoço
        </p>
      </div>
    </main>
  )
}