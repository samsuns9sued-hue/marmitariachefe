import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { limparTelefone } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')

    const where: any = {}

    if (statusParam) {
      const statusArray = statusParam.split(',')
      where.status = { in: statusArray }
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        cliente: true,
        itens: {
          include: {
            produto: true,
            tamanho: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limita para performance
    })

    return NextResponse.json(pedidos)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Criar ou buscar cliente
    const telefoneLimpo = limparTelefone(body.cliente.telefone)
    
    let cliente = await prisma.cliente.findUnique({
      where: { telefone: telefoneLimpo },
    })

    if (cliente) {
      cliente = await prisma.cliente.update({
        where: { id: cliente.id },
        data: {
          nome: body.cliente.nome,
          endereco: body.cliente.endereco,
          bairro: body.cliente.bairro || null,
          referencia: body.cliente.referencia || null,
        },
      })
    } else {
      cliente = await prisma.cliente.create({
        data: {
          nome: body.cliente.nome,
          telefone: telefoneLimpo,
          endereco: body.cliente.endereco,
          bairro: body.cliente.bairro || null,
          referencia: body.cliente.referencia || null,
        },
      })
    }

    // 2. Criar pedido
    const pedido = await prisma.pedido.create({
      data: {
        clienteId: cliente.id,
        status: 'PENDENTE',
        formaPagamento: body.formaPagamento,
        trocoPara: body.trocoPara || null,
        observacoes: body.observacoes || null,
        total: body.total,
        taxaEntrega: body.taxaEntrega || 0,
        itens: {
          create: body.itens.map((item: any) => ({
            tamanhoId: item.tamanhoId || null,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnit: item.precoUnit,
            observacao: item.observacao || null,
          })),
        },
      },
      include: {
        cliente: true,
        itens: {
          include: {
            produto: true,
            tamanho: true,
          },
        },
      },
    })

    return NextResponse.json(pedido, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 500 }
    )
  }
}