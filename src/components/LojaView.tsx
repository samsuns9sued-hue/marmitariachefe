// src/components/LojaView.tsx
'use client'

import { useState, useEffect } from 'react'
import { useCarrinho } from '@/hooks/useCarrinho'
import { criarPedido } from '@/lib/actions'
import { toast } from 'sonner'
import { 
  ShoppingBag, Minus, Plus, X, Utensils, Coffee, 
  ChevronRight, MapPin, CreditCard, Banknote,
  Smartphone, Check, Image as ImageIcon
} from 'lucide-react'

export default function LojaView({ produtos, tamanhos, config }: any) {
  const carrinho = useCarrinho()
  const [categoriaAtiva, setCategoriaAtiva] = useState('MISTURA')
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  
  // Estados do Modal de Adição
  const [tamanhoId, setTamanhoId] = useState('')
  const [obs, setObs] = useState('')
  const [qtd, setQtd] = useState(1)

  // Drawer do Carrinho
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [etapaCarrinho, setEtapaCarrinho] = useState(1)
  const [enviando, setEnviando] = useState(false)

  // Dados do Cliente
  const [cliente, setCliente] = useState({ 
    nome: '', 
    telefone: '', 
    endereco: '', 
    bairro: '', 
    referencia: '' 
  })
  const [pagamento, setPagamento] = useState('PIX')
  const [troco, setTroco] = useState('')

  // Categorias
  const categorias = [
    { id: 'MISTURA', nome: 'Pratos', icon: Utensils, emoji: '🍛' },
    { id: 'COMPLEMENTO', nome: 'Porções', icon: Plus, emoji: '🍟' },
    { id: 'BEBIDA', nome: 'Bebidas', icon: Coffee, emoji: '🥤' },
  ]

  const abrirModal = (produto: any) => {
    setProdutoSelecionado(produto)
    setQtd(1)
    setObs('')
    setTamanhoId(produto.categoria !== 'MISTURA' ? 'unico' : '')
    setModalAberto(true)
  }

  const adicionarAoCarrinho = () => {
    if (!tamanhoId && produtoSelecionado.categoria === 'MISTURA') {
      toast.error('Selecione um tamanho!')
      return
    }

    let precoFinal = 0
    let nomeTamanho = ''

    if (produtoSelecionado.categoria === 'MISTURA') {
      const tam = tamanhos.find((t: any) => t.id === tamanhoId)
      precoFinal = tam.preco
      nomeTamanho = tam.nome
    } else {
      precoFinal = produtoSelecionado.preco
    }
    
    carrinho.adicionar({
      id: Date.now().toString(),
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      quantidade: qtd,
      precoUnit: precoFinal,
      tamanhoId: tamanhoId === 'unico' ? null : tamanhoId,
      tamanhoNome: nomeTamanho,
      complementos: '',
      observacao: obs
    })

    setModalAberto(false)
    toast.success('Adicionado ao carrinho!', {
      icon: '🛒',
      duration: 2000
    })
  }

  const finalizarPedido = async () => {
    if (!cliente.nome || !cliente.telefone || !cliente.endereco) {
      toast.error('Preencha os dados obrigatórios!')
      return
    }

    setEnviando(true)

    const payload = {
      cliente,
      itens: carrinho.itens,
      formaPagamento: pagamento,
      trocoPara: troco ? parseFloat(troco) : null,
      total: carrinho.total() + config.taxaEntrega,
      taxaEntrega: config.taxaEntrega,
      observacoes: 'Pedido via Site'
    }

    const res = await criarPedido(payload)

    if (res.success) {
      toast.success('Pedido enviado com sucesso!', { icon: '✅' })
      carrinho.limpar()
      setCarrinhoAberto(false)
      setEtapaCarrinho(1)
    } else {
      toast.error('Erro ao enviar pedido.')
    }
    setEnviando(false)
  }

  // Filtra produtos por categoria
  const produtosAtuais = produtos.filter((p: any) => p.categoria === categoriaAtiva)

  // Calcula preço no modal
  const calcularPrecoModal = () => {
    if (!produtoSelecionado) return 0
    if (produtoSelecionado.categoria !== 'MISTURA') {
      return produtoSelecionado.preco * qtd
    }
    if (tamanhoId) {
      const tam = tamanhos.find((t: any) => t.id === tamanhoId)
      return tam ? tam.preco * qtd : 0
    }
    return 0
  }

  return (
    <div className="pb-28 -mt-1">
      {/* Navegação de Categorias - Sticky */}
      <nav className="sticky top-0 bg-white z-20 shadow-sm">
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 ${
                categoriaAtiva === cat.id 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">{cat.emoji}</span>
              {cat.nome}
            </button>
          ))}
        </div>
      </nav>

      {/* Grid de Produtos */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          {categorias.find(c => c.id === categoriaAtiva)?.nome}
        </h2>
        
        <div className="space-y-3">
          {produtosAtuais.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Coffee size={48} className="mx-auto mb-3 opacity-50" />
              <p>Nenhum item disponível</p>
            </div>
          ) : (
            produtosAtuais.map((produto: any) => (
              <div 
                key={produto.id} 
                onClick={() => abrirModal(produto)} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex cursor-pointer hover:shadow-md hover:border-red-200 transition-all duration-200 active:scale-[0.98]"
              >
                {/* Info do Produto */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base leading-tight">
                      {produto.nome}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {produto.descricao}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      {produto.preco > 0 ? (
                        <p className="text-red-600 font-bold text-lg">
                          R$ {produto.preco.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          A partir de <span className="font-bold text-red-600">
                            R$ {tamanhos[0]?.preco?.toFixed(2)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Imagem do Produto */}
                <div className="relative w-28 h-28 flex-shrink-0 m-3">
                  {produto.imagem ? (
                    <img 
                      src={produto.imagem} 
                      alt={produto.nome} 
                      className="w-full h-full rounded-xl object-cover bg-gray-100" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-300" />
                    </div>
                  )}
                  
                  {/* Botão de Adicionar */}
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-colors">
                    <Plus size={22} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botão Flutuante do Carrinho */}
      {carrinho.itens.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent z-30">
          <button 
            onClick={() => setCarrinhoAberto(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl shadow-xl shadow-red-200 flex justify-between items-center font-bold transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag size={24} />
                <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {carrinho.itens.length}
                </span>
              </div>
              <span>Ver carrinho</span>
            </div>
            <span className="text-lg">R$ {carrinho.total().toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* MODAL DE PRODUTO */}
      {modalAberto && produtoSelecionado && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={() => setModalAberto(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300"
          >
            {/* Imagem do Produto (grande) */}
            <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
              {produtoSelecionado.imagem ? (
                <img 
                  src={produtoSelecionado.imagem} 
                  alt={produtoSelecionado.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={64} className="text-gray-300" />
                </div>
              )}
              
              {/* Botão Fechar */}
              <button 
                onClick={() => setModalAberto(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-5">
              <h2 className="text-2xl font-bold text-gray-800">
                {produtoSelecionado.nome}
              </h2>
              <p className="text-gray-500 mt-2 leading-relaxed">
                {produtoSelecionado.descricao}
              </p>

              {/* Seleção de Tamanho */}
              {produtoSelecionado.categoria === 'MISTURA' && (
                <div className="mt-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    📏 Escolha o tamanho
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      Obrigatório
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {tamanhos.map((tam: any) => (
                      <label 
                        key={tam.id} 
                        className={`flex justify-between items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          tamanhoId === tam.id 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            tamanhoId === tam.id 
                              ? 'border-red-500 bg-red-500' 
                              : 'border-gray-300'
                          }`}>
                            {tamanhoId === tam.id && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{tam.nome}</p>
                            <p className="text-sm text-gray-500">{tam.descricao}</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-800">
                          R$ {tam.preco.toFixed(2)}
                        </span>
                        <input 
                          type="radio" 
                          name="tamanho" 
                          value={tam.id} 
                          checked={tamanhoId === tam.id} 
                          onChange={(e) => setTamanhoId(e.target.value)} 
                          className="sr-only" 
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-800 mb-3">📝 Alguma observação?</h3>
                <textarea 
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Ex: Tirar cebola, molho à parte..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-red-500 focus:outline-none transition-colors"
                  rows={2}
                />
              </div>
            </div>

            {/* Footer com Quantidade e Botão */}
            <div className="p-5 border-t bg-gray-50 flex-shrink-0">
              <div className="flex gap-4">
                {/* Controle de Quantidade */}
                <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setQtd(Math.max(1, qtd - 1))} 
                    className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={qtd <= 1}
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-10 text-center font-bold text-lg">{qtd}</span>
                  <button 
                    onClick={() => setQtd(qtd + 1)} 
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Botão Adicionar */}
                <button 
                  onClick={adicionarAoCarrinho} 
                  disabled={!tamanhoId && produtoSelecionado.categoria === 'MISTURA'}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <span>Adicionar</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-md">
                    R$ {calcularPrecoModal().toFixed(2)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER DO CARRINHO */}
      {carrinhoAberto && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setCarrinhoAberto(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white flex flex-col animate-in slide-in-from-right duration-300"
          >
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="font-bold text-xl">Seu Pedido</h2>
                <p className="text-sm text-gray-500">
                  {etapaCarrinho === 1 ? 'Revise seus itens' : 'Finalize seu pedido'}
                </p>
              </div>
              <button 
                onClick={() => setCarrinhoAberto(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Indicador de Etapas */}
            <div className="px-4 py-3 bg-gray-50 border-b flex gap-2">
              {[1, 2].map((etapa) => (
                <div 
                  key={etapa}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    etapaCarrinho >= etapa ? 'bg-red-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto">
              {etapaCarrinho === 1 ? (
                // ETAPA 1: LISTA DE ITENS
                <div className="p-4 space-y-3">
                  {carrinho.itens.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-500">Seu carrinho está vazio</p>
                    </div>
                  ) : (
                    carrinho.itens.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-gray-50 rounded-xl p-4 flex gap-3"
                      >
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold flex-shrink-0">
                          {item.quantidade}x
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{item.nome}</p>
                          {item.tamanhoNome && (
                            <p className="text-sm text-gray-500">Tam: {item.tamanhoNome}</p>
                          )}
                          {item.observacao && (
                            <p className="text-sm text-gray-400 italic truncate">Obs: {item.observacao}</p>
                          )}
                          <p className="text-red-600 font-bold mt-1">
                            R$ {(item.precoUnit * item.quantidade).toFixed(2)}
                          </p>
                        </div>
                        <button 
                          onClick={() => carrinho.remover(item.id)} 
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // ETAPA 2: DADOS DE ENTREGA
                <div className="p-4 space-y-5">
                  {/* Dados do Cliente */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <MapPin size={18} className="text-red-600" />
                      Dados de Entrega
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Seu nome *
                      </label>
                      <input 
                        type="text" 
                        value={cliente.nome} 
                        onChange={e => setCliente({...cliente, nome: e.target.value})} 
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors" 
                        placeholder="Como podemos te chamar?" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        WhatsApp *
                      </label>
                      <input 
                        type="tel" 
                        value={cliente.telefone} 
                        onChange={e => setCliente({...cliente, telefone: e.target.value})} 
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors" 
                        placeholder="(00) 00000-0000" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Endereço completo *
                      </label>
                      <textarea 
                        value={cliente.endereco} 
                        onChange={e => setCliente({...cliente, endereco: e.target.value})} 
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors resize-none" 
                        placeholder="Rua, número e complemento" 
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Ponto de referência
                      </label>
                      <input 
                        type="text" 
                        value={cliente.referencia} 
                        onChange={e => setCliente({...cliente, referencia: e.target.value})} 
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors" 
                        placeholder="Próximo a..." 
                      />
                    </div>
                  </div>

                  {/* Forma de Pagamento */}
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <CreditCard size={18} className="text-red-600" />
                      Forma de Pagamento
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'PIX', nome: 'Pix', icon: Smartphone },
                        { id: 'DINHEIRO', nome: 'Dinheiro', icon: Banknote },
                        { id: 'CARTAO_CREDITO', nome: 'Crédito', icon: CreditCard },
                        { id: 'CARTAO_DEBITO', nome: 'Débito', icon: CreditCard },
                      ].map((pag) => (
                        <button
                          key={pag.id}
                          onClick={() => setPagamento(pag.id)}
                          className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${
                            pagamento === pag.id 
                              ? 'border-red-500 bg-red-50 text-red-600' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <pag.icon size={18} />
                          <span className="font-medium text-sm">{pag.nome}</span>
                        </button>
                      ))}
                    </div>

                    {pagamento === 'DINHEIRO' && (
                      <div className="animate-in slide-in-from-top duration-200">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Troco para quanto?
                        </label>
                        <input 
                          type="number" 
                          value={troco} 
                          onChange={e => setTroco(e.target.value)} 
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors" 
                          placeholder="Ex: 50" 
                        />
                      </div>
                    )}

                    {pagamento === 'PIX' && config?.pixChave && (
                      <div className="bg-green-50 p-3 rounded-xl text-sm text-green-700 animate-in slide-in-from-top duration-200">
                        <p className="font-medium">Chave Pix: {config.pixChave}</p>
                        <p className="text-xs mt-1 text-green-600">
                          Envie o comprovante para o entregador
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer com Resumo e Botões */}
            <div className="p-4 border-t bg-white flex-shrink-0">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {carrinho.total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxa de entrega</span>
                  <span className={config?.taxaEntrega === 0 ? 'text-green-600 font-medium' : ''}>
                    {config?.taxaEntrega === 0 ? 'Grátis' : `R$ ${config?.taxaEntrega?.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-red-600">
                    R$ {(carrinho.total() + (config?.taxaEntrega || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {etapaCarrinho === 1 ? (
                <button 
                  onClick={() => setEtapaCarrinho(2)} 
                  disabled={carrinho.itens.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  Continuar
                  <ChevronRight size={20} />
                </button>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={() => setEtapaCarrinho(1)} 
                    className="px-5 py-4 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={finalizarPedido} 
                    disabled={enviando}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {enviando ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        Finalizar Pedido
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}