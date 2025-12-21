import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tamanhos = await prisma.tamanho.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    })

    return NextResponse.json(tamanhos)
  } catch (error) {
    console.error('Erro ao buscar tamanhos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tamanhos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const tamanho = await prisma.tamanho.create({
      data: {
        nome: body.nome,
        descricao: body.descricao,
        preco: body.preco,
        ativo: body.ativo ?? true,
        ordem: body.ordem ?? 0,
      },
    })

    return NextResponse.json(tamanho, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tamanho:', error)
    return NextResponse.json(
      { error: 'Erro ao criar tamanho' },
      { status: 500 }
    )
  }
}