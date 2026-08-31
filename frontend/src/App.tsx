import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, BedDouble, CalendarCheck, Activity, Key, Lock, 
  Utensils, ShoppingBag, Search, LogOut, LayoutDashboard, 
  Wallet, Map, Plus, Settings, RefreshCw, QrCode, Menu, X,
  Compass, Thermometer, MessageSquare, Check, Clock, ChevronRight, Wind, Flame, AlertCircle, Brush, Wrench, Calendar, LayoutGrid, Play, CheckCircle2
} from 'lucide-react';
import { gerarReciboPdf, type MockReserva, type MockConsumo } from './utils/gerarReciboPdf'; 
import MapaInterativo from './components/MapaInterativo';

// --- INTERFACES ---
interface Hospede { id: string; nome: string; cpf: string; email: string; telefone: string; }
interface Quarto { id: string; numero: string; capacidade: number; valorDiaria: number; status: string; categoria: string; descricao?: string; itensInclusos?: string; }
interface Reserva { id: string; dataCheckIn: string; dataCheckOut: string; status: string; origem: string; hospede: Hospede; quarto: Quarto; consumos?: any[]; }
interface Produto { id: string; nome: string; preco: number; estoque: number; categoria?: string; }
interface Transacao { id: string; tipo: string; valor: number; metodoPagamento: string; descricao: string; criadoEm: string; }
interface ChamadoManutencao { id: string; local: string; descricao: string; prioridade: 'Alta' | 'Média' | 'Baixa'; tempoEspera: string; status: 'Pendente' | 'Em Andamento' | 'Concluído'; hospedeEnvolvido?: string; }
interface TarefaGovernanca { id: string; quarto: string; tipo: string; observacao: string; status: 'Sujo' | 'Em Limpeza' | 'Limpo' | 'Bloqueado'; urgente?: boolean; responsavel?: string; }

export default function App() {
  // --- ESTADOS GERAIS E AUTENTICAÇÃO ---
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [emailInput, setEmailInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');

  // --- NAVEGAÇÃO E UI ---
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'hospedes' | 'quartos' | 'reservas' | 'operacoes' | 'restaurante' | 'caixa' | 'portal-hospede' | 'mapa' | 'configuracoes' | 'rh'>('dashboard');
  const [menuMobileAberto, setMenuMobileAberto] = useState(false); 
  const [abaPortal, setAbaPortal] = useState<'visao-geral' | 'guia' | 'concierge' | 'preferencias'>('visao-geral');
  const [abaRestaurante, setAbaRestaurante] = useState<'pedidos' | 'layout'>('pedidos');
  const [abaOperacoes, setAbaOperacoes] = useState<'limpeza' | 'reparos'>('limpeza');
  const [filtroLimpeza, setFiltroLimpeza] = useState<'todos' | 'urgentes'>('todos');
  const [filtroReparos, setFiltroReparos] = useState<'pendentes' | 'concluidos'>('pendentes');

  // --- DADOS DO SISTEMA ---
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pedidosCozinha, setPedidosCozinha] = useState<any[]>([]);
  const [reservasMesas, setReservasMesas] = useState<any[]>([]);
  const [eventosAgenda, setEventosAgenda] = useState<any[]>([]);
  
  // --- ESTADOS DE FORMULÁRIOS E OPERAÇÕES ---
  const [extratoHospede, setExtratoHospede] = useState<any>(null);
  const [mesaSelecionada, setMesaSelecionada] = useState('');
  const [nomeReservaMesa, setNomeReservaMesa] = useState('');
  const [paxReservaMesa, setPaxReservaMesa] = useState('2');
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS');

  // Perfil e Configurações
  const [perfilNome, setPerfilNome] = useState('');
  const [perfilEmail, setPerfilEmail] = useState('');
  const [perfilTelefone, setPerfilTelefone] = useState('');
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [alertasReserva, setAlertasReserva] = useState(true);
  const [fotoPerfil, setFotoPerfil] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop');
  const [prefTemp, setPrefTemp] = useState(22);
  const [outrasRestricoes, setOutrasRestricoes] = useState('');

  // Cadastros
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [nome, setNome] = useState(''); const [cpf, setCpf] = useState(''); 
  const [email, setEmail] = useState(''); const [telefone, setTelefone] = useState('');
  const [numero, setNumero] = useState(''); const [capacidade, setCapacidade] = useState(''); 
  const [valorDiaria, setValorDiaria] = useState(''); const [categoria, setCategoria] = useState('Chalé Luxo Casal'); 
  const [hospedeId, setHospedeId] = useState(''); const [quartoId, setQuartoId] = useState(''); 
  const [dataCheckIn, setDataCheckIn] = useState(''); const [dataCheckOut, setDataCheckOut] = useState('');
  const [origem, setOrigem] = useState('WhatsApp'); 
  const [prodNome, setProdNome] = useState(''); const [prodPreco, setProdPreco] = useState('');
  const [prodEstoque, setProdEstoque] = useState(''); const [prodCategoria, setProdCategoria] = useState('Prato Principal');
  const [tipoTransacao, setTipoTransacao] = useState('ENTRADA'); const [descricaoTransacao, setDescricaoTransacao] = useState('');
  const [valorTransacao, setValorTransacao] = useState(''); const [metodoPagamento, setMetodoPagamento] = useState('PIX');

  // --- DADOS MOCADOS INICIAIS ---
  const [chamados, setChamados] = useState<ChamadoManutencao[]>([
    { id: '1', local: 'QUARTO S-04', descricao: 'Ar condicionado não gela', prioridade: 'Alta', tempoEspera: '15 min', status: 'Pendente', hospedeEnvolvido: 'Hóspede no quarto' },
    { id: '2', local: 'QUARTO S-12', descricao: 'Troca de lâmpada (Banheiro)', prioridade: 'Média', tempoEspera: '1h 20m', status: 'Pendente' },
    { id: '3', local: 'ÁREA COMUM - PISCINA', descricao: 'Ajuste de aquecedor', prioridade: 'Baixa', tempoEspera: 'Iniciado há 45m', status: 'Em Andamento' }
  ]);

  const [tarefasLimpeza, setTarefasLimpeza] = useState<TarefaGovernanca[]>([
    { id: '1', quarto: 'C01 - Suíte Master Dourada', tipo: 'Limpeza de Check-in', observacao: 'Hóspede chega às 14:00', status: 'Sujo', urgente: true },
    { id: '2', quarto: 'S02 - Quarto Superior Serra', tipo: 'Limpeza de Estadia (Arrumação)', observacao: 'Trocar toalhas', status: 'Em Limpeza', responsavel: 'Maria' },
    { id: '3', quarto: 'B04 - Bangalô Jardim', tipo: 'Necessita Manutenção', observacao: 'Aguardando reparo no ar condicionado', status: 'Bloqueado' }
  ]);

  // --- INTEGRAÇÕES COM API ---
  const buscarPedidosCozinha = async () => { 
    try { 
      const res = await axios.get('http://localhost:3333/api/consumos/ativos', { timeout: 3000 }); 
      setPedidosCozinha(Array.isArray(res.data) ? res.data : []); 
    } catch (err) { 
      console.error('Erro ao buscar pedidos da cozinha:', err); 
      setPedidosCozinha([]); 
    } 
  };

  const atualizarStatusPedido = async (id: string, novoStatus: string) => { 
    try { 
      await axios.put(`http://localhost:3333/api/consumos/${id}/status`, { status: novoStatus }); 
      buscarPedidosCozinha(); 
    } catch (err) { 
      alert('Erro ao atualizar status.'); 
    } 
  };

  const buscarReservasMesas = async () => {
    try {
      const res = await axios.get('http://localhost:3333/api/restaurante/reservas');
      setReservasMesas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro ao buscar reservas de mesas', err);
    }
  };

  const buscarEventosAgenda = async () => {
    try {
      const res = await axios.get('http://localhost:3333/api/restaurante/eventos');
      setEventosAgenda(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro ao buscar eventos', err);
    }
  };

  const reservarMesaRestaurante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaSelecionada) return alert("Por favor, selecione uma mesa clicando no mapa.");
    try {
      await axios.post('http://localhost:3333/api/restaurante/reservas', {
        nome: nomeReservaMesa, data: '30/08/2026', hora: '20:30', qtdPessoas: Number(paxReservaMesa), mesa: mesaSelecionada
      });
      alert(`Mesa ${mesaSelecionada} reservada com sucesso para ${nomeReservaMesa}!`);
      setNomeReservaMesa(''); setMesaSelecionada(''); buscarReservasMesas();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao salvar reserva de mesa.');
    }
  };

  const buscarExtratoHospede = async (email: string) => { 
    try { 
      const res = await axios.get(`http://localhost:3333/api/hospede/extrato/${email}`); 
      setExtratoHospede(res.data); 
      if (res.data.temReserva && res.data.reservaId) { 
        setUsuarioLogado((prev: any) => {
          if (prev?.reservaId === res.data.reservaId) return prev;
          return { ...prev, reservaId: res.data.reservaId };
        }); 
      } 
    } catch (err) { 
      console.error('Erro ao carregar extrato'); 
    } 
  };

  const buscarHospedes = () => axios.get('http://localhost:3333/api/hospedes').then(res => setHospedes(res.data));
  const buscarQuartos = () => axios.get('http://localhost:3333/api/quartos').then(res => setQuartos(res.data));
  const buscarReservas = () => axios.get('http://localhost:3333/api/reservas').then(res => setReservas(res.data));
  const buscarProdutos = () => axios.get('http://localhost:3333/api/produtos').then(res => setProdutos(res.data));
  const buscarTransacoes = () => axios.get('http://localhost:3333/api/transacoes').then(res => setTransacoes(res.data));

  // --- EFEITOS (USE EFFECT) ---
  useEffect(() => {
    if (usuarioLogado) {
      setPerfilNome(usuarioLogado.nome || ''); 
      setPerfilEmail(usuarioLogado.email || ''); 
      setPerfilTelefone(usuarioLogado.telefone || '+55 (88) 99999-9999');
    }
  }, [usuarioLogado]);

  useEffect(() => {
    if (autenticado) {
      if (abaAtiva === 'hospedes') buscarHospedes();
      if (abaAtiva === 'quartos') buscarQuartos();
      if (abaAtiva === 'reservas') { buscarHospedes(); buscarQuartos(); buscarReservas(); }
      if (abaAtiva === 'restaurante') { buscarProdutos(); buscarPedidosCozinha(); buscarReservasMesas(); buscarEventosAgenda(); }
      if (abaAtiva === 'portal-hospede') { buscarProdutos(); buscarPedidosCozinha(); if (usuarioLogado?.email) buscarExtratoHospede(usuarioLogado.email); }
      if (abaAtiva === 'caixa') buscarTransacoes();
      if (abaAtiva === 'dashboard') { buscarHospedes(); buscarQuartos(); buscarReservas(); }
      if (abaAtiva === 'operacoes') buscarOperacoes();
    }
  }, [abaAtiva, autenticado]);

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval>;
    if (autenticado && (abaAtiva === 'restaurante' || abaAtiva === 'portal-hospede')) {
      intervalo = setInterval(() => { buscarPedidosCozinha(); }, 10000);
    }
    return () => { if (intervalo) clearInterval(intervalo); };
  }, [abaAtiva, autenticado]);

  // --- FUNÇÕES AUXILIARES E HANDLERS ---
  const mascaraCPF = (valor: string) => valor.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const mascaraTelefone = (valor: string) => valor.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3333/api/login', { email: emailInput, senha: senhaInput });
      const user = response.data;
      setUsuarioLogado(user); setAutenticado(true);
      if (user.cargo === 'GERENTE') setAbaAtiva('dashboard');
      else if (user.cargo === 'RECEPCAO') setAbaAtiva('reservas');
      else if (user.cargo === 'COZINHA') setAbaAtiva('restaurante');
      else if (user.cargo === 'HOSPEDE') { setAbaAtiva('portal-hospede'); buscarExtratoHospede(user.email); }
    } catch (error) { alert('E-mail ou senha incorretos! Verifique suas credenciais.'); setSenhaInput(''); }
  };

  const cadastrarHospede = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    await axios.post('http://localhost:3333/api/hospedes', { nome, cpf, email, telefone }); 
    alert('Hóspede salvo!'); setNome(''); setCpf(''); setEmail(''); setTelefone(''); buscarHospedes(); 
  };
  
  const cadastrarQuarto = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    await axios.post('http://localhost:3333/api/quartos', { numero, capacidade: Number(capacidade), valorDiaria: Number(valorDiaria), categoria }); 
    alert('Quarto salvo!'); setNumero(''); setCapacidade(''); setValorDiaria(''); setCategoria('Chalé Luxo Casal'); buscarQuartos(); 
  };
  
  const cadastrarReserva = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      await axios.post('http://localhost:3333/api/reservas', { hospedeId, quartoId, dataCheckIn, dataCheckOut, origem }); 
      alert('Reserva confirmada!'); setHospedeId(''); setQuartoId(''); setDataCheckIn(''); setDataCheckOut(''); setOrigem('WhatsApp'); buscarReservas(); buscarQuartos(); 
    } catch (error) { alert('Erro ao criar reserva.'); } 
  };
  
  const cadastrarProduto = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      await axios.post('http://localhost:3333/api/produtos', { nome: prodNome, preco: Number(prodPreco), estoque: Number(prodEstoque), categoria: prodCategoria }); 
      alert('Item salvo!'); setProdNome(''); setProdPreco(''); setProdEstoque(''); setProdCategoria('Prato Principal'); buscarProdutos(); 
    } catch (error) { alert('Erro ao cadastrar produto.'); } 
  };
  
  const pedirComoHospede = async (produtoId: string) => { 
    if (!extratoHospede || !extratoHospede.temReserva) { alert('Sua conta não está vinculada a nenhuma reserva ativa.'); return; } 
    try { 
      await axios.post('http://localhost:3333/api/consumos', { reservaId: extratoHospede.reservaId, produtoId, quantidade: 1, observacoes: outrasRestricoes }); 
      alert('Pedido realizado!'); setAbaPortal('visao-geral'); buscarPedidosCozinha(); buscarExtratoHospede(usuarioLogado.email); 
    } catch (error) { alert('Erro ao registrar pedido.'); } 
  };
  
  const cancelarPedido = async (id: string) => { if (!window.confirm('Cancelar este pedido?')) return; try { await axios.put(`http://localhost:3333/api/consumos/${id}/cancelar`); alert('Cancelado.'); buscarPedidosCozinha(); buscarExtratoHospede(usuarioLogado.email); } catch (error: any) { alert(error.response?.data?.error || 'Erro.'); } };
  
  const fazerCheckout = async (reservaId: string) => { if (!window.confirm('Deseja finalizar esta reserva?')) return; try { await axios.put(`http://localhost:3333/api/reservas/${reservaId}/checkout`); alert('Check-out realizado!'); buscarReservas(); buscarQuartos(); } catch (error) { alert('Erro no check-out.'); } };

  const emitirRecibo = (reserva: any) => {
    const dataIn = new Date(reserva.dataCheckIn); const dataOut = new Date(reserva.dataCheckOut); const diffTempo = Math.abs(dataOut.getTime() - dataIn.getTime()); const qtdDiarias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24)) || 1; const totalDiarias = qtdDiarias * reserva.quarto.valorDiaria;
    const listaConsumos: MockConsumo[] = (reserva.consumos || []).map((c: any) => ({ descricao: c.produto.nome, quantidade: c.quantidade, subtotal: c.subtotal })); const totalConsumos = listaConsumos.reduce((acc, c) => acc + c.subtotal, 0);
    gerarReciboPdf({ id: reserva.id, cliente: reserva.hospede.nome, dataCheckIn: dataIn.toLocaleDateString('pt-BR'), dataCheckOut: dataOut.toLocaleDateString('pt-BR'), quarto: `${reserva.quarto.categoria} (Nº ${reserva.quarto.numero})`, diarias: { quantidade: qtdDiarias, valor: reserva.quarto.valorDiaria, total: totalDiarias }, consumos: listaConsumos, totalGeral: totalDiarias + totalConsumos });
  };

  const enviarWhatsApp = (reserva: Reserva) => { const numeroLimpo = reserva.hospede.telefone.replace(/\D/g, ''); const msg = `Olá ${reserva.hospede.nome}! Agradecemos por escolher a Pousada Refúgio Dourado. Até a próxima!`; window.open(`https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(msg)}`, '_blank'); };
  
  const registrarTransacao = async (e: React.FormEvent) => { e.preventDefault(); try { await axios.post('http://localhost:3333/api/transacoes', { tipo: tipoTransacao, valor: valorTransacao, metodoPagamento, descricao: descricaoTransacao }); alert('Registrado!'); setDescricaoTransacao(''); setValorTransacao(''); buscarTransacoes(); } catch (error) { alert('Erro ao registrar.'); } };
  
  const alterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) return alert('Preencha todos os campos de senha!');
    if (novaSenha !== confirmarNovaSenha) return alert('A nova senha e a confirmação não conferem!');
    try {
      await axios.put(`http://localhost:3333/api/usuarios/${usuarioLogado.id}/senha`, { senhaAtual, novaSenha });
      alert('Senha alterada com sucesso!'); setSenhaAtual(''); setNovaSenha(''); setConfirmarNovaSenha('');
    } catch (error: any) { alert(error.response?.data?.error || 'Erro ao alterar a senha. Verifique se a senha atual está correta.'); }
  };

  const buscarOperacoes = async () => {
    try {
      const resLimpeza = await axios.get('http://localhost:3333/api/operacoes/limpeza'); setTarefasLimpeza(resLimpeza.data);
      const resReparos = await axios.get('http://localhost:3333/api/operacoes/reparos'); setChamados(resReparos.data);
    } catch (error) { console.error('Erro ao buscar operações:', error); }
  };

  const atualizarStatusLimpeza = async (id: string, novoStatus: string) => {
    try {
      await axios.put(`http://localhost:3333/api/operacoes/limpeza/${id}/status`, { status: novoStatus, responsavel: novoStatus === 'Em Limpeza' ? usuarioLogado?.nome : null });
      buscarOperacoes();
    } catch (error) { alert('Erro ao atualizar tarefa de limpeza.'); }
  };

  const atualizarStatusReparo = async (id: string, novoStatus: string) => {
    try {
      await axios.put(`http://localhost:3333/api/operacoes/reparos/${id}/status`, { status: novoStatus });
      buscarOperacoes();
    } catch (error) { alert('Erro ao atualizar chamado de manutenção.'); }
  };

  // --- VARIÁVEIS DERIVADAS DE ESTADO ---
  const totalQuartos = quartos.length;
  const quartosOcupados = quartos.filter(q => q.status !== 'LIVRE').length;
  const taxaOcupacao = totalQuartos === 0 ? 0 : Math.round((quartosOcupados / totalQuartos) * 100);
  const reservasAtivas = reservas.filter(r => r.status !== 'CONCLUÍDA').length;
  const totalEntradas = transacoes.filter(t => t.tipo === 'ENTRADA').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'SAIDA').reduce((acc, t) => acc + t.valor, 0);
  const saldoReal = totalEntradas - totalSaidas;

  // --- TELA DE LOGIN ---
  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-end px-12 md:px-24 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(26, 28, 27, 0.3), rgba(26, 28, 27, 0.6)), url('/fundo-login.jpeg')` }}>
        <div className="bg-surface-container-lowest/95 backdrop-blur-md p-10 rounded-2xl shadow-level-2 max-w-md w-full ghost-border text-center">
          <h1 className="font-display-lg text-primary text-4xl mb-2">Refúgio Dourado</h1>
          <p className="text-secondary font-body-md mb-8">Acesso Unificado ao Sistema</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wide block mb-1">E-mail</label>
              <div className="relative">
                <Lock size={18} className="absolute top-3.5 left-4 text-secondary" />
                <input type="email" placeholder="seu.email@pousada.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary transition-colors font-body-md" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wide block mb-1">Senha</label>
              <div className="relative">
                <Key size={18} className="absolute top-3.5 left-4 text-secondary" />
                <input type="password" placeholder="••••••••" value={senhaInput} onChange={(e) => setSenhaInput(e.target.value)} required className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary transition-colors font-body-md" />
              </div>
            </div>
            <button type="submit" className="w-full mt-4 py-3.5 px-4 rounded-lg bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all shadow-sm cursor-pointer text-center font-bold">
              Entrar no Sistema
            </button>
          </form>
          <p className="text-xs text-secondary mt-6">Painel restrito para colaboradores e hóspedes.</p>
        </div>
      </div>
    );
  }

  // Componente auxiliar para os botões do Menu Lateral
  const SidebarItem = ({ id, label, icon: Icon }: { id: typeof abaAtiva, label: string, icon: any }) => {
    const isActive = abaAtiva === id;
    return (
      <button 
        onClick={() => { setAbaAtiva(id); setMenuMobileAberto(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all duration-200 text-left cursor-pointer select-none ${isActive ? "bg-primary-container/20 text-on-surface font-bold border border-primary-container/30 shadow-sm" : "text-secondary hover:bg-surface-container hover:text-on-surface"}`}
      >
        <Icon size={20} className={isActive ? "text-primary" : "text-secondary"} />
        {label}
      </button>
    );
  };

  // --- RENDERIZAÇÃO DA APLICAÇÃO PRINCIPAL ---
  return (
    <div className="bg-background text-on-background min-h-screen flex antialiased w-full relative">
      {/* Overlay para fechar menu no mobile */}
      {menuMobileAberto && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMenuMobileAberto(false)}></div>}

      {/* MENU LATERAL ORGANIZADO POR PERFIS */}
      <aside className={`w-[280px] bg-surface-container-low border-r border-outline-variant/30 flex flex-col h-screen fixed left-0 top-0 z-40 select-none transition-transform duration-300 ${menuMobileAberto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex flex-col items-center border-b border-outline-variant/20 flex-shrink-0 relative">
          <button onClick={() => setMenuMobileAberto(false)} className="md:hidden absolute top-4 right-4 text-secondary p-1"><X size={24} /></button>
          <h1 className="font-display-lg text-primary text-xl text-center leading-tight font-bold mt-2 md:mt-0">Refúgio Dourado</h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">Painel Administrativo</p>
        </div>

        {/* Botão de Check-in (Visível para Recepção e Gerente) */}
        {(usuarioLogado?.cargo === 'GERENTE' || usuarioLogado?.cargo === 'RECEPCAO') && (
          <div className="px-6 pt-5 pb-2 flex-shrink-0">
            <button onClick={() => { setAbaAtiva('reservas'); setMenuMobileAberto(false); }} className="w-full py-3 px-4 rounded-lg bg-primary text-white font-label-md font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-sm cursor-pointer">
              <Plus size={18} /> Novo Check-in
            </button>
          </div>
        )}

        {/* Navegação de Abas */}
        <nav className="flex-1 px-4 py-3 flex flex-col gap-1 overflow-y-auto pr-3">
          {(usuarioLogado?.cargo === 'GERENTE' || usuarioLogado?.cargo === 'RECEPCAO') && (
            <>
              <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
              <SidebarItem id="hospedes" label="Hóspedes" icon={Users} />
              <SidebarItem id="quartos" label="Quartos" icon={BedDouble} />
              <SidebarItem id="reservas" label="Reservas" icon={CalendarCheck} />
              <SidebarItem id="operacoes" label="Limpeza & Manutenção" icon={Brush} />
              <SidebarItem id="mapa" label="Mapa" icon={Map} />
            </>
          )}
          {(usuarioLogado?.cargo === 'GERENTE' || usuarioLogado?.cargo === 'RECEPCAO' || usuarioLogado?.cargo === 'COZINHA') && (
            <SidebarItem id="restaurante" label="Restaurante & Eventos" icon={Utensils} />
          )}
          
          {/* Abas exclusivas do Gerente */}
          {usuarioLogado?.cargo === 'GERENTE' && (
            <>
              <SidebarItem id="caixa" label="Financeiro" icon={Wallet} />
              <SidebarItem id="rh" label="Gestão de Equipe (RH)" icon={Users} />
            </>
          )}
          
          {/* Aba exclusiva do Hóspede */}
          {usuarioLogado?.cargo === 'HOSPEDE' && (
            <SidebarItem id="portal-hospede" label="Meu Chalé" icon={Utensils} />
          )}
        </nav>

        {/* Rodapé do Menu (Configurações e Sair) */}
        <div className="p-4 border-t border-outline-variant/20 flex flex-col gap-1 flex-shrink-0">
           <button onClick={() => { setAbaAtiva('configuracoes'); setMenuMobileAberto(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all duration-200 text-left cursor-pointer select-none ${abaAtiva === 'configuracoes' ? 'bg-primary-container/20 text-on-surface font-bold border border-primary-container/30 shadow-sm' : 'text-secondary hover:bg-surface-container hover:text-on-surface'}`}>
             <Settings size={20} className={abaAtiva === 'configuracoes' ? "text-primary" : "text-secondary"} /> Configurações
           </button>
           <button onClick={() => { setAutenticado(false); setUsuarioLogado(null); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-secondary hover:bg-error-container hover:text-on-error-container transition-colors text-left cursor-pointer">
             <LogOut size={20} /> Sair
           </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-h-screen bg-background md:ml-[280px]">
        
        {/* Cabeçalho Mobile */}
        <header className="md:hidden h-16 bg-surface border-b border-outline-variant/20 flex items-center justify-between px-4 flex-shrink-0 z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuMobileAberto(true)} className="text-secondary p-2 -ml-2 hover:bg-surface-container rounded-full transition-colors cursor-pointer"><Menu size={24} /></button>
            <h1 className="font-display-lg text-primary text-xl font-bold">Refúgio Dourado</h1>
          </div>
          <button onClick={() => { setAutenticado(false); setUsuarioLogado(null); }} className="text-secondary p-2 -mr-2 cursor-pointer"><LogOut size={20} /></button>
        </header>

        <main className="flex-1 p-4 md:p-10 w-full max-w-[1200px] mx-auto">
          
          {/* === MÓDULO: MAPA INTERATIVO === */}
          {abaAtiva === 'mapa' && <MapaInterativo quartos={quartos} onSelecionarQuarto={(q) => alert(`Chalé: ${q.categoria} (Nº ${q.numero})\nStatus: ${q.status}`)} />}

          {/* === MÓDULO: DASHBOARD (VISÃO GERAL) === */}
          {abaAtiva === 'dashboard' && (
            <div className="flex flex-col gap-stack-lg">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="font-headline-lg text-[32px] text-on-surface mb-1">Visão Geral do Hotel</h1>
                  <p className="font-body-md text-secondary">Acompanhe os principais indicadores de hoje.</p>
                </div>
              </header>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4"><h2 className="text-[12px] font-bold text-secondary uppercase tracking-widest">Taxa de<br/>Ocupação</h2><div className="p-2 bg-primary-container/20 rounded-lg text-primary"><Activity size={20} /></div></div>
                  <p className="font-display-lg text-5xl text-on-surface mb-2">{taxaOcupacao}%</p><p className="text-xs font-bold text-primary flex items-center gap-1">↗ +5% vs última semana</p>
                </div>
                <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4"><h2 className="text-[12px] font-bold text-secondary uppercase tracking-widest">Chalés<br/>Ocupados</h2><div className="p-2 bg-primary-container/20 rounded-lg text-primary"><BedDouble size={20} /></div></div>
                  <p className="font-display-lg text-5xl text-on-surface mb-2">{quartosOcupados}<span className="text-2xl text-outline">/{totalQuartos}</span></p><p className="text-xs text-secondary">{totalQuartos - quartosOcupados} chalé(s) disponível(is)</p>
                </div>
                <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4"><h2 className="text-[12px] font-bold text-secondary uppercase tracking-widest">Reservas<br/>Ativas</h2><div className="p-2 bg-primary-container/20 rounded-lg text-primary"><CalendarCheck size={20} /></div></div>
                  <p className="font-display-lg text-5xl text-on-surface mb-2">{reservasAtivas}</p><p className="text-xs text-secondary">Para os próximos dias</p>
                </div>
                <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4"><h2 className="text-[12px] font-bold text-secondary uppercase tracking-widest">Hóspedes<br/>Hoje</h2><div className="p-2 bg-primary-container/20 rounded-lg text-primary"><Users size={20} /></div></div>
                  <p className="font-display-lg text-5xl text-on-surface mb-2">{hospedes.length}</p><p className="text-xs text-secondary">Cadastrados na base</p>
                </div>
              </section>
              <section className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                <div className="flex justify-between items-center mb-6"><h3 className="font-headline-md text-xl text-on-surface">Últimas Atividades (Check-ins)</h3><button onClick={() => setAbaAtiva('reservas')} className="text-primary text-sm font-bold hover:underline cursor-pointer">Ver todos →</button></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-body-md">
                    <thead>
                      <tr className="text-secondary border-b border-outline-variant/30 text-[11px] uppercase tracking-wider">
                        <th className="pb-3 font-medium">Hóspede</th><th className="pb-3 font-medium">Chalé</th><th className="pb-3 font-medium">Data/Hora</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservas.slice(0, 4).map(r => (
                        <tr key={r.id} className="border-b border-surface-container last:border-0 hover:bg-surface/50 transition-colors">
                          <td className="py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary-container/30 text-primary flex items-center justify-center font-bold text-xs">{r.hospede.nome.substring(0,2).toUpperCase()}</div><div><p className="font-bold text-on-surface">{r.hospede.nome}</p><p className="text-[11px] text-secondary">Origem: {r.origem}</p></div></div></td>
                          <td className="py-4 text-on-surface">{r.quarto.categoria} ({r.quarto.numero})</td>
                          <td className="py-4 text-secondary">{new Date(r.dataCheckIn).toLocaleDateString('pt-BR')}</td>
                          <td className="py-4"><span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${r.status === 'CONCLUÍDA' ? 'bg-secondary' : 'bg-green-500'}`}></span>{r.status}</span></td>
                          <td className="py-4 text-right">{r.status !== 'CONCLUÍDA' && (<button onClick={() => fazerCheckout(r.id)} className="px-3 py-1.5 border border-primary text-primary rounded text-xs font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer">Checkout</button>)}</td>
                        </tr>
                      ))}
                      {reservas.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-secondary">Nenhuma reserva recente.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* === MÓDULO: HÓSPEDES === */}
          {abaAtiva === 'hospedes' && (
            <div className="flex flex-col gap-6">
              <h1 className="font-headline-lg text-3xl text-on-surface">Gestão de Hóspedes</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border self-start">
                  <h2 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Novo Cadastro</h2>
                  <form onSubmit={cadastrarHospede} className="flex flex-col gap-4">
                    <input required placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                    <input required placeholder="CPF (Apenas números)" value={cpf} onChange={e => setCpf(mascaraCPF(e.target.value))} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                    <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                    <input required placeholder="Telefone" value={telefone} onChange={e => setTelefone(mascaraTelefone(e.target.value))} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                    <button type="submit" className="mt-2 w-full py-3 px-4 rounded-lg bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all cursor-pointer">Salvar Hóspede</button>
                  </form>
                </div>
                
                <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                  <h2 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Cadastrados</h2>
                  <ul className="flex flex-col gap-3">
                    {hospedes.map(h => (
                      <li key={h.id} className="flex justify-between items-center p-4 rounded-lg border border-surface-container hover:border-primary/30 transition-colors">
                        <div>
                          <strong className="font-headline-md text-lg text-on-surface">{h.nome}</strong><br/>
                          <small className="font-body-md text-secondary">CPF: {h.cpf} | Tel: {h.telefone}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* === MÓDULO: QUARTOS (ACOMODAÇÕES) === */}
          {abaAtiva === 'quartos' && (
            <div className="flex flex-col gap-6">
              <h1 className="font-headline-lg text-3xl text-on-surface">Gestão de Acomodações</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border self-start">
                  <h2 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Adicionar Chalé</h2>
                  <form onSubmit={cadastrarQuarto} className="flex flex-col gap-4">
                    <input required placeholder="Identificação (Ex: Chalé 01)" value={numero} onChange={e => setNumero(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-secondary uppercase tracking-wide">Categoria</label>
                      <select required value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary">
                        <option value="Chalé Luxo Casal">Chalé Luxo Casal</option>
                        <option value="Suíte Luxo Casal + Solteiro">Suíte Casal + Solteiro</option>
                        <option value="Suíte Luxo Família">Suíte Luxo Família</option>
                        <option value="Padrão">Padrão</option>
                      </select>
                    </div>
                    <input required type="number" placeholder="Capacidade (Pessoas)" value={capacidade} onChange={e => setCapacidade(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                    <input required type="number" placeholder="Valor Diária (R$)" value={valorDiaria} onChange={e => setValorDiaria(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                    <button type="submit" className="mt-2 w-full py-3 px-4 rounded-lg bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all cursor-pointer">Salvar Acomodação</button>
                  </form>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quartos.map(quarto => (
                      <div key={quarto.id} className="bg-surface-container-lowest rounded-xl shadow-level-1 ghost-border p-5 flex flex-col justify-between group hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-headline-md text-lg text-on-surface">{quarto.categoria}</h3>
                            <span className="font-body-sm text-secondary">Chalé: {quarto.numero}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${quarto.status === 'LIVRE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {quarto.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-surface-container">
                          <span className="font-label-md text-secondary flex items-center gap-1"><Users size={16}/> Até {quarto.capacidade}</span>
                          <span className="font-headline-md text-primary font-bold">{formatarMoeda(quarto.valorDiaria)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === MÓDULO: RESERVAS === */}
          {abaAtiva === 'reservas' && (
            <div className="flex flex-col gap-6">
              <h1 className="font-headline-lg text-3xl text-on-surface">Reservas</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border self-start">
                  <h2 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Nova Reserva</h2>
                  <form onSubmit={cadastrarReserva} className="flex flex-col gap-4">
                    <select required value={hospedeId} onChange={e => setHospedeId(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary">
                      <option value="">Selecione um Hóspede...</option>
                      {hospedes.map(h => <option key={h.id} value={h.id}>{h.nome}</option>)}
                    </select>
                    <select required value={quartoId} onChange={e => setQuartoId(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary">
                      <option value="">Selecione a Acomodação...</option>
                      {quartos.filter(q => q.status === 'LIVRE').map(q => <option key={q.id} value={q.id}>{q.categoria} - {q.numero}</option>)}
                    </select>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-secondary uppercase tracking-wide">Canal</label>
                      <select required value={origem} onChange={e => setOrigem(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary">
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Booking">Booking</option>
                        <option value="Balcão">Balcão</option>
                      </select>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wide block mb-1">Check-in</label>
                        <input required type="date" value={dataCheckIn} onChange={e => setDataCheckIn(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wide block mb-1">Check-out</label>
                        <input required type="date" value={dataCheckOut} onChange={e => setDataCheckOut(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                      </div>
                    </div>
                    <button type="submit" className="mt-2 w-full py-3 px-4 rounded-lg bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all cursor-pointer">Confirmar Reserva</button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                  <h2 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Agenda</h2>
                  <ul className="flex flex-col gap-4">
                    {reservas.map(r => (
                      <li key={r.id} className={`p-5 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-4 ${r.status === 'CONCLUÍDA' ? 'bg-surface opacity-70 border-surface-container' : 'bg-white border-outline-variant/50 shadow-sm'}`}>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-headline-md text-lg text-on-surface">{r.quarto.numero} - {r.hospede.nome}</h3>
                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-container text-secondary">{r.origem}</span>
                          </div>
                          <p className="font-body-sm text-secondary mb-1">Entrada: {new Date(r.dataCheckIn).toLocaleDateString('pt-BR')} | Saída: {new Date(r.dataCheckOut).toLocaleDateString('pt-BR')}</p>
                          <p className={`text-xs font-bold uppercase ${r.status === 'CONCLUÍDA' ? 'text-secondary' : 'text-primary'}`}>Status: {r.status}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => enviarWhatsApp(r)} className="px-4 py-2 rounded-lg bg-green-500 text-white font-label-md hover:bg-green-600 transition-colors cursor-pointer">Zap</button>
                          <button onClick={() => emitirRecibo(r)} className="px-4 py-2 rounded-lg border border-outline/30 text-on-surface-variant font-label-md hover:bg-surface-container transition-colors cursor-pointer">Recibo</button>
                          {r.status !== 'CONCLUÍDA' && (
                            <button onClick={() => fazerCheckout(r.id)} className="px-4 py-2 rounded-lg bg-error text-on-error font-label-md hover:bg-error/90 transition-colors cursor-pointer">Check-out</button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* === MÓDULO: GESTÃO OPERACIONAL (LIMPEZA E MANUTENÇÃO) === */}
          {abaAtiva === 'operacoes' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                 <div>
                    <h1 className="font-headline-lg text-3xl text-on-surface mb-1">Gestão Operacional</h1>
                    <p className="text-secondary font-body-md">Status de limpeza, arrumação dos chalés e chamados de manutenção.</p>
                 </div>
                 <div className="flex gap-6">
                    <button onClick={() => setAbaOperacoes('limpeza')} className={`pb-4 -mb-[17px] font-label-md text-sm transition-colors ${abaOperacoes === 'limpeza' ? 'text-primary border-b-2 border-primary font-bold' : 'text-secondary hover:text-on-surface cursor-pointer'}`}>Limpeza (Governança)</button>
                    <button onClick={() => setAbaOperacoes('reparos')} className={`pb-4 -mb-[17px] font-label-md text-sm transition-colors ${abaOperacoes === 'reparos' ? 'text-primary border-b-2 border-primary font-bold' : 'text-secondary hover:text-on-surface cursor-pointer'}`}>Reparos (Manutenção)</button>
                 </div>
              </div>

              {/* Sub-Aba: Limpeza */}
              {abaOperacoes === 'limpeza' && (
                <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pt-2">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div className="bg-surface-container-lowest p-6 rounded-xl border-t-4 border-t-error shadow-sm">
                         <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-2 flex items-center gap-2">Para Limpar <Brush size={14}/></h3>
                         <p className="font-display-lg text-4xl text-on-surface">{tarefasLimpeza.filter((t: any) => t.status === 'Sujo').length}</p>
                      </div>
                      <div className="bg-surface-container-lowest p-6 rounded-xl border-t-4 border-t-primary shadow-sm">
                         <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-2 flex items-center gap-2">Em Limpeza <Clock size={14}/></h3>
                         <p className="font-display-lg text-4xl text-on-surface">{tarefasLimpeza.filter((t: any) => t.status === 'Em Limpeza').length}</p>
                      </div>
                      <div className="bg-surface-container-lowest p-6 rounded-xl border-t-4 border-t-green-500 shadow-sm">
                         <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-2 flex items-center gap-2">Concluídos <CheckCircle2 size={14}/></h3>
                         <p className="font-display-lg text-4xl text-on-surface">{tarefasLimpeza.filter((t: any) => t.status === 'Limpo').length}</p>
                      </div>
                   </div>

                   {/* Filtros de Limpeza */}
                   <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      <button onClick={() => setFiltroLimpeza('todos')} className={`px-5 py-2 rounded-full font-label-md whitespace-nowrap shadow-sm transition-colors ${filtroLimpeza === 'todos' ? 'bg-on-surface text-white' : 'bg-surface-container-lowest text-secondary border border-outline-variant hover:bg-surface-container cursor-pointer'}`}>
                         Todos ({tarefasLimpeza.length})
                      </button>
                      <button onClick={() => setFiltroLimpeza('urgentes')} className={`px-5 py-2 rounded-full font-label-md whitespace-nowrap shadow-sm transition-colors ${filtroLimpeza === 'urgentes' ? 'bg-on-surface text-white' : 'bg-surface-container-lowest text-secondary border border-outline-variant hover:bg-surface-container cursor-pointer'}`}>
                         Urgentes ({tarefasLimpeza.filter((t: any) => t.urgente).length})
                      </button>
                   </div>

                   <div className="flex flex-col gap-4">
                      {tarefasLimpeza
                        .filter((t: any) => filtroLimpeza === 'todos' ? true : t.urgente)
                        .map((tarefa: any) => (
                         <div key={tarefa.id} className="bg-surface-container-lowest p-5 md:p-6 rounded-xl shadow-level-1 ghost-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden animate-fade-in">
                            {tarefa.urgente && <div className="absolute top-0 left-0 w-1.5 h-full bg-error"></div>}
                            {tarefa.status === 'Em Limpeza' && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>}
                            
                            <div className="pl-2">
                               <div className="flex items-center gap-3 mb-1">
                                  <h3 className="font-headline-md text-xl text-on-surface">{tarefa.quarto}</h3>
                                  {tarefa.urgente && <span className="bg-error-container text-error text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Urgente</span>}
                                  {tarefa.status === 'Bloqueado' && <span className="bg-surface-container-high text-secondary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Bloqueado</span>}
                               </div>
                               <p className="text-sm text-secondary flex items-center gap-1.5 mb-2"><BedDouble size={14}/> {tarefa.tipo} • {tarefa.observacao}</p>
                               <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${tarefa.status === 'Sujo' ? 'bg-error' : tarefa.status === 'Em Limpeza' ? 'bg-primary' : 'bg-secondary'}`}></div>
                                  <span className="text-xs font-bold text-on-surface">{tarefa.status} {tarefa.responsavel ? `(por ${tarefa.responsavel})` : ''}</span>
                               </div>
                            </div>
                            
                            <div className="w-full md:w-auto mt-2 md:mt-0">
                               {tarefa.status === 'Sujo' && <button onClick={() => atualizarStatusLimpeza(tarefa.id, 'Em Limpeza')} className="w-full md:w-auto px-8 py-3 bg-primary-container text-primary-fixed-variant font-label-md font-bold rounded-lg hover:brightness-95 cursor-pointer flex items-center justify-center gap-2 shadow-sm"><Play size={16} fill="currentColor"/> Iniciar Limpeza</button>}
                               {tarefa.status === 'Em Limpeza' && <button onClick={() => atualizarStatusLimpeza(tarefa.id, 'Limpo')} className="w-full md:w-auto px-8 py-3 border border-outline text-on-surface font-label-md font-bold rounded-lg hover:bg-surface-container cursor-pointer flex items-center justify-center gap-2 shadow-sm"><Check size={16}/> Finalizar</button>}
                               {tarefa.status === 'Limpo' && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={16}/> Limpeza Concluída</span>}
                            </div>
                         </div>
                      ))}
                      {tarefasLimpeza.filter((t: any) => filtroLimpeza === 'todos' ? true : t.urgente).length === 0 && (
                         <p className="text-secondary text-center py-6">Nenhuma tarefa encontrada neste filtro.</p>
                      )}
                   </div>
                </div>
              )}

              {/* Sub-Aba: Reparos */}
              {abaOperacoes === 'reparos' && (
                <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pt-2 animate-fade-in">
                   <div className="bg-surface-container-highest p-4 rounded-lg flex items-center gap-3 mb-2">
                      <AlertCircle className="text-secondary" size={20} />
                      <p className="text-sm text-on-surface font-body-md">Você tem <strong>{chamados.filter((c: any) => c.status !== 'Concluído').length} chamados</strong> pendentes de reparo.</p>
                   </div>
                   
                   {/* Filtros de Reparos */}
                   <div className="flex gap-2 overflow-x-auto pb-2 border-b border-outline-variant/30 mb-2">
                      <button onClick={() => setFiltroReparos('pendentes')} className={`pb-3 border-b-2 font-bold text-sm px-2 transition-colors cursor-pointer ${filtroReparos === 'pendentes' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-on-surface'}`}>
                         Pendentes ({chamados.filter((c: any) => c.status !== 'Concluído').length})
                      </button>
                      <button onClick={() => setFiltroReparos('concluidos')} className={`pb-3 border-b-2 font-bold text-sm px-2 transition-colors cursor-pointer ${filtroReparos === 'concluidos' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-on-surface'}`}>
                         Concluídos ({chamados.filter((c: any) => c.status === 'Concluído').length})
                      </button>
                   </div>

                   <div className="flex flex-col gap-4">
                      {chamados
                        .filter((c: any) => filtroReparos === 'pendentes' ? c.status !== 'Concluído' : c.status === 'Concluído')
                        .map((chamado: any) => (
                         <div key={chamado.id} className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 ghost-border relative overflow-hidden animate-fade-in">
                            {chamado.prioridade === 'Alta' && <div className="absolute top-0 left-0 w-1.5 h-full bg-error"></div>}
                            {chamado.prioridade === 'Média' && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>}
                            <div className="pl-2">
                               <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{chamado.local}</span>
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${chamado.prioridade === 'Alta' ? 'bg-error-container text-error' : chamado.prioridade === 'Média' ? 'bg-primary-container text-primary-fixed-variant' : 'bg-surface-container text-secondary'}`}>
                                     <div className={`w-1.5 h-1.5 rounded-full ${chamado.prioridade === 'Alta' ? 'bg-error' : chamado.prioridade === 'Média' ? 'bg-primary' : 'bg-secondary'}`}></div>
                                     {chamado.prioridade}
                                  </span>
                               </div>
                               <h3 className="font-headline-md text-xl text-on-surface mb-4">{chamado.descricao}</h3>
                               <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-6 text-sm text-secondary">
                                  <div className="flex items-center gap-2"><Clock size={16}/> {chamado.status === 'Pendente' ? `Espera: ${chamado.tempoEspera}` : chamado.tempoEspera}</div>
                                  {chamado.hospedeEnvolvido && <div className="flex items-center gap-2"><Users size={16}/> {chamado.hospedeEnvolvido}</div>}
                               </div>
                               {chamado.status === 'Pendente' && (
                                  <button onClick={() => atualizarStatusReparo(chamado.id, 'Em Andamento')} className="w-full md:w-auto px-6 py-3 bg-[#c5a059] text-white font-label-md font-bold rounded-lg hover:brightness-95 cursor-pointer shadow-sm">
                                     ✋ Assumir Tarefa
                                  </button>
                               )}
                               {chamado.status === 'Em Andamento' && (
                                  <div className="flex gap-2 w-full md:w-auto">
                                     <button onClick={() => atualizarStatusReparo(chamado.id, 'Pendente')} className="px-4 py-3 border border-outline text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container cursor-pointer">
                                        Pausar
                                     </button>
                                     <button onClick={() => atualizarStatusReparo(chamado.id, 'Concluído')} className="px-6 py-3 bg-on-surface text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer shadow-sm">
                                        Concluir
                                     </button>
                                  </div>
                               )}
                               {chamado.status === 'Concluído' && (
                                  <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={16}/> Resolvido</span>
                               )}
                            </div>
                         </div>
                      ))}
                      {chamados.filter((c: any) => filtroReparos === 'pendentes' ? c.status !== 'Concluído' : c.status === 'Concluído').length === 0 && (
                         <p className="text-secondary text-center py-6">Nenhum chamado neste filtro.</p>
                      )}
                   </div>
                </div>
              )}
            </div>
          )}

          {/* === MÓDULO: RESTAURANTE E EVENTOS === */}
          {abaAtiva === 'restaurante' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                 <div>
                    <h1 className="font-headline-lg text-3xl text-on-surface mb-4">Gestão do Restaurante</h1>
                    <div className="flex gap-6">
                       <button onClick={() => setAbaRestaurante('pedidos')} className={`pb-4 -mb-[17px] font-label-md text-sm transition-colors ${abaRestaurante === 'pedidos' ? 'text-primary border-b-2 border-primary font-bold' : 'text-secondary hover:text-on-surface cursor-pointer'}`}>Cozinha & Pedidos</button>
                       <button onClick={() => setAbaRestaurante('layout')} className={`pb-4 -mb-[17px] font-label-md text-sm transition-colors ${abaRestaurante === 'layout' ? 'text-primary border-b-2 border-primary font-bold' : 'text-secondary hover:text-on-surface cursor-pointer'}`}>Layout & Eventos</button>
                    </div>
                 </div>
                 {abaRestaurante === 'pedidos' && (
                    <button onClick={() => buscarPedidosCozinha()} className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg text-primary font-bold text-sm hover:bg-surface-container-high transition-colors cursor-pointer shadow-sm"><RefreshCw size={16} /> Atualizar</button>
                 )}
              </div>

              {/* -- SUB-ABA: COZINHA E PEDIDOS -- */}
              {abaRestaurante === 'pedidos' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                    <div className="lg:col-span-1 flex flex-col gap-6 self-start">
                      
                      {/* Cadastro de Novo Prato */}
                      <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                        <h2 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Novo Prato</h2>
                        <form onSubmit={cadastrarProduto} className="flex flex-col gap-4">
                          <input required placeholder="Nome do Prato/Bebida" value={prodNome} onChange={e => setProdNome(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                          <select value={prodCategoria} onChange={e => setProdCategoria(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary">
                            <option value="Prato Principal">Prato Principal</option>
                            <option value="Petiscos">Petiscos & Entradas</option>
                            <option value="Bebidas">Bebidas & Drinks</option>
                            <option value="Sobremesas">Sobremesas</option>
                          </select>
                          <input required type="number" step="0.01" placeholder="Preço (R$)" value={prodPreco} onChange={e => setProdPreco(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                          <input required type="number" placeholder="Estoque Inicial" value={prodEstoque} onChange={e => setProdEstoque(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                          <button type="submit" className="mt-2 w-full py-3 px-4 rounded-lg bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all cursor-pointer font-bold">Adicionar ao Menu</button>
                        </form>
                      </div>

                      {/* Seção de Inventário / Estoque para a Cozinha */}
                      <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                        <h3 className="font-headline-md text-lg text-on-surface mb-4 border-b border-outline-variant/20 pb-2">
                          📦 Controle de Estoque (Cozinha)
                        </h3>
                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                          {produtos.slice().sort((a: any, b: any) => a.estoque - b.estoque).map((p: any) => (
                            <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border border-outline-variant/30 bg-surface">
                              <div>
                                <p className="font-bold text-sm text-on-surface">{p.nome}</p>
                                <span className="text-[10px] text-secondary uppercase">{p.categoria || 'Geral'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {p.estoque <= 5 ? (
                                  <span className="bg-error-container text-error text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Baixo ({p.estoque})</span>
                                ) : (
                                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Ok ({p.estoque})</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {produtos.length === 0 && <p className="text-xs text-secondary text-center py-4">Nenhum produto cadastrado.</p>}
                        </div>
                      </div>
                    </div>

                    {/* Fila de Pedidos */}
                    <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                      <h2 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2 flex items-center gap-2">
                        <Activity size={20} className="text-primary"/> Fila de Pedidos
                      </h2>
                      <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                        {Array.isArray(pedidosCozinha) && pedidosCozinha.map((pedido: any) => (
                          <div key={pedido.id} className={`p-5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${pedido?.status === 'CANCELADO' ? 'bg-error-container border-error/20' : 'bg-white shadow-sm border-outline-variant/50'}`}>
                            <div>
                              <h4 className="font-headline-md text-lg text-on-surface mb-1">{pedido?.quantidade || 1}x {pedido?.produto?.nome || 'Item'}</h4>
                              <p className="font-body-sm text-secondary mb-3">Destino: Chalé {pedido?.reserva?.quarto?.numero || 'N/A'} ({pedido?.reserva?.hospede?.nome || 'Hóspede'})</p>
                              {pedido.observacoes && (
                                <div className="mb-4 inline-flex items-start gap-1.5 px-3 py-2 bg-error-container/40 border border-error/30 rounded-md max-w-sm">
                                   <AlertCircle size={16} className="text-error mt-0.5 flex-shrink-0" />
                                   <span className="text-xs font-bold text-error leading-tight">Obs do Hóspede: {pedido.observacoes}</span>
                                </div>
                              )}
                              <span className={`block w-max px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${pedido?.status === 'SOLICITADO' ? 'bg-orange-100 text-orange-800' : pedido?.status === 'EM_PREPARO' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {pedido?.status ? pedido.status.replace('_', ' ') : 'PENDENTE'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {pedido?.status === 'SOLICITADO' && (
                                <>
                                  <button type="button" onClick={() => atualizarStatusPedido(pedido.id, 'EM_PREPARO')} className="px-3 py-2 rounded bg-primary-container text-on-primary-container text-xs font-bold hover:brightness-95 cursor-pointer">Iniciar</button>
                                  <button type="button" onClick={() => atualizarStatusPedido(pedido.id, 'CANCELADO')} className="px-3 py-2 rounded bg-error text-white text-xs font-bold hover:brightness-95 cursor-pointer">Cancelar</button>
                                </>
                              )}
                              {pedido?.status === 'EM_PREPARO' && <button type="button" onClick={() => atualizarStatusPedido(pedido.id, 'PRONTO')} className="px-3 py-2 rounded bg-green-600 text-white text-xs font-bold cursor-pointer">Pronto</button>}
                              {pedido?.status === 'PRONTO' && <button type="button" onClick={() => atualizarStatusPedido(pedido.id, 'ENTREGUE')} className="px-3 py-2 rounded border border-outline text-on-surface text-xs font-bold cursor-pointer">Entregue</button>}
                              {pedido?.status === 'CANCELADO' && <button type="button" onClick={() => atualizarStatusPedido(pedido.id, 'ENTREGUE')} className="px-3 py-2 rounded bg-surface-container text-secondary text-xs font-bold cursor-pointer">Limpar</button>}
                            </div>
                          </div>
                        ))}
                        {(!pedidosCozinha || pedidosCozinha.length === 0) && (
                          <p className="text-secondary py-8 text-center">Nenhum pedido na fila no momento. 🍳</p>
                        )}
                      </div>
                    </div>
                 </div>
              )}

              {/* -- SUB-ABA: LAYOUT SALÃO E EVENTOS -- */}
              {abaRestaurante === 'layout' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 animate-fade-in">
                    <div className="lg:col-span-1 flex flex-col gap-6">
                       
                       <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 ghost-border border-t-4 border-t-primary">
                          <h3 className="font-headline-md text-lg text-on-surface mb-4">Nova Reserva de Mesa</h3>
                          <form onSubmit={reservarMesaRestaurante} className="flex flex-col gap-3">
                             <input required type="text" placeholder="Nome do Cliente/Hóspede" value={nomeReservaMesa} onChange={(e) => setNomeReservaMesa(e.target.value)} className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm" />
                             <div className="flex gap-3">
                                <input required type="date" className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm text-secondary" />
                                <input required type="time" className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm text-secondary" />
                             </div>
                             <div className="flex gap-3 items-center">
                                <input required type="number" min="1" value={paxReservaMesa} onChange={(e) => setPaxReservaMesa(e.target.value)} placeholder="Qtd. Pessoas" className="w-1/3 p-2.5 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm" />
                                <select required value={mesaSelecionada} onChange={(e) => setMesaSelecionada(e.target.value)} className="w-2/3 p-2.5 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm" >
                                   <option value="">Selecione a Mesa</option>
                                   <option value="01">Mesa 01</option><option value="02">Mesa 02</option>
                                   <option value="03">Mesa 03</option><option value="04">Mesa 04</option>
                                   <option value="05">Mesa 05</option><option value="06">Mesa 06</option>
                                   <option value="07">Mesa 07</option><option value="08">Mesa 08</option>
                                </select>
                             </div>
                             <button type="submit" className="mt-2 w-full py-2.5 bg-primary text-white font-label-md font-bold rounded-lg hover:brightness-95 shadow-sm cursor-pointer">
                                Confirmar Reserva
                             </button>
                          </form>
                       </div>

                       <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 ghost-border hidden md:block">
                          <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-2">
                             <h3 className="font-headline-md text-xl text-on-surface">Agenda Semanal</h3>
                             <div className="flex gap-2">
                                <button className="p-1 border border-outline-variant rounded hover:bg-surface-container"><ChevronRight size={16} className="rotate-180"/></button>
                                <button className="p-1 border border-outline-variant rounded hover:bg-surface-container"><ChevronRight size={16}/></button>
                             </div>
                          </div>
                          <div className="flex flex-col gap-4">
                             {eventosAgenda.map((ev: any) => (
                                <div key={ev.id} className="flex gap-4 pb-3 border-b border-outline-variant/20 last:border-0">
                                   <div className="text-center flex-shrink-0 pt-1">
                                      <p className="text-lg font-bold text-on-surface leading-none">{ev.data ? ev.data.split('/')[0] : '12'}</p>
                                      <p className="text-[10px] font-bold text-secondary uppercase">Mês</p>
                                   </div>
                                   <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                         <h4 className="font-bold text-sm text-on-surface">{ev.titulo}</h4>
                                         <span className="text-[10px] text-primary font-bold">{ev.tipo}</span>
                                      </div>
                                      <p className="text-xs text-secondary mb-1">{ev.descricao}</p>
                                      <p className="text-[11px] text-secondary font-bold flex items-center gap-1"><Clock size={12}/> {ev.hora}</p>
                                   </div>
                                </div>
                             ))}
                             {eventosAgenda.length === 0 && <p className="text-xs text-secondary text-center py-2">Nenhum evento agendado.</p>}
                          </div>
                       </div>
                    </div>

                    <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-level-1 ghost-border flex flex-col">
                       <div className="flex justify-between items-center mb-6">
                          <h3 className="font-headline-md text-xl text-on-surface">Layout Salão</h3>
                          <div className="flex gap-4">
                             <span className="text-xs font-bold text-secondary flex items-center gap-1.5"><div className="w-2 h-2 border border-outline-variant rounded-full"></div> Livre</span>
                             <span className="text-xs font-bold text-on-surface flex items-center gap-1.5"><div className="w-2 h-2 bg-primary rounded-full"></div> Ocupado / Selecionada</span>
                          </div>
                       </div>
                       
                       <div className="flex-1 border-2 border-outline-variant/30 border-dashed rounded-xl p-8 relative min-h-[400px] flex items-center justify-center bg-[#faf9f6]">
                          <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#faf9f6] px-4 -mt-2.5 text-[10px] font-bold text-secondary uppercase tracking-widest">CLIQUE NA MESA PARA RESERVAR</span>
                          
                          <div className="w-full h-full relative">
                             {(() => {
                               const getMesaClass = (num: string) => {
                                 const isSelected = mesaSelecionada === num;
                                 const reservaDaMesa = reservasMesas.find((r: any) => r.mesa === num && r.status === 'CONFIRMADA');

                                 if (isSelected) return 'absolute flex items-center justify-center font-bold cursor-pointer transition-all duration-300 border-4 border-[#c5a059] bg-primary-container text-[#c5a059] shadow-lg scale-110 z-10';
                                 if (reservaDaMesa) return 'absolute flex items-center justify-center font-bold cursor-pointer transition-all duration-300 bg-primary text-white border-2 border-primary shadow-sm';
                                 return 'absolute flex items-center justify-center font-bold cursor-pointer transition-all duration-300 border-2 border-outline-variant bg-white text-secondary hover:scale-105';
                               };

                               const renderMesa = (num: string, formatoClass: string, posicaoStyle: any) => {
                                 const reservaDaMesa = reservasMesas.find((r: any) => r.mesa === num && r.status === 'CONFIRMADA');
                                 return (
                                   <div 
                                     key={num}
                                     onClick={() => {
                                       if (reservaDaMesa) {
                                         if (window.confirm(`A Mesa ${num} está ocupada. Deseja cancelar esta reserva e liberar a mesa?`)) { alert('Função de cancelar reserva em desenvolvimento.'); }
                                       } else {
                                         setMesaSelecionada(num);
                                       }
                                     }}
                                     title={reservaDaMesa ? `Reservado para: ${reservaDaMesa.nome} | Pessoas: ${reservaDaMesa.qtdPessoas}` : `Mesa ${num} - Clique para selecionar`}
                                     className={`${getMesaClass(num)} ${formatoClass}`}
                                     style={posicaoStyle}
                                   >
                                     {num}
                                   </div>
                                 );
                               };

                               return (
                                 <>
                                   {renderMesa('01', 'w-16 h-16 rounded-full', { top: '40px', left: '40px' })}
                                   {renderMesa('02', 'w-16 h-16 rounded-full', { top: '40px', left: '45%', transform: 'translateX(-50%)' })}
                                   {renderMesa('03', 'w-16 h-16 rounded-full', { top: '40px', right: '40px' })}
                                   {renderMesa('04', 'w-24 h-16 rounded-lg', { top: '50%', transform: 'translateY(-50%)', left: '60px' })}
                                   {renderMesa('05', 'w-24 h-16 rounded-lg', { top: '50%', transform: 'translateY(-50%)', right: '60px' })}
                                   {renderMesa('06', 'w-16 h-16 rounded-full', { bottom: '40px', left: '40px' })}
                                   {renderMesa('07', 'w-16 h-16 rounded-full', { bottom: '40px', left: '45%', transform: 'translateX(-50%)' })}
                                   {renderMesa('08', 'w-16 h-16 rounded-full', { bottom: '40px', right: '40px' })}
                                 </>
                               );
                             })()}
                          </div>
                       </div>
                    </div>
                 </div>
              )}
            </div>
          )}

          {/* === MÓDULO: FINANCEIRO (CAIXA) === */}
          {abaAtiva === 'caixa' && (
            <div className="flex flex-col gap-6">
              <h1 className="font-headline-lg text-3xl text-on-surface">Financeiro</h1>
              
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border border-l-4 border-l-green-500">
                  <h3 className="font-label-md text-secondary mb-2 uppercase tracking-widest">Entradas</h3>
                  <p className="font-headline-lg text-3xl text-green-600">{formatarMoeda(totalEntradas)}</p>
                </div>
                <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border border-l-4 border-l-red-500">
                  <h3 className="font-label-md text-secondary mb-2 uppercase tracking-widest">Saídas</h3>
                  <p className="font-headline-lg text-3xl text-red-600">{formatarMoeda(totalSaidas)}</p>
                </div>
                <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border border-l-4 border-l-primary">
                  <h3 className="font-label-md text-secondary mb-2 uppercase tracking-widest">Saldo Real</h3>
                  <p className="font-headline-lg text-3xl text-on-surface">{formatarMoeda(saldoReal)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
                {/* Nova Transação */}
                <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border self-start">
                  <h3 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Nova Transação</h3>
                  <form onSubmit={registrarTransacao} className="flex flex-col gap-4">
                    <select value={tipoTransacao} onChange={e => setTipoTransacao(e.target.value)} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary">
                      <option value="ENTRADA">Entrada (+)</option>
                      <option value="SAIDA">Saída (-)</option>
                    </select>
                    <input value={descricaoTransacao} onChange={e => setDescricaoTransacao(e.target.value)} required placeholder="Descrição" className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                    <input value={valorTransacao} onChange={e => setValorTransacao(e.target.value)} required type="number" step="0.01" placeholder="Valor (R$)" className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                    <select value={metodoPagamento} onChange={e => setMetodoPagamento(e.target.value)} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary">
                      <option value="PIX">PIX</option>
                      <option value="CARTAO_CREDITO">Crédito</option>
                      <option value="DINHEIRO">Dinheiro</option>
                    </select>
                    <button type="submit" className="mt-2 w-full py-3 px-4 rounded-lg bg-on-surface text-white font-label-md hover:opacity-90 cursor-pointer">Registrar</button>
                  </form>
                </div>

                {/* Histórico do Dia */}
                <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                  <h3 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Histórico do Dia</h3>
                  <ul className="flex flex-col">
                    {transacoes.map(t => (
                      <li key={t.id} className="flex justify-between items-center border-b border-surface-container py-4 last:border-0">
                        <div>
                          <strong className="font-headline-md text-lg text-on-surface">{t.descricao}</strong><br/>
                          <small className="text-secondary">{t.metodoPagamento} | {new Date(t.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                        <strong className={`font-headline-md text-xl ${t.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.tipo === 'ENTRADA' ? '+' : '-'} {formatarMoeda(t.valor)}
                        </strong>
                      </li>
                    ))}
                    {transacoes.length === 0 && <p className="text-secondary text-sm">Nenhuma transação registrada hoje.</p>}
                  </ul>
                </div>
              </div>

              {/* Fechamento de Turno e Conciliação */}
              <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border mt-6">
                <h3 className="font-headline-md text-xl text-on-surface mb-4 border-b border-outline-variant/20 pb-2">
                  🔒 Fechamento de Turno e Conciliação
                </h3>
                <p className="text-sm text-secondary mb-6">
                  Confira os valores acumulados por forma de pagamento no turno atual para o fechamento de caixa.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Total PIX (Sistema)</span>
                    <p className="font-headline-md text-2xl text-primary">
                      {formatarMoeda(transacoes.filter(t => t.tipo === 'ENTRADA' && t.metodoPagamento === 'PIX').reduce((acc, t) => acc + t.valor, 0))}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Total Cartão (Sistema)</span>
                    <p className="font-headline-md text-2xl text-primary">
                      {formatarMoeda(transacoes.filter(t => t.tipo === 'ENTRADA' && t.metodoPagamento === 'CARTAO_CREDITO').reduce((acc, t) => acc + t.valor, 0))}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Total Dinheiro (Sistema)</span>
                    <p className="font-headline-md text-2xl text-primary">
                      {formatarMoeda(transacoes.filter(t => t.tipo === 'ENTRADA' && t.metodoPagamento === 'DINHEIRO').reduce((acc, t) => acc + t.valor, 0))}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-xl border border-outline-variant/30">
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">Conferência de Gaveta (Dinheiro Físico)</h4>
                    <p className="text-xs text-secondary">Informe o valor total apurado na contagem física de notas e moedas.</p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="R$ 0,00" 
                      className="p-3 rounded-lg border border-outline-variant bg-white outline-none focus:border-primary text-sm w-full md:w-48 font-bold"
                      onChange={(e) => {
                        const valorFisico = Number(e.target.value) || 0;
                        const valorSistema = transacoes.filter(t => t.tipo === 'ENTRADA' && t.metodoPagamento === 'DINHEIRO').reduce((acc, t) => acc + t.valor, 0);
                        const diferenca = valorFisico - valorSistema;
                        const elDiferenca = document.getElementById('resultado-diferenca');
                        if (elDiferenca) {
                          elDiferenca.innerText = formatarMoeda(diferenca);
                          elDiferenca.className = `font-headline-md text-xl font-bold ${diferenca < 0 ? 'text-red-600' : diferenca > 0 ? 'text-green-600' : 'text-on-surface'}`;
                        }
                      }}
                    />
                    <div className="flex flex-col justify-center px-4 bg-surface-container rounded-lg border border-outline-variant/30">
                      <span className="text-[10px] uppercase font-bold text-secondary">Diferença</span>
                      <span id="resultado-diferenca" className="font-headline-md text-xl font-bold text-on-surface">R$ 0,00</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button onClick={() => alert('Fechamento de turno registrado e conciliado com sucesso!')} className="px-6 py-3 bg-primary text-white font-label-md font-bold rounded-lg hover:brightness-95 transition-all shadow-sm cursor-pointer">
                    Encerrar e Consolidar Turno
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* === MÓDULO: RECURSOS HUMANOS (RH) === */}
          {abaAtiva === 'rh' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                <div>
                  <h1 className="font-headline-lg text-3xl text-on-surface mb-1">Gestão de Equipe & RH</h1>
                  <p className="text-secondary font-body-md">Diretório de colaboradores ativos e controle de escala semanal.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border self-start">
                  <h3 className="font-headline-md text-xl text-on-surface mb-4">Adicionar Funcionário</h3>
                  <form onSubmit={(e) => { e.preventDefault(); alert('Colaborador cadastrado com sucesso!'); }} className="flex flex-col gap-4">
                    <input required placeholder="Nome Completo" className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm" />
                    <input required placeholder="Cargo (Ex: Camareira, Cozinheiro)" className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm" />
                    <input required placeholder="Telefone / Contato" className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm" />
                    <select className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm">
                      <option value="Turno Manhã">Turno Manhã (06h - 14h)</option>
                      <option value="Turno Tarde">Turno Tarde (14h - 22h)</option>
                      <option value="Turno Noite">Turno Noite (22h - 06h)</option>
                    </select>
                    <button type="submit" className="w-full py-3 bg-primary text-white font-label-md font-bold rounded-lg hover:brightness-95 cursor-pointer shadow-sm">
                      Cadastrar Colaborador
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                  <h3 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Colaboradores Ativos & Escala</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center p-4 rounded-xl border border-outline-variant/30 bg-surface">
                      <div>
                        <h4 className="font-bold text-base text-on-surface">Maria das Graças</h4>
                        <p className="text-xs text-secondary">Camareira Chefe • Turno Manhã</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">Ativo (Escala OK)</span>
                    </div>

                    <div className="flex justify-between items-center p-4 rounded-xl border border-outline-variant/30 bg-surface">
                      <div>
                        <h4 className="font-bold text-base text-on-surface">Antônio Carlos</h4>
                        <p className="text-xs text-secondary">Cozinheiro Principal • Turno Tarde</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">Ativo (Escala OK)</span>
                    </div>

                    <div className="flex justify-between items-center p-4 rounded-xl border border-outline-variant/30 bg-surface">
                      <div>
                        <h4 className="font-bold text-base text-on-surface">Juliana Souza</h4>
                        <p className="text-xs text-secondary">Recepcionista • Turno Noite</p>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full uppercase tracking-wider">Folga Programada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === MÓDULO: PORTAL DO HÓSPEDE === */}
          {abaAtiva === 'portal-hospede' && (
            <div className="flex flex-col gap-6 max-w-[1000px] mx-auto pt-4">
              <header className="flex flex-col gap-2 text-center md:text-left mb-2">
                <h1 className="font-headline-lg text-[32px] md:text-[40px] text-on-surface leading-tight">Olá, {usuarioLogado?.nome?.split(' ')[0]}. Aproveite sua estadia.</h1>
                <p className="font-body-lg text-secondary">Estamos felizes em tê-lo conosco. Acesse os serviços do seu chalé abaixo.</p>
              </header>

              <div className="flex gap-6 border-b border-outline-variant/50 overflow-x-auto no-scrollbar">
                <button onClick={() => setAbaPortal('visao-geral')} className={`pb-3 font-label-md whitespace-nowrap transition-colors ${abaPortal === 'visao-geral' ? 'text-primary border-b-2 border-primary font-bold' : 'text-secondary hover:text-on-surface cursor-pointer'}`}>Resumo da Estadia</button>
                <button onClick={() => setAbaPortal('guia')} className={`pb-3 font-label-md whitespace-nowrap transition-colors ${abaPortal === 'guia' ? 'text-primary border-b-2 border-primary font-bold' : 'text-secondary hover:text-on-surface cursor-pointer'}`}>Guia Majorlândia</button>
                <button onClick={() => setAbaPortal('concierge')} className={`pb-3 font-label-md whitespace-nowrap transition-colors ${abaPortal === 'concierge' ? 'text-primary border-b-2 border-primary font-bold' : 'text-secondary hover:text-on-surface cursor-pointer'}`}>Concierge & Serviços</button>
                <button onClick={() => setAbaPortal('preferencias')} className={`pb-3 font-label-md whitespace-nowrap transition-colors ${abaPortal === 'preferencias' ? 'text-primary border-b-2 border-primary font-bold' : 'text-secondary hover:text-on-surface cursor-pointer'}`}>Preferências</button>
              </div>

              {/* Sub-Aba: Visão Geral (Extrato, Wi-Fi, Cardápio) */}
              {abaPortal === 'visao-geral' && (
                <div className="flex flex-col gap-6">
                  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-surface-container-lowest rounded-lg shadow-level-1 p-6 flex flex-col justify-between group hover:shadow-level-2 transition-shadow duration-300 ghost-border">
                      <div className="flex items-start justify-between mb-4 border-b border-outline-variant/20 pb-2">
                        <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary" data-icon="payments">payments</span><h2 className="font-headline-md text-base text-on-surface">Extrato do Chalé</h2></div>
                      </div>
                      <div className="flex flex-col gap-2 flex-grow">
                        <p className="font-body-md text-secondary text-sm">Saldo atual em consumo:</p>
                        <p className="font-headline-lg text-[28px] text-on-surface">{extratoHospede && extratoHospede.temReserva ? formatarMoeda(extratoHospede.totalGeral) : 'R$ 0,00'}</p>
                      </div>
                      <button onClick={() => document.getElementById('detalhes-extrato')?.scrollIntoView({ behavior: 'smooth' })} className="mt-4 w-full py-2.5 px-4 rounded bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all cursor-pointer">Ver Detalhes</button>
                    </div>

                    <div className="bg-surface-container-lowest rounded-lg shadow-level-1 p-6 flex flex-col justify-between group hover:shadow-level-2 transition-shadow duration-300 ghost-border">
                      <div className="flex items-start justify-between mb-4 border-b border-outline-variant/20 pb-2">
                        <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary" data-icon="wifi">wifi</span><h2 className="font-headline-md text-base text-on-surface">Conectar Wi-Fi</h2></div>
                      </div>
                      <div className="flex flex-col gap-2 flex-grow">
                        <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-outline-variant/30">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-secondary font-bold">Rede</p>
                            <p className="font-headline-md text-sm font-bold text-on-surface">Refugio_Hospedes</p>
                            <p className="text-[10px] uppercase tracking-wider text-secondary font-bold mt-2">Senha</p>
                            <p className="font-headline-md text-sm font-bold text-primary">bemvindo</p>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-outline-variant flex flex-col items-center justify-center shadow-sm"><QrCode size={36} className="text-on-surface" /></div>
                        </div>
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText('bemvindo'); alert('Senha copiada com sucesso!')}} className="mt-4 w-full py-2.5 px-4 rounded border ghost-border text-on-surface-variant font-label-md hover:bg-primary-container/10 transition-all cursor-pointer">Copiar Senha</button>
                    </div>

                    <div className="bg-surface-container-lowest rounded-lg shadow-level-1 p-6 flex flex-col justify-between group hover:shadow-level-2 transition-shadow duration-300 ghost-border">
                      <div className="flex items-start justify-between mb-4 border-b border-outline-variant/20 pb-2">
                        <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary" data-icon="restaurant">restaurant</span><h2 className="font-headline-md text-base text-on-surface">Cardápio Digital</h2></div>
                      </div>
                      <div className="flex flex-col gap-2 flex-grow relative overflow-hidden rounded mb-2 min-h-[100px]">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544025162-811114bd4157?q=80&w=800&auto=format&fit=crop')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="relative z-10 p-3 h-full flex items-end"><p className="font-body-md text-white text-sm">Opções exclusivas de gastronomia.</p></div>
                      </div>
                      <button onClick={() => document.getElementById('secao-cardapio')?.scrollIntoView({ behavior: 'smooth' })} className="mt-auto w-full py-2.5 px-4 rounded bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all cursor-pointer">Acessar Cardápio</button>
                    </div>
                  </section>

                  {/* Acompanhamento de Pedidos para o Hóspede */}
                  {pedidosCozinha.filter((p: any) => p.status !== 'ENTREGUE' && p.status !== 'CANCELADO').length > 0 && (
                    <section className="mt-4">
                      <h3 className="font-headline-md text-xl mb-4 text-on-surface">Acompanhamento de Pedidos</h3>
                      {pedidosCozinha.filter((p: any) => p.status !== 'ENTREGUE' && p.status !== 'CANCELADO').map((pedido: any) => {
                         const isPreparo = pedido.status === 'EM_PREPARO';
                         const isPronto = pedido.status === 'PRONTO';
                         return (
                            <div key={pedido.id} className="bg-white p-6 rounded-xl shadow-level-1 ghost-border mb-4">
                               <div className="flex justify-between items-start mb-8">
                                  <div>
                                     <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 block">Pedido #{pedido.id.substring(0,6)}</span>
                                     <h4 className="font-headline-md text-lg text-on-surface">{pedido.quantidade}x {pedido.produto.nome}</h4>
                                  </div>
                                  {pedido.status === 'SOLICITADO' && <button onClick={() => cancelarPedido(pedido.id)} className="text-error hover:bg-error-container px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer border border-error/30">Cancelar</button>}
                               </div>

                               <div className="relative flex justify-between items-center max-w-md mx-auto px-4 sm:px-8">
                                  <div className="absolute top-4 left-12 right-12 h-1 bg-surface-container z-0"></div>
                                  <div className="absolute top-4 left-12 h-1 bg-primary z-0 transition-all duration-700" style={{ width: isPronto ? 'calc(100% - 6rem)' : isPreparo ? '50%' : '0%' }}></div>
                                  
                                  <div className="relative z-10 flex flex-col items-center gap-2">
                                     <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm"><Check size={16}/></div>
                                     <span className="text-[11px] font-bold text-on-surface">Recebido</span>
                                  </div>

                                  <div className="relative z-10 flex flex-col items-center gap-2">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 shadow-sm ${isPreparo || isPronto ? 'bg-primary text-white' : 'bg-surface border-2 border-outline-variant text-secondary'}`}><Utensils size={14}/></div>
                                     <span className={`text-[11px] font-bold ${isPreparo || isPronto ? 'text-on-surface' : 'text-secondary'}`}>Em Preparo</span>
                                  </div>

                                  <div className="relative z-10 flex flex-col items-center gap-2">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 shadow-sm ${isPronto ? 'bg-primary text-white' : 'bg-surface border-2 border-outline-variant text-secondary'}`}><Clock size={14}/></div>
                                     <span className={`text-[11px] font-bold ${isPronto ? 'text-on-surface' : 'text-secondary'}`}>A Caminho</span>
                                  </div>
                               </div>
                            </div>
                         )
                      })}
                    </section>
                  )}

                  {/* Cardápio Digital Interativo */}
                  <section id="secao-cardapio" className="mt-4 border-t border-outline-variant/30 pt-8">
                    <h3 className="font-headline-md text-2xl text-on-surface mb-6">Explore nosso Menu</h3>
                    <div className="relative mb-6">
                      <Search size={20} className="absolute top-3.5 left-4 text-secondary" />
                      <input type="text" placeholder="O que deseja pedir hoje?" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-outline-variant bg-surface outline-none focus:border-primary transition-colors font-body-md shadow-sm" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
                      {['TODOS', 'Prato Principal', 'Petiscos', 'Bebidas', 'Sobremesas'].map((cat) => (
                        <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`px-5 py-2 rounded-full font-label-md transition-colors whitespace-nowrap cursor-pointer ${categoriaFiltro === cat ? 'bg-primary-container text-white border-transparent shadow-sm' : 'bg-surface-container-lowest text-secondary border border-outline-variant hover:bg-surface-container'}`}>
                          {cat === 'TODOS' ? '✨ Cardápio Completo' : cat}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {produtos.filter((p: any) => {
                          const norm = (t: string) => t ? t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
                          return norm(p.nome).includes(norm(termoBusca)) && (categoriaFiltro === 'TODOS' || p.categoria === categoriaFiltro);
                        }).map(p => (
                         <div key={p.id} className="bg-surface-container-lowest rounded-xl shadow-level-1 p-5 ghost-border flex flex-col justify-between hover:shadow-level-2 transition-all group">
                          <div className="mb-4">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{p.categoria || 'Geral'}</span>
                              {p.estoque <= 5 && (
                                <span className="bg-error-container text-error text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Estoque Baixo</span>
                              )}
                            </div>
                            <h3 className="font-headline-md text-lg text-on-surface mt-1 mb-2">{p.nome}</h3>
                            <p className="text-xl font-bold text-surface-tint">{formatarMoeda(p.preco)}</p>
                          </div>
                          <button onClick={() => pedirComoHospede(p.id)} className="w-full py-2.5 rounded-lg bg-surface border border-primary text-primary font-label-md flex items-center justify-center gap-2 hover:bg-primary-container hover:text-white transition-colors cursor-pointer">
                            <ShoppingBag size={16} /> Fazer Pedido
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Extrato do Hóspede */}
                  {extratoHospede && extratoHospede.temReserva && (
                    <div id="detalhes-extrato" className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border mt-4">
                      <h3 className="font-headline-md text-xl mb-4 border-b border-outline-variant/20 pb-2">📋 Detalhes da Conta</h3>
                      <div className="flex justify-between mb-2 text-secondary">
                        <span>Diárias ({extratoHospede.qtdDiarias}x)</span> 
                        <span>{formatarMoeda(extratoHospede.totalDiarias)}</span>
                      </div>
                      
                      {extratoHospede.consumos.length > 0 && <div className="mt-4 mb-2 font-bold text-sm text-on-surface">Consumo no Bar/Restaurante:</div>}
                      
                      {extratoHospede.consumos.map((c: any) => (
                        <div key={c.id} className="flex justify-between text-sm text-secondary mb-1 border-b border-surface-container pb-1">
                          <span>{c.quantidade}x {c.nome}</span> 
                          <span>{formatarMoeda(c.subtotal)}</span>
                        </div>
                      ))}
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/30">
                        <strong className="font-headline-md text-lg text-on-surface">Total Acumulado</strong>
                        <strong className="font-headline-md text-xl text-primary">{formatarMoeda(extratoHospede.totalGeral)}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Aba: Guia Local */}
              {abaPortal === 'guia' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <div className="bg-primary-container/10 p-6 rounded-xl border border-primary-container/20">
                    <h2 className="font-headline-lg text-2xl text-on-surface mb-2">Descubra Majorlândia</h2>
                    <p className="text-secondary font-body-md">Bem-vindo ao coração do Ceará. Explore as falésias de areias coloridas e a brisa constante que fazem desta região um verdadeiro refúgio.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden group ghost-border">
                      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800')" }}></div>
                      <div className="p-5">
                        <h3 className="font-headline-md text-lg text-on-surface mb-2">Praia de Majorlândia</h3>
                        <p className="text-sm text-secondary mb-4">Famosa por suas areias coloridas que inspiram o artesanato local. Um mar tranquilo, perfeito para relaxar ao entardecer.</p>
                        <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline cursor-pointer">Ver rota <ChevronRight size={16}/></button>
                      </div>
                    </div>
                    
                    <div className="bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden group ghost-border">
                      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1533561797500-4bad4728594e?q=80&w=800')" }}></div>
                      <div className="p-5">
                        <h3 className="font-headline-md text-lg text-on-surface mb-2">Passeio de Buggy</h3>
                        <p className="text-sm text-secondary mb-4">Aventure-se pelas dunas douradas e descubra lagoas escondidas. Uma experiência com ou sem emoção, você escolhe!</p>
                        <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline cursor-pointer">Agendar passeio <ChevronRight size={16}/></button>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden group ghost-border">
                      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544025162-811114bd4157?q=80&w=800')" }}></div>
                      <div className="p-5">
                        <h3 className="font-headline-md text-lg text-on-surface mb-2">Gastronomia Costeira</h3>
                        <p className="text-sm text-secondary mb-4">Saboreie peixes frescos e mariscos nas tradicionais barracas de praia, acompanhados de uma água de coco bem gelada.</p>
                        <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline cursor-pointer">Ver recomendações <ChevronRight size={16}/></button>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden group ghost-border">
                      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800')" }}></div>
                      <div className="p-5">
                        <h3 className="font-headline-md text-lg text-on-surface mb-2">Centro de Artesanato</h3>
                        <p className="text-sm text-secondary mb-4">Conheça a arte secular das garrafinhas de areia colorida. Uma lembrança inesquecível feita pelas mãos dos moradores.</p>
                        <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline cursor-pointer">Como chegar <ChevronRight size={16}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Aba: Concierge */}
              {abaPortal === 'concierge' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 ghost-border">
                      <h3 className="font-headline-md text-xl mb-6">Solicitações Rápidas</h3>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 border border-outline-variant/50 rounded-lg hover:border-primary/30 transition-colors bg-[#faf9f6]">
                            <div><h4 className="font-bold text-sm text-on-surface">Toalhas Extras</h4><p className="text-xs text-secondary mt-0.5">Jogo de banho completo</p></div>
                            <button onClick={() => alert('Solicitação enviada para a Governança!')} className="px-5 py-2.5 bg-primary-container text-primary-fixed-variant text-xs font-bold rounded-lg hover:brightness-95 cursor-pointer">Solicitar</button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-outline-variant/50 rounded-lg hover:border-primary/30 transition-colors bg-[#faf9f6]">
                            <div><h4 className="font-bold text-sm text-on-surface">Reposição Frigobar</h4><p className="text-xs text-secondary mt-0.5">Água, sucos e snacks</p></div>
                            <button onClick={() => alert('Solicitação enviada para o Restaurante!')} className="px-5 py-2.5 bg-primary-container text-primary-fixed-variant text-xs font-bold rounded-lg hover:brightness-95 cursor-pointer">Solicitar</button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-outline-variant/50 rounded-lg hover:border-primary/30 transition-colors bg-[#faf9f6]">
                            <div><h4 className="font-bold text-sm text-on-surface">Limpeza do Quarto</h4><p className="text-xs text-secondary mt-0.5">Arrumação e higienização</p></div>
                            <button onClick={() => alert('Arrumação agendada com a equipe!')} className="px-5 py-2.5 bg-primary-container text-primary-fixed-variant text-xs font-bold rounded-lg hover:brightness-95 cursor-pointer">Solicitar</button>
                        </div>
                      </div>
                  </div>

                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 ghost-border flex flex-col h-full">
                      <h3 className="font-headline-md text-xl mb-2 flex items-center gap-2"><MessageSquare size={20} className="text-primary"/> Falar com a Recepção</h3>
                      <p className="text-sm text-secondary mb-6">Precisa de algo específico ou tem alguma dúvida? Envie uma mensagem direta para nossa equipe.</p>
                      
                      <div className="flex-1 flex flex-col gap-3">
                        <textarea rows={4} placeholder="Ex: Gostaria de agendar o SPA para amanhã às 14h..." className="w-full p-4 rounded-xl border border-outline-variant bg-[#faf9f6] outline-none focus:border-primary resize-none text-sm text-on-surface font-body-md"></textarea>
                        <button onClick={() => alert('Mensagem enviada com sucesso! A recepção responderá em breve.')} className="w-full py-3.5 bg-primary text-white font-label-md font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:brightness-95 cursor-pointer mt-auto">
                          Enviar Mensagem
                        </button>
                      </div>
                  </div>
                </div>
              )}

              {/* Sub-Aba: Preferências */}
              {abaPortal === 'preferencias' && (
                <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-level-1 ghost-border animate-fade-in max-w-3xl">
                  <h3 className="font-headline-md text-2xl mb-2 text-on-surface">Personalize sua Estadia</h3>
                  <p className="text-secondary font-body-md mb-8">Nós cuidamos dos detalhes para que você se sinta em casa.</p>
                  
                  <div className="mb-8">
                    <label className="font-bold text-sm text-on-surface flex items-center gap-2 mb-4"><Flame size={18} className="text-primary"/> Restrições Alimentares</label>
                    <div className="flex flex-wrap gap-6 mb-4">
                      <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" /> Vegetariano</label>
                      <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" /> Sem Glúten</label>
                      <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" /> Sem Lactose</label>
                      <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" /> Vegano</label>
                    </div>
                    
                    <textarea 
                      placeholder="Outras restrições ou alergias? (Ex: sem pimenta, sem nozes, alergia a camarão...)" 
                      value={outrasRestricoes}
                      onChange={(e) => setOutrasRestricoes(e.target.value)}
                      className="w-full p-3 rounded-lg border border-outline-variant/50 bg-[#faf9f6] outline-none focus:border-primary transition-colors text-sm text-on-surface resize-none"
                      rows={2}
                    ></textarea>
                    <p className="text-[10px] text-secondary mt-1 ml-1">* O que você escrever aqui será enviado como alerta para o Chef na hora do seu pedido.</p>
                  </div>

                  <hr className="border-outline-variant/30 mb-8" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <label className="font-bold text-sm text-on-surface flex items-center gap-2 mb-4"><Thermometer size={18} className="text-primary"/> Temperatura Ideal do Quarto</label>
                        <input type="range" min="16" max="28" value={prefTemp} onChange={e => setPrefTemp(Number(e.target.value))} className="w-full accent-primary cursor-pointer" />
                        <div className="flex justify-between text-xs text-secondary font-bold mt-2">
                          <span>16°C</span> 
                          <span className="text-primary text-lg px-3 py-1 bg-primary-container/20 rounded-md">{prefTemp}°C</span> 
                          <span>28°C</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="font-bold text-sm text-on-surface flex items-center gap-2 mb-4"><Wind size={18} className="text-primary"/> Preferência de Travesseiro</label>
                        <select className="w-full p-3.5 rounded-xl border border-outline-variant bg-[#faf9f6] outline-none focus:border-primary text-sm text-secondary cursor-pointer">
                          <option>Plumas de Ganso (Padrão)</option>
                          <option>Viscoelástico (Nasa)</option>
                          <option>Espuma Firme</option>
                          <option>Hipoalergênico</option>
                        </select>
                      </div>
                  </div>

                  <div className="mt-10 flex justify-end">
                     <button onClick={() => alert('Preferências salvas! Nossa equipe já foi notificada.')} className="px-8 py-3 bg-[#c5a059] text-white font-label-md font-bold rounded-lg hover:brightness-95 transition-all shadow-sm cursor-pointer">
                        Salvar Minhas Preferências
                     </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === MÓDULO: CONFIGURAÇÕES E PERFIL === */}
          {abaAtiva === 'configuracoes' && (
            <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pt-4">
              <h1 className="font-headline-lg text-3xl text-on-surface">Gestão de Perfil</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna da Esquerda: Foto e Info Resumida */}
                <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-8 ghost-border flex flex-col items-center text-center self-start">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-5 border-4 border-surface shadow-sm">
                    <img src={fotoPerfil} alt="Foto de Perfil" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="font-headline-md text-xl text-on-surface font-bold">{usuarioLogado?.nome || 'Administrador'}</h2>
                  <p className="text-secondary font-body-md mb-6">{usuarioLogado?.cargo === 'GERENTE' ? 'Administrador Geral' : usuarioLogado?.cargo || 'Membro da Equipe'}</p>
                  
                  <label className="w-full py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-md font-bold hover:bg-surface-container transition-colors cursor-pointer text-center block">
                    Alterar Foto
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) { setFotoPerfil(URL.createObjectURL(e.target.files[0])); } }} />
                  </label>
                </div>

                {/* Coluna da Direita: Formulários de Configuração */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  
                  <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 lg:p-8 ghost-border">
                    <h3 className="font-headline-md text-xl text-on-surface mb-6 font-bold">Informações Pessoais</h3>
                    <div className="flex flex-col gap-5">
                      <div>
                        <label className="text-xs font-bold text-secondary mb-1 block">Nome Completo</label>
                        <input type="text" value={perfilNome} onChange={e => setPerfilNome(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant/50 bg-[#faf9f6] outline-none focus:border-primary transition-colors text-on-surface" />
                      </div>
                      <div className="flex flex-col md:flex-row gap-5">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-secondary mb-1 block">Email Corporativo</label>
                          <input type="email" value={perfilEmail} onChange={e => setPerfilEmail(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant/50 bg-[#faf9f6] outline-none focus:border-primary transition-colors text-on-surface" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-secondary mb-1 block">Telefone</label>
                          <input type="text" value={perfilTelefone} onChange={e => setPerfilTelefone(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant/50 bg-[#faf9f6] outline-none focus:border-primary transition-colors text-on-surface" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 lg:p-8 ghost-border">
                   <h3 className="font-headline-md text-xl text-on-surface mb-6 font-bold">Segurança</h3>
                    <div className="flex flex-col gap-5">
                     <div>
                      <label className="text-xs font-bold text-secondary mb-1 block">Senha Atual</label>
                       <input type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} placeholder="••••••••" className="w-full p-3 rounded-lg border border-outline-variant/50 bg-[#faf9f6] outline-none focus:border-primary transition-colors text-on-surface" />
                        </div>
                         <div className="flex flex-col md:flex-row gap-5">
                          <div className="flex-1">
                           <label className="text-xs font-bold text-secondary mb-1 block">Nova Senha</label>
                            <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="Sua nova senha" className="w-full p-3 rounded-lg border border-outline-variant/50 bg-[#faf9f6] outline-none focus:border-primary transition-colors text-on-surface" />
                           </div>
                          <div className="flex-1">
                         <label className="text-xs font-bold text-secondary mb-1 block">Confirmar Nova Senha</label>
                        <input type="password" value={confirmarNovaSenha} onChange={e => setConfirmarNovaSenha(e.target.value)} placeholder="Confirme a nova senha" className="w-full p-3 rounded-lg border border-outline-variant/50 bg-[#faf9f6] outline-none focus:border-primary transition-colors text-on-surface" />
                       </div>
                      </div>
                     <div className="flex justify-end mt-2">
                    <button onClick={alterarSenha} className="px-6 py-2.5 bg-primary-container text-primary-fixed-variant font-bold rounded-lg hover:brightness-95 transition-colors cursor-pointer shadow-sm">
                    Atualizar Senha
                   </button>
                  </div>
                  </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 lg:p-8 ghost-border">
                    <h3 className="font-headline-md text-xl text-on-surface mb-6 font-bold">Preferências de Notificação</h3>
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <h4 className="font-label-md text-on-surface text-base">Notificações por Email</h4>
                          <p className="font-body-sm text-secondary text-sm mt-0.5">Receber atualizações gerais e comunicados.</p>
                        </div>
                        <button onClick={() => setNotificacoesEmail(!notificacoesEmail)} className={`w-12 h-6 flex-shrink-0 rounded-full flex items-center p-1 transition-colors cursor-pointer ${notificacoesEmail ? 'bg-[#c5a059]' : 'bg-outline-variant/50'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${notificacoesEmail ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <h4 className="font-label-md text-on-surface text-base">Alertas de Reserva</h4>
                          <p className="font-body-sm text-secondary text-sm mt-0.5">Notificação sobre novas reservas ou cancelamentos.</p>
                        </div>
                        <button onClick={() => setAlertasReserva(!alertasReserva)} className={`w-12 h-6 flex-shrink-0 rounded-full flex items-center p-1 transition-colors cursor-pointer ${alertasReserva ? 'bg-[#c5a059]' : 'bg-outline-variant/50'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${alertasReserva ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-2 mb-8">
                    <button onClick={() => alert('Configurações salvas!')} className="px-8 py-3 bg-[#c5a059] text-white font-label-md font-bold rounded-lg hover:brightness-95 transition-all shadow-sm cursor-pointer">
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}