'use client'

import useSWR from 'swr'
import { PedidoCompleto } from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UsePedidosOptions {
  status?: string[]
  refreshInterval?: number
}

export function usePedidos(options: UsePedidosOptions = {}) {
  const { status, refreshInterval = 15000 } = options

  const params = new URLSearchParams()
  if (status && status.length > 0) {
    params.set('status', status.join(','))
  }

  const url = `/api/pedidos${params.toString() ? `?${params.toString()}` : ''}`

  const { data, error, isLoading, mutate } = useSWR<PedidoCompleto[]>(
    url,
    fetcher,
    {
      refreshInterval, // Atualiza a cada X ms
      revalidateOnFocus: true,
    }
  )

  return {
    pedidos: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function usePedido(id: string) {
  const { data, error, isLoading, mutate } = useSWR<PedidoCompleto>(
    id ? `/api/pedidos/${id}` : null,
    fetcher
  )

  return {
    pedido: data,
    isLoading,
    isError: error,
    mutate,
  }
}