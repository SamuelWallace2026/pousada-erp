import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, BedDouble, CalendarCheck, Activity, Key, Lock, 
  Utensils, ShoppingBag, Search, LogOut, LayoutDashboard, 
  Wallet, Map, Plus, Settings, RefreshCw, QrCode
} from 'lucide-react';
import { gerarReciboPdf, type MockReserva, type MockConsumo } from './utils/gerarReciboPdf'; 
import MapaInterativo from './components/MapaInterativo';

interface Hospede { id: string; nome: string; cpf: string; email: string; telefone: string; }
interface Quarto { id: string; numero: string; capacidade: number; valorDiaria: number; status: string; categoria: string; descricao?: string; itensInclusos?: string; }
interface Reserva { id: string; dataCheckIn: string; dataCheckOut: string; status: string; origem: string; hospede: Hospede; quarto: Quarto; consumos?: any[]; }
interface Produto { id: string; nome: string; preco: number; estoque: number; categoria?: string; }
interface Transacao { id: string; tipo: string; valor: number; metodoPagamento: string; descricao: string; criadoEm: string; }

export default function App() {
  const [extratoHospede, setExtratoHospede] = useState<any>(null);
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  
  const [emailInput, setEmailInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');

  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'hospedes' | 'quartos' | 'reservas' | 'restaurante' | 'caixa' | 'portal-hospede' | 'mapa'>('dashboard');
  
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pedidosCozinha, setPedidosCozinha] = useState<any[]>([]);

  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS');

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

  const buscarHospedes = () => axios.get('http://localhost:3333/api/hospedes').then(res => setHospedes(res.data));
  const buscarQuartos = () => axios.get('http://localhost:3333/api/quartos').then(res => setQuartos(res.data));
  const buscarReservas = () => axios.get('http://localhost:3333/api/reservas').then(res => setReservas(res.data));
  const buscarProdutos = () => axios.get('http://localhost:3333/api/produtos').then(res => setProdutos(res.data));
  const buscarTransacoes = () => axios.get('http://localhost:3333/api/transacoes').then(res => setTransacoes(res.data));

  useEffect(() => {
    if (autenticado) {
      if (abaAtiva === 'hospedes') buscarHospedes();
      if (abaAtiva === 'quartos') buscarQuartos();
      if (abaAtiva === 'reservas') { buscarHospedes(); buscarQuartos(); buscarReservas(); }
      if (abaAtiva === 'restaurante') { buscarProdutos(); buscarPedidosCozinha(); }
      if (abaAtiva === 'portal-hospede') { buscarProdutos(); buscarPedidosCozinha(); if (usuarioLogado?.email) buscarExtratoHospede(usuarioLogado.email); }
      if (abaAtiva === 'caixa') buscarTransacoes();
      if (abaAtiva === 'dashboard') { buscarHospedes(); buscarQuartos(); buscarReservas(); }
    }
  }, [abaAtiva, autenticado]);

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

  const cadastrarHospede = async (e: React.FormEvent) => { e.preventDefault(); await axios.post('http://localhost:3333/api/hospedes', { nome, cpf, email, telefone }); alert('Hóspede salvo!'); setNome(''); setCpf(''); setEmail(''); setTelefone(''); buscarHospedes(); };
  const cadastrarQuarto = async (e: React.FormEvent) => { e.preventDefault(); await axios.post('http://localhost:3333/api/quartos', { numero, capacidade: Number(capacidade), valorDiaria: Number(valorDiaria), categoria }); alert('Quarto salvo!'); setNumero(''); setCapacidade(''); setValorDiaria(''); setCategoria('Chalé Luxo Casal'); buscarQuartos(); };
  const cadastrarReserva = async (e: React.FormEvent) => { e.preventDefault(); try { await axios.post('http://localhost:3333/api/reservas', { hospedeId, quartoId, dataCheckIn, dataCheckOut, origem }); alert('Reserva confirmada!'); setHospedeId(''); setQuartoId(''); setDataCheckIn(''); setDataCheckOut(''); setOrigem('WhatsApp'); buscarReservas(); buscarQuartos(); } catch (error) { alert('Erro ao criar reserva.'); } };
  const cadastrarProduto = async (e: React.FormEvent) => { e.preventDefault(); try { await axios.post('http://localhost:3333/api/produtos', { nome: prodNome, preco: Number(prodPreco), estoque: Number(prodEstoque), categoria: prodCategoria }); alert('Item salvo!'); setProdNome(''); setProdPreco(''); setProdEstoque(''); setProdCategoria('Prato Principal'); buscarProdutos(); } catch (error) { alert('Erro ao cadastrar produto.'); } };
  const pedirComoHospede = async (produtoId: string) => { if (!extratoHospede || !extratoHospede.temReserva) { alert('Sua conta não está vinculada a nenhuma reserva ativa.'); return; } try { await axios.post('http://localhost:3333/api/consumos', { reservaId: extratoHospede.reservaId, produtoId, quantidade: 1 }); alert('Pedido realizado!'); buscarPedidosCozinha(); buscarExtratoHospede(usuarioLogado.email); } catch (error) { alert('Erro ao registrar pedido.'); } };
  const cancelarPedido = async (id: string) => { if (!window.confirm('Cancelar este pedido?')) return; try { await axios.put(`http://localhost:3333/api/consumos/${id}/cancelar`); alert('Cancelado.'); buscarPedidosCozinha(); buscarExtratoHospede(usuarioLogado.email); } catch (error: any) { alert(error.response?.data?.error || 'Erro.'); } };
  const fazerCheckout = async (reservaId: string) => { if (!window.confirm('Deseja finalizar esta reserva?')) return; try { await axios.put(`http://localhost:3333/api/reservas/${reservaId}/checkout`); alert('Check-out realizado!'); buscarReservas(); buscarQuartos(); } catch (error) { alert('Erro no check-out.'); } };

  const emitirRecibo = (reserva: any) => {
    const dataIn = new Date(reserva.dataCheckIn); const dataOut = new Date(reserva.dataCheckOut); const diffTempo = Math.abs(dataOut.getTime() - dataIn.getTime()); const qtdDiarias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24)) || 1; const totalDiarias = qtdDiarias * reserva.quarto.valorDiaria;
    const listaConsumos: MockConsumo[] = (reserva.consumos || []).map((c: any) => ({ descricao: c.produto.nome, quantidade: c.quantidade, subtotal: c.subtotal })); const totalConsumos = listaConsumos.reduce((acc, c) => acc + c.subtotal, 0);
    gerarReciboPdf({ id: reserva.id, cliente: reserva.hospede.nome, dataCheckIn: dataIn.toLocaleDateString('pt-BR'), dataCheckOut: dataOut.toLocaleDateString('pt-BR'), quarto: `${reserva.quarto.categoria} (Nº ${reserva.quarto.numero})`, diarias: { quantidade: qtdDiarias, valor: reserva.quarto.valorDiaria, total: totalDiarias }, consumos: listaConsumos, totalGeral: totalDiarias + totalConsumos });
  };
  const enviarWhatsApp = (reserva: Reserva) => { const numeroLimpo = reserva.hospede.telefone.replace(/\D/g, ''); const msg = `Olá ${reserva.hospede.nome}! Agradecemos por escolher a Pousada Refúgio Dourado. Até a próxima!`; window.open(`https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(msg)}`, '_blank'); };
  const registrarTransacao = async (e: React.FormEvent) => { e.preventDefault(); try { await axios.post('http://localhost:3333/api/transacoes', { tipo: tipoTransacao, valor: valorTransacao, metodoPagamento, descricao: descricaoTransacao }); alert('Registrado!'); setDescricaoTransacao(''); setValorTransacao(''); buscarTransacoes(); } catch (error) { alert('Erro ao registrar.'); } };

  const totalQuartos = quartos.length;
  const quartosOcupados = quartos.filter(q => q.status !== 'LIVRE').length;
  const taxaOcupacao = totalQuartos === 0 ? 0 : Math.round((quartosOcupados / totalQuartos) * 100);
  const reservasAtivas = reservas.filter(r => r.status !== 'CONCLUÍDA').length;
  const totalEntradas = transacoes.filter(t => t.tipo === 'ENTRADA').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'SAIDA').reduce((acc, t) => acc + t.valor, 0);
  const saldoReal = totalEntradas - totalSaidas;

  if (!autenticado) {
    return (
      <div 
        className="min-h-screen flex items-center justify-end px-12 md:px-24 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(26, 28, 27, 0.3), rgba(26, 28, 27, 0.6)), url('/fundo-login.jpeg')` }}
      >
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

  const SidebarItem = ({ id, label, icon: Icon }: { id: typeof abaAtiva, label: string, icon: any }) => {
    const isActive = abaAtiva === id;
    return (
      <button 
        onClick={() => {
          setAbaAtiva(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all duration-200 text-left cursor-pointer select-none
          ${isActive ? "bg-primary-container/20 text-on-surface font-bold border border-primary-container/30 shadow-sm" : "text-secondary hover:bg-surface-container hover:text-on-surface"}
        `}
      >
        <Icon size={20} className={isActive ? "text-primary" : "text-secondary"} />
        {label}
      </button>
    );
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex antialiased w-full">
      
      {/* SIDEBAR FIXA ESTÁTICA COM NOME AJUSTADO */}
      <aside className="w-[280px] bg-surface-container-low border-r border-outline-variant/30 hidden md:flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
        
        <div className="p-6 flex flex-col items-center border-b border-outline-variant/20 flex-shrink-0">
          <h1 className="font-display-lg text-primary text-xl text-center leading-tight font-bold">Refúgio Dourado</h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">Painel Administrativo</p>
        </div>

        {(usuarioLogado?.cargo === 'GERENTE' || usuarioLogado?.cargo === 'RECEPCAO') && (
          <div className="px-6 pt-5 pb-2 flex-shrink-0">
            <button onClick={() => setAbaAtiva('reservas')} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all shadow-sm cursor-pointer">
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
              <SidebarItem id="mapa" label="Mapa" icon={Map} />
            </>
          )}
          {(usuarioLogado?.cargo === 'GERENTE' || usuarioLogado?.cargo === 'RECEPCAO' || usuarioLogado?.cargo === 'COZINHA') && (
            <SidebarItem id="restaurante" label="Restaurante" icon={Utensils} />
          )}
          {usuarioLogado?.cargo === 'GERENTE' && (
            <SidebarItem id="caixa" label="Financeiro" icon={Wallet} />
          )}
          {usuarioLogado?.cargo === 'HOSPEDE' && (
            <SidebarItem id="portal-hospede" label="Meu Chalé" icon={Utensils} />
          )}
        </nav>

        <div className="p-4 border-t border-outline-variant/20 flex flex-col gap-1 flex-shrink-0">
           <div className="px-4 py-3 text-sm text-secondary font-body-md flex items-center gap-3">
              <Settings size={20} /> Configurações
           </div>
           <button onClick={() => { setAutenticado(false); setUsuarioLogado(null); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-secondary hover:bg-error-container hover:text-on-error-container transition-colors text-left cursor-pointer">
              <LogOut size={20} /> Sair
           </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-h-screen bg-background md:ml-[280px]">
        
        <header className="md:hidden h-16 bg-surface border-b border-outline-variant/20 flex items-center justify-between px-4 flex-shrink-0">
          <h1 className="font-display-lg text-primary text-xl font-bold">Refúgio Dourado</h1>
          <button onClick={() => { setAutenticado(false); setUsuarioLogado(null); }} className="text-secondary p-2"><LogOut size={20} /></button>
        </header>

        <main className="flex-1 p-4 md:p-10 w-full max-w-[1200px] mx-auto">
          
          {abaAtiva === 'mapa' && (
            <MapaInterativo quartos={quartos} onSelecionarQuarto={(q) => alert(`Chalé: ${q.categoria} (Nº ${q.numero})\nStatus: ${q.status}`)} />
          )}

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
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-[12px] font-bold text-secondary uppercase tracking-widest">Taxa de<br/>Ocupação</h2>
                    <div className="p-2 bg-primary-container/20 rounded-lg text-primary"><Activity size={20} /></div>
                  </div>
                  <p className="font-display-lg text-5xl text-on-surface mb-2">{taxaOcupacao}%</p>
                  <p className="text-xs font-bold text-primary flex items-center gap-1">↗ +5% vs última semana</p>
                </div>
                
                <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-[12px] font-bold text-secondary uppercase tracking-widest">Chalés<br/>Ocupados</h2>
                    <div className="p-2 bg-primary-container/20 rounded-lg text-primary"><BedDouble size={20} /></div>
                  </div>
                  <p className="font-display-lg text-5xl text-on-surface mb-2">{quartosOcupados}<span className="text-2xl text-outline">/{totalQuartos}</span></p>
                  <p className="text-xs text-secondary">{totalQuartos - quartosOcupados} chalé(s) disponível(is)</p>
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-[12px] font-bold text-secondary uppercase tracking-widest">Reservas<br/>Ativas</h2>
                    <div className="p-2 bg-primary-container/20 rounded-lg text-primary"><CalendarCheck size={20} /></div>
                  </div>
                  <p className="font-display-lg text-5xl text-on-surface mb-2">{reservasAtivas}</p>
                  <p className="text-xs text-secondary">Para os próximos dias</p>
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-[12px] font-bold text-secondary uppercase tracking-widest">Hóspedes<br/>Hoje</h2>
                    <div className="p-2 bg-primary-container/20 rounded-lg text-primary"><Users size={20} /></div>
                  </div>
                  <p className="font-display-lg text-5xl text-on-surface mb-2">{hospedes.length}</p>
                  <p className="text-xs text-secondary">Cadastrados na base</p>
                </div>
              </section>

              <section className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-xl text-on-surface">Últimas Atividades (Check-ins)</h3>
                  <button onClick={() => setAbaAtiva('reservas')} className="text-primary text-sm font-bold hover:underline cursor-pointer">Ver todos →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-body-md">
                    <thead>
                      <tr className="text-secondary border-b border-outline-variant/30 text-[11px] uppercase tracking-wider">
                        <th className="pb-3 font-medium">Hóspede</th>
                        <th className="pb-3 font-medium">Chalé</th>
                        <th className="pb-3 font-medium">Data/Hora</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservas.slice(0, 4).map(r => (
                        <tr key={r.id} className="border-b border-surface-container last:border-0 hover:bg-surface/50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-container/30 text-primary flex items-center justify-center font-bold text-xs">{r.hospede.nome.substring(0,2).toUpperCase()}</div>
                              <div>
                                <p className="font-bold text-on-surface">{r.hospede.nome}</p>
                                <p className="text-[11px] text-secondary">Origem: {r.origem}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-on-surface">{r.quarto.categoria} ({r.quarto.numero})</td>
                          <td className="py-4 text-secondary">{new Date(r.dataCheckIn).toLocaleDateString('pt-BR')}</td>
                          <td className="py-4">
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${r.status === 'CONCLUÍDA' ? 'bg-secondary' : 'bg-green-500'}`}></span>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                             {r.status !== 'CONCLUÍDA' && (
                                <button onClick={() => fazerCheckout(r.id)} className="px-3 py-1.5 border border-primary text-primary rounded text-xs font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer">Checkout</button>
                             )}
                          </td>
                        </tr>
                      ))}
                      {reservas.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-secondary">Nenhuma reserva recente.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

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
                      <div className="flex-1"><label className="text-xs font-bold text-secondary uppercase tracking-wide block mb-1">Check-in</label><input required type="date" value={dataCheckIn} onChange={e => setDataCheckIn(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" /></div>
                      <div className="flex-1"><label className="text-xs font-bold text-secondary uppercase tracking-wide block mb-1">Check-out</label><input required type="date" value={dataCheckOut} onChange={e => setDataCheckOut(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" /></div>
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

          {abaAtiva === 'restaurante' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h1 className="font-headline-lg text-3xl text-on-surface">Gestão do Restaurante</h1>
                <button 
                  type="button"
                  onClick={() => buscarPedidosCozinha()} 
                  className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg text-primary font-bold text-sm hover:bg-surface-container-high transition-colors cursor-pointer shadow-sm"
                >
                  <RefreshCw size={16} /> Atualizar Pedidos
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border self-start">
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

                <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                  <h2 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2 flex items-center gap-2">
                    <Activity size={20} className="text-primary"/> Fila de Pedidos
                  </h2>
                  <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                    {Array.isArray(pedidosCozinha) && pedidosCozinha.map((pedido: any) => (
                      <div key={pedido.id} className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${pedido?.status === 'CANCELADO' ? 'bg-error-container border-error/20' : 'bg-white shadow-sm border-outline-variant/50'}`}>
                        <div>
                          <h4 className="font-headline-md text-lg text-on-surface mb-1">{pedido?.quantidade || 1}x {pedido?.produto?.nome || 'Item'}</h4>
                          <p className="font-body-sm text-secondary mb-2">Destino: Chalé {pedido?.reserva?.quarto?.numero || 'N/A'} ({pedido?.reserva?.hospede?.nome || 'Hóspede'})</p>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${pedido?.status === 'SOLICITADO' ? 'bg-orange-100 text-orange-800' : pedido?.status === 'EM_PREPARO' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
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
            </div>
          )}

          {abaAtiva === 'caixa' && (
            <div className="flex flex-col gap-6">
              <h1 className="font-headline-lg text-3xl text-on-surface">Financeiro</h1>
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
                <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border self-start">
                  <h3 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Nova Transação</h3>
                  <form onSubmit={registrarTransacao} className="flex flex-col gap-4">
                    <select value={tipoTransacao} onChange={e => setTipoTransacao(e.target.value)} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary"><option value="ENTRADA">Entrada (+)</option><option value="SAIDA">Saída (-)</option></select>
                    <input value={descricaoTransacao} onChange={e => setDescricaoTransacao(e.target.value)} required placeholder="Descrição" className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                    <input value={valorTransacao} onChange={e => setValorTransacao(e.target.value)} required type="number" step="0.01" placeholder="Valor (R$)" className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
                    <select value={metodoPagamento} onChange={e => setMetodoPagamento(e.target.value)} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary"><option value="PIX">PIX</option><option value="CARTAO_CREDITO">Crédito</option><option value="DINHEIRO">Dinheiro</option></select>
                    <button type="submit" className="mt-2 w-full py-3 px-4 rounded-lg bg-on-surface text-white font-label-md hover:opacity-90 cursor-pointer">Registrar</button>
                  </form>
                </div>
                <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                  <h3 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Histórico do Dia</h3>
                  <ul className="flex flex-col">
                    {transacoes.map(t => (
                      <li key={t.id} className="flex justify-between items-center border-b border-surface-container py-4 last:border-0">
                        <div>
                          <strong className="font-headline-md text-lg text-on-surface">{t.descricao}</strong><br/>
                          <small className="text-secondary">{t.metodoPagamento} | {new Date(t.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                        <strong className={`font-headline-md text-xl ${t.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>{t.tipo === 'ENTRADA' ? '+' : '-'} {formatarMoeda(t.valor)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === 'portal-hospede' && (
            <div className="flex flex-col gap-stack-lg max-w-[1000px] mx-auto pt-4">
              
              <header className="flex flex-col gap-stack-sm text-center md:text-left">
                <h1 className="font-headline-lg text-[32px] md:text-[48px] text-on-surface leading-tight">Olá, {usuarioLogado?.nome?.split(' ')[0]}. Aproveite sua estadia.</h1>
                <p className="font-body-lg text-secondary">Estamos felizes em tê-lo conosco. Abaixo você encontra os detalhes do seu chalé.</p>
              </header>

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                <div className="bg-surface-container-lowest rounded-lg shadow-level-1 p-stack-md flex flex-col justify-between group hover:shadow-level-2 transition-shadow duration-300 ghost-border">
                  <div className="flex items-start justify-between mb-stack-md border-b border-outline-variant/20 pb-stack-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary" data-icon="payments">payments</span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Extrato do Chalé</h2>
                    </div>
                  </div>
                  <div className="flex flex-col gap-stack-sm flex-grow">
                    <p className="font-body-md text-secondary">Saldo atual em consumo:</p>
                    <p className="font-headline-lg text-[32px] text-on-surface">
                      {extratoHospede && extratoHospede.temReserva ? formatarMoeda(extratoHospede.totalGeral) : 'R$ 0,00'}
                    </p>
                  </div>
                  <button onClick={() => document.getElementById('detalhes-extrato')?.scrollIntoView({ behavior: 'smooth' })} className="mt-stack-md w-full py-3 px-4 rounded bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all cursor-pointer">
                    Ver Detalhes
                  </button>
                </div>

                <div className="bg-surface-container-lowest rounded-lg shadow-level-1 p-stack-md flex flex-col justify-between group hover:shadow-level-2 transition-shadow duration-300 ghost-border">
                  <div className="flex items-start justify-between mb-stack-md border-b border-outline-variant/20 pb-stack-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary" data-icon="wifi">wifi</span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Conectar Wi-Fi</h2>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-grow">
                    <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-outline-variant/30">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-secondary font-bold">Rede</p>
                        <p className="font-headline-md text-base font-bold text-on-surface">Refugio Dourado cliente</p>
                        <p className="text-[11px] uppercase tracking-wider text-secondary font-bold mt-2">Senha</p>
                        <p className="font-headline-md text-base font-bold text-primary">bemvindo</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-outline-variant flex flex-col items-center justify-center shadow-sm">
                        <QrCode size={48} className="text-on-surface" />
                        <span className="text-[9px] text-secondary font-bold mt-1">Escanear</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-label-sm mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Status: Excelente
                    </div>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText('bemvindo'); alert('Senha "bemvindo" copiada com sucesso!')}} className="mt-4 w-full py-2.5 px-4 rounded border ghost-border text-on-surface-variant font-label-md hover:bg-primary-container/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>content_copy</span> Copiar Senha
                  </button>
                </div>

                <div className="bg-surface-container-lowest rounded-lg shadow-level-1 p-stack-md flex flex-col justify-between group hover:shadow-level-2 transition-shadow duration-300 ghost-border">
                  <div className="flex items-start justify-between mb-stack-md border-b border-outline-variant/20 pb-stack-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary" data-icon="restaurant">restaurant</span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Cardápio Digital</h2>
                    </div>
                  </div>
                  <div className="flex flex-col gap-stack-sm flex-grow relative overflow-hidden rounded mb-stack-sm min-h-[120px]">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544025162-811114bd4157?q=80&w=800&auto=format&fit=crop')" }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="relative z-10 p-4 h-full flex items-end">
                      <p className="font-body-md text-white">Descubra opções de gastronomia exclusiva.</p>
                    </div>
                  </div>
                  <button onClick={() => document.getElementById('secao-cardapio')?.scrollIntoView({ behavior: 'smooth' })} className="mt-auto w-full py-3 px-4 rounded bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all cursor-pointer">
                    Acessar Cardápio
                  </button>
                </div>
              </section>

              <section className="mt-stack-md flex flex-col gap-stack-md">
                <h3 className="font-headline-md text-[24px] text-on-surface">Serviços Sugeridos para Você</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                  <div className="bg-surface-container-lowest rounded-lg shadow-level-1 p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors ghost-border"><div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary"><span className="material-symbols-outlined">spa</span></div><div><h4 className="font-label-md text-on-surface">Massagem Relaxante</h4><p className="font-label-sm text-secondary mt-1">Agende na recepção</p></div></div>
                  <div className="bg-surface-container-lowest rounded-lg shadow-level-1 p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors ghost-border"><div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary"><span className="material-symbols-outlined">explore</span></div><div><h4 className="font-label-md text-on-surface">Passeio Guiado</h4><p className="font-label-sm text-secondary mt-1">Trilhas pela região</p></div></div>
                  <div className="bg-surface-container-lowest rounded-lg shadow-level-1 p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors ghost-border"><div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary"><span className="material-symbols-outlined">room_service</span></div><div><h4 className="font-label-md text-on-surface">Café no Quarto</h4><p className="font-label-sm text-secondary mt-1">Solicite pelo app</p></div></div>
                  <div className="bg-surface-container-lowest rounded-lg shadow-level-1 p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors ghost-border"><div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary"><span className="material-symbols-outlined">local_bar</span></div><div><h4 className="font-label-md text-on-surface">Degustação Vinhos</h4><p className="font-label-sm text-secondary mt-1">Consulte horários</p></div></div>
                </div>
              </section>

              <hr className="my-8 border-outline-variant/30" />

              <div id="detalhes-extrato" className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-8">
                {extratoHospede && extratoHospede.temReserva && (
                  <div className="bg-surface-container-lowest rounded-lg shadow-level-1 p-6 ghost-border">
                    <h3 className="font-headline-md text-xl mb-4 border-b border-outline-variant/20 pb-2">📋 Detalhes da Conta</h3>
                    <div className="flex justify-between mb-2 text-secondary"><span>Diárias ({extratoHospede.qtdDiarias}x)</span> <span>{formatarMoeda(extratoHospede.totalDiarias)}</span></div>
                    {extratoHospede.consumos.length > 0 && <div className="mt-4 mb-2 font-bold text-sm text-on-surface">Consumo no Bar/Restaurante:</div>}
                    {extratoHospede.consumos.map((c: any) => (
                      <div key={c.id} className="flex justify-between text-sm text-secondary mb-1 border-b border-surface-container pb-1">
                        <span>{c.quantidade}x {c.nome}</span> <span>{formatarMoeda(c.subtotal)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/30">
                      <strong className="font-headline-md text-lg text-on-surface">Total Acumulado</strong>
                      <strong className="font-headline-md text-xl text-primary">{formatarMoeda(extratoHospede.totalGeral)}</strong>
                    </div>
                  </div>
                )}

                {pedidosCozinha.filter((p: any) => p.status !== 'ENTREGUE' && p.status !== 'CANCELADO').length > 0 && (
                  <div className="bg-primary-fixed-dim/10 rounded-lg shadow-level-1 p-6 border border-primary-container/30">
                    <h3 className="font-headline-md text-xl mb-4 text-on-primary-container">🔔 Pedidos em Andamento</h3>
                    {pedidosCozinha.filter((p: any) => p.status !== 'ENTREGUE' && p.status !== 'CANCELADO').map((pedido: any) => (
                      <div key={pedido.id} className="flex justify-between items-center bg-white p-4 rounded-lg mb-2 shadow-sm">
                        <span className="font-bold text-on-surface">{pedido.quantidade}x {pedido.produto.nome}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-primary-container/20 text-primary-fixed-variant uppercase">{pedido.status.replace('_', ' ')}</span>
                          {pedido.status === 'SOLICITADO' && (
                             <button onClick={() => cancelarPedido(pedido.id)} className="text-error hover:text-error/80 text-xs font-bold transition-colors cursor-pointer">Cancelar</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <section id="secao-cardapio" className="mt-4">
                <h3 className="font-headline-md text-[24px] text-on-surface mb-6">Explore nosso Menu</h3>
                <div className="relative mb-6">
                  <Search size={20} className="absolute top-3.5 left-4 text-secondary" />
                  <input type="text" placeholder="O que deseja pedir hoje?" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-outline-variant bg-surface outline-none focus:border-primary transition-colors font-body-md" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
                  {['TODOS', 'Prato Principal', 'Petiscos', 'Bebidas', 'Sobremesas'].map((cat) => (
                    <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`px-5 py-2 rounded-full font-label-md transition-colors whitespace-nowrap cursor-pointer ${categoriaFiltro === cat ? 'bg-primary-container text-white border-transparent' : 'bg-surface-container-lowest text-secondary border border-outline-variant hover:bg-surface-container'}`}>
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
                          <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{p.categoria || 'Geral'}</span>
                          <h3 className="font-headline-md text-lg text-on-surface mt-1 mb-2">{p.nome}</h3>
                          <p className="text-xl font-bold text-surface-tint">{formatarMoeda(p.preco)}</p>
                        </div>
                        <button onClick={() => pedirComoHospede(p.id)} className="w-full py-2.5 rounded-lg bg-surface border border-primary text-primary font-label-md flex items-center justify-center gap-2 hover:bg-primary-container hover:text-white transition-colors cursor-pointer">
                          <ShoppingBag size={16} /> Pedir
                        </button>
                      </div>
                  ))}
                </div>
              </section>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}