import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ROTAS DE HÓSPEDES
app.get('/api/hospedes', async (req, res) => {
  const hospedes = await prisma.hospede.findMany();
  res.json(hospedes);
});

app.post('/api/hospedes', async (req, res) => {
  const { nome, cpf, email, telefone } = req.body;
  try {
    const hospede = await prisma.hospede.create({
      data: { nome, cpf, email, telefone }
    });
    res.status(201).json(hospede);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar hóspede' });
  }
});

// ROTAS DE QUARTOS
app.get('/api/quartos', async (req, res) => {
  const quartos = await prisma.quarto.findMany();
  res.json(quartos);
});

app.post('/api/quartos', async (req, res) => {
  const { numero, capacidade, valorDiaria, categoria } = req.body;
  try {
    const quarto = await prisma.quarto.create({
      data: { 
        numero, 
        capacidade: Number(capacidade), 
        valorDiaria: Number(valorDiaria),
        categoria: categoria || 'Padrão'
      }
    });
    res.status(201).json(quarto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar quarto' });
  }
});

// ROTAS DE RESERVAS
app.get('/api/reservas', async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: { 
        hospede: true, 
        quarto: true,
        consumos: { include: { produto: true } }
      }
    });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar reservas' });
  }
});

app.post('/api/reservas', async (req, res) => {
  const { hospedeId, quartoId, dataCheckIn, dataCheckOut, origem } = req.body;
  try {
    const novaReserva = await prisma.reserva.create({
      data: {
        hospedeId,
        quartoId,
        dataCheckIn: new Date(dataCheckIn),
        dataCheckOut: new Date(dataCheckOut),
        origem: origem || 'Direto'
      },
      include: { hospede: true }
    });

    await prisma.quarto.update({
      where: { id: quartoId },
      data: { status: 'OCUPADO' }
    });

    const emailHospede = novaReserva.hospede.email || `hospede_${novaReserva.hospede.cpf.replace(/\D/g, '')}@pousada.com`;
    
    const usuarioExistente = await prisma.usuario.findFirst({
      where: { email: emailHospede }
    });

    if (usuarioExistente) {
      await prisma.usuario.update({
        where: { id: usuarioExistente.id },
        data: { reservaId: novaReserva.id }
      });
    } else {
      await prisma.usuario.create({
        data: {
          nome: novaReserva.hospede.nome,
          email: emailHospede,
          senha: '123',
          cargo: 'HOSPEDE',
          reservaId: novaReserva.id
        }
      });
    }

    res.status(201).json(novaReserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar reserva.' });
  }
});

app.put('/api/reservas/:id/checkout', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const reservaAtualizada = await prisma.reserva.update({
      where: { id },
      data: { status: 'CONCLUÍDA' }
    });

    await prisma.quarto.update({
      where: { id: reservaAtualizada.quartoId },
      data: { status: 'LIVRE' }
    });

    res.json({ message: 'Check-out realizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer check-out' });
  }
});

// ROTAS DO CAIXA
app.get('/api/transacoes', async (req, res) => {
  const transacoes = await prisma.transacao.findMany({ orderBy: { criadoEm: 'desc' } });
  res.json(transacoes);
});

app.post('/api/transacoes', async (req, res) => {
  const { tipo, valor, metodoPagamento, descricao } = req.body;
  try {
    const transacao = await prisma.transacao.create({
      data: { tipo, valor: Number(valor), metodoPagamento, descricao }
    });
    res.status(201).json(transacao);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// ROTAS DO RESTAURANTE
app.get('/api/produtos', async (req, res) => {
  const produtos = await prisma.produto.findMany();
  res.json(produtos);
});

app.post('/api/produtos', async (req, res) => {
  const { nome, preco, estoque } = req.body;
  try {
    const produto = await prisma.produto.create({
      data: { nome, preco: Number(preco), estoque: Number(estoque) }
    });
    res.status(201).json(produto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar produto.' });
  }
});

app.post('/api/consumos', async (req, res) => {
  const { reservaId, produtoId, quantidade } = req.body;
  try {
    const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });

    const subtotal = produto.preco * Number(quantidade);

    const consumo = await prisma.consumo.create({
      data: { reservaId, produtoId, quantidade: Number(quantidade), subtotal }
    });
    res.status(201).json(consumo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao lançar consumo.' });
  }
});

// ROTA DE LOGIN
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { reserva: true }
    });

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos!' });
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      cargo: usuario.cargo,
      reservaId: usuario.reservaId || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Servidor da Pousada rodando na porta ${PORT} 🚀`);
});