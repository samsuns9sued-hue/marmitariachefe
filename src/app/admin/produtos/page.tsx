// src/app/admin/produtos/page.tsx
import { prisma } from '@/lib/prisma'
import AdminProdutosClient from './AdminProdutosClient'

export const dynamic = 'force-dynamic'

export default async function AdminProdutos() {
  const produtos = await prisma.produto.findMany({
    orderBy: { ordem: 'asc' }
  })

  return <AdminProdutosClient produtos={produtos} />
}