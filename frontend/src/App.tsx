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
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Hospedes from './pages/Hospedes';
import Quartos from './pages/Quartos';
import Reservas from './pages/Reservas';
import Financeiro from './pages/Financeiro';
import Operacoes from './pages/Operacoes';
import Restaurante from './pages/Restaurante';
import PortalHospede from './pages/PortalHospede';
import Mensagens from './pages/Mensagens';
import RH from './pages/RH';

interface Hospede { id: string; nome: string; cpf: string; email: string; telefone: string; }
interface Quarto { id: string; numero: string; capacidade: number; valorDiaria: number; status: string; categoria: string; descricao?: string; itensInclusos?: string; }
interface Reserva { id: string; dataCheckIn: string; dataCheckOut: string; status: string; origem: string; hospede: Hospede; quarto: Quarto; consumos?: any[]; }
interface Produto { id: string; nome: string; preco: number; estoque: number; categoria?: string; }
interface Transacao { id: string; tipo: string; valor: number; metodoPagamento: string; descricao: string; criadoEm: string; }
interface ChamadoManutencao { id: string; local: string; descricao: string; prioridade: 'Alta' | 'Média' | 'Baixa'; tempoEspera: string; status: 'Pendente' | 'Em Andamento' | 'Concluído'; hospedeEnvolvido?: string; }
interface TarefaGovernanca { id: string; quarto: string; tipo: string; observacao: string; status: 'Sujo' | 'Em Limpeza' | 'Limpo' | 'Bloqueado'; urgente?: boolean; responsavel?: string; }

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'hospedes' | 'quartos' | 'reservas' | 'operacoes' | 'restaurante' | 'caixa' | 'portal-hospede' | 'mapa' | 'configuracoes' | 'rh' | 'mensagens'>('dashboard');
  const [menuMobileAberto, setMenuMobileAberto] = useState(false); 
  
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pedidosCozinha, setPedidosCozinha] = useState<any[]>([]);
  const [reservasMesas, setReservasMesas] = useState<any[]>([]);
  const [eventosAgenda, setEventosAgenda] = useState<any[]>([]);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [extratoHospede, setExtratoHospede] = useState<any>(null);
  
  const [chamados, setChamados] = useState<ChamadoManutencao[]>([]);
  const [tarefasLimpeza, setTarefasLimpeza] = useState<TarefaGovernanca[]>([]);

  const buscarPedidosCozinha = async () => { 
    try { 
      const res = await axios.get('http://localhost:3333/api/consumos/ativos', { timeout: 3000 }); 
      setPedidosCozinha(Array.isArray(res.data) ? res.data : []); 
    } catch (err) { setPedidosCozinha([]); } 
  };

  const atualizarStatusPedido = async (id: string, novoStatus: string) => { 
    try { 
      await axios.put(`http://localhost:3333/api/consumos/${id}/status`, { status: novoStatus }); 
      buscarPedidosCozinha(); 
    } catch (err) { alert('Erro ao atualizar status.'); } 
  };

  const buscarReservasMesas = async () => {
    try { const res = await axios.get('http://localhost:3333/api/restaurante/reservas'); setReservasMesas(Array.isArray(res.data) ? res.data : []); } catch (err) {}
  };

  const buscarEventosAgenda = async () => {
    try { const res = await axios.get('http://localhost:3333/api/restaurante/eventos'); setEventosAgenda(Array.isArray(res.data) ? res.data : []); } catch (err) {}
  };

  const buscarExtratoHospede = async (email: string) => { 
    try { 
      const res = await axios.get(`http://localhost:3333/api/hospede/extrato/${email}`); 
      setExtratoHospede(res.data); 
      if (res.data.temReserva && res.data.reservaId) { 
        setUsuarioLogado((prev: any) => ({ ...prev, reservaId: res.data.reservaId })); 
      } 
    } catch (err) {} 
  };

  const buscarHospedes = () => axios.get('http://localhost:3333/api/hospedes').then(res => setHospedes(res.data));
  const buscarQuartos = () => axios.get('http://localhost:3333/api/quartos').then(res => setQuartos(res.data));
  const buscarReservas = () => axios.get('http://localhost:3333/api/reservas').then(res => setReservas(res.data));
  const buscarProdutos = () => axios.get('http://localhost:3333/api/produtos').then(res => setProdutos(res.data));
  const buscarTransacoes = () => axios.get('http://localhost:3333/api/transacoes').then(res => setTransacoes(res.data));

  const buscarOperacoes = async () => {
    try {
      const resLimpeza = await axios.get('http://localhost:3333/api/operacoes/limpeza'); setTarefasLimpeza(resLimpeza.data);
      const resReparos = await axios.get('http://localhost:3333/api/operacoes/reparos'); setChamados(resReparos.data);
    } catch (error) {}
  };

  const buscarMensagens = async () => {
    try { const res = await axios.get('http://localhost:3333/api/mensagens'); setMensagens(res.data); } catch (err) {}
  };

  const marcarMensagemLida = async (id: string, resposta: string) => {
    try {
      await axios.put(`http://localhost:3333/api/mensagens/${id}/ler`, { resposta });
      buscarMensagens();
    } catch (error) { alert('Erro ao atualizar mensagem.'); }
  };

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
      if (abaAtiva === 'mensagens') buscarMensagens();
    }
  }, [abaAtiva, autenticado]);

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval>;
    if (autenticado && (abaAtiva === 'restaurante' || abaAtiva === 'portal-hospede' || abaAtiva === 'mensagens')) {
      intervalo = setInterval(() => { 
        if (abaAtiva === 'restaurante' || abaAtiva === 'portal-hospede') buscarPedidosCozinha(); 
        if (abaAtiva === 'mensagens') buscarMensagens();
        if (abaAtiva === 'portal-hospede' && usuarioLogado?.email) buscarExtratoHospede(usuarioLogado.email);
      }, 10000);
    }
    return () => { if (intervalo) clearInterval(intervalo); };
  }, [abaAtiva, autenticado]);

  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const pedirComoHospede = async (produtoId: string, observacoes: string) => { 
    if (!extratoHospede || !extratoHospede.temReserva) { alert('Sua conta não está vinculada a nenhuma reserva ativa.'); return; } 
    try { 
      await axios.post('http://localhost:3333/api/consumos', { reservaId: extratoHospede.reservaId, produtoId, quantidade: 1, observacoes }); 
      alert('Pedido realizado!'); buscarPedidosCozinha(); buscarExtratoHospede(usuarioLogado.email); 
    } catch (error) { alert('Erro ao registrar pedido.'); } 
  };
  
  const cancelarPedido = async (id: string) => { if (!window.confirm('Cancelar este pedido?')) return; try { await axios.put(`http://localhost:3333/api/consumos/${id}/cancelar`); alert('Cancelado.'); buscarPedidosCozinha(); buscarExtratoHospede(usuarioLogado.email); } catch (error: any) { alert('Erro.'); } };
  
  const fazerCheckout = async (reservaId: string) => { if (!window.confirm('Deseja finalizar esta reserva?')) return; try { await axios.put(`http://localhost:3333/api/reservas/${reservaId}/checkout`); alert('Check-out realizado!'); buscarReservas(); buscarQuartos(); } catch (error) {} };

  const emitirRecibo = (reserva: any) => {
    const dataIn = new Date(reserva.dataCheckIn); const dataOut = new Date(reserva.dataCheckOut); const diffTempo = Math.abs(dataOut.getTime() - dataIn.getTime()); const qtdDiarias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24)) || 1; const totalDiarias = qtdDiarias * reserva.quarto.valorDiaria;
    const listaConsumos: MockConsumo[] = (reserva.consumos || []).map((c: any) => ({ descricao: c.produto.nome, quantidade: c.quantidade, subtotal: c.subtotal })); const totalConsumos = listaConsumos.reduce((acc, c) => acc + c.subtotal, 0);
    gerarReciboPdf({ id: reserva.id, cliente: reserva.hospede.nome, dataCheckIn: dataIn.toLocaleDateString('pt-BR'), dataCheckOut: dataOut.toLocaleDateString('pt-BR'), quarto: `${reserva.quarto.categoria} (Nº ${reserva.quarto.numero})`, diarias: { quantidade: qtdDiarias, valor: reserva.quarto.valorDiaria, total: totalDiarias }, consumos: listaConsumos, totalGeral: totalDiarias + totalConsumos });
  };

  const enviarWhatsApp = (reserva: Reserva) => { window.open(`https://wa.me/55${reserva.hospede.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${reserva.hospede.nome}! Agradecemos por escolher a Pousada Refúgio Dourado.`)}`, '_blank'); };
  
  const atualizarStatusLimpeza = async (id: string, novoStatus: string) => {
    try { await axios.put(`http://localhost:3333/api/operacoes/limpeza/${id}/status`, { status: novoStatus, responsavel: novoStatus === 'Em Limpeza' ? usuarioLogado?.nome : null }); buscarOperacoes(); } catch (error) {}
  };

  const atualizarStatusReparo = async (id: string, novoStatus: string) => {
    try { await axios.put(`http://localhost:3333/api/operacoes/reparos/${id}/status`, { status: novoStatus }); buscarOperacoes(); } catch (error) {}
  };

  const solicitarAtendimentoHospede = async (tipo: 'limpeza' | 'reparos', titulo: string, observacao: string) => {
    try {
      if (tipo === 'limpeza') { await axios.post('http://localhost:3333/api/operacoes/limpeza', { quarto: `Hóspede: ${usuarioLogado?.nome}`, tipo: titulo, observacao, status: 'Sujo', urgente: false }); } 
      else { await axios.post('http://localhost:3333/api/operacoes/reparos', { local: `Hóspede: ${usuarioLogado?.nome}`, descricao: `${titulo} - ${observacao}`, prioridade: 'Média', status: 'Pendente', hospedeEnvolvido: usuarioLogado?.nome }); }
      alert(`Solicitação para "${titulo}" enviada!`); buscarOperacoes();
    } catch (error) { alert('Erro ao enviar.'); }
  };

  const totalQuartos = quartos.length;
  const quartosOcupados = quartos.filter(q => q.status !== 'LIVRE').length;
  const taxaOcupacao = totalQuartos === 0 ? 0 : Math.round((quartosOcupados / totalQuartos) * 100);
  const reservasAtivas = reservas.filter(r => r.status !== 'CONCLUÍDA').length;
  const totalEntradas = transacoes.filter(t => t.tipo === 'ENTRADA').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'SAIDA').reduce((acc, t) => acc + t.valor, 0);
  const saldoReal = totalEntradas - totalSaidas;

  if (!autenticado) {
    return (
      <Login onLoginSucesso={(user) => {
        setUsuarioLogado(user); setAutenticado(true);
        if (user.cargo === 'GERENTE') setAbaAtiva('dashboard');
        else if (user.cargo === 'RECEPCAO') setAbaAtiva('reservas');
        else if (user.cargo === 'COZINHA') setAbaAtiva('restaurante');
        else if (user.cargo === 'HOSPEDE') { setAbaAtiva('portal-hospede'); buscarExtratoHospede(user.email); }
      }} />
    );
  }

  const SidebarItem = ({ id, label, icon: Icon }: { id: typeof abaAtiva, label: string, icon: any }) => {
    const isActive = abaAtiva === id;
    return (
      <button onClick={() => { setAbaAtiva(id); setMenuMobileAberto(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all duration-200 text-left cursor-pointer select-none ${isActive ? "bg-primary-container/20 text-on-surface font-bold border border-primary-container/30 shadow-sm" : "text-secondary hover:bg-surface-container hover:text-on-surface"}`}>
        <Icon size={20} className={isActive ? "text-primary" : "text-secondary"} /> {label}
      </button>
    );
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex antialiased w-full relative">
      {menuMobileAberto && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMenuMobileAberto(false)}></div>}

      <aside className={`w-[280px] bg-surface-container-low border-r border-outline-variant/30 flex flex-col h-screen fixed left-0 top-0 z-40 select-none transition-transform duration-300 ${menuMobileAberto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex flex-col items-center border-b border-outline-variant/20 flex-shrink-0 relative">
          <button onClick={() => setMenuMobileAberto(false)} className="md:hidden absolute top-4 right-4 text-secondary p-1"><X size={24} /></button>
          <h1 className="font-display-lg text-primary text-xl text-center leading-tight font-bold mt-2 md:mt-0">Refúgio Dourado</h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">Painel Administrativo</p>
        </div>

        {(usuarioLogado?.cargo === 'GERENTE' || usuarioLogado?.cargo === 'RECEPCAO') && (
          <div className="px-6 pt-5 pb-2 flex-shrink-0">
            <button onClick={() => { setAbaAtiva('reservas'); setMenuMobileAberto(false); }} className="w-full py-3 px-4 rounded-lg bg-primary text-white font-label-md font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-sm cursor-pointer">
              <Plus size={18} /> Novo Check-in
            </button>
          </div>
        )}

        <nav className="flex-1 px-4 py-3 flex flex-col gap-1 overflow-y-auto pr-3">
          {(usuarioLogado?.cargo === 'GERENTE' || usuarioLogado?.cargo === 'RECEPCAO') && (
            <>
              <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
              <SidebarItem id="hospedes" label="Hóspedes" icon={Users} />
              <SidebarItem id="quartos" label="Quartos" icon={BedDouble} />
              <SidebarItem id="reservas" label="Reservas" icon={CalendarCheck} />
              <SidebarItem id="operacoes" label="Limpeza & Manutenção" icon={Brush} />
              <SidebarItem id="mensagens" label="Mensagens" icon={MessageSquare} />
              <SidebarItem id="mapa" label="Mapa" icon={Map} />
            </>
          )}
          {(usuarioLogado?.cargo === 'GERENTE' || usuarioLogado?.cargo === 'RECEPCAO' || usuarioLogado?.cargo === 'COZINHA') && (
            <SidebarItem id="restaurante" label="Restaurante & Eventos" icon={Utensils} />
          )}
          {usuarioLogado?.cargo === 'GERENTE' && (
            <>
              <SidebarItem id="caixa" label="Financeiro" icon={Wallet} />
              <SidebarItem id="rh" label="Gestão de Equipe (RH)" icon={Users} />
            </>
          )}
          {usuarioLogado?.cargo === 'HOSPEDE' && (
            <SidebarItem id="portal-hospede" label="Meu Chalé" icon={Utensils} />
          )}
        </nav>

        <div className="p-4 border-t border-outline-variant/20 flex flex-col gap-1 flex-shrink-0">
           <button onClick={() => { setAutenticado(false); setUsuarioLogado(null); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-secondary hover:bg-error-container hover:text-on-error-container transition-colors text-left cursor-pointer">
             <LogOut size={20} /> Sair
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen bg-background md:ml-[280px]">
        <header className="md:hidden h-16 bg-surface border-b border-outline-variant/20 flex items-center justify-between px-4 flex-shrink-0 z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuMobileAberto(true)} className="text-secondary p-2 -ml-2 rounded-full cursor-pointer"><Menu size={24} /></button>
            <h1 className="font-display-lg text-primary text-xl font-bold">Refúgio Dourado</h1>
          </div>
          <button onClick={() => { setAutenticado(false); setUsuarioLogado(null); }} className="text-secondary p-2 -mr-2 cursor-pointer"><LogOut size={20} /></button>
        </header>

        <main className="flex-1 p-4 md:p-10 w-full max-w-[1200px] mx-auto">
          {abaAtiva === 'mapa' && <MapaInterativo quartos={quartos} onSelecionarQuarto={(q) => alert(`Chalé: ${q.categoria} (Nº ${q.numero})`)} />}
          {abaAtiva === 'dashboard' && <Dashboard taxaOcupacao={taxaOcupacao} quartosOcupados={quartosOcupados} totalQuartos={totalQuartos} reservasAtivas={reservasAtivas} hospedes={hospedes} reservas={reservas} setAbaAtiva={setAbaAtiva} fazerCheckout={fazerCheckout} />}
          {abaAtiva === 'hospedes' && <Hospedes hospedes={hospedes} buscarHospedes={buscarHospedes} />}
          {abaAtiva === 'quartos' && <Quartos quartos={quartos} buscarQuartos={buscarQuartos} formatarMoeda={formatarMoeda} />}
          {abaAtiva === 'reservas' && <Reservas reservas={reservas} hospedes={hospedes} quartos={quartos} buscarReservas={buscarReservas} buscarQuartos={buscarQuartos} fazerCheckout={fazerCheckout} emitirRecibo={emitirRecibo} enviarWhatsApp={enviarWhatsApp} />}
          {abaAtiva === 'operacoes' && <Operacoes tarefasLimpeza={tarefasLimpeza} chamados={chamados} atualizarStatusLimpeza={atualizarStatusLimpeza} atualizarStatusReparo={atualizarStatusReparo} />}
          {abaAtiva === 'restaurante' && <Restaurante produtos={produtos} pedidosCozinha={pedidosCozinha} reservasMesas={reservasMesas} eventosAgenda={eventosAgenda} buscarProdutos={buscarProdutos} buscarPedidosCozinha={buscarPedidosCozinha} buscarReservasMesas={buscarReservasMesas} atualizarStatusPedido={atualizarStatusPedido} />}
          {abaAtiva === 'caixa' && <Financeiro transacoes={transacoes} buscarTransacoes={buscarTransacoes} totalEntradas={totalEntradas} totalSaidas={totalSaidas} saldoReal={saldoReal} formatarMoeda={formatarMoeda} />}
          {abaAtiva === 'rh' && <RH />}
          {abaAtiva === 'portal-hospede' && <PortalHospede usuarioLogado={usuarioLogado} extratoHospede={extratoHospede} pedidosCozinha={pedidosCozinha} produtos={produtos} formatarMoeda={formatarMoeda} pedirComoHospede={pedirComoHospede} cancelarPedido={cancelarPedido} solicitarAtendimentoHospede={solicitarAtendimentoHospede} />}
          {abaAtiva === 'mensagens' && <Mensagens mensagens={mensagens} buscarMensagens={buscarMensagens} marcarMensagemLida={marcarMensagemLida} />}
        </main>
      </div>
    </div>
  );
}