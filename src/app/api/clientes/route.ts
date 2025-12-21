import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { limparTelefone } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const telefone = searchParams.get('telefone')

    if (telefone) {
      const telefoneLimpo = limparTelefone(telefone)
      
      const cliente = await prisma.cliente.findUnique({
        where: { telefone: telefoneLimpo },
      })

      return NextResponse.json(cliente || null)
    }

    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const telefoneLimpo = limparTelefone(body.telefone)

    // Tenta encontrar cliente existente
    let cliente = await prisma.cliente.findUnique({
      where: { telefone: telefoneLimpo },
    })

    if (cliente) {
      // Atualiza dados se já existe
      cliente = await prisma.cliente.update({
        where: { id: cliente.id },
        data: {
          nome: body.nome,
          endereco: body.endereco,
          bairro: body.bairro,
          referencia: body.referencia,
        },
      })
    } else {
      // Cria novo cliente
      cliente = await prisma.cliente.create({
        data: {
          nome: body.nome,
          telefone: telefoneLimpo,
          endereco: body.endereco,
          bairro: body.bairro,
          referencia: body.referencia,
        },
      })
    }

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar/atualizar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar/atualizar cliente' },
      { status: 500 }
    )
  }
}