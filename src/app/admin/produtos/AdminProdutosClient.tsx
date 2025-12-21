'use client'

import { useState, useTransition } from 'react'
import { salvarProduto, toggleDisponibilidade, deletarProduto } from '@/lib/actions'
import { 
  Pencil, Trash, Plus, Eye, EyeOff, X, 
  Save, Image as ImageIcon, Loader2, 
  Package, Search
} from 'lucide-react'
import { toast } from 'sonner'

// AQUI ESTAVA O ERRO: Mudei preco para aceitar null
type Produto = {
  id: string
  nome: string
  descricao: string | null
  preco: number | null 
  categoria: string
  imagem: string | null
  disponivel: boolean
  ordem: number
}

type FormData = {
  id?: string
  nome: string
  descricao: string
  preco: string
  categoria: string
  imagem: string
}

const categorias = [
  { id: 'MISTURA', nome: 'Prato Principal', emoji: '🍛' },
  { id: 'COMPLEMENTO', nome: 'Porção/Complemento', emoji: '🍟' },
  { id: 'BEBIDA', nome: 'Bebida', emoji: '🥤' },
]

export default function AdminProdutosClient({ produtos: produtosIniciais }: { produtos: Produto[] }) {
  const [produtos, setProdutos] = useState(produtosIniciais)
  const [modalAberto, setModalAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    descricao: '',
    preco: '',
    categoria: 'MISTURA',
    imagem: ''
  })
  const [editandoId, setEditandoId] = useState<string | null>(null)

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = !filtroCategoria || p.categoria === filtroCategoria
    return matchBusca && matchCategoria
  })

  // Abrir modal para novo produto
  const abrirModalNovo = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco: '',
      categoria: 'MISTURA',
      imagem: ''
    })
    setEditandoId(null)
    setModalAberto(true)
  }

  // Abrir modal para editar
  const abrirModalEditar = (produto: Produto) => {
    setFormData({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: produto.preco ? produto.preco.toString() : '',
      categoria: produto.categoria,
      imagem: produto.imagem || ''
    })
    setEditandoId(produto.id)
    setModalAberto(true)
  }

  // Salvar produto
  const handleSalvar = async () => {
    if (!formData.nome.trim()) {
      toast.error('Preencha o nome do produto')
      return
    }

    startTransition(async () => {
      try {
        const payload = {
          id: editandoId || undefined,
          nome: formData.nome,
          descricao: formData.descricao,
          preco: parseFloat(formData.preco) || 0,
          categoria: formData.categoria,
          imagem: formData.imagem || null
        }

        const result = await salvarProduto(payload)
        
        if (result.success && result.produto) {
          toast.success(editandoId ? 'Produto atualizado!' : 'Produto criado!')
          setModalAberto(false)
          
          // Atualiza lista local com tipagem correta
          if (editandoId) {
            setProdutos(produtos.map(p => 
              p.id === editandoId ? { ...p, ...result.produto } : p
            ))
          } else {
            setProdutos([...produtos, result.produto])
          }
        } else {
          toast.error('Erro ao salvar produto')
        }
      } catch (error) {
        toast.error('Erro ao salvar produto')
      }
    })
  }

  // Toggle disponibilidade
  const handleToggle = async (id: string, atual: boolean) => {
    startTransition(async () => {
      await toggleDisponibilidade(id, atual)
      setProdutos(produtos.map(p => 
        p.id === id ? { ...p, disponivel: !atual } : p
      ))
      toast.success(atual ? 'Produto desativado' : 'Produto ativado')
    })
  }

  // Deletar produto
  const handleDeletar = async (id: string, nome: string) => {
    if (!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return
    
    startTransition(async () => {
      await deletarProduto(id)
      setProdutos(produtos.filter(p => p.id !== id))
      toast.success('Produto excluído')
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="text-red-600" />
                Gerenciar Cardápio
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {produtos.length} produto(s) cadastrado(s)
              </p>
            </div>
            
            <button 
              onClick={abrirModalNovo}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-red-200 transition-all hover:scale-105"
            >
              <Plus size={20} />
              Novo Produto
            </button>
          </div>

          {/* Barra de Busca e Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFiltroCategoria(null)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  !filtroCategoria 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Todos
              </button>
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFiltroCategoria(cat.id)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    filtroCategoria === cat.id 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.nome}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Lista de Produtos */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {produtosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Package size={64} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-400">
              {busca || filtroCategoria 
                ? 'Tente ajustar os filtros' 
                : 'Comece adicionando seu primeiro produto'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {produtosFiltrados.map((produto) => (
              <div 
                key={produto.id} 
                className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  !produto.disponivel ? 'opacity-60' : ''
                }`}
              >
                {/* Imagem */}
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                  {produto.imagem ? (
                    <img 
                      src={produto.imagem} 
                      alt={produto.nome} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={48} className="text-gray-300" />
                    </div>
                  )}
                  
                  {/* Badge de Categoria */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                    {categorias.find(c => c.id === produto.categoria)?.emoji}{' '}
                    {categorias.find(c => c.id === produto.categoria)?.nome}
                  </span>

                  {/* Badge de Status */}
                  {!produto.disponivel && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Indisponível
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 truncate">
                    {produto.nome}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2 min-h-[40px]">
                    {produto.descricao || 'Sem descrição'}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-red-600">
                      {(produto.preco || 0) > 0 
                        ? `R$ ${(produto.preco || 0).toFixed(2)}` 
                        : 'Por tamanho'}
                    </span>
                    
                    {/* Ações */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggle(produto.id, produto.disponivel)}
                        disabled={isPending}
                        className={`p-2.5 rounded-xl transition-all ${
                          produto.disponivel 
                            ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                            : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                        }`}
                        title={produto.disponivel ? 'Desativar' : 'Ativar'}
                      >
                        {produto.disponivel ? <Eye size={18}/> : <EyeOff size={18}/>}
                      </button>
                      
                      <button 
                        onClick={() => abrirModalEditar(produto)}
                        className="p-2.5 text-blue-600 bg-blue-100 rounded-xl hover:bg-blue-200 transition-all"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      
                      <button 
                        onClick={() => handleDeletar(produto.id, produto.nome)}
                        disabled={isPending}
                        className="p-2.5 text-red-600 bg-red-100 rounded-xl hover:bg-red-200 transition-all"
                        title="Excluir"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE FORMULÁRIO */}
      {modalAberto && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !isPending && setModalAberto(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {editandoId ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <p className="text-red-100 text-sm mt-0.5">
                  Preencha as informações abaixo
                </p>
              </div>
              <button 
                onClick={() => setModalAberto(false)}
                disabled={isPending}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview da Imagem */}
            {formData.imagem && (
              <div className="h-40 bg-gray-100 relative">
                <img 
                  src={formData.imagem} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-3 left-3 text-white text-sm font-medium">
                  Preview da imagem
                </span>
              </div>
            )}

            {/* Formulário */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSalvar(); }}
              className="p-5 space-y-4"
            >
              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Ex: Marmita Completa"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors resize-none"
                  placeholder="Descreva os ingredientes ou detalhes..."
                  rows={3}
                />
              </div>

              {/* Preço e Categoria em Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Deixe 0 para preço por tamanho
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Categoria *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors bg-white"
                    required
                  >
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* URL da Imagem */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  URL da Imagem
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="url"
                    value={formData.imagem}
                    onChange={(e) => setFormData({...formData, imagem: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Cole a URL de uma imagem (PNG, JPG, WebP)
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={isPending}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || !formData.nome.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editandoId ? 'Atualizar' : 'Criar Produto'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}