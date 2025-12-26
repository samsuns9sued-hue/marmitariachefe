'use client'

import StatusPedidoBtn from './StatusPedidoBtn'
import { useState, useEffect } from 'react' // <--- useEffect importado
import { useCarrinho } from '@/hooks/useCarrinho'
import { criarPedido, buscarClientePorTelefone, calcularTaxaEntrega } from '@/lib/actions'
import { toast } from 'sonner'
import { 
  ShoppingBag, Minus, Plus, X, Utensils, Coffee, 
  ChevronRight, MapPin, CreditCard, Banknote,
  Smartphone, Check, Image as ImageIcon, User, Navigation, Search, ArrowLeft
} from 'lucide-react'

export default function LojaView({ produtos, tamanhos, config }: any) {
  const carrinho = useCarrinho()
  const [categoriaAtiva, setCategoriaAtiva] = useState('MISTURA')
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  
  const [tamanhoId, setTamanhoId] = useState('')
  const [obs, setObs] = useState('')
  const [qtd, setQtd] = useState(1)

  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [etapa, setEtapa] = useState(1)
  const [enviando, setEnviando] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [buscandoGeo, setBuscandoGeo] = useState(false)

  const [taxaEntregaCalculada, setTaxaEntregaCalculada] = useState<number | null>(null)
  const [distanciaKm, setDistanciaKm] = useState<string>('')

  const [cliente, setCliente] = useState({ 
    nome: '', telefone: '', cep: '', endereco: '', numero: '', bairro: '', referencia: '' 
  })
  const [pagamento, setPagamento] = useState('PIX')
  const [troco, setTroco] = useState('')

  const categorias = [
    { id: 'MISTURA', nome: 'Pratos', icon: Utensils, emoji: '🍛' },
    { id: 'COMPLEMENTO', nome: 'Porções', icon: Plus, emoji: '🍟' },
    { id: 'BEBIDA', nome: 'Bebidas', icon: Coffee, emoji: '🥤' },
  ]

  // --- TRAVAR SCROLL DO FUNDO ---
  useEffect(() => {
    if (modalAberto || carrinhoAberto) {
      document.body.style.overflow = 'hidden' // Trava
    } else {
      document.body.style.overflow = 'unset'  // Destrava
    }
    // Limpeza ao desmontar
    return () => { document.body.style.overflow = 'unset' }
  }, [modalAberto, carrinhoAberto])

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
    toast.success('Adicionado ao carrinho!', { icon: '🛒' })
  }

  const atualizarTaxa = async (lat: number, lng: number) => {
    const res = await calcularTaxaEntrega(lat, lng)
    setTaxaEntregaCalculada(res.taxa)
    setDistanciaKm(res.distancia)
  }

  const buscarCep = async (cepInput: string) => {
    const cepLimpo = cepInput.replace(/\D/g, '')
    setCliente(prev => ({ ...prev, cep: cepLimpo }))
    
    if (cepLimpo.length === 8) {
      setBuscandoCep(true)
      try {
        const resViaCep = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        const dataViaCep = await resViaCep.json()
        
        if (!dataViaCep.erro) {
          setCliente(prev => ({ ...prev, endereco: dataViaCep.logradouro, bairro: dataViaCep.bairro }))
          const termoBusca = `${dataViaCep.logradouro}, ${dataViaCep.bairro}, ${dataViaCep.localidade}, Mato Grosso`
          const resGeo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(termoBusca)}&limit=1`)
          const dataGeo = await resGeo.json()
          if (dataGeo && dataGeo[0]) {
            atualizarTaxa(parseFloat(dataGeo[0].lat), parseFloat(dataGeo[0].lon))
          }
          toast.success('Endereço encontrado!')
        } else {
          toast.error('CEP não encontrado.')
        }
      } catch (e) {
        toast.error('Erro ao buscar endereço.')
      }
      setBuscandoCep(false)
    }
  }

  const usarLocalizacaoAtual = () => {
    if (!navigator.geolocation) {
      toast.error('Seu navegador não suporta localização.')
      return
    }
    setBuscandoGeo(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        await atualizarTaxa(latitude, longitude)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        const data = await res.json()
        if (data && data.address) {
          setCliente(prev => ({
            ...prev,
            endereco: data.address.road || '',
            bairro: data.address.suburb || data.address.neighbourhood || '',
            cep: (data.address.postcode || '').replace(/\D/g, '')
          }))
          toast.success('Localização aplicada!')
        }
      } catch (e) {
        toast.error('Erro ao obter endereço do GPS.')
      } finally {
        setBuscandoGeo(false)
      }
    }, () => {
      toast.error('Permissão de localização negada.')
      setBuscandoGeo(false)
    })
  }

  const avancarIdentificacao = async () => {
    if (!cliente.nome.trim() || cliente.telefone.length < 8) {
      toast.error('Preencha Nome e WhatsApp')
      return
    }
    const res = await buscarClientePorTelefone(cliente.telefone)
    
    if (res.success && res.cliente) {
      let rua = res.cliente.endereco || ''
      let numero = ''
      let cep = ''

      if (rua.includes('Nº')) {
        const partes = rua.split('Nº')
        rua = partes[0].replace(/,\s*$/, '').trim() 
        const resto = partes[1] || ''
        const matchNumero = resto.match(/(\d+)/)
        if (matchNumero) numero = matchNumero[0]
        if (resto.includes('CEP:')) {
           const matchCep = resto.match(/CEP:\s*([\d-]+)/)
           if (matchCep) cep = matchCep[1].replace(/\D/g, '')
        }
      }

      const bairro = res.cliente.bairro || ''

      setCliente(prev => ({
        ...prev,
        endereco: rua,
        numero: numero,
        cep: cep,
        bairro: bairro,
        referencia: res.cliente.referencia || ''
      }))

      if (rua && bairro) {
        try {
          const termoBusca = `${rua}, ${bairro}, Mato Grosso, Brasil`
          const resGeo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(termoBusca)}&limit=1`)
          const dataGeo = await resGeo.json()
          if (dataGeo && dataGeo[0]) {
            await atualizarTaxa(parseFloat(dataGeo[0].lat), parseFloat(dataGeo[0].lon))
          }
        } catch (e) { console.log('Erro ao calcular taxa automática', e) }
      }

      setEtapa(2)
    } else {
      setEtapa(3) 
    }
  }

  const finalizarPedido = async () => {
    if (!cliente.endereco || !cliente.bairro || !cliente.numero) {
      toast.error('Preencha o endereço completo!')
      return
    }

    const taxaFinal = taxaEntregaCalculada !== null ? taxaEntregaCalculada : config.taxaEntrega

    setEnviando(true)
    const enderecoCompleto = `${cliente.endereco}, Nº ${cliente.numero}${cliente.cep ? ` - CEP: ${cliente.cep}` : ''}`

    const payload = {
      cliente: { ...cliente, endereco: enderecoCompleto },
      itens: carrinho.itens,
      formaPagamento: pagamento,
      trocoPara: troco ? parseFloat(troco) : null,
      total: carrinho.total() + taxaFinal,
      taxaEntrega: taxaFinal,
      observacoes: 'Pedido via Site'
    }

    const res = await criarPedido(payload)

    if (res.success) {
      localStorage.setItem('marmitaria_telefone', cliente.telefone) 
      toast.success('Pedido Realizado com Sucesso!', { description: 'Aguarde a confirmação no WhatsApp.', duration: 5000, icon: '🎉' })
      carrinho.limpar()
      setCarrinhoAberto(false)
      setEtapa(1)
      setCliente(prev => ({ ...prev, endereco: '', numero: '', bairro: '', referencia: '' }))
      setTaxaEntregaCalculada(null)
    } else {
      toast.error('Erro ao enviar pedido.')
    }
    setEnviando(false)
  }

  const produtosAtuais = produtos.filter((p: any) => p.categoria === categoriaAtiva)
  const calcularPrecoModal = () => {
    if (!produtoSelecionado) return 0
    if (produtoSelecionado.categoria !== 'MISTURA') return produtoSelecionado.preco * qtd
    if (tamanhoId) {
      const tam = tamanhos.find((t: any) => t.id === tamanhoId)
      return tam ? tam.preco * qtd : 0
    }
    return 0
  }

  const taxaExibir = taxaEntregaCalculada !== null ? taxaEntregaCalculada : config.taxaEntrega

  return (
    <div className="pb-28 -mt-1">
      <StatusPedidoBtn /> 

      <nav className="sticky top-0 bg-white z-20 shadow-sm">
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
          {categorias.map((cat) => (
            <button key={cat.id} onClick={() => setCategoriaAtiva(cat.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 ${categoriaAtiva === cat.id ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <span className="text-lg">{cat.emoji}</span>{cat.nome}
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 space-y-3">
        {produtosAtuais.length === 0 ? <div className="text-center py-10 text-gray-400">Nenhum item.</div> : produtosAtuais.map((produto: any) => (
          <div key={produto.id} onClick={() => abrirModal(produto)} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div><h3 className="font-bold text-gray-800 text-base">{produto.nome}</h3><p className="text-sm text-gray-500 mt-1 line-clamp-2">{produto.descricao}</p></div>
              <div className="mt-3">{produto.preco > 0 ? <p className="text-red-600 font-bold text-lg">R$ {produto.preco.toFixed(2)}</p> : <p className="text-gray-500 text-sm">A partir de <span className="font-bold text-red-600">R$ {tamanhos[0]?.preco?.toFixed(2)}</span></p>}</div>
            </div>
            <div className="relative w-28 h-28 flex-shrink-0 m-3">
              {produto.imagem ? <img src={produto.imagem} alt={produto.nome} className="w-full h-full rounded-xl object-cover bg-gray-100" /> : <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center"><ImageIcon className="text-gray-300" /></div>}
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center"><Plus size={22} /></button>
            </div>
          </div>
        ))}
      </div>

      {carrinho.itens.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent z-30">
          <button onClick={() => { setCarrinhoAberto(true); setEtapa(1); }} className="w-full bg-red-600 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center font-bold">
            <div className="flex items-center gap-3"><ShoppingBag size={24} /><span>Ver carrinho ({carrinho.itens.length})</span></div><span className="text-lg">R$ {carrinho.total().toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* MODAL DE PRODUTO: Fundo bloqueado para cliques */}
      {modalAberto && produtoSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom">
             <div className="relative h-48 bg-gray-100">
              {produtoSelecionado.imagem ? <img src={produtoSelecionado.imagem} alt={produtoSelecionado.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={48} className="text-gray-300" /></div>}
              <button onClick={() => setModalAberto(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"><X size={18} /></button>
            </div>
            <div className="p-5 overflow-y-auto">
              <h2 className="text-2xl font-bold">{produtoSelecionado.nome}</h2>
              <p className="text-gray-500 mt-2">{produtoSelecionado.descricao}</p>
              {produtoSelecionado.categoria === 'MISTURA' && (
                <div className="mt-6 space-y-2"><h3 className="font-bold mb-2">Escolha o tamanho:</h3>
                  {tamanhos.map((tam: any) => (
                    <label key={tam.id} className={`flex justify-between items-center p-4 rounded-xl border-2 cursor-pointer ${tamanhoId === tam.id ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${tamanhoId === tam.id ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>{tamanhoId === tam.id && <Check size={12} className="text-white" />}</div><div><p className="font-semibold">{tam.nome}</p><p className="text-sm text-gray-500">{tam.descricao}</p></div></div><span className="font-bold">R$ {tam.preco.toFixed(2)}</span><input type="radio" name="tamanho" value={tam.id} checked={tamanhoId === tam.id} onChange={(e) => setTamanhoId(e.target.value)} className="hidden" />
                    </label>
                  ))}
                </div>
              )}
              <div className="mt-6"><h3 className="font-bold mb-2">Observações:</h3><textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: Sem cebola..." className="w-full p-3 border-2 border-gray-200 rounded-xl resize-none" rows={2} /></div>
            </div>
            <div className="p-5 border-t bg-gray-50 flex gap-4">
               <div className="flex items-center bg-white border rounded-xl"><button onClick={() => setQtd(Math.max(1, qtd - 1))} className="p-3"><Minus size={18}/></button><span className="w-8 text-center font-bold">{qtd}</span><button onClick={() => setQtd(qtd + 1)} className="p-3"><Plus size={18}/></button></div>
               <button onClick={adicionarAoCarrinho} disabled={!tamanhoId && produtoSelecionado.categoria === 'MISTURA'} className="flex-1 bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"><span>Adicionar R$ {calcularPrecoModal().toFixed(2)}</span></button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER DO CHECKOUT: Fundo bloqueado para cliques */}
      {carrinhoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white flex flex-col animate-in slide-in-from-right">
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <div><h2 className="font-bold text-xl">{etapa === 1 ? 'Identificação' : etapa === 2 ? 'Confirmação' : etapa === 3 ? 'Endereço' : 'Pagamento'}</h2><div className="flex gap-1 mt-1">{[1, 2, 3, 4].map(s => (<div key={s} className={`h-1 w-8 rounded-full transition-colors ${etapa >= s ? 'bg-red-600' : 'bg-gray-200'}`} />))}</div></div>
              <button onClick={() => setCarrinhoAberto(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              
              {/* ETAPAS */}
              {etapa === 1 && (
                <div className="space-y-6">
                  {carrinho.itens.map(item => (<div key={item.id} className="flex justify-between text-sm border-b pb-2"><span>{item.quantidade}x {item.nome}</span><div className="flex items-center gap-2"><span className="font-bold">R$ {(item.precoUnit * item.quantidade).toFixed(2)}</span><button onClick={() => carrinho.remover(item.id)}><X size={14} className="text-gray-400"/></button></div></div>))}
                  <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm border border-blue-100">👋 Digite seu Zap. Se já tiver cadastro, achamos seu endereço!</div>
                  <div><label className="block text-sm font-bold mb-2">Nome</label><input type="text" value={cliente.nome} onChange={e => setCliente({...cliente, nome: e.target.value})} className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none" placeholder="Seu nome" /></div>
                  <div><label className="block text-sm font-bold mb-2">WhatsApp</label><input type="tel" value={cliente.telefone} onChange={e => setCliente({...cliente, telefone: e.target.value})} className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none" placeholder="(00) 00000-0000" /></div>
                  <button onClick={avancarIdentificacao} className="w-full bg-red-600 text-white font-bold py-4 rounded-xl mt-4">Continuar</button>
                </div>
              )}

              {etapa === 2 && (
                <div className="space-y-6 text-center pt-5 animate-in fade-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-green-600" /></div>
                  <h3 className="text-xl font-bold">Cadastro Encontrado!</h3>
                  <div className="bg-gray-50 p-5 rounded-2xl text-left border">
                    <p className="font-bold text-lg">{cliente.nome}</p>
                    <p>{cliente.telefone}</p>
                    <p className="mt-2 text-gray-600">{cliente.endereco} {cliente.numero ? `, Nº ${cliente.numero}` : ''}</p>
                    <p className="text-sm text-gray-500">{cliente.bairro}</p>
                  </div>
                  <button onClick={() => setEtapa(4)} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl">Sim, usar este endereço</button>
                  <button onClick={() => setEtapa(3)} className="w-full bg-white border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl">Mudar endereço</button>
                </div>
              )}

              {etapa === 3 && (
                <div className="space-y-5 animate-in slide-in-from-right">
                  <button onClick={usarLocalizacaoAtual} disabled={buscandoGeo} className="w-full bg-blue-50 text-blue-700 border border-blue-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    {buscandoGeo ? <span className="animate-spin">⌛</span> : <Navigation size={18} />} {buscandoGeo ? 'Calculando...' : 'Usar minha localização atual'}
                  </button>
                  <div className="relative"><div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400"><Search size={18}/></div><input type="tel" maxLength={9} value={cliente.cep} onChange={e => buscarCep(e.target.value)} className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl outline-none" placeholder="Buscar por CEP" /></div>
                  
                  {taxaEntregaCalculada !== null && (
                    <div className={`p-3 rounded-lg text-center font-bold text-sm ${taxaEntregaCalculada === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                      {taxaEntregaCalculada === 0 ? 'Entrega Grátis!' : `Taxa de entrega: R$ ${taxaEntregaCalculada.toFixed(2)}`}
                      <span className="block text-xs font-normal opacity-80">Distância: {distanciaKm}km</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Rua</label><input value={cliente.endereco} onChange={e => setCliente({...cliente, endereco: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 outline-none" placeholder="Rua..." /></div>
                    <div><label className="text-xs font-bold text-gray-500">Número</label><input value={cliente.numero} onChange={e => setCliente({...cliente, numero: e.target.value})} className="w-full p-3 border rounded-lg outline-none" placeholder="Nº" /></div>
                  </div>
                  <div><label className="text-xs font-bold text-gray-500">Bairro</label><input value={cliente.bairro} onChange={e => setCliente({...cliente, bairro: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 outline-none" placeholder="Bairro..." /></div>
                  <div><label className="text-xs font-bold text-gray-500">Referência</label><input value={cliente.referencia} onChange={e => setCliente({...cliente, referencia: e.target.value})} className="w-full p-3 border rounded-lg outline-none" placeholder="Ex: Portão preto" /></div>
                  <button onClick={() => setEtapa(4)} className="w-full bg-red-600 text-white font-bold py-4 rounded-xl mt-4">Continuar</button>
                  <button onClick={() => setEtapa(1)} className="w-full text-gray-400 text-sm py-2">Voltar</button>
                </div>
              )}

              {etapa === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right">
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-2">Resumo</h3>
                    {carrinho.itens.map(item => (<div key={item.id} className="flex justify-between"><span>{item.quantidade}x {item.nome}</span><span className="font-bold">R$ {(item.precoUnit * item.quantidade).toFixed(2)}</span></div>))}
                    <div className="flex justify-between text-gray-600 border-t pt-2"><span>Entrega ({distanciaKm ? `${distanciaKm}km` : 'Fixa'})</span><span>{taxaExibir === 0 ? 'Grátis' : `R$ ${taxaExibir.toFixed(2)}`}</span></div>
                    <div className="flex justify-between font-bold text-base text-red-600 pt-1"><span>Total</span><span>R$ {(carrinho.total() + taxaExibir).toFixed(2)}</span></div>
                  </div>
                  <div><h3 className="font-bold mb-3">Pagamento</h3><div className="grid grid-cols-2 gap-2">{[{ id: 'PIX', nome: 'Pix', icon: Smartphone }, { id: 'DINHEIRO', nome: 'Dinheiro', icon: Banknote }, { id: 'CARTAO_CREDITO', nome: 'Crédito', icon: CreditCard }, { id: 'CARTAO_DEBITO', nome: 'Débito', icon: CreditCard }].map((pag) => (<button key={pag.id} onClick={() => setPagamento(pag.id)} className={`p-3 rounded-xl border-2 flex items-center gap-2 ${pagamento === pag.id ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200'}`}><pag.icon size={18} /> <span className="text-sm font-bold">{pag.nome}</span></button>))}</div>{pagamento === 'DINHEIRO' && (<div className="mt-4"><label className="text-sm font-bold">Troco para?</label><input type="number" value={troco} onChange={e => setTroco(e.target.value)} className="w-full p-3 border rounded-lg mt-1 outline-none" placeholder="Ex: 50" /></div>)}</div>
                  <button onClick={finalizarPedido} disabled={enviando} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">{enviando ? 'Enviando...' : 'Finalizar Pedido'} <Check /></button>
                  <button onClick={() => setEtapa(3)} className="w-full text-gray-400 text-sm py-2 flex items-center justify-center gap-1"><ArrowLeft size={14}/> Voltar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}