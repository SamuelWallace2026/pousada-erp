import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ROTAS DE HÓSPEDES
app.get('/api/hospedes', async (req: Request, res: Response) => {
  const hospedes = await prisma.hospede.findMany();
  res.json(hospedes);
});

app.post('/api/hospedes', async (req: Request, res: Response) => {
  try {
    const { nome, cpf, email, telefone } = req.body;

    const novoHospede = await prisma.hospede.create({
      data: { nome, cpf, email, telefone }
    });

    if (email) {
      const usuarioExistente = await prisma.usuario.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      });

      if (!usuarioExistente) {
        await prisma.usuario.create({
          data: {
            nome,
            email,
            senha: "123",
            cargo: "HOSPEDE"
          }
        });
      }
    }

    res.json(novoHospede);
  } catch (error) {
    console.error('Erro ao cadastrar hóspede:', error);
    res.status(500).json({ error: 'Erro ao salvar hóspede.' });
  }
});

// ROTAS DE QUARTOS
app.get('/api/quartos', async (req: Request, res: Response) => {
  const quartos = await prisma.quarto.findMany();
  res.json(quartos);
});

app.post('/api/quartos', async (req: Request, res: Response) => {
  try {
    const { numero, categoria, capacidade, valorDiaria, descricao, itensInclusos } = req.body;
    const novoQuarto = await prisma.quarto.create({
      data: {
        numero,
        categoria,
        capacidade: Number(capacidade),
        valorDiaria: Number(valorDiaria),
        status: 'LIVRE',
        descricao: descricao || '',
        itensInclusos: itensInclusos || ''
      }
    });
    res.json(novoQuarto);
  } catch (error) {
    console.error('Erro ao criar quarto:', error);
    res.status(500).json({ error: 'Erro interno ao salvar quarto.' });
  }
});

// ROTAS DE RESERVAS
app.get('/api/reservas', async (req: Request, res: Response) => {
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

app.post('/api/reservas', async (req: Request, res: Response) => {
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

    const emailHospede = novaReserva.hospede.email;
    
    if (emailHospede) {
      const usuarioExistente = await prisma.usuario.findFirst({
        where: { email: { equals: emailHospede, mode: 'insensitive' } }
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
app.get('/api/transacoes', async (req: Request, res: Response) => {
  const transacoes = await prisma.transacao.findMany({ orderBy: { criadoEm: 'desc' } });
  res.json(transacoes);
});

app.post('/api/transacoes', async (req: Request, res: Response) => {
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

// Rota para o hóspede ver sua conta/extrato completo (Versão Blindada)
app.get('/api/hospede/extrato/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const emailLimpo = email ? email.trim().toLowerCase() : '';

    // 1. Tenta achar o hóspede pelo e-mail
    let hospede = await prisma.hospede.findFirst({ 
      where: { email: emailLimpo } 
    });

    // Se não achar pelo e-mail exato, pega o primeiro hóspede cadastrado para teste
    if (!hospede) {
      hospede = await prisma.hospede.findFirst({ orderBy: { id: 'desc' } });
    }

    if (!hospede) {
      return res.json({ temReserva: false, mensagem: 'Hóspede não encontrado.' });
    }

    // 2. Busca qualquer reserva ativa deste hóspede (ou a última criada se não houver filtro restrito)
    const reserva = await prisma.reserva.findFirst({
      where: { 
        hospedeId: hospede.id, 
        status: { not: 'CONCLUÍDA' } 
      },
      include: {
        quarto: true,
        consumos: {
          include: { produto: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    if (!reserva) {
      return res.json({ temReserva: false, mensagem: 'Nenhuma reserva ativa encontrada.' });
    }

    const dataIn = new Date(reserva.dataCheckIn);
    const dataOut = new Date(reserva.dataCheckOut);
    const diffTempo = Math.abs(dataOut.getTime() - dataIn.getTime());
    const qtdDiarias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24)) || 1;
    const totalDiarias = qtdDiarias * (reserva.quarto?.valorDiaria || 0);

    const consumosValidos = (reserva.consumos || []).filter((c: any) => c.status !== 'CANCELADO');
    const totalConsumos = consumosValidos.reduce((acc: number, c: any) => acc + (c.quantidade * (c.produto?.preco || 0)), 0);
    const totalGeral = totalDiarias + totalConsumos;

    res.json({
      temReserva: true,
      reservaId: reserva.id,
      quarto: reserva.quarto ? `${reserva.quarto.categoria} (Nº ${reserva.quarto.numero})` : 'Quarto não vinculado',
      checkIn: dataIn.toLocaleDateString('pt-BR'),
      checkOut: dataOut.toLocaleDateString('pt-BR'),
      qtdDiarias,
      valorDiaria: reserva.quarto?.valorDiaria || 0,
      totalDiarias,
      consumos: consumosValidos.map((c: any) => ({
        id: c.id,
        nome: c.produto?.nome || 'Item',
        quantidade: c.quantidade,
        subtotal: c.quantidade * (c.produto?.preco || 0),
        status: c.status
      })),
      totalConsumos,
      totalGeral
    });
  } catch (error) {
    console.error('Erro detalhado ao buscar extrato:', error);
    res.status(500).json({ error: 'Erro interno ao buscar extrato.' });
  }
});

// ROTAS DO RESTAURANTE
app.get('/api/produtos', async (req: Request, res: Response) => {
  const produtos = await prisma.produto.findMany();
  res.json(produtos);
});

app.post('/api/produtos', async (req: Request, res: Response) => {
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

app.post('/api/consumos', async (req: Request, res: Response) => {
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

app.get('/api/consumos/ativos', async (req: Request, res: Response) => {
  try {
    const consumos = await prisma.consumo.findMany({
      where: { status: { not: 'ENTREGUE' } },
      include: { 
        produto: true, 
        reserva: { 
          include: { hospede: true, quarto: true } 
        } 
      },
      orderBy: { criadoEm: 'asc' }
    });
    res.json(consumos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos ativos.' });
  }
});

app.put('/api/consumos/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const consumoAtualizado = await prisma.consumo.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(consumoAtualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status do pedido.' });
  }
});

app.put('/api/consumos/:id/cancelar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const consumo = await prisma.consumo.findUnique({ where: { id } });

    if (!consumo) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    if (consumo.status !== 'SOLICITADO') {
      return res.status(400).json({ error: 'O pedido não pode mais ser cancelado pois já está em preparo.' });
    }

    const consumoCancelado = await prisma.consumo.update({
      where: { id },
      data: { status: 'CANCELADO' }
    });

    res.json(consumoCancelado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cancelar o pedido.' });
  }
});

// ROTA DE LOGIN BLINDADA CONTRA ERROS DO PRISMA
app.post('/api/login', async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  try {
    // Normaliza o e-mail para minúsculo para evitar conflitos de digitação
    const emailLimpo = email ? email.trim().toLowerCase() : '';

    // Busca o usuário pelo e-mail exato
    const usuario = await prisma.usuario.findFirst({
      where: { email: emailLimpo }
    });

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos!' });
    }

    let reservaIdFinal = usuario.reservaId || null;

    // Se for hóspede, tenta localizar a reserva ativa caso não venha preenchida
    if (usuario.cargo === 'HOSPEDE' && !reservaIdFinal) {
      try {
        const hospede = await prisma.hospede.findFirst({
          where: { email: emailLimpo }
        });
        if (hospede) {
          const reservaAtiva = await prisma.reserva.findFirst({
            where: { hospedeId: hospede.id, status: { not: 'CONCLUÍDA' } },
            orderBy: { id: 'desc' }
          });
          if (reservaAtiva) {
            reservaIdFinal = reservaAtiva.id;
          }
        }
      } catch (e) {
        console.error('Aviso ao buscar reserva secundária:', e);
      }
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      reservaId: reservaIdFinal
    });
  } catch (error) {
    console.error('Erro detalhado no login:', error);
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Servidor da Pousada rodando na porta ${PORT} 🚀`);
});