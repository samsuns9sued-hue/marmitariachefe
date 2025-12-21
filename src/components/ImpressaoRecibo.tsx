import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ImpressaoRecibo({ pedido }: { pedido: any }) {
  if (!pedido) return null

  return (
    <div 
      id="area-impressao" 
      className="hidden print:block text-black font-mono w-[300px] font-bold uppercase leading-tight"
      style={{ padding: '0', margin: '0' }}
    >
      {/* --- CABEÇALHO --- */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <h1 className="text-xl font-black">MARMITARIA DO CHEFE</h1>
        <p className="text-sm mt-1">PEDIDO #{pedido.numero}</p>
        <p className="text-xs">{format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
      </div>

      {/* --- CLIENTE --- */}
      <div className="mb-2 border-b-2 border-black pb-2">
        <p className="text-sm font-black">{pedido.cliente.nome}</p>
        <p className="text-sm">{pedido.cliente.telefone}</p>
        
        <div className="mt-2 text-sm">
          <p>{pedido.cliente.endereco}</p>
          <p>{pedido.cliente.bairro}</p>
          {pedido.cliente.referencia && (
            <p className="mt-1 text-xs">REF: {pedido.cliente.referencia}</p>
          )}
        </div>
      </div>

      {/* --- ITENS --- */}
      <div className="mb-2 border-b-2 border-black pb-2">
        <p className="text-sm font-black mb-2 border-b border-black border-dashed pb-1">ITENS DO PEDIDO:</p>
        
        {pedido.itens.map((item: any, idx: number) => (
          <div key={idx} className="mb-3">
            <div className="flex justify-between text-sm items-start">
              <span className="w-[80%]">
                {item.quantidade}x {item.produto.nome}
              </span>
              <span>R${(item.precoUnit * item.quantidade).toFixed(2)}</span>
            </div>

            {/* Detalhes do Item */}
            <div className="pl-2 text-xs">
              {item.tamanho && (
                <p>- TAM: {item.tamanho.nome}</p>
              )}
              {item.complementos && (
                <p>+ {item.complementos}</p>
              )}
              {item.observacao && (
                <p className="mt-1 bg-black text-white inline-block px-1 font-black">
                  OBS: {item.observacao}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- TOTAIS --- */}
      <div className="text-right text-sm mb-2 border-b-2 border-black pb-2">
        <div className="flex justify-between">
          <span>TAXA ENTREGA:</span>
          <span>R$ {pedido.taxaEntrega.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-black mt-1">
          <span>TOTAL:</span>
          <span>R$ {pedido.total.toFixed(2)}</span>
        </div>
      </div>

      {/* --- PAGAMENTO --- */}
      <div className="text-center text-sm">
        <p>FORMA DE PAGAMENTO:</p>
        <p className="font-black text-base border-2 border-black inline-block px-2 py-1 mt-1 rounded">
          {pedido.formaPagamento.replace('_', ' ')}
        </p>
        {pedido.trocoPara && (
          <p className="mt-1 font-bold">TROCO PARA: R$ {pedido.trocoPara}</p>
        )}
      </div>

      {/* --- RODAPÉ --- */}
      <div className="text-center mt-6 text-xs border-t border-black pt-2">
        <p>OBRIGADO PELA PREFERÊNCIA!</p>
        <p>www.marmitariadochefe.vercel.app</p>
      </div>
    </div>
  )
}