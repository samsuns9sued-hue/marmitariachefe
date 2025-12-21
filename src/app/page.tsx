import Link from 'next/link'
import { ChefHat, ShoppingBag, Settings } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <ChefHat size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {process.env.NEXT_PUBLIC_NOME_LOJA || 'Marmitaria'}
        </h1>
        <p className="text-gray-600">Sistema de Pedidos Online</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Link
          href="/pedir"
          className="w-full flex items-center justify-center gap-3 bg-primary-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-primary-600 active:scale-95 transition-all shadow-lg"
        >
          <ShoppingBag size={24} />
          Fazer Pedido
        </Link>

        <Link
          href="/admin"
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-gray-50 active:scale-95 transition-all shadow border"
        >
          <Settings size={24} />
          Painel Admin
        </Link>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>Desenvolvido com ❤️</p>
      </footer>
    </main>
  )
}