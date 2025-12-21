import { PrismaClient, Categoria, FormaPagamento } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpar dados existentes
  await prisma.itemPedido.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.produto.deleteMany()
  await prisma.tamanho.deleteMany()
  await prisma.configuracao.deleteMany()

  // Criar configuração inicial
  await prisma.configuracao.create({
    data: {
      id: 'config',
      nomeLoja: 'Marmitaria da Mãe',
      telefone: '11999999999',
      horarioAbertura: '11:00',
      horarioFechamento: '14:00',
      aceitaPedidos: true,
      taxaEntrega: 5.00,
      pixChave: '11999999999',
      pixNome: 'Maria Silva',
      senhaAdmin: '123456',
    }
  })

  // Criar tamanhos
  const tamanhos = await Promise.all([
    prisma.tamanho.create({
      data: { nome: 'P', descricao: 'Pequena - Ideal para 1 pessoa', preco: 15.00, ordem: 1 }
    }),
    prisma.tamanho.create({
      data: { nome: 'M', descricao: 'Média - Com bastante comida', preco: 18.00, ordem: 2 }
    }),
    prisma.tamanho.create({
      data: { nome: 'G', descricao: 'Grande - Para quem tem fome!', preco: 22.00, ordem: 3 }
    }),
    prisma.tamanho.create({
      data: { nome: 'GG', descricao: 'Gigante - Dá pra dividir', preco: 28.00, ordem: 4 }
    }),
  ])

  // Criar misturas (pratos do dia)
  await prisma.produto.createMany({
    data: [
      { nome: 'Bife Acebolado', descricao: 'Bife grelhado com cebolas douradas', categoria: Categoria.MISTURA, disponivel: true, destaque: true, ordem: 1 },
      { nome: 'Frango Grelhado', descricao: 'Peito de frango temperado e grelhado', categoria: Categoria.MISTURA, disponivel: true, destaque: true, ordem: 2 },
      { nome: 'Strogonoff de Frango', descricao: 'Cremoso com batata palha', categoria: Categoria.MISTURA, disponivel: true, ordem: 3 },
      { nome: 'Peixe Frito', descricao: 'Filé de tilápia empanado', categoria: Categoria.MISTURA, disponivel: false, ordem: 4 },
      { nome: 'Linguiça Calabresa', descricao: 'Acebolada', categoria: Categoria.MISTURA, disponivel: true, ordem: 5 },
      { nome: 'Ovo Frito', descricao: '2 ovos fritos', categoria: Categoria.MISTURA, disponivel: true, ordem: 6 },
    ]
  })

  // Criar complementos
  await prisma.produto.createMany({
    data: [
      { nome: 'Batata Frita', descricao: 'Porção extra de batata', categoria: Categoria.COMPLEMENTO, preco: 5.00, disponivel: true, ordem: 1 },
      { nome: 'Farofa', descricao: 'Farofa caseira temperada', categoria: Categoria.COMPLEMENTO, preco: 3.00, disponivel: true, ordem: 2 },
      { nome: 'Vinagrete', descricao: 'Salada de tomate e cebola', categoria: Categoria.COMPLEMENTO, preco: 2.00, disponivel: true, ordem: 3 },
      { nome: 'Salada Extra', descricao: 'Alface, tomate e cenoura', categoria: Categoria.COMPLEMENTO, preco: 4.00, disponivel: true, ordem: 4 },
      { nome: 'Ovo Extra', descricao: '1 ovo frito adicional', categoria: Categoria.COMPLEMENTO, preco: 2.50, disponivel: true, ordem: 5 },
    ]
  })

  // Criar bebidas
  await prisma.produto.createMany({
    data: [
      { nome: 'Refrigerante Lata', descricao: 'Coca, Guaraná ou Fanta', categoria: Categoria.BEBIDA, preco: 5.00, disponivel: true, ordem: 1 },
      { nome: 'Suco Natural', descricao: 'Laranja, Limão ou Maracujá', categoria: Categoria.BEBIDA, preco: 6.00, disponivel: true, ordem: 2 },
      { nome: 'Água Mineral', descricao: '500ml', categoria: Categoria.BEBIDA, preco: 3.00, disponivel: true, ordem: 3 },
    ]
  })

  console.log('✅ Seed executado com sucesso!')
  console.log('Tamanhos criados:', tamanhos.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })