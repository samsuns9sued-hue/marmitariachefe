'use client'

import { useState } from 'react'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { formatarMoeda, classNames } from '@/lib/utils'
import { useCarrinho } from '@/hooks/useCarrinho'
import FormularioCliente from './FormularioCliente'

interface CarrinhoDrawerProps {
  taxaEntrega: number
}

export default function CarrinhoDrawer({ taxaEntrega }: CarrinhoDrawerProps) {
  const {
    itens,
    isOpen,
    setCarrinhoOpen,
    removeItem,
    updateQuantidade,
    getTotalValor,
  } = useCarrinho()
  
  const [etapa, setEtapa] = useState<'carrinho' | 'dados'>('carrinho')

  const total = getTotalValor()
  const totalComEntrega = total + taxaEntrega

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          setCarrinhoOpen(false)
          setEtapa('carrinho')
        }}
      />

      {/* Drawer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary-500" size={24} />
            <h2 className="text-lg font-bold">
              {etapa === 'carrinho' ? 'Seu Pedido' : 'Seus Dados'}
            </h2>
          </div>
          <button
            onClick={() => {
              setCarrinhoOpen(false)
              setEtapa('carrinho')
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-4 py-4">
          {etapa === 'carrinho' ? (
            <>
              {itens.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag
                    size={64}
                    className="mx-auto text-gray-300 mb-4"
                  />
                  <p className="text-gray-500">Seu carrinho está vazio</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Adicione itens do cardápio
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {itens.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">
                            {item.tamanhoNome} - {item.produtoNome}
                          </h3>
                          {item.complementos.length > 0 && (
                            <p className="text-sm text-gray-500">
                              + {item.complementos.map((c) => c.nome).join(', ')}
                            </p>
                          )}
                          {item.observacao && (
                            <p className="text-sm text-gray-400 italic">
                              "{item.observacao}"
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantidade(item.id, item.quantidade - 1)
                            }
                            className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-1.5 font-medium">
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantidade(item.id, item.quantidade + 1)
                            }
                            className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="font-semibold text-primary-600">
                          {formatarMoeda(item.precoTotal)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Resumo */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatarMoeda(total)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Taxa de entrega</span>
                      <span>
                        {taxaEntrega > 0 ? formatarMoeda(taxaEntrega) : 'Grátis'}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary-600">
                        {formatarMoeda(totalComEntrega)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <FormularioCliente
              total={totalComEntrega}
              taxaEntrega={taxaEntrega}
              onVoltar={() => setEtapa('carrinho')}
            />
          )}
        </div>

        {/* Footer */}
        {etapa === 'carrinho' && itens.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t p-4">
            <button
              onClick={() => setEtapa('dados')}
              className="w-full bg-primary-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-600 active:scale-[0.98] transition-all"
            >
              Continuar • {formatarMoeda(totalComEntrega)}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}