'use client'

import { useState } from 'react'
import { Plus, Minus, Check } from 'lucide-react'
import { formatarMoeda, classNames } from '@/lib/utils'
import { useCarrinho } from '@/hooks/useCarrinho'

interface Tamanho {
  id: string
  nome: string
  descricao: string | null
  preco: number
}

interface Produto {
  id: string
  nome: string
  descricao: string | null
  disponivel: boolean
  destaque: boolean
}

interface Complemento {
  id: string
  nome: string
  preco: number
}

interface CardapioItemProps {
  produto: Produto
  tamanhos: Tamanho[]
  complementos: Complemento[]
}

export default function CardapioItem({
  produto,
  tamanhos,
  complementos,
}: CardapioItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<Tamanho | null>(null)
  const [complementosSelecionados, setComplementosSelecionados] = useState<Complemento[]>([])
  const [quantidade, setQuantidade] = useState(1)
  const [observacao, setObservacao] = useState('')

  const { addItem, setCarrinhoOpen } = useCarrinho()

  const toggleComplemento = (comp: Complemento) => {
    setComplementosSelecionados((prev) =>
      prev.some((c) => c.id === comp.id)
        ? prev.filter((c) => c.id !== comp.id)
        : [...prev, comp]
    )
  }

  const calcularTotal = () => {
    if (!tamanhoSelecionado) return 0
    const basePrice = tamanhoSelecionado.preco
    const complementosPrice = complementosSelecionados.reduce(
      (acc, c) => acc + c.preco,
      0
    )
    return (basePrice + complementosPrice) * quantidade
  }

  const handleAdicionar = () => {
    if (!tamanhoSelecionado) return

    addItem({
      id: '', // Será gerado no hook
      tamanhoId: tamanhoSelecionado.id,
      tamanhoNome: tamanhoSelecionado.nome,
      tamanhoPreco: tamanhoSelecionado.preco,
      produtoId: produto.id,
      produtoNome: produto.nome,
      complementos: complementosSelecionados,
      quantidade,
      observacao,
      precoTotal: calcularTotal(),
    })

    // Reset
    setIsOpen(false)
    setTamanhoSelecionado(null)
    setComplementosSelecionados([])
    setQuantidade(1)
    setObservacao('')
    setCarrinhoOpen(true)
  }

  if (!produto.disponivel) {
    return (
      <div className="bg-gray-100 rounded-xl p-4 opacity-60">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-500 line-through">
              {produto.nome}
            </h3>
            <p className="text-sm text-gray-400">{produto.descricao}</p>
          </div>
          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
            Esgotado
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header do Item */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-start text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{produto.nome}</h3>
            {produto.destaque && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                ⭐ Destaque
              </span>
            )}
          </div>
          {produto.descricao && (
            <p className="text-sm text-gray-500 mt-1">{produto.descricao}</p>
          )}
          <p className="text-sm text-primary-600 mt-2">
            A partir de {formatarMoeda(tamanhos[0]?.preco || 0)}
          </p>
        </div>
        <div
          className={classNames(
            'w-10 h-10 rounded-full flex items-center justify-center transition-all',
            isOpen
              ? 'bg-primary-500 text-white rotate-45'
              : 'bg-primary-100 text-primary-600'
          )}
        >
          <Plus size={24} />
        </div>
      </button>

      {/* Painel Expandido */}
      {isOpen && (
        <div className="border-t border-gray-100 p-4 space-y-4 animate-slide-down bg-gray-50">
          {/* Tamanhos */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Escolha o tamanho: *
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {tamanhos.map((tamanho) => (
                <button
                  key={tamanho.id}
                  onClick={() => setTamanhoSelecionado(tamanho)}
                  className={classNames(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    tamanhoSelecionado?.id === tamanho.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{tamanho.nome}</span>
                    {tamanhoSelecionado?.id === tamanho.id && (
                      <Check size={20} className="text-primary-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{tamanho.descricao}</p>
                  <p className="text-primary-600 font-semibold mt-1">
                    {formatarMoeda(tamanho.preco)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Complementos */}
          {complementos.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Complementos (opcional)
              </h4>
              <div className="space-y-2">
                {complementos.map((comp) => {
                  const isSelected = complementosSelecionados.some(
                    (c) => c.id === comp.id
                  )
                  return (
                    <button
                      key={comp.id}
                      onClick={() => toggleComplemento(comp)}
                      className={classNames(
                        'w-full p-3 rounded-lg border-2 flex justify-between items-center transition-all',
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={classNames(
                            'w-5 h-5 rounded border-2 flex items-center justify-center',
                            isSelected
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-gray-300'
                          )}
                        >
                          {isSelected && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                        <span className="text-gray-900">{comp.nome}</span>
                      </div>
                      <span className="text-primary-600 font-medium">
                        + {formatarMoeda(comp.preco)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Observação */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Alguma observação?
            </h4>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Sem cebola, pouco sal..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none h-20 text-sm"
            />
          </div>

          {/* Quantidade e Adicionar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                className="px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="px-4 py-2 font-medium min-w-[50px] text-center">
                {quantidade}
              </span>
              <button
                onClick={() => setQuantidade((q) => q + 1)}
                className="px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              onClick={handleAdicionar}
              disabled={!tamanhoSelecionado}
              className={classNames(
                'flex-1 py-3 rounded-lg font-semibold transition-all',
                tamanhoSelecionado
                  ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              Adicionar {formatarMoeda(calcularTotal())}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}