const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cardapio = [
  // PETISCOS
  { nome: 'Camarão Grande Alho e Óleo (400g)', preco: 65.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Bolinho Camarão, Carne de Sol, Queijo ou Arraia (8 un.)', preco: 28.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Camarão Crocante Empanado Panko c/ Maracujá (200g)', preco: 52.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Casquinha de Siri / Combo de Caranguejo (3 un.)', preco: 70.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Isca de Peixe Crocante (300g)', preco: 47.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Carne de Sol Acebolada (200g)', preco: 52.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Caldo de Peixe (Copo)', preco: 12.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Dadinho de Tapioca com Geleia de Pimenta (8 un.)', preco: 28.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Batata Frita (300g)', preco: 25.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Fritas com Carne Desfiada e Sour Cream', preco: 58.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Macaxeira Frita (300g)', preco: 28.00, estoque: 100, categoria: 'RESTAURANTE' },

  // PRATOS PRINCIPAIS - DO MAR
  { nome: 'Peixe Inteiro Frito (1kg) c/ Legumes e Baião', preco: 165.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Filé de Peixe Grelhado (400g) c/ Legumes e Arroz', preco: 140.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Filé de Peixe (400g) à Milanesa c/ Feijão Verde e Cuscuz', preco: 145.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Filé de Peixe à Delícia (400g)', preco: 155.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Peixada Cearense (500g) c/ Pirão e Arroz', preco: 150.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Peixada Cearense (500g) c/ Filé de Camarão (200g)', preco: 170.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Arroz de Camarão Cremoso c/ Isca de Peixe', preco: 170.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Camarão ao Dengo (200g) c/ Arroz de Coco', preco: 150.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Moqueca de Filé de Camarão (200g)', preco: 145.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Moqueca de Arraia (200g)', preco: 110.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Polvo Grelhado c/ Arroz Romesco e Bacon', preco: 150.00, estoque: 50, categoria: 'RESTAURANTE' },

  // PRATOS PRINCIPAIS - DA TERRA & OUTROS
  { nome: 'Filé de Frango à Cubana (300g)', preco: 110.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Filé de Frango Grelhado (300g)', preco: 75.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Carne de Sol Desfiada (300g) c/ Banana Grelhada', preco: 135.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Carne de Sol Acebolada (300g) c/ Macaxeira', preco: 130.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Filé Mignon Grelhado (400g) ao Molho Madeira', preco: 140.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Filé Mignon Grelhado (400g) ao Gorgonzola', preco: 150.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Espaguete Grano Duro c/ Camarão e Telha de Parmesão', preco: 145.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Arroz Caldoso de Carne de Sol c/ Queijo Coalho', preco: 135.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Filezinho Kids (Carne ou Frango) 100g', preco: 30.00, estoque: 50, categoria: 'RESTAURANTE' },
  { nome: 'Vegetariano - Espaguete ao Pesto', preco: 80.00, estoque: 50, categoria: 'RESTAURANTE' },

  // GUARNIÇÕES & SOBREMESAS
  { nome: 'Vinagrete (Extra)', preco: 8.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Arroz Branco (Extra)', preco: 12.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Arroz à Grega / Baião de Dois / Pirão', preco: 16.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Salada de Feijão Verde e Abóbora c/ Cuscuz', preco: 22.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Salada Verde', preco: 20.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Tapioca de Café c/ Doce de Leite e Banana', preco: 24.00, estoque: 100, categoria: 'RESTAURANTE' },
  { nome: 'Brigadeiro de Colher', preco: 8.00, estoque: 100, categoria: 'RESTAURANTE' },

  // BEBIDAS & DRINKS (RESUMO)
  { nome: 'Suco (Copo)', preco: 7.00, estoque: 500, categoria: 'RESTAURANTE' },
  { nome: 'Suco (Jarra)', preco: 18.00, estoque: 500, categoria: 'RESTAURANTE' },
  { nome: 'Água de Coco (Jarra)', preco: 14.00, estoque: 500, categoria: 'RESTAURANTE' },
  { nome: 'Coco (Unidade)', preco: 6.00, estoque: 500, categoria: 'RESTAURANTE' },
  { nome: 'Água Mineral c/s Gás', preco: 5.00, estoque: 500, categoria: 'RESTAURANTE' },
  { nome: 'Refrigerante Lata', preco: 6.00, estoque: 500, categoria: 'RESTAURANTE' },
  { nome: 'Cerveja 600ml (Skol, Brahma, Amstel, Spaten)', preco: 15.00, estoque: 300, categoria: 'RESTAURANTE' },
  { nome: 'Cerveja 600ml (Heineken / Original)', preco: 19.00, estoque: 300, categoria: 'RESTAURANTE' },
  { nome: 'Longneck (Stella, Corona, Heineken)', preco: 14.00, estoque: 300, categoria: 'RESTAURANTE' },
  { nome: 'Caipirinha / Caipiroska Nacional', preco: 17.00, estoque: 200, categoria: 'RESTAURANTE' },
  { nome: 'Drinks (Aperol, Gin Tônica, Mimosa, Melosca)', preco: 22.00, estoque: 200, categoria: 'RESTAURANTE' }
];

async function main() {
  console.log('🍹 Iniciando injeção do cardápio Dengo...');
  
  for (const item of cardapio) {
    await prisma.produto.create({ data: item });
  }
  
  console.log('✅ Cardápio injetado com sucesso! Seus hóspedes já podem fazer os pedidos!');
}

main()
  .catch((e) => {
    console.error('Erro ao popular o cardápio:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });