import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let config = await prisma.configuracao.findUnique({
      where: { id: 'config' },
    })

    // Se não existe, cria configuração padrão
    if (!config) {
      config = await prisma.configuracao.create({
        data: {
          id: 'config',
          nomeLoja: 'Marmitaria',
          horarioAbertura: '11:00',
          horarioFechamento: '14:00',
          aceitaPedidos: true,
          taxaEntrega: 0,
        },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    const config = await prisma.configuracao.update({
      where: { id: 'config' },
      data: body,
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}