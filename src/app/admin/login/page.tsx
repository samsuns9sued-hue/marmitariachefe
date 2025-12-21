'use client'

import { verificarLogin } from '@/lib/actions'
import { useFormState } from 'react-dom'

export default function LoginPage() {
  // useFormState é novo no React/Next para lidar com Server Actions
  // @ts-ignore
  const [state, formAction] = useFormState(verificarLogin, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Acesso Restrito</h1>
        
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha do Sistema</label>
            <input 
              type="password" 
              name="senha"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          
          {state?.error && (
            <p className="text-red-500 text-sm text-center">{state.error}</p>
          )}

          <button 
            type="submit"
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-semibold"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}