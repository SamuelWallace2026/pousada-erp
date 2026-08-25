import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ==========================================
// ROTAS DE QUARTOS
// ==========================================
app.get('/api/quartos', async (req: Request, res: Response) => {
  const quartos = await prisma.quarto.findMany();
  res.json(quartos);
});

app.post('/api/quartos', async (req: Request, res: Response) => {
  const { numero, capacidade, valorDiaria } = req.body;
  const novoQuarto = await prisma.quarto.create({
    data: { numero, capacidade, valorDiaria }
  });
  res.status(201).json(novoQuarto);
});

// ==========================================
// ROTAS DE HÓSPEDES
// ==========================================
app.get('/api/hospedes', async (req: Request, res: Response) => {
  const hospedes = await prisma.hospede.findMany();
  res.json(hospedes);
});

app.post('/api/hospedes', async (req: Request, res: Response) => {
  const { nome, cpf, email, telefone } = req.body;
  const novoHospede = await prisma.hospede.create({
    data: { nome, cpf, email, telefone }
  });
  res.status(201).json(novoHospede);
});

// ==========================================
// ROTAS DE RESERVAS
// ==========================================
app.get('/api/reservas', async (req: Request, res: Response) => {
  const reservas = await prisma.reserva.findMany({
    include: { hospede: true, quarto: true }
  });
  res.json(reservas);
});

app.post('/api/reservas', async (req: Request, res: Response) => {
  const { hospedeId, quartoId, dataCheckIn, dataCheckOut } = req.body;
  
  const novaReserva = await prisma.reserva.create({
    data: { 
      hospedeId, 
      quartoId, 
      dataCheckIn: new Date(dataCheckIn), 
      dataCheckOut: new Date(dataCheckOut) 
    }
  });

  await prisma.quarto.update({
    where: { id: quartoId },
    data: { status: 'RESERVADO' }
  });

  res.status(201).json(novaReserva);
});

// ==========================================
// ROTA NOVA: CHECK-OUT 🚪🚶‍♂️
// ==========================================
app.put('/api/reservas/:id/checkout', async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1. Atualiza a reserva para "CONCLUÍDA"
  const reservaAtualizada = await prisma.reserva.update({
    where: { id },
    data: { status: 'CONCLUÍDA' }
  });

  // 2. Libera o quarto alterando o status de volta para "LIVRE"
  await prisma.quarto.update({
    where: { id: reservaAtualizada.quartoId },
    data: { status: 'LIVRE' }
  });

  res.json({ message: 'Check-out realizado com sucesso!' });
});

// ==========================================
  // ROTAS DO FINANCEIRO (CAIXA) - ETAPA 3
  // ==========================================
  
  // 1. Buscar todas as transações do dia/histórico
  app.get('/api/transacoes', async (req, res) => {
    const transacoes = await prisma.transacao.findMany({
      orderBy: { criadoEm: 'desc' } // Traz as mais recentes primeiro
    });
    res.json(transacoes);
  });

  // 2. Criar uma nova transação (Entrada ou Saída)
  app.post('/api/transacoes', async (req, res) => {
    const { tipo, valor, metodoPagamento, descricao } = req.body;
    
    try {
      const transacao = await prisma.transacao.create({
        data: {
          tipo,
          valor: Number(valor),
          metodoPagamento,
          descricao
        }
      });
      res.status(201).json(transacao);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao registrar transação no caixa.' });
    }
  });

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Servidor da Pousada rodando na porta ${PORT} 🚀`);
});