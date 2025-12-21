import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: params.id },
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

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedido' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Se está atualizando status, adicionar timestamps
    const updateData: any = { ...body }
    
    if (body.status === 'EM_PREPARO') {
      updateData.preparadoAt = new Date()
    } else if (body.status === 'SAIU_ENTREGA') {
      updateData.saiuEntregaAt = new Date()
    } else if (body.status === 'ENTREGUE') {
      updateData.entregueAt = new Date()
    }

    const pedido = await prisma.pedido.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.pedido.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar pedido:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar pedido' },
      { status: 500 }
    )
  }
}