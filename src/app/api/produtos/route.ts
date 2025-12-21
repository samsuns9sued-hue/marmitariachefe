import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const apenasDisponiveis = searchParams.get('disponiveis') === 'true'

    const where: any = {}

    if (categoria) {
      where.categoria = categoria
    }

    if (apenasDisponiveis) {
      where.disponivel = true
    }

    const produtos = await prisma.produto.findMany({
      where,
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })

    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const produto = await prisma.produto.create({
      data: {
        nome: body.nome,
        descricao: body.descricao,
        categoria: body.categoria,
        preco: body.preco,
        disponivel: body.disponivel ?? true,
        destaque: body.destaque ?? false,
        ordem: body.ordem ?? 0,
      },
    })

    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}