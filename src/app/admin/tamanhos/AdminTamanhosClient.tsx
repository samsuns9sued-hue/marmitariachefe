'use client'

import { useState, useTransition } from 'react'
import { salvarTamanho, toggleTamanhoAtivo, deletarTamanho } from '@/lib/actions'
import { Pencil, Trash, Plus, Eye, EyeOff, X, Save, Ruler, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Tamanho = {
  id: string
  nome: string
  descricao: string | null
  preco: number
  ativo: boolean
  ordem: number
}

export default function AdminTamanhosClient({ tamanhos }: { tamanhos: Tamanho[] }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    descricao: '',
    preco: '',
    ordem: ''
  })

  const abrirModal = (tamanho?: Tamanho) => {
    if (tamanho) {
      setFormData({
        id: tamanho.id,
        nome: tamanho.nome,
        descricao: tamanho.descricao || '',
        preco: tamanho.preco.toString(),
        ordem: tamanho.ordem.toString()
      })
    } else {
      setFormData({ id: '', nome: '', descricao: '', preco: '', ordem: '' })
    }
    setModalAberto(true)
  }

  const handleSalvar = () => {
    if (!formData.nome || !formData.preco) {
      toast.error('Preencha nome e preço')
      return
    }

    startTransition(async () => {
      await salvarTamanho({
        id: formData.id || undefined,
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        ordem: parseInt(formData.ordem) || 0,
        ativo: true
      })
      toast.success('Salvo com sucesso!')
      setModalAberto(false)
    })
  }

  const handleDeletar = (id: string) => {
    if (!confirm('Tem certeza?')) return
    startTransition(async () => {
      const res = await deletarTamanho(id)
      if (res.success) toast.success('Excluído!')
      else toast.error('Erro ao excluir (pode estar em uso)')
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Ruler className="text-red-600" /> Gerenciar Tamanhos
            </h1>
            <p className="text-gray-500 text-sm">Defina os preços das marmitas</p>
          </div>
          <button onClick={() => abrirModal()} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700">
            <Plus size={20} /> Novo Tamanho
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tamanhos.map((tam) => (
            <div key={tam.id} className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center ${!tam.ativo && 'opacity-60'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{tam.nome}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                    R$ {tam.preco.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{tam.descricao}</p>
                <p className="text-xs text-gray-400 mt-1">Ordem de exibição: {tam.ordem}</p>
              </div>
              
              <div className="flex gap-2">
                 <button 
                  onClick={() => startTransition(() => toggleTamanhoAtivo(tam.id, tam.ativo))}
                  className="p-2 bg-gray-100 rounded text-gray-600 hover:bg-gray-200"
                >
                  {tam.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button onClick={() => abrirModal(tam)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDeletar(tam.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {formData.id ? 'Editar Tamanho' : 'Novo Tamanho'}
              </h3>
              <button onClick={() => setModalAberto(false)}><X size={20} /></button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700">Nome (Ex: P, M, Executiva)</label>
                <input 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full p-2 border rounded-lg mt-1" 
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Descrição (Ex: Serve 1 pessoa)</label>
                <input 
                  value={formData.descricao} 
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                  className="w-full p-2 border rounded-lg mt-1" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">Preço (R$)</label>
                  <input 
                    type="number" step="0.50"
                    value={formData.preco} 
                    onChange={e => setFormData({...formData, preco: e.target.value})}
                    className="w-full p-2 border rounded-lg mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Ordem (1, 2, 3...)</label>
                  <input 
                    type="number"
                    value={formData.ordem} 
                    onChange={e => setFormData({...formData, ordem: e.target.value})}
                    className="w-full p-2 border rounded-lg mt-1" 
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-2">
              <button onClick={() => setModalAberto(false)} className="flex-1 py-2 border rounded-lg">Cancelar</button>
              <button 
                onClick={handleSalvar} 
                disabled={isPending}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold flex justify-center items-center gap-2"
              >
                {isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />} Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}