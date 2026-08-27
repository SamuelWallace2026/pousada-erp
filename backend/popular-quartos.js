const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const quartos = [
  {
    numero: 'C-01',
    categoria: 'Chalé Luxo Família',
    capacidade: 4, // Até 3 adultos + crianças/berço
    valorDiaria: 450.00,
    descricao: 'Pensado para famílias, o Chalé Luxo Família oferece um espaço amplo, confortável e totalmente equipado. Acomoda casais com crianças ou até três adultos. Crianças e pets são bem-vindos. A varanda privativa com rede e piscina exclusiva garante momentos de descanso com total privacidade em Majorlândia.',
    itensInclusos: 'Cama king, cama de solteiro (opção de colchão extra/berço), cozinha completa, banheiro privativo, Wi-Fi, ar-condicionado, Alexa, varanda com rede, piscina exclusiva, café da manhã e estacionamento.'
  },
  {
    numero: 'C-02',
    categoria: 'Chalé Luxo Casal',
    capacidade: 3, // Casal + possibilidade de berço/colchão extra
    valorDiaria: 380.00,
    descricao: 'O Chalé Luxo Casal foi projetado para oferecer conforto, privacidade e uma experiência acolhedora para casais, recebendo também crianças e pets. A varanda privativa com piscina exclusiva garante momentos de descanso em um ambiente tranquilo e reservado em Majorlândia.',
    itensInclusos: 'Cama queen-size (opção de colchão extra/berço), cozinha completa, banheiro privativo, Wi-Fi, ar-condicionado, Alexa, armador de rede, piscina exclusiva, café da manhã e estacionamento.'
  },
  {
    numero: 'S-01',
    categoria: 'Suíte Luxo Família',
    capacidade: 4, // Casais com crianças ou até 3 adultos
    valorDiaria: 350.00,
    descricao: 'A Suíte Luxo Família oferece um ambiente confortável e funcional para famílias que buscam praticidade e bem-estar. Uma escolha ideal para famílias que desejam conforto e tranquilidade em Majorlândia, com acesso liberado à piscina da pousada.',
    itensInclusos: 'Cama king-size, cama de solteiro (opção de colchão extra/berço), frigobar, banheiro privativo, Wi-Fi, ar-condicionado, acesso à piscina, café da manhã e estacionamento.'
  },
  {
    numero: 'S-02',
    categoria: 'Suíte Luxo Casal',
    capacidade: 3, // Casal + berço/pets
    valorDiaria: 280.00,
    descricao: 'A Suíte Luxo Casal foi pensada para oferecer conforto e praticidade a dois hóspedes. É ideal para casais, viajantes com bebê ou até quem traz pets. Uma opção acolhedora e funcional para quem deseja descansar com conforto em Majorlândia.',
    itensInclusos: 'Cama queen-size (possibilidade de berço), frigobar, banheiro privativo, Wi-Fi, ar-condicionado, acesso à piscina, café da manhã e estacionamento.'
  },
  {
    numero: 'S-03',
    categoria: 'Suíte Luxo Casal + Solteiro',
    capacidade: 3, // Casal + 1 filho ou 3 adultos
    valorDiaria: 310.00,
    descricao: 'A Suíte Luxo Casal + Solteiro oferece o equilíbrio ideal entre conforto e praticidade para quem viaja em dupla e traz mais um acompanhante. Acomoda perfeitamente casais com um filho ou três adultos.',
    itensInclusos: 'Cama de casal, cama de solteiro, frigobar, banheiro privativo, Wi-Fi, ar-condicionado, acesso à piscina, café da manhã e estacionamento.'
  },
  {
    numero: 'S-04',
    categoria: 'Suíte Luxo Duplo ou Triplo',
    capacidade: 3, // Duas camas + extra/berço
    valorDiaria: 310.00,
    descricao: 'A Suíte Luxo Duplo oferece praticidade e conforto para dois hóspedes, ideal para amigos, colegas de viagem ou quem deseja camas separadas, permitindo acomodar até três pessoas com comodidade. Crianças e pets são bem-vindos.',
    itensInclusos: 'Duas camas box de solteiro (opção de cama extra/berço), frigobar, banheiro privativo, Wi-Fi, ar-condicionado, acesso à piscina, café da manhã e estacionamento.'
  }
];

async function main() {
  console.log('🏨 Iniciando o cadastro de quartos da Pousada Refúgio Dourado...');
  
  for (const quarto of quartos) {
    // Usando upsert para não duplicar caso rode o script mais de uma vez
    await prisma.quarto.upsert({
      where: { numero: quarto.numero },
      update: {},
      create: quarto,
    });
    console.log(`✅ ${quarto.categoria} (Num: ${quarto.numero}) cadastrado!`);
  }
  
  console.log('🎉 Todos os quartos foram cadastrados com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao popular os quartos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });