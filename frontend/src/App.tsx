import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, BedDouble, UserPlus, List, DoorOpen, CalendarCheck, Activity, Key, Lock, Utensils, ShoppingBag } from 'lucide-react';
import { gerarReciboPdf, type MockReserva, type MockConsumo } from './utils/gerarReciboPdf'; 
import MapaInterativo from './components/MapaInterativo';

interface Hospede { id: string; nome: string; cpf: string; email: string; telefone: string; }
interface Quarto { 
  id: string; 
  numero: string; 
  capacidade: number; 
  valorDiaria: number; 
  status: string; 
  categoria: string; 
  descricao?: string;      
  itensInclusos?: string; 
}
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

  // Estados para pesquisa e filtros do cardápio do hóspede
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS');

  const buscarPedidosCozinha = async () => {
    try {
      const res = await axios.get('http://localhost:3333/api/consumos/ativos');
      setPedidosCozinha(res.data);
    } catch (err) {
      console.error('Erro ao buscar pedidos da cozinha');
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
        setUsuarioLogado((prev: any) => ({
          ...prev,
          reservaId: res.data.reservaId
        }));
      }
    } catch (err) {
      console.error('Erro ao carregar extrato do hóspede');
    }
  };
  
  const [nome, setNome] = useState(''); const [cpf, setCpf] = useState(''); 
  const [email, setEmail] = useState(''); const [telefone, setTelefone] = useState('');
  
  const [numero, setNumero] = useState(''); const [capacidade, setCapacidade] = useState(''); 
  const [valorDiaria, setValorDiaria] = useState(''); 
  const [categoria, setCategoria] = useState('Chalé Luxo Casal'); 
  
  const [hospedeId, setHospedeId] = useState(''); const [quartoId, setQuartoId] = useState(''); 
  const [dataCheckIn, setDataCheckIn] = useState(''); const [dataCheckOut, setDataCheckOut] = useState('');
  const [origem, setOrigem] = useState('WhatsApp'); 

  const [prodNome, setProdNome] = useState('');
  const [prodPreco, setProdPreco] = useState('');
  const [prodEstoque, setProdEstoque] = useState('');
  const [prodCategoria, setProdCategoria] = useState('Prato Principal');

  const [tipoTransacao, setTipoTransacao] = useState('ENTRADA');
  const [descricaoTransacao, setDescricaoTransacao] = useState('');
  const [valorTransacao, setValorTransacao] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('PIX');

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
      
      if (abaAtiva === 'restaurante' || abaAtiva === 'portal-hospede') { 
        buscarProdutos(); 
        buscarPedidosCozinha();
        if (usuarioLogado?.email) buscarExtratoHospede(usuarioLogado.email);
        
        const interval = setInterval(() => {
          buscarPedidosCozinha();
          if (usuarioLogado?.email) buscarExtratoHospede(usuarioLogado.email);
        }, 5000);
        return () => clearInterval(interval);
      }
      
      if (abaAtiva === 'caixa') buscarTransacoes();
      if (abaAtiva === 'dashboard') { buscarHospedes(); buscarQuartos(); buscarReservas(); }
    }
  }, [abaAtiva, autenticado, usuarioLogado]);

  const mascaraCPF = (valor: string) => valor.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const mascaraTelefone = (valor: string) => valor.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3333/api/login', { email: emailInput, senha: senhaInput });
      const user = response.data;
      setUsuarioLogado(user);
      setAutenticado(true);

      if (user.cargo === 'GERENTE') setAbaAtiva('dashboard');
      else if (user.cargo === 'RECEPCAO') setAbaAtiva('reservas');
      else if (user.cargo === 'COZINHA') setAbaAtiva('restaurante');
      else if (user.cargo === 'HOSPEDE') {
        setAbaAtiva('portal-hospede');
        buscarExtratoHospede(user.email);
      }

    } catch (error) {
      alert('E-mail ou senha incorretos! Verifique suas credenciais.');
      setSenhaInput('');
    }
  };

  const cadastrarHospede = async (e: React.FormEvent) => { e.preventDefault(); await axios.post('http://localhost:3333/api/hospedes', { nome, cpf, email, telefone }); alert('Hóspede salvo!'); setNome(''); setCpf(''); setEmail(''); setTelefone(''); buscarHospedes(); };
  
  const cadastrarQuarto = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    await axios.post('http://localhost:3333/api/quartos', { numero, capacidade: Number(capacidade), valorDiaria: Number(valorDiaria), categoria }); 
    alert('Quarto salvo!'); setNumero(''); setCapacidade(''); setValorDiaria(''); setCategoria('Chalé Luxo Casal'); buscarQuartos(); 
  };
  
  const cadastrarReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await axios.post('http://localhost:3333/api/reservas', { hospedeId, quartoId, dataCheckIn, dataCheckOut, origem }); alert('Reserva confirmada!'); setHospedeId(''); setQuartoId(''); setDataCheckIn(''); setDataCheckOut(''); setOrigem('WhatsApp'); buscarReservas(); buscarQuartos(); } 
    catch (error) { alert('Erro ao criar reserva.'); }
  };

  const cadastrarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3333/api/produtos', { 
        nome: prodNome, 
        preco: Number(prodPreco), 
        estoque: Number(prodEstoque),
        categoria: prodCategoria 
      });
      alert('Item adicionado ao cardápio pelo Cozinheiro!');
      setProdNome(''); setProdPreco(''); setProdEstoque(''); setProdCategoria('Prato Principal');
      buscarProdutos();
    } catch (error) { alert('Erro ao cadastrar produto.'); }
  };

  const pedirComoHospede = async (produtoId: string) => {
    if (!extratoHospede || !extratoHospede.temReserva) {
      alert('Aviso: Sua conta de hóspede não está vinculada a nenhuma reserva ativa no momento.');
      return;
    }
    try {
      await axios.post('http://localhost:3333/api/consumos', { 
        reservaId: extratoHospede.reservaId, 
        produtoId, 
        quantidade: 1 
      });
      alert('Pedido realizado com sucesso! O item foi debitado na conta do seu chalé. 🛎️🍹');
      buscarPedidosCozinha();
      buscarExtratoHospede(usuarioLogado.email);
    } catch (error) { alert('Erro ao registrar pedido.'); }
  };

  const cancelarPedido = async (id: string) => {
    if (!window.confirm('Deseja realmente cancelar este pedido?')) return;
    try {
      await axios.put(`http://localhost:3333/api/consumos/${id}/cancelar`);
      alert('Pedido cancelado com sucesso.');
      buscarPedidosCozinha();
      buscarExtratoHospede(usuarioLogado.email);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao cancelar pedido.');
    }
  };

  const fazerCheckout = async (reservaId: string) => {
    if (!window.confirm('Deseja finalizar esta reserva e liberar o quarto?')) return;
    try { await axios.put(`http://localhost:3333/api/reservas/${reservaId}/checkout`); alert('Check-out realizado!'); buscarReservas(); buscarQuartos(); } 
    catch (error) { alert('Erro ao fazer o check-out.'); }
  };

  const emitirRecibo = (reserva: any) => {
    const dataIn = new Date(reserva.dataCheckIn);
    const dataOut = new Date(reserva.dataCheckOut);
    const diffTempo = Math.abs(dataOut.getTime() - dataIn.getTime());
    const qtdDiarias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24)) || 1;
    const totalDiarias = qtdDiarias * reserva.quarto.valorDiaria;

    const listaConsumos: MockConsumo[] = (reserva.consumos || []).map((c: any) => ({
      descricao: c.produto.nome,
      quantidade: c.quantidade,
      subtotal: c.subtotal
    }));

    const totalConsumos = listaConsumos.reduce((acc, c) => acc + c.subtotal, 0);
    const totalGeral = totalDiarias + totalConsumos;

    const dadosReais: MockReserva = {
      id: reserva.id,
      cliente: reserva.hospede.nome,
      dataCheckIn: dataIn.toLocaleDateString('pt-BR'),
      dataCheckOut: dataOut.toLocaleDateString('pt-BR'),
      quarto: `${reserva.quarto.categoria} (Nº ${reserva.quarto.numero})`,
      diarias: { quantidade: qtdDiarias, valor: reserva.quarto.valorDiaria, total: totalDiarias },
      consumos: listaConsumos,
      totalGeral: totalGeral
    };
    gerarReciboPdf(dadosReais);
  };

  const enviarWhatsApp = (reserva: Reserva) => {
    const numeroLimpo = reserva.hospede.telefone.replace(/\D/g, ''); 
    const mensagem = `Olá ${reserva.hospede.nome}! Gostaríamos de agradecer imensamente por escolher a Pousada Refúgio Dourado. Esperamos que tenha vivido momentos inesquecíveis em nosso ${reserva.quarto.categoria}. Até a próxima visita! [Equipe Refúgio Dourado]`;
    const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const registrarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3333/api/transacoes', { tipo: tipoTransacao, valor: valorTransacao, metodoPagamento, descricao: descricaoTransacao });
      alert('Transação registrada no caixa!');
      setDescricaoTransacao(''); setValorTransacao('');
      buscarTransacoes();
    } catch (error) { alert('Erro ao registrar transação.'); }
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10%', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundImage: `linear-gradient(rgba(0, 50, 100, 0.3), rgba(0, 50, 100, 0.6)), url('/fundo-login.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '2.5rem 2rem', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)', width: '100%', maxWidth: '360px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img src="/logo-pousada.png" alt="Refúgio Dourado" style={{ maxWidth: '170px', height: 'auto', objectFit: 'contain' }} />
          </div>
          <p style={{ color: '#0077b6', margin: '0 0 1.5rem 0', fontWeight: '500', fontSize: '0.9rem' }}>Acesso Unificado (Gerência & Hóspedes)</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="email" 
              placeholder="Seu e-mail de acesso" 
              value={emailInput} 
              onChange={(e) => setEmailInput(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '2px solid #bce0fd', outline: 'none', fontSize: '0.95rem', color: '#1a365d', boxSizing: 'border-box' }}
            />
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#0077b6" style={{ position: 'absolute', top: '13px', left: '14px' }} />
              <input 
                type="password" 
                placeholder="Sua senha" 
                value={senhaInput} 
                onChange={(e) => setSenhaInput(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '2px solid #bce0fd', outline: 'none', fontSize: '0.95rem', color: '#1a365d', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" style={{ padding: '12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: '0.3s', boxShadow: '0 4px 12px rgba(243,156,18,0.3)' }}>Acessar Sistema</button>
          </form>
          <p style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '1.2rem' }}>Perfis: Gerente, Recepcionista, Cozinheiro & Hóspede.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #e0fbfc 0%, #ffffff 50%, #fdfbf7 100%)' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo-pousada.png" alt="Refúgio Dourado" style={{ maxWidth: '160px', height: 'auto', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#1a365d', letterSpacing: '1px', fontSize: '2.2rem' }}>Pousada Refúgio Dourado</h1>
            <p style={{ margin: 0, color: '#0077b6', fontWeight: '500', fontSize: '1.05rem' }}>
              Logado como: <strong>{usuarioLogado?.nome}</strong> ({usuarioLogado?.cargo})
            </p>
          </div>
        </div>
        <button onClick={() => { setAutenticado(false); setUsuarioLogado(null); setEmailInput(''); setSenhaInput(''); }} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Sair</button>
      </div>

      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '2px solid rgba(0, 119, 182, 0.15)', paddingBottom: '1.5rem', overflowX: 'auto' }}>
        {(usuarioLogado?.cargo === 'GERENTE' || usuarioLogado?.cargo === 'RECEPCAO') && (
          <>
            <button onClick={() => setAbaAtiva('dashboard')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'dashboard' ? '#0077b6' : 'transparent', color: abaAtiva === 'dashboard' ? 'white' : '#1a365d', border: abaAtiva === 'dashboard' ? 'none' : '1px solid #0077b6', borderRadius: '30px', fontWeight: 'bold' }}>📊 Dashboard</button>
            <button onClick={() => setAbaAtiva('hospedes')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'hospedes' ? '#0077b6' : 'transparent', color: abaAtiva === 'hospedes' ? 'white' : '#1a365d', border: abaAtiva === 'hospedes' ? 'none' : '1px solid #0077b6', borderRadius: '30px', fontWeight: 'bold' }}>👥 Hóspedes</button>
            <button onClick={() => setAbaAtiva('quartos')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'quartos' ? '#0077b6' : 'transparent', color: abaAtiva === 'quartos' ? 'white' : '#1a365d', border: abaAtiva === 'quartos' ? 'none' : '1px solid #0077b6', borderRadius: '30px', fontWeight: 'bold' }}>🚪 Quartos / Chalés</button>
            <button onClick={() => setAbaAtiva('reservas')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'reservas' ? '#0077b6' : 'transparent', color: abaAtiva === 'reservas' ? 'white' : '#1a365d', border: abaAtiva === 'reservas' ? 'none' : '1px solid #0077b6', borderRadius: '30px', fontWeight: 'bold' }}>📅 Reservas</button>
            <button onClick={() => setAbaAtiva('mapa')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'mapa' ? '#0077b6' : 'transparent', color: abaAtiva === 'mapa' ? 'white' : '#1a365d', border: abaAtiva === 'mapa' ? 'none' : '1px solid #0077b6', borderRadius: '30px', fontWeight: 'bold' }}>🗺️ Mapa</button>
          </>
        )}

        {(usuarioLogado?.cargo === 'GERENTE' || usuarioLogado?.cargo === 'RECEPCAO' || usuarioLogado?.cargo === 'COZINHA') && (
          <button onClick={() => setAbaAtiva('restaurante')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'restaurante' ? '#e67e22' : 'transparent', color: abaAtiva === 'restaurante' ? 'white' : '#d35400', border: abaAtiva === 'restaurante' ? 'none' : '1px solid #e67e22', borderRadius: '30px', fontWeight: 'bold' }}>🍔 Restaurante Dengo</button>
        )}

        {usuarioLogado?.cargo === 'GERENTE' && (
          <button onClick={() => setAbaAtiva('caixa')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'caixa' ? '#f39c12' : 'transparent', color: abaAtiva === 'caixa' ? 'white' : '#d35400', border: abaAtiva === 'caixa' ? 'none' : '1px solid #f39c12', borderRadius: '30px', fontWeight: 'bold' }}>💰 Caixa</button>
        )}

        {usuarioLogado?.cargo === 'HOSPEDE' && (
          <button onClick={() => setAbaAtiva('portal-hospede')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'portal-hospede' ? '#27ae60' : 'transparent', color: abaAtiva === 'portal-hospede' ? 'white' : '#27ae60', border: '1px solid #27ae60', borderRadius: '30px', fontWeight: 'bold' }}>🍹 Cardápio do Chalé</button>
        )}
      </nav>

      {abaAtiva === 'mapa' && (
        <MapaInterativo 
          quartos={quartos} 
          onSelecionarQuarto={(q) => alert(`Chalé: ${q.categoria} (Nº ${q.numero})\nStatus: ${q.status}`)} 
        />
      )}

      {abaAtiva === 'dashboard' && (
        <div>
          <h2 style={{ color: '#1a365d', marginTop: 0 }}>Visão Geral</h2>
          <p style={{ color: '#0077b6', marginBottom: '2rem' }}>Acompanhe o movimento do Refúgio em tempo real.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.8)', borderLeft: '6px solid #0077b6', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1a365d', fontSize: '1rem', fontWeight: 'bold' }}><Activity size={20} color="#0077b6" /> Taxa de Ocupação</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0 0 0', color: '#1a365d' }}>{taxaOcupacao}%</h2>
            </div>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.8)', borderLeft: '6px solid #e74c3c', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1a365d', fontSize: '1rem', fontWeight: 'bold' }}><Key size={20} color="#e74c3c" /> Chalés Ocupados</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0 0 0', color: '#1a365d' }}>{quartosOcupados} <span style={{ fontSize: '1.2rem', color: '#95a5a6' }}>/ {totalQuartos}</span></h2>
            </div>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.8)', borderLeft: '6px solid #f39c12', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1a365d', fontSize: '1rem', fontWeight: 'bold' }}><CalendarCheck size={20} color="#f39c12" /> Reservas Ativas</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0 0 0', color: '#1a365d' }}>{reservasAtivas}</h2>
            </div>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.8)', borderLeft: '6px solid #2ecc71', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1a365d', fontSize: '1rem', fontWeight: 'bold' }}><Users size={20} color="#2ecc71" /> Total de Hóspedes</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0 0 0', color: '#1a365d' }}>{hospedes.length}</h2>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'hospedes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#1a365d' }}><UserPlus size={24} color="#0077b6" /> Novo Hóspede</h2>
            <form onSubmit={cadastrarHospede} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <input required placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }} />
              <input required placeholder="CPF (Apenas números)" value={cpf} onChange={e => setCpf(mascaraCPF(e.target.value))} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }} />
              <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }} />
              <input required placeholder="Telefone" value={telefone} onChange={e => setTelefone(mascaraTelefone(e.target.value))} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }} />
              <button type="submit" style={{ padding: '14px', backgroundColor: '#0077b6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Hóspede</button>
            </form>
          </div>
          <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#1a365d' }}><List size={24} color="#0077b6" /> Cadastrados</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {hospedes.map(h => (
                <li key={h.id} style={{ borderBottom: '1px solid #edf2f7', padding: '16px 0' }}><strong style={{ fontSize: '1.1rem', color: '#1a365d' }}>{h.nome}</strong><br/><small style={{ color: '#0077b6' }}>CPF: {h.cpf} | Tel: {h.telefone}</small></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {abaAtiva === 'quartos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#1a365d' }}><DoorOpen size={24} color="#0077b6" /> Novo Quarto/Chalé</h2>
            <form onSubmit={cadastrarQuarto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <input required placeholder="Identificação (Ex: Chalé 01)" value={numero} onChange={e => setNumero(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }} />
              <label style={{ fontSize: '14px', color: '#0077b6', marginBottom: '-5px', fontWeight: 'bold' }}>Categoria</label>
              <select required value={categoria} onChange={e => setCategoria(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }}>
                <option value="Chalé Luxo Casal">Chalé Luxo Casal</option>
                <option value="Suíte Luxo Casal + Solteiro">Suíte Luxo Casal + Solteiro</option>
                <option value="Suíte Luxo Família">Suíte Luxo Família</option>
                <option value="Suíte Luxo Duplo">Suíte Luxo Duplo</option>
                <option value="Chalé Taipa Luxo">Chalé Taipa Luxo</option>
                <option value="Padrão">Padrão</option>
              </select>
              <input required type="number" placeholder="Capacidade de Pessoas" value={capacidade} onChange={e => setCapacidade(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }} />
              <input required type="number" placeholder="Valor Diária (R$)" value={valorDiaria} onChange={e => setValorDiaria(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }} />
              <button type="submit" style={{ padding: '14px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Acomodação</button>
            </form>
          </div>
          
          <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#1a365d' }}><BedDouble size={24} color="#0077b6" /> Cadastrados</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              {quartos.map(quarto => (
                <div key={quarto.id} style={{ 
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.96)), url('/fundo-login.jpeg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid #e0e0e0', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', color: '#1a365d', fontSize: '1.2rem', lineHeight: '1.2' }}>{quarto.categoria}</h3>
                      <span style={{ color: '#7f8c8d', fontSize: '0.85rem', fontWeight: 'bold' }}>Chalé / Quarto: {quarto.numero}</span>
                    </div>
                    <span style={{ backgroundColor: quarto.status === 'LIVRE' ? '#e8f8f5' : '#fdedec', color: quarto.status === 'LIVRE' ? '#27ae60' : '#e74c3c', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', border: `1px solid ${quarto.status === 'LIVRE' ? '#27ae60' : '#e74c3c'}` }}>
                      {quarto.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#576574', fontSize: '0.9rem', lineHeight: '1.5', textAlign: 'justify' }}>
                    {quarto.descricao || 'Nenhuma descrição cadastrada para esta acomodação.'}
                  </p>
                  <div style={{ backgroundColor: '#fcf3eb', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f39c12' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#8e44ad', lineHeight: '1.4' }}>
                      <strong style={{ color: '#d35400' }}>✨ Inclusos:</strong> {quarto.itensInclusos || 'Não especificado.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f2f6' }}>
                    <span style={{ color: '#2980b9', fontSize: '0.9rem', fontWeight: '500' }}>👥 Até {quarto.capacidade} pessoas</span>
                    <span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.15rem' }}>{formatarMoeda(quarto.valorDiaria)}</span>
                  </div>
                </div>
              ))}
              {quartos.length === 0 && (
                <p style={{ textAlign: 'center', color: '#95a5a6', gridColumn: '1 / -1', padding: '2rem' }}>Nenhum quarto cadastrado ainda.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'reservas' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#1a365d' }}><CalendarCheck size={24} color="#0077b6" /> Nova Reserva</h2>
            <form onSubmit={cadastrarReserva} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <select required value={hospedeId} onChange={e => setHospedeId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }}>
                <option value="">Selecione um Hóspede...</option>
                {hospedes.map(h => <option key={h.id} value={h.id}>{h.nome} ({h.cpf})</option>)}
              </select>
              <select required value={quartoId} onChange={e => setQuartoId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }}>
                <option value="">Selecione a Acomodação...</option>
                {quartos.filter(q => q.status === 'LIVRE').map(q => <option key={q.id} value={q.id}>{q.categoria} - {q.numero} (R${q.valorDiaria})</option>)}
              </select>
              <label style={{ fontSize: '14px', color: '#0077b6', marginBottom: '-5px', fontWeight: 'bold' }}>Canal de Origem</label>
              <select required value={origem} onChange={e => setOrigem(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }}>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Airbnb">Airbnb</option>
                <option value="Booking">Booking</option>
                <option value="Site/Motor">Site / Motor de Reservas</option>
                <option value="Direto/Balcão">Direto / Balcão</option>
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: '14px', color: '#0077b6', marginBottom: '5px', display: 'block', fontWeight: 'bold' }}>Check-in</label><input required type="date" value={dataCheckIn} onChange={e => setDataCheckIn(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', width: '100%', boxSizing: 'border-box' }} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: '14px', color: '#0077b6', marginBottom: '5px', display: 'block', fontWeight: 'bold' }}>Check-out</label><input required type="date" value={dataCheckOut} onChange={e => setDataCheckOut(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', width: '100%', boxSizing: 'border-box' }} /></div>
              </div>
              <button type="submit" style={{ padding: '14px', backgroundColor: '#0077b6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Confirmar Reserva</button>
            </form>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#1a365d' }}><List size={24} color="#0077b6" /> Histórico</h2>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1.5rem' }}>
              {reservas.map(r => (
                <li key={r.id} style={{ border: '1px solid #edf2f7', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', backgroundColor: r.status === 'CONCLUÍDA' ? '#f8f9fa' : '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0', color: '#1a365d' }}>{r.quarto.numero} - {r.hospede.nome}</h3>
                      <p style={{ margin: '4px 0', color: '#0077b6' }}>Entrada: {new Date(r.dataCheckIn).toLocaleDateString('pt-BR')} | Saída: {new Date(r.dataCheckOut).toLocaleDateString('pt-BR')}</p>
                      <p style={{ margin: '4px 0', fontWeight: 'bold', color: r.status === 'CONCLUÍDA' ? '#95a5a6' : '#f39c12' }}>Status: {r.status}</p>
                    </div>
                    <span style={{ backgroundColor: '#fdf3e7', color: '#d35400', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Origem: {r.origem}</span>
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => enviarWhatsApp(r)} style={{ padding: '10px 16px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>💬 Zap</button>
                    <button onClick={() => emitirRecibo(r)} style={{ padding: '10px 16px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📄 Recibo</button>
                    {r.status !== 'CONCLUÍDA' && (
                      <button onClick={() => fazerCheckout(r.id)} style={{ padding: '10px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Check-out</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {abaAtiva === 'restaurante' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#e67e22' }}><Utensils size={24} color="#e67e22" /> Cardápio (Cozinha)</h2>
            <form onSubmit={cadastrarProduto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <input required placeholder="Nome do Prato/Bebida (Ex: Peixe Frito)" value={prodNome} onChange={e => setProdNome(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #f9d5a7', outline: 'none' }} />
              
              <label style={{ fontSize: '14px', color: '#e67e22', fontWeight: 'bold', marginTop: '-5px' }}>Categoria</label>
              <select value={prodCategoria} onChange={e => setProdCategoria(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #f9d5a7', outline: 'none' }}>
                <option value="Prato Principal">Prato Principal</option>
                <option value="Petiscos">Petiscos & Entradas</option>
                <option value="Bebidas">Bebidas & Drinks</option>
                <option value="Sobremesas">Sobremesas</option>
              </select>

              <input required type="number" step="0.01" placeholder="Preço (R$)" value={prodPreco} onChange={e => setProdPreco(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #f9d5a7', outline: 'none' }} />
              <input required type="number" placeholder="Estoque Inicial" value={prodEstoque} onChange={e => setProdEstoque(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #f9d5a7', outline: 'none' }} />
              <button type="submit" style={{ padding: '14px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar no Cardápio</button>
            </form>

            <h3 style={{ marginTop: '2rem', color: '#1a365d' }}>Itens Atuais do Cardápio</h3>
            <ul style={{ listStyle: 'none', padding: 0, maxHeight: '250px', overflowY: 'auto' }}>
              {produtos.map(p => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', padding: '10px 0' }}>
                  <span><strong>{p.nome}</strong> ({p.categoria || 'Geral'} - Estq: {p.estoque})</span>
                  <span style={{ color: '#e67e22', fontWeight: 'bold' }}>{formatarMoeda(p.preco)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#e67e22' }}>🔔 Pedidos dos Chalés (Tempo Real)</h2>
            <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Acompanhe os pedidos feitos pelos hóspedes e atualize o status de preparo.</p>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
              {pedidosCozinha && pedidosCozinha.map((pedido: any) => (
                <div key={pedido.id} style={{ border: `1px solid ${pedido.status === 'CANCELADO' ? '#e74c3c' : '#fce4c8'}`, padding: '1rem', borderRadius: '12px', backgroundColor: pedido.status === 'CANCELADO' ? '#fdedec' : '#fffcf7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1a365d' }}>{pedido.quantidade}x {pedido.produto.nome}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#d35400' }}>
                      🏡 Chalé {pedido.reserva.quarto.numero} - Hóspede: <strong>{pedido.reserva.hospede.nome}</strong>
                    </p>
                    <span style={{ display: 'inline-block', marginTop: '6px', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: pedido.status === 'SOLICITADO' ? '#fdebd0' : pedido.status === 'EM_PREPARO' ? '#d4efdf' : pedido.status === 'CANCELADO' ? '#fadbd8' : '#d6eaf8', color: pedido.status === 'SOLICITADO' ? '#d35400' : pedido.status === 'EM_PREPARO' ? '#27ae60' : pedido.status === 'CANCELADO' ? '#c0392b' : '#2980b9' }}>
                      Status: {pedido.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pedido.status === 'SOLICITADO' && (
                      <>
                        <button onClick={() => atualizarStatusPedido(pedido.id, 'EM_PREPARO')} style={{ padding: '6px 12px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>🍳 Iniciar Preparo</button>
                        <button onClick={() => atualizarStatusPedido(pedido.id, 'CANCELADO')} style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>❌ Cancelar</button>
                      </>
                    )}
                    {pedido.status === 'EM_PREPARO' && (
                      <button onClick={() => atualizarStatusPedido(pedido.id, 'PRONTO')} style={{ padding: '6px 12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>✅ Pronto / Entregar</button>
                    )}
                    {pedido.status === 'PRONTO' && (
                      <button onClick={() => atualizarStatusPedido(pedido.id, 'ENTREGUE')} style={{ padding: '6px 12px', backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>🏁 Concluir</button>
                    )}
                    {pedido.status === 'CANCELADO' && (
                      <button onClick={() => atualizarStatusPedido(pedido.id, 'ENTREGUE')} style={{ padding: '6px 12px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>🗑️ Limpar da Tela</button>
                    )}
                  </div>
                </div>
              ))}

              {(!pedidosCozinha || pedidosCozinha.length === 0) && (
                <p style={{ textAlign: 'center', color: '#95a5a6', padding: '2rem' }}>Nenhum pedido pendente no momento. 🍳</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {abaAtiva === 'portal-hospede' && (
        <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '48px' }}>🍹</span>
            <h2 style={{ color: '#1a365d', margin: '10px 0 5px 0' }}>Restaurante Dengo & Conta do Chalé</h2>
            <p style={{ color: '#0077b6', marginBottom: '0.5rem' }}>
              Logado como: <strong>{usuarioLogado?.nome}</strong> ({usuarioLogado?.cargo})
            </p>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Acompanhe seus pedidos em tempo real e o resumo financeiro da sua estadia.
            </p>
            
            {/* BANNER DE WI-FI */}
            <div style={{ display: 'inline-block', backgroundColor: '#e0fbfc', padding: '10px 20px', borderRadius: '12px', border: '1px dashed #0077b6', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, color: '#1a365d', fontSize: '0.9rem' }}>
                📶 <strong>Wi-Fi da Pousada</strong> | Rede: <span style={{ color: '#0077b6', fontWeight: 'bold' }}>Refugio Dourado cliente</span> | Senha: <span style={{ color: '#e67e22', fontWeight: 'bold' }}>bemvindo</span>
              </p>
            </div>

            {/* EXTRATO FINANCEIRO DA CONTA DO HÓSPEDE */}
            {extratoHospede && extratoHospede.temReserva ? (
              <div style={{ maxWidth: '650px', margin: '0 auto 2rem auto', padding: '1.5rem', backgroundColor: '#f0f8ff', borderRadius: '14px', border: '1px solid #bce0fd', textAlign: 'left', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #bce0fd', paddingBottom: '10px', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, color: '#1a365d', fontSize: '1.1rem' }}>📋 Extrato Parcial da Estadia</h3>
                  <span style={{ backgroundColor: '#0077b6', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>{extratoHospede.quarto}</span>
                </div>
                
                <div style={{ fontSize: '0.9rem', color: '#333', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🏨 Diárias ({extratoHospede.qtdDiarias}x {formatarMoeda(extratoHospede.valorDiaria)}):</span>
                    <strong>{formatarMoeda(extratoHospede.totalDiarias)}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🍔 Consumo no Restaurante / Bar:</span>
                    <strong>{formatarMoeda(extratoHospede.totalConsumos)}</strong>
                  </div>

                  {extratoHospede.consumos.length > 0 && (
                    <div style={{ backgroundColor: 'white', padding: '8px 12px', borderRadius: '8px', marginTop: '6px', border: '1px solid #e1effe' }}>
                      <small style={{ color: '#555', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Itens consumidos:</small>
                      {extratoHospede.consumos.map((c: any) => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', borderBottom: '1px solid #f1f1f1', padding: '3px 0' }}>
                          <span>{c.quantidade}x {c.nome} ({c.status})</span>
                          <span>{formatarMoeda(c.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #bce0fd', paddingTop: '10px', marginTop: '8px', fontSize: '1.1rem' }}>
                    <strong style={{ color: '#1a365d' }}>Total Parcial Acumulado:</strong>
                    <strong style={{ color: '#27ae60' }}>{formatarMoeda(extratoHospede.totalGeral)}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: '600px', margin: '0 auto 2rem auto', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '12px', border: '1px solid #ffeeba', color: '#856404' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>⚠️ Sua conta não está vinculada a nenhuma reserva ativa no momento. Procure a recepção se precisar de ajuda.</p>
              </div>
            )}

            {/* ACOMPANHAMENTO DOS PEDIDOS RECENTES */}
            {usuarioLogado && (
              <div style={{ maxWidth: '600px', margin: '0 auto 2rem auto', padding: '1rem', backgroundColor: '#fdf3e7', borderRadius: '12px', border: '1px solid #f9d5a7', textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#d35400', fontSize: '1rem' }}>🔔 Status dos Seus Pedidos Recentes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pedidosCozinha
                    .filter((p: any) => p.status !== 'ENTREGUE' && p.status !== 'CANCELADO')
                    .map((pedido: any) => (
                      <div key={pedido.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f6cc9c' }}>
                        <div>
                          <span style={{ fontSize: '0.9rem', color: '#1a365d', display: 'block' }}><strong>{pedido.quantidade}x</strong> {pedido.produto.nome}</span>
                          <span style={{ display: 'inline-block', marginTop: '4px', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: pedido.status === 'SOLICITADO' ? '#fdebd0' : pedido.status === 'EM_PREPARO' ? '#d4efdf' : '#d6eaf8', color: pedido.status === 'SOLICITADO' ? '#d35400' : pedido.status === 'EM_PREPARO' ? '#27ae60' : '#2980b9' }}>
                            {pedido.status === 'SOLICITADO' ? '⏳ Enviado à Cozinha' : pedido.status === 'EM_PREPARO' ? '🍳 Em Preparo' : '✅ Pronto / A Caminho!'}
                          </span>
                        </div>

                        {pedido.status === 'SOLICITADO' && (
                          <button 
                            onClick={() => cancelarPedido(pedido.id)}
                            style={{ padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                          >
                            ❌ Cancelar
                          </button>
                        )}
                      </div>
                    ))}
                  {pedidosCozinha.filter((p: any) => p.status !== 'ENTREGUE' && p.status !== 'CANCELADO').length === 0 && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f8c8d', textAlign: 'center' }}>Nenhum pedido em andamento no momento.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BARRA DE PESQUISA E BOTÕES DE CATEGORIA */}
          <div style={{ maxWidth: '750px', margin: '0 auto 2rem auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text"
              placeholder="🔍 Pesquisar prato, petisco ou bebida..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #bce0fd', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {['TODOS', 'Prato Principal', 'Petiscos', 'Bebidas', 'Sobremesas'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: categoriaFiltro === cat ? 'none' : '1px solid #bce0fd',
                    backgroundColor: categoriaFiltro === cat ? '#e67e22' : 'white',
                    color: categoriaFiltro === cat ? 'white' : '#1a365d',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    transition: '0.2s'
                  }}
                >
                  {cat === 'TODOS' ? '✨ Todos os Itens' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA DE PRODUTOS FILTRADOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {produtos
              .filter((p: any) => {
                // Função para normalizar texto (remove acentos e converte para minúsculas)
                const normalizar = (texto: string) => 
                  texto ? texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

                const nomeProduto = normalizar(p.nome);
                const textoBusca = normalizar(termoBusca);

                const matchTexto = nomeProduto.includes(textoBusca);
                const matchCategoria = categoriaFiltro === 'TODOS' || p.categoria === categoriaFiltro;
                
                return matchTexto && matchCategoria;
              })
              .map(p => (
                <div key={p.id} style={{ border: '1px solid #fce4c8', padding: '1.5rem', borderRadius: '16px', backgroundColor: '#fffcf7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, color: '#1a365d' }}>{p.nome}</h3>
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#fdebd0', color: '#d35400', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {p.categoria || 'Geral'}
                      </span>
                    </div>
                    <p style={{ color: '#e67e22', fontWeight: 'bold', fontSize: '1.2rem', margin: '0 0 15px 0' }}>{formatarMoeda(p.preco)}</p>
                  </div>
                  <button 
                    onClick={() => pedirComoHospede(p.id)}
                    style={{ width: '100%', padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <ShoppingBag size={18} /> Pedir para o Chalé
                  </button>
                </div>
              ))}
            
            {produtos.length === 0 && (
              <p style={{ textAlign: 'center', color: '#95a5a6', gridColumn: '1 / -1' }}>O cardápio está sendo atualizado pela cozinha. Volte em instantes!</p>
            )}
          </div>
        </div>
      )}
      
      {abaAtiva === 'caixa' && (
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#1a365d' }}>💰 Controle de Caixa</h2>
          <p style={{ color: '#0077b6', marginBottom: '2rem' }}>Acompanhe o fluxo financeiro da pousada.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', borderLeft: '6px solid #2ecc71', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
              <h3 style={{ margin: 0, color: '#0077b6', fontSize: '1rem', fontWeight: 'bold' }}>Entradas do Dia</h3>
              <h2 style={{ fontSize: '2rem', margin: '10px 0 0 0', color: '#2ecc71' }}>{formatarMoeda(totalEntradas)}</h2>
            </div>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', borderLeft: '6px solid #e74c3c', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
              <h3 style={{ margin: 0, color: '#0077b6', fontSize: '1rem', fontWeight: 'bold' }}>Saídas do Dia</h3>
              <h2 style={{ fontSize: '2rem', margin: '10px 0 0 0', color: '#e74c3c' }}>{formatarMoeda(totalSaidas)}</h2>
            </div>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', borderLeft: '6px solid #f39c12', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
              <h3 style={{ margin: 0, color: '#0077b6', fontSize: '1rem', fontWeight: 'bold' }}>Saldo Real</h3>
              <h2 style={{ fontSize: '2rem', margin: '10px 0 0 0', color: '#1a365d' }}>{formatarMoeda(saldoReal)}</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
              <h3 style={{ marginTop: 0, color: '#1a365d' }}>Nova Transação</h3>
              <form onSubmit={registrarTransacao} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select value={tipoTransacao} onChange={e => setTipoTransacao(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }}><option value="ENTRADA">Entrada (+)</option><option value="SAIDA">Saída (-)</option></select>
                <input value={descricaoTransacao} onChange={e => setDescricaoTransacao(e.target.value)} required type="text" placeholder="Descrição (Ex: Day Use Piscina)" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }} />
                <input value={valorTransacao} onChange={e => setValorTransacao(e.target.value)} required type="number" step="0.01" placeholder="Valor (R$)" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }} />
                <select value={metodoPagamento} onChange={e => setMetodoPagamento(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bce0fd', outline: 'none' }}><option value="PIX">PIX</option><option value="CARTAO_CREDITO">Cartão de Crédito</option><option value="CARTAO_DEBITO">Cartão de Débito</option><option value="DINHEIRO">Dinheiro Físico</option></select>
                <button type="submit" style={{ padding: '14px', backgroundColor: '#1a365d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Registrar no Caixa</button>
              </form>
            </div>
            <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
              <h3 style={{ marginTop: 0, color: '#1a365d' }}>Histórico do Dia</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {transacoes.map(t => (
                  <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', padding: '12px 0' }}>
                    <div><strong style={{ color: '#1a365d' }}>{t.descricao}</strong><br/><small style={{ color: '#0077b6' }}>{t.metodoPagamento} | {new Date(t.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></div>
                    <strong style={{ color: t.tipo === 'ENTRADA' ? '#2ecc71' : '#e74c3c', fontSize: '1.1rem' }}>{t.tipo === 'ENTRADA' ? '+' : '-'} {formatarMoeda(t.valor)}</strong>
                  </li>
                ))}
                {transacoes.length === 0 && <p style={{ color: '#95a5a6' }}>Nenhuma transação registrada ainda.</p>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}