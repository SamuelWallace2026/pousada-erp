import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- AUTENTICAÇÃO ---
app.post('/api/login', async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  try {
    const emailLimpo = email ? email.trim().toLowerCase() : '';
    const usuario = await prisma.usuario.findFirst({ where: { email: emailLimpo } });

    if (!usuario) return res.status(401).json({ error: 'E-mail ou senha incorretos!' });

    let senhaValida = false;
    if (usuario.senha.startsWith('$2b$')) {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } else {
      senhaValida = (usuario.senha === senha);
    }

    if (!senhaValida) return res.status(401).json({ error: 'E-mail ou senha incorretos!' });

    let reservaIdFinal = usuario.reservaId || null;
    if (usuario.cargo === 'HOSPEDE' && !reservaIdFinal) {
      try {
        const hospede = await prisma.hospede.findFirst({ where: { email: emailLimpo } });
        if (hospede) {
          const reservaAtiva = await prisma.reserva.findFirst({
            where: { hospedeId: hospede.id, status: { not: 'CONCLUÍDA' } },
            orderBy: { id: 'desc' }
          });
          if (reservaAtiva) reservaIdFinal = reservaAtiva.id;
        }
      } catch (e) { console.error(e); }
    }

    res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo, reservaId: reservaIdFinal });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

app.put('/api/usuarios/:id/senha', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { senhaAtual, novaSenha } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });

    let senhaValida = usuario.senha.startsWith('$2b$') ? await bcrypt.compare(senhaAtual, usuario.senha) : (usuario.senha === senhaAtual);
    if (!senhaValida) return res.status(401).json({ error: 'A senha atual está incorreta.' });

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({ where: { id }, data: { senha: novaSenhaHash } });
    return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor ao alterar a senha.' });
  }
});

// --- HÓSPEDES ---
app.get('/api/hospedes', async (req: Request, res: Response) => {
  res.json(await prisma.hospede.findMany());
});

app.post('/api/hospedes', async (req: Request, res: Response) => {
  try {
    const { nome, cpf, email, telefone } = req.body;
    const novoHospede = await prisma.hospede.create({ data: { nome, cpf, email, telefone } });
    if (email) {
      const usuarioExistente = await prisma.usuario.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
      if (!usuarioExistente) {
        await prisma.usuario.create({ data: { nome, email, senha: "123", cargo: "HOSPEDE" } });
      }
    }
    res.json(novoHospede);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar hóspede.' });
  }
});

// --- OPERAÇÕES ---
app.post('/api/operacoes/limpeza', async (req, res) => {
  try {
    const { quarto, tipo, observacao, status, urgente } = req.body;
    const novaTarefa = await prisma.tarefaLimpeza.create({ data: { quarto, tipo, observacao: observacao || '', status: status || 'Sujo', urgente: urgente || false } });
    res.status(201).json(novaTarefa);
  } catch (error) { res.status(500).json({ error: 'Erro interno.' }); }
});

app.post('/api/operacoes/reparos', async (req, res) => {
  try {
    const { local, descricao, prioridade, status, hospedeEnvolvido } = req.body;
    const novoChamado = await prisma.chamadoManutencao.create({ data: { local, descricao, prioridade: prioridade || 'Média', tempoEspera: 'Agora', status: status || 'Pendente', hospedeEnvolvido: hospedeEnvolvido || null } });
    res.status(201).json(novoChamado);
  } catch (error) { res.status(500).json({ error: 'Erro interno.' }); }
});

// --- QUARTOS ---
app.get('/api/quartos', async (req: Request, res: Response) => { res.json(await prisma.quarto.findMany()); });
app.post('/api/quartos', async (req: Request, res: Response) => {
  try {
    const { numero, categoria, capacidade, valorDiaria, descricao, itensInclusos } = req.body;
    const novoQuarto = await prisma.quarto.create({ data: { numero, categoria, capacidade: Number(capacidade), valorDiaria: Number(valorDiaria), status: 'LIVRE', descricao: descricao || '', itensInclusos: itensInclusos || '' } });
    res.json(novoQuarto);
  } catch (error) { res.status(500).json({ error: 'Erro interno.' }); }
});

// --- RESERVAS ---
app.get('/api/reservas', async (req: Request, res: Response) => {
  try {
    const reservas = await prisma.reserva.findMany({ include: { hospede: true, quarto: true, consumos: { include: { produto: true } } } });
    res.json(reservas);
  } catch (error) { res.status(500).json({ error: 'Erro ao buscar reservas' }); }
});

app.post('/api/reservas', async (req: Request, res: Response) => {
  const { hospedeId, quartoId, dataCheckIn, dataCheckOut, origem } = req.body;
  try {
    const novaReserva = await prisma.reserva.create({ data: { hospedeId, quartoId, dataCheckIn: new Date(dataCheckIn), dataCheckOut: new Date(dataCheckOut), origem: origem || 'Direto' }, include: { hospede: true } });
    await prisma.quarto.update({ where: { id: quartoId }, data: { status: 'OCUPADO' } });
    res.status(201).json(novaReserva);
  } catch (error) { res.status(500).json({ error: 'Erro ao criar reserva.' }); }
});

app.put('/api/reservas/:id/checkout', async (req: Request, res: Response) => {
  try {
    const reservaAtualizada = await prisma.reserva.update({ where: { id: req.params.id }, data: { status: 'CONCLUÍDA' } });
    await prisma.quarto.update({ where: { id: reservaAtualizada.quartoId }, data: { status: 'LIVRE' } });
    res.json({ message: 'Check-out realizado com sucesso!' });
  } catch (error) { res.status(500).json({ error: 'Erro ao fazer check-out' }); }
});

// --- PORTAL DO HÓSPEDE (EXTRATO + MENSAGENS) ---
app.get('/api/hospede/extrato/:email', async (req: Request, res: Response) => {
  try {
    const emailLimpo = req.params.email ? req.params.email.trim().toLowerCase() : '';
    let hospede = await prisma.hospede.findFirst({ where: { email: emailLimpo } });
    if (!hospede) hospede = await prisma.hospede.findFirst({ orderBy: { id: 'desc' } });
    if (!hospede) return res.json({ temReserva: false });

    const reserva = await prisma.reserva.findFirst({
      where: { hospedeId: hospede.id, status: { not: 'CONCLUÍDA' } },
      include: { quarto: true, consumos: { include: { produto: true } } },
      orderBy: { id: 'desc' }
    });

    // Busca também as mensagens trocadas para aparecer no chat do hóspede
    const mensagensHospede = await prisma.mensagem.findMany({
      where: { remetente: { contains: hospede.nome } },
      orderBy: { criadoEm: 'asc' }
    });

    if (!reserva) return res.json({ temReserva: false, mensagens: mensagensHospede });

    const dataIn = new Date(reserva.dataCheckIn);
    const dataOut = new Date(reserva.dataCheckOut);
    const qtdDiarias = Math.ceil(Math.abs(dataOut.getTime() - dataIn.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const totalDiarias = qtdDiarias * (reserva.quarto?.valorDiaria || 0);
    const consumosValidos = (reserva.consumos || []).filter((c: any) => c.status !== 'CANCELADO');
    const totalConsumos = consumosValidos.reduce((acc: number, c: any) => acc + (c.quantidade * (c.produto?.preco || 0)), 0);

    res.json({
      temReserva: true,
      reservaId: reserva.id,
      quarto: reserva.quarto ? `${reserva.quarto.categoria} (Nº ${reserva.quarto.numero})` : '',
      qtdDiarias,
      totalDiarias,
      consumos: consumosValidos.map((c: any) => ({ id: c.id, nome: c.produto?.nome, quantidade: c.quantidade, subtotal: c.quantidade * (c.produto?.preco || 0) })),
      totalGeral: totalDiarias + totalConsumos,
      mensagens: mensagensHospede
    });
  } catch (error) { res.status(500).json({ error: 'Erro interno.' }); }
});

// --- FINANCEIRO ---
app.get('/api/transacoes', async (req: Request, res: Response) => { res.json(await prisma.transacao.findMany({ orderBy: { criadoEm: 'desc' } })); });
app.post('/api/transacoes', async (req: Request, res: Response) => {
  const { tipo, valor, metodoPagamento, descricao } = req.body;
  res.status(201).json(await prisma.transacao.create({ data: { tipo, valor: Number(valor), metodoPagamento, descricao } }));
});

// --- RESTAURANTE ---
app.get('/api/produtos', async (req: Request, res: Response) => { res.json(await prisma.produto.findMany()); });
app.post('/api/produtos', async (req: Request, res: Response) => {
  const { nome, preco, estoque } = req.body;
  res.status(201).json(await prisma.produto.create({ data: { nome, preco: Number(preco), estoque: Number(estoque) } }));
});

app.post('/api/consumos', async (req: Request, res: Response) => {
  const { reservaId, produtoId, quantidade, observacoes } = req.body;
  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
  if (!produto) return res.status(404).json({ error: 'Não encontrado' });
  const consumo = await prisma.consumo.create({ data: { reservaId, produtoId, quantidade: Number(quantidade), subtotal: produto.preco * Number(quantidade), observacoes } });
  res.status(201).json(consumo);
});

app.get('/api/consumos/ativos', async (req: Request, res: Response) => {
  res.json(await prisma.consumo.findMany({ where: { status: { not: 'ENTREGUE' } }, include: { produto: true, reserva: { include: { hospede: true, quarto: true } } }, orderBy: { criadoEm: 'asc' } }));
});

app.put('/api/consumos/:id/status', async (req: Request, res: Response) => {
  res.json(await prisma.consumo.update({ where: { id: req.params.id }, data: { status: req.body.status } }));
});

app.put('/api/consumos/:id/cancelar', async (req: Request, res: Response) => {
  res.json(await prisma.consumo.update({ where: { id: req.params.id }, data: { status: 'CANCELADO' } }));
});

app.post('/api/restaurante/reservas', async (req: Request, res: Response) => {
  const { nome, data, hora, qtdPessoas, mesa } = req.body;
  res.status(201).json(await prisma.reservaMesa.create({ data: { nome, data, hora, qtdPessoas: Number(qtdPessoas), mesa, status: 'CONFIRMADA' } }));
});

app.get('/api/restaurante/reservas', async (req: Request, res: Response) => { res.json(await prisma.reservaMesa.findMany({ orderBy: { data: 'asc' } })); });
app.post('/api/restaurante/eventos', async (req: Request, res: Response) => {
  const { titulo, data, hora, descricao, tipo } = req.body;
  res.status(201).json(await prisma.eventoRestaurante.create({ data: { titulo, data, hora, descricao, tipo } }));
});
app.get('/api/restaurante/eventos', async (req: Request, res: Response) => { res.json(await prisma.eventoRestaurante.findMany({ orderBy: { data: 'asc' } })); });

// --- OPERAÇÕES ---
app.get('/api/operacoes/limpeza', async (req, res) => { res.json(await prisma.tarefaLimpeza.findMany({ orderBy: { criadoEm: 'desc' } })); });
app.put('/api/operacoes/limpeza/:id/status', async (req, res) => {
  res.json(await prisma.tarefaLimpeza.update({ where: { id: req.params.id }, data: { status: req.body.status, responsavel: req.body.responsavel } }));
});
app.get('/api/operacoes/reparos', async (req, res) => { res.json(await prisma.chamadoManutencao.findMany({ orderBy: { criadoEm: 'desc' } })); });
app.put('/api/operacoes/reparos/:id/status', async (req, res) => {
  res.json(await prisma.chamadoManutencao.update({ where: { id: req.params.id }, data: { status: req.body.status } }));
});

// --- MENSAGENS (CHAT COM RESPOSTA DA EQUIPE) ---
app.post('/api/mensagens', async (req: Request, res: Response) => {
  const { remetente, conteudo } = req.body;
  res.status(201).json(await prisma.mensagem.create({ data: { remetente, conteudo } }));
});

app.get('/api/mensagens', async (req: Request, res: Response) => {
  res.json(await prisma.mensagem.findMany({ orderBy: { criadoEm: 'desc' } }));
});

app.put('/api/mensagens/:id/ler', async (req: Request, res: Response) => {
  const { resposta } = req.body;
  res.json(await prisma.mensagem.update({
    where: { id: req.params.id },
    data: { lida: true, resposta: resposta || 'Mensagem visualizada pela recepção.' }
  }));
});

const PORT = 3333;
app.listen(PORT, () => { console.log(`Servidor rodando na porta ${PORT} 🚀`); });