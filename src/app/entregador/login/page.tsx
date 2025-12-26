'use client'

import { useFormState } from 'react-dom'
import { verificarLoginEntregador } from '@/lib/actions'
import { Navigation, Bike } from 'lucide-react'

export default function LoginEntregador() {
  // @ts-ignore
  const [state, formAction] = useFormState(verificarLoginEntregador, null)

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-yellow-400 p-6 flex flex-col items-center">
          <div className="bg-gray-900 p-3 rounded-full mb-2">
            <Navigation className="text-yellow-400" size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 uppercase">Área do Entregador</h1>
          <p className="text-gray-800 font-medium text-sm">Acesso Restrito</p>
        </div>

        {/* Formulário */}
        <div className="p-8">
          <form action={formAction} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Senha de Acesso</label>
              <input 
                type="password" 
                name="senha"
                placeholder="••••••"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-xl tracking-widest focus:border-yellow-400 focus:outline-none"
              />
            </div>

            {state?.error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center font-bold">
                {state.error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-transform active:scale-95 shadow-lg"
            >
              ENTRAR
            </button>
          </form>
        </div>
      </div>
      
      <p className="text-gray-500 text-xs mt-8">Sistema de Logística v1.0</p>
    </div>
  )
}