import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Adicionado para criptografia de senhas

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ==========================================
// MÓDULO 1: AUTENTICAÇÃO E SEGURANÇA
// ==========================================

// 1. Rota de Login (Blindada e Híbrida para senhas antigas e novas)
app.post('/api/login', async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  try {
    const emailLimpo = email ? email.trim().toLowerCase() : '';
    const usuario = await prisma.usuario.findFirst({
      where: { email: emailLimpo }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos!' });
    }

    // Verifica se a senha salva está criptografada (hash do bcrypt começa com $2b$)
    let senhaValida = false;
    if (usuario.senha.startsWith('$2b$')) {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } else {
      // Fallback para usuários antigos que ainda têm a senha em texto plano (ex: "123")
      senhaValida = (usuario.senha === senha);
    }

    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos!' });
    }

    let reservaIdFinal = usuario.reservaId || null;

    // Busca reserva ativa para o hóspede, caso não esteja vinculada diretamente
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

// 2. Rota para Atualizar a Senha (com Criptografia Bcrypt)
app.put('/api/usuarios/:id/senha', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { senhaAtual, novaSenha } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Verifica a senha atual (suportando texto plano antigo ou hash novo)
    let senhaValida = false;
    if (usuario.senha.startsWith('$2b$')) {
      senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    } else {
      senhaValida = (usuario.senha === senhaAtual);
    }

    if (!senhaValida) {
      return res.status(401).json({ error: 'A senha atual está incorreta.' });
    }

    // Criptografa a nova senha antes de salvar
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { id },
      data: { senha: novaSenhaHash }
    });

    return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao alterar a senha.' });
  }
});

// ==========================================
// MÓDULO 2: GESTÃO DE HÓSPEDES
// ==========================================

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

    // Cria usuário de acesso para o hóspede automaticamente
    if (email) {
      const usuarioExistente = await prisma.usuario.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      });

      if (!usuarioExistente) {
        await prisma.usuario.create({
          data: {
            nome,
            email,
            senha: "123", // Senha padrão inicial (pode ser alterada pelo usuário depois)
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

// =========================================================================
// ROTAS DE OPERAÇÕES (CRIADAS PELO PORTAL DO HÓSPEDE)
// =========================================================================

// POST: Criar nova tarefa de limpeza/solicitação rápida
app.post('/api/operacoes/limpeza', async (req, res) => {
  try {
    const { quarto, tipo, observacao, status, urgente } = req.body;

    // Salvando no banco de dados com Prisma
    const novaTarefa = await prisma.tarefaLimpeza.create({
      data: {
        quarto,
        tipo,
        observacao: observacao || '',
        status: status || 'Sujo',
        urgente: urgente || false,
      }
    });

    res.status(201).json(novaTarefa);
  } catch (error) {
    console.error('Erro ao criar tarefa de limpeza:', error);
    res.status(500).json({ error: 'Erro interno ao criar tarefa de limpeza.' });
  }
});

// POST: Criar novo chamado de reparo/manutenção
app.post('/api/operacoes/reparos', async (req, res) => {
  try {
    const { local, descricao, prioridade, status, hospedeEnvolvido } = req.body;

    // Salvando no banco de dados com Prisma
    const novoChamado = await prisma.chamadoManutencao.create({
      data: {
        local,
        descricao,
        prioridade: prioridade || 'Média',
        tempoEspera: 'Agora', // Define o tempo inicial como Agora
        status: status || 'Pendente',
        hospedeEnvolvido: hospedeEnvolvido || null,
      }
    });

    res.status(201).json(novoChamado);
  } catch (error) {
    console.error('Erro ao criar chamado de manutenção:', error);
    res.status(500).json({ error: 'Erro interno ao criar chamado de manutenção.' });
  }
});

// ==========================================
// MÓDULO 3: GESTÃO DE ACOMODAÇÕES (QUARTOS)
// ==========================================

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

// ==========================================
// MÓDULO 4: GESTÃO DE RESERVAS
// ==========================================

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

    // Atualiza o status do quarto para OCUPADO
    await prisma.quarto.update({
      where: { id: quartoId },
      data: { status: 'OCUPADO' }
    });

    // Vincula a reserva ativa ao usuário do hóspede
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

    // Libera o quarto novamente
    await prisma.quarto.update({
      where: { id: reservaAtualizada.quartoId },
      data: { status: 'LIVRE' }
    });

    res.json({ message: 'Check-out realizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer check-out' });
  }
});

// ==========================================
// MÓDULO 5: PORTAL DO HÓSPEDE (EXTRATO)
// ==========================================

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

    // 2. Busca qualquer reserva ativa deste hóspede
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

// ==========================================
// MÓDULO 6: FINANCEIRO (CAIXA)
// ==========================================

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

// ==========================================
// MÓDULO 7: RESTAURANTE (COZINHA E PEDIDOS)
// ==========================================

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

// Lançamento de Pedido na Cozinha (Vindo do Hóspede ou Balcão)
app.post('/api/consumos', async (req: Request, res: Response) => {
  const { reservaId, produtoId, quantidade, observacoes } = req.body; 
  
  try {
    const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });

    const subtotal = produto.preco * Number(quantidade);

    const consumo = await prisma.consumo.create({
      data: { 
        reservaId, 
        produtoId, 
        quantidade: Number(quantidade), 
        subtotal,
        observacoes // Salva alergias e restrições no banco de dados!
      }
    });
    
    res.status(201).json(consumo);
  } catch (error) {
    console.error("ERRO AO SALVAR PEDIDO NA COZINHA:", error);
    res.status(500).json({ error: 'Erro ao lançar consumo.' });
  }
});

// Busca pedidos ativos para a fila da Cozinha
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

// Atualiza o Status do Pedido (Solicitado -> Em Preparo -> Pronto -> Entregue)
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

// Cancela o pedido (Apenas se ainda estiver como SOLICITADO)
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

// ==========================================
// MÓDULO 8: RESTAURANTE (MESAS E EVENTOS)
// ==========================================

// Criar nova reserva de mesa (Com bloqueio anti-overbooking)
app.post('/api/restaurante/reservas', async (req: Request, res: Response) => {
  const { nome, data, hora, qtdPessoas, mesa } = req.body;
  try {
    // Verifica se já existe uma mesa ativa com status CONFIRMADA para a mesma mesa
    const mesaOcupada = await prisma.reservaMesa.findFirst({
      where: { mesa, status: 'CONFIRMADA' }
    });

    if (mesaOcupada) {
      return res.status(400).json({ error: `A Mesa ${mesa} já está reservada para ${mesaOcupada.nome}!` });
    }

    const reserva = await prisma.reservaMesa.create({
      data: { nome, data, hora, qtdPessoas: Number(qtdPessoas), mesa, status: 'CONFIRMADA' }
    });
    res.status(201).json(reserva);
  } catch (error) {
    console.error("Erro ao reservar mesa:", error);
    res.status(500).json({ error: 'Erro ao reservar mesa.' });
  }
});

// Buscar as reservas de mesa
app.get('/api/restaurante/reservas', async (req: Request, res: Response) => {
  try {
    const reservas = await prisma.reservaMesa.findMany({ orderBy: { data: 'asc' } });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar reservas de mesa.' });
  }
});

// Cancelar reserva de mesa
app.put('/api/restaurante/reservas/:id/cancelar', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const reservaAtualizada = await prisma.reservaMesa.update({
      where: { id },
      data: { status: 'CANCELADA' }
    });
    res.json(reservaAtualizada);
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    res.status(500).json({ error: 'Erro ao cancelar reserva.' });
  }
});

// Criar novo evento na agenda
app.post('/api/restaurante/eventos', async (req: Request, res: Response) => {
  const { titulo, data, hora, descricao, tipo } = req.body;
  try {
    const evento = await prisma.eventoRestaurante.create({
      data: { titulo, data, hora, descricao, tipo }
    });
    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar evento.' });
  }
});

// Buscar a agenda de eventos
app.get('/api/restaurante/eventos', async (req: Request, res: Response) => {
  try {
    const eventos = await prisma.eventoRestaurante.findMany({ orderBy: { data: 'asc' } });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar eventos.' });
  }
});

// ==========================================
// MÓDULO 9: GESTÃO OPERACIONAL (LIMPEZA E REPAROS)
// ==========================================

// --- LIMPEZA (GOVERNANÇA) ---
app.get('/api/operacoes/limpeza', async (req, res) => {
  try {
    let tarefas = await prisma.tarefaLimpeza.findMany({ orderBy: { criadoEm: 'desc' } });
    
    // MÁGICA: Se o banco estiver vazio, cria dados reais de teste para a apresentação!
    if (tarefas.length === 0) {
      await prisma.tarefaLimpeza.createMany({
        data: [
          { quarto: 'C01 - Suíte Master Dourada', tipo: 'Limpeza de Check-in', observacao: 'Hóspede chega às 14:00', status: 'Sujo', urgente: true },
          { quarto: 'S02 - Quarto Superior Serra', tipo: 'Limpeza de Estadia (Arrumação)', observacao: 'Trocar toalhas', status: 'Sujo', urgente: false },
          { quarto: 'B04 - Bangalô Jardim', tipo: 'Necessita Manutenção', observacao: 'Aguardando reparo', status: 'Bloqueado', urgente: false }
        ]
      });
      tarefas = await prisma.tarefaLimpeza.findMany({ orderBy: { criadoEm: 'desc' } });
    }
    res.json(tarefas);
  } catch (error) { res.status(500).json({ error: 'Erro ao buscar tarefas de limpeza' }); }
});

app.put('/api/operacoes/limpeza/:id/status', async (req, res) => {
  const { status, responsavel } = req.body;
  try {
    const tarefa = await prisma.tarefaLimpeza.update({
      where: { id: req.params.id },
      data: { status, responsavel }
    });
    res.json(tarefa);
  } catch (error) { res.status(500).json({ error: 'Erro ao atualizar status' }); }
});

// --- REPAROS (MANUTENÇÃO) ---
app.get('/api/operacoes/reparos', async (req, res) => {
  try {
    let chamados = await prisma.chamadoManutencao.findMany({ orderBy: { criadoEm: 'desc' } });
    
    // MÁGICA: Se o banco estiver vazio, cria dados reais de teste!
    if (chamados.length === 0) {
      await prisma.chamadoManutencao.createMany({
        data: [
          { local: 'QUARTO S-04', descricao: 'Ar condicionado não gela', prioridade: 'Alta', tempoEspera: '15 min', status: 'Pendente', hospedeEnvolvido: 'Hóspede no quarto' },
          { local: 'QUARTO S-12', descricao: 'Troca de lâmpada (Banheiro)', prioridade: 'Média', tempoEspera: '1h 20m', status: 'Pendente' },
          { local: 'ÁREA COMUM - PISCINA', descricao: 'Ajuste de aquecedor', prioridade: 'Baixa', tempoEspera: 'Iniciado há 45m', status: 'Em Andamento' }
        ]
      });
      chamados = await prisma.chamadoManutencao.findMany({ orderBy: { criadoEm: 'desc' } });
    }
    res.json(chamados);
  } catch (error) { res.status(500).json({ error: 'Erro ao buscar chamados' }); }
});

app.put('/api/operacoes/reparos/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const chamado = await prisma.chamadoManutencao.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(chamado);
  } catch (error) { res.status(500).json({ error: 'Erro ao atualizar chamado' }); }
});

// ==========================================
// MÓDULO 10: MENSAGENS (CHAT DA RECEPÇÃO)
// ==========================================

// Hóspede enviando mensagem
app.post('/api/mensagens', async (req: Request, res: Response) => {
  const { remetente, conteudo } = req.body;
  try {
    const novaMensagem = await prisma.mensagem.create({
      data: { remetente, conteudo }
    });
    res.status(201).json(novaMensagem);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

// Recepção buscando mensagens
app.get('/api/mensagens', async (req: Request, res: Response) => {
  try {
    const mensagens = await prisma.mensagem.findMany({ orderBy: { criadoEm: 'desc' } });
    res.json(mensagens);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
});

// Recepção marcando mensagem como lida
app.put('/api/mensagens/:id/ler', async (req: Request, res: Response) => {
  try {
    const mensagem = await prisma.mensagem.update({
      where: { id: req.params.id },
      data: { lida: true }
    });
    res.json(mensagem);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar mensagem.' });
  }
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Servidor da Pousada rodando perfeitamente na porta ${PORT} 🚀`);
});