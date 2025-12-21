import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ImpressaoRecibo({ pedido }: { pedido: any }) {
  if (!pedido) return null

  return (
    <div id="area-impressao" className="hidden print:block p-2 text-black font-mono text-xs w-[300px]">
      {/* Cabeçalho */}
      <div className="text-center border-b border-black pb-2 mb-2">
        <h1 className="font-bold text-lg uppercase">Marmitaria do Chefe</h1>
        <p>Pedido #{pedido.numero}</p>
        <p>{format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
      </div>

      {/* Cliente */}
      <div className="mb-2 border-b border-black pb-2">
        <p className="font-bold text-sm uppercase">{pedido.cliente.nome}</p>
        <p>{pedido.cliente.telefone}</p>
        <p className="mt-1">{pedido.cliente.endereco}, {pedido.cliente.bairro}</p>
        {pedido.cliente.referencia && (
          <p className="italic">Ref: {pedido.cliente.referencia}</p>
        )}
      </div>

      {/* Itens */}
      <div className="mb-2 border-b border-black pb-2">
        <p className="font-bold mb-1">ITENS DO PEDIDO:</p>
        {pedido.itens.map((item: any, idx: number) => (
          <div key={idx} className="mb-2">
            <div className="flex justify-between">
              <span>{item.quantidade}x {item.produto.nome}</span>
              <span>R$ {(item.precoUnit * item.quantidade).toFixed(2)}</span>
            </div>
            {item.tamanho && (
              <p className="pl-4 text-[10px]">- Tam: {item.tamanho.nome}</p>
            )}
            {item.complementos && (
              <p className="pl-4 text-[10px]">+ {item.complementos}</p>
            )}
            {item.observacao && (
              <p className="pl-4 font-bold uppercase">OBS: {item.observacao}</p>
            )}
          </div>
        ))}
      </div>

      {/* Totais */}
      <div className="text-right">
        <div className="flex justify-between">
          <span>Taxa Entrega:</span>
          <span>R$ {pedido.taxaEntrega.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm mt-1">
          <span>TOTAL:</span>
          <span>R$ {pedido.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Pagamento */}
      <div className="mt-2 text-center border-t border-black pt-2">
        <p>Pagamento: <span className="font-bold">{pedido.formaPagamento.replace('_', ' ')}</span></p>
        {pedido.trocoPara && <p>Troco para: R$ {pedido.trocoPara}</p>}
      </div>

      <div className="text-center mt-4 text-[10px]">
        <p>Obrigado pela preferência!</p>
        <p>Bom apetite 😋</p>
      </div>
    </div>
  )
}