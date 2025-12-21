'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useCarrinho } from '@/hooks/useCarrinho'
import { formatarMoeda, limparTelefone } from '@/lib/utils'
import { gerarMensagemPedido, gerarLinkWhatsApp } from '@/lib/whatsapp'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface FormularioClienteProps {
  total: number
  taxaEntrega: number
  onVoltar: () => void
}

export default function FormularioCliente({
  total,
  taxaEntrega,
  onVoltar,
}: FormularioClienteProps) {
  const router = useRouter()
  const { itens, limparCarrinho, setCarrinhoOpen } = useCarrinho()
  
  const [loading, setLoading] = useState(false)
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [dados, setDados] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    bairro: '',
    referencia: '',
  })
  const [formaPagamento, setFormaPagamento] = useState('')
  const [trocoPara, setTrocoPara] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [modoEnvio, setModoEnvio] = useState<'sistema' | 'whatsapp'>('sistema')

  // Buscar cliente pelo telefone
  useEffect(() => {
    const telefone = limparTelefone(dados.telefone)
    if (telefone.length >= 10) {
      buscarCliente(telefone)
    }
  }, [dados.telefone])

  async function buscarCliente(telefone: string) {
    setBuscandoCliente(true)
    try {
      const res = await fetch(`/api/clientes?telefone=${telefone}`)
      const cliente = await res.json()
      
      if (cliente && cliente.id) {
        setDados((prev) => ({
          ...prev,
          nome: cliente.nome || prev.nome,
          endereco: cliente.endereco || prev.endereco,
          bairro: cliente.bairro || prev.bairro,
          referencia: cliente.referencia || prev.referencia,
        }))
        toast.success('Dados encontrados! 🎉')
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error)
    } finally {
      setBuscandoCliente(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validações
    if (!dados.nome || !dados.telefone || !dados.endereco) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!formaPagamento) {
      toast.error('Selecione a forma de pagamento')
      return
    }

    setLoading(true)

    try {
      // Montar payload
      const payload = {
        cliente: dados,
        itens: itens.map((item) => ({
          tamanhoId: item.tamanhoId,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnit: item.precoTotal / item.quantidade,
          observacao: item.observacao,
        })),
        formaPagamento,
        trocoPara: trocoPara ? parseFloat(trocoPara) : null,
        observacoes,
        total,
        taxaEntrega,
      }

      if (modoEnvio === 'sistema') {
        // Salvar no banco
        const res = await fetch('/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) throw new Error('Erro ao enviar pedido')

        const pedido = await res.json()

        toast.success(`Pedido #${pedido.numero} enviado com sucesso! 🎉`)
        limparCarrinho()
        setCarrinhoOpen(false)
        router.push(`/pedir/sucesso?pedido=${pedido.numero}`)
      } else {
        // Enviar pelo WhatsApp
        const pedidoWhatsApp = {
          numero: Date.now() % 10000,
          cliente: dados,
          itens: itens.map((item) => ({
            quantidade: item.quantidade,
            tamanho: { nome: item.tamanhoNome },
            produto: { nome: item.produtoNome },
            observacao: item.observacao,
          })),
          formaPagamento,
          trocoPara: trocoPara ? parseFloat(trocoPara) : null,
          observacoes,
          total,
        }

        const mensagem = gerarMensagemPedido(pedidoWhatsApp)
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP || ''
        const link = gerarLinkWhatsApp(whatsappNumber, mensagem)
        
        window.open(link, '_blank')
        limparCarrinho()
        setCarrinhoOpen(false)
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao enviar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formasPagamento = [
    { id: 'PIX', label: '💠 PIX', desc: 'Pagamento instantâneo' },
    { id: 'DINHEIRO', label: '💵 Dinheiro', desc: 'Na entrega' },
    { id: 'CARTAO_CREDITO', label: '💳 Crédito', desc: 'Na entrega' },
    { id: 'CARTAO_DEBITO', label: '💳 Débito', desc: 'Na entrega' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Botão Voltar */}
      <button
        type="button"
        onClick={onVoltar}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        <span>Voltar ao carrinho</span>
      </button>

      {/* Dados do Cliente */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Seus dados</h3>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            WhatsApp *
          </label>
          <div className="relative">
            <input
              type="tel"
              value={dados.telefone}
              onChange={(e) =>
                setDados((prev) => ({ ...prev, telefone: e.target.value }))
              }
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            {buscandoCliente && (
              <Loader2
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                size={20}
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Nome *</label>
          <input
            type="text"
            value={dados.nome}
            onChange={(e) =>
              setDados((prev) => ({ ...prev, nome: e.target.value }))
            }
            placeholder="Seu nome completo"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Endereço completo *
          </label>
          <input
            type="text"
            value={dados.endereco}
            onChange={(e) =>
              setDados((prev) => ({ ...prev, endereco: e.target.value }))
            }
            placeholder="Rua, número, complemento"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bairro</label>
            <input
              type="text"
              value={dados.bairro}
              onChange={(e) =>
                setDados((prev) => ({ ...prev, bairro: e.target.value }))
              }
              placeholder="Bairro"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Referência
            </label>
            <input
              type="text"
              value={dados.referencia}
              onChange={(e) =>
                setDados((prev) => ({ ...prev, referencia: e.target.value }))
              }
              placeholder="Próximo a..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Forma de Pagamento */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Forma de pagamento</h3>
        <div className="grid grid-cols-2 gap-2">
          {formasPagamento.map((forma) => (
            <button
              key={forma.id}
              type="button"
              onClick={() => setFormaPagamento(forma.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                formaPagamento === forma.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{forma.label}</span>
              <p className="text-xs text-gray-500">{forma.desc}</p>
            </button>
          ))}
        </div>

        {formaPagamento === 'DINHEIRO' && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Precisa de troco? Para quanto?
            </label>
            <input
              type="number"
              value={trocoPara}
              onChange={(e) => setTrocoPara(e.target.value)}
              placeholder="Ex: 50"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Observações */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Observações gerais
        </label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Algo mais que precisamos saber?"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none h-20"
        />
      </div>

      {/* Modo de Envio */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm">Enviar pedido via:</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setModoEnvio('sistema')}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              modoEnvio === 'sistema'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200'
            }`}
          >
            <span className="text-sm font-medium">📱 Sistema</span>
          </button>
          <button
            type="button"
            onClick={() => setModoEnvio('whatsapp')}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              modoEnvio === 'whatsapp'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200'
            }`}
          >
            <span className="text-sm font-medium">📲 WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Botão Finalizar */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Enviando...
          </>
        ) : (
          <>Finalizar Pedido • {formatarMoeda(total)}</>
        )}
      </button>
    </form>
  )
}