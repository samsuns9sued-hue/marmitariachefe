// src/lib/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// --- ÁREA DO CLIENTE ---

export async function getCardapio() {
  const [produtos, tamanhos, config] = await Promise.all([
    prisma.produto.findMany({
      where: { disponivel: true },
      orderBy: [{ destaque: 'desc' }, { ordem: 'asc' }] // Melhorei a ordenação aqui
    }),
    prisma.tamanho.findMany({
      orderBy: { ordem: 'asc' }
    }),
    prisma.configuracao.findUnique({
      where: { id: 'config' }
    })
  ])
  return { produtos, tamanhos, config }
}

export async function criarPedido(dados: any) {
  try {
    // 1. Cria ou atualiza o cliente
    const cliente = await prisma.cliente.upsert({
      where: { telefone: dados.cliente.telefone },
      update: {
        nome: dados.cliente.nome,
        endereco: dados.cliente.endereco,
        bairro: dados.cliente.bairro,
        referencia: dados.cliente.referencia,
      },
      create: {
        nome: dados.cliente.nome,
        telefone: dados.cliente.telefone,
        endereco: dados.cliente.endereco,
        bairro: dados.cliente.bairro,
        referencia: dados.cliente.referencia,
      }
    })

    // 2. Concatena os complementos em uma string se vierem separados
    // (O novo front não manda array de complementos complexos ainda, mas prevenimos erros)
    
    // 3. Cria o pedido
    const pedido = await prisma.pedido.create({
      data: {
        clienteId: cliente.id,
        formaPagamento: dados.formaPagamento,
        trocoPara: dados.trocoPara,
        observacoes: dados.observacoes,
        total: dados.total,
        taxaEntrega: dados.taxaEntrega,
        status: 'PENDENTE',
        itens: {
          create: dados.itens.map((item: any) => ({
            produtoId: item.produtoId,
            tamanhoId: item.tamanhoId,
            quantidade: item.quantidade,
            precoUnit: item.precoUnit,
            observacao: item.observacao,
            complementos: item.complementos
          }))
        }
      }
    })

    revalidatePath('/admin')
    return { success: true, pedidoId: pedido.id }

  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return { success: false, error: 'Erro ao processar pedido' }
  }
}

// --- ÁREA DO ADMIN ---

export async function verificarLogin(_prevState: any, formData: FormData) {
  const senha = formData.get('senha') as string
  const config = await prisma.configuracao.findUnique({ where: { id: 'config' } })

  if (config?.senhaAdmin === senha) {
    cookies().set('admin_session', 'true', { httpOnly: true, maxAge: 60 * 60 * 24 })
    redirect('/admin')
  } else {
    return { error: 'Senha incorreta' }
  }
}

export async function logout() {
  cookies().delete('admin_session')
  redirect('/admin/login')
}

export async function getPedidosHoje() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  return await prisma.pedido.findMany({
    where: {
      createdAt: {
        gte: hoje
      }
    },
    include: {
      cliente: true,
      itens: {
        include: {
          produto: true,
          tamanho: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function atualizarStatusPedido(pedidoId: string, novoStatus: any) {
  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { 
      status: novoStatus,
      updatedAt: new Date(),
      saiuEntregaAt: novoStatus === 'SAIU_ENTREGA' ? new Date() : undefined,
      entregueAt: novoStatus === 'ENTREGUE' ? new Date() : undefined
    }
  })
  revalidatePath('/admin')
}

// --- GERENCIAMENTO DE PRODUTOS (ATUALIZADO PARA O NOVO DESIGN) ---

export async function salvarProduto(dados: any) {
  try {
    const { id, nome, descricao, preco, categoria, imagem } = dados

    if (id) {
      // Atualizar existente
      const prod = await prisma.produto.update({
        where: { id },
        data: { nome, descricao, preco, categoria, imagem }
      })
      revalidatePath('/admin/produtos')
      revalidatePath('/pedir')
      return { success: true, produto: prod }
    } else {
      // Criar novo
      const prod = await prisma.produto.create({
        data: { 
          nome, descricao, preco, categoria, imagem,
          disponivel: true,
          ordem: 0 // Default
        }
      })
      revalidatePath('/admin/produtos')
      revalidatePath('/pedir')
      return { success: true, produto: prod }
    }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao salvar' }
  }
}

export async function toggleDisponibilidade(id: string, estadoAtual: boolean) {
  await prisma.produto.update({
    where: { id },
    data: { disponivel: !estadoAtual }
  })
  revalidatePath('/admin/produtos')
  revalidatePath('/pedir')
}

export async function deletarProduto(id: string) {
  await prisma.produto.delete({ where: { id } })
  revalidatePath('/admin/produtos')
  revalidatePath('/pedir')
}