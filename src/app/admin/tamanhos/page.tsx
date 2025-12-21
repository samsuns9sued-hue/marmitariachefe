import { prisma } from '@/lib/prisma'
import AdminTamanhosClient from './AdminTamanhosClient'

export const dynamic = 'force-dynamic'

export default async function AdminTamanhosPage() {
  const tamanhos = await prisma.tamanho.findMany({
    orderBy: { ordem: 'asc' }
  })

  return <AdminTamanhosClient tamanhos={tamanhos} />
}