// src/lib/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// --- 📍 CONFIGURAÇÃO DA ENTREGA (EDITE AQUI) ---
const LOJA_LAT = -15.656795 // <--- COLOQUE SUA LATITUDE AQUI
const LOJA_LNG = -56.086259 // <--- COLOQUE SUA LONGITUDE AQUI
const RAIO_GRATIS_KM = 2.0
const TAXA_EXTRA_FIXA = 3.00
// -----------------------------------------------

// Função matemática para calcular distância em KM (Haversine)
function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function calcularTaxaEntrega(latCliente: number, lngCliente: number) {
  const distancia = calcularDistanciaKm(LOJA_LAT, LOJA_LNG, latCliente, lngCliente)
  
  if (distancia <= RAIO_GRATIS_KM) {
    return { taxa: 0, distancia: distancia.toFixed(1) } // Grátis
  } else {
    return { taxa: TAXA_EXTRA_FIXA, distancia: distancia.toFixed(1) } // R$ 3,00
  }
}

// --- ÁREA DO CLIENTE ---

export async function getCardapio() {
  const [produtos, tamanhos, config] = await Promise.all([
    prisma.produto.findMany({ where: { disponivel: true }, orderBy: [{ destaque: 'desc' }, { ordem: 'asc' }] }),
    prisma.tamanho.findMany({ orderBy: { ordem: 'asc' } }),
    prisma.configuracao.findUnique({ where: { id: 'config' } })
  ])
  return { produtos, tamanhos, config }
}

export async function buscarClientePorTelefone(telefone: string) {
  try {
    const telLimpo = telefone.trim()
    const cliente = await prisma.cliente.findUnique({ where: { telefone: telLimpo } })
    if (cliente) return { success: true, cliente }
    return { success: false }
  } catch (error) { return { success: false } }
}

export async function criarPedido(dados: any) {
  try {
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

// --- ADMIN ---
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
    where: { createdAt: { gte: hoje } },
    include: { cliente: true, itens: { include: { produto: true, tamanho: true } } },
    orderBy: { createdAt: 'desc' }
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

// --- GERENCIAMENTO DE TAMANHOS ---

export async function salvarTamanho(dados: any) {
  try {
    const { id, nome, descricao, preco, ativo, ordem } = dados

    if (id) {
      // Atualizar existente
      await prisma.tamanho.update({
        where: { id },
        data: { nome, descricao, preco, ativo, ordem }
      })
    } else {
      // Criar novo
      await prisma.tamanho.create({
        data: { 
          nome, descricao, preco, ativo, 
          ordem: ordem || 99 
        }
      })
    }
    revalidatePath('/admin/tamanhos')
    revalidatePath('/pedir')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Erro ao salvar tamanho' }
  }
}

export async function toggleTamanhoAtivo(id: string, estadoAtual: boolean) {
  await prisma.tamanho.update({
    where: { id },
    data: { ativo: !estadoAtual }
  })
  revalidatePath('/admin/tamanhos')
  revalidatePath('/pedir')
}

export async function deletarTamanho(id: string) {
  try {
    await prisma.tamanho.delete({ where: { id } })
    revalidatePath('/admin/tamanhos')
    revalidatePath('/pedir')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Não é possível excluir um tamanho que já tem pedidos.' }
  }
}