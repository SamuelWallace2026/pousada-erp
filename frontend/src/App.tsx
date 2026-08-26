import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, BedDouble, UserPlus, List, DoorOpen, CalendarCheck, Activity, Key, Lock, Utensils } from 'lucide-react';
import { gerarReciboPdf, type MockReserva, type MockConsumo } from './utils/gerarReciboPdf'; 

interface Hospede { id: string; nome: string; cpf: string; email: string; telefone: string; }
interface Quarto { id: string; numero: string; capacidade: number; valorDiaria: number; status: string; categoria: string; }
interface Reserva { id: string; dataCheckIn: string; dataCheckOut: string; status: string; origem: string; hospede: Hospede; quarto: Quarto; consumos?: any[]; }
interface Produto { id: string; nome: string; preco: number; estoque: number; }
interface Transacao { id: string; tipo: string; valor: number; metodoPagamento: string; descricao: string; criadoEm: string; }

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');

  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'hospedes' | 'quartos' | 'reservas' | 'restaurante' | 'caixa'>('dashboard');
  
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  
  const [nome, setNome] = useState(''); const [cpf, setCpf] = useState(''); 
  const [email, setEmail] = useState(''); const [telefone, setTelefone] = useState('');
  
  const [numero, setNumero] = useState(''); const [capacidade, setCapacidade] = useState(''); 
  const [valorDiaria, setValorDiaria] = useState(''); 
  const [categoria, setCategoria] = useState('Chalé Luxo Casal'); 
  
  const [hospedeId, setHospedeId] = useState(''); const [quartoId, setQuartoId] = useState(''); 
  const [dataCheckIn, setDataCheckIn] = useState(''); const [dataCheckOut, setDataCheckOut] = useState('');
  const [origem, setOrigem] = useState('WhatsApp'); 

  // Estados do Restaurante
  const [prodNome, setProdNome] = useState('');
  const [prodPreco, setProdPreco] = useState('');
  const [prodEstoque, setProdEstoque] = useState('');
  const [reservaConsumoId, setReservaConsumoId] = useState('');
  const [produtoConsumoId, setProdutoConsumoId] = useState('');
  const [qtdConsumo, setQtdConsumo] = useState('1');

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
      if (abaAtiva === 'restaurante') { buscarProdutos(); buscarReservas(); }
      if (abaAtiva === 'caixa') buscarTransacoes();
      if (abaAtiva === 'dashboard') { buscarHospedes(); buscarQuartos(); buscarReservas(); }
    }
  }, [abaAtiva, autenticado]);

  const mascaraCPF = (valor: string) => valor.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const mascaraTelefone = (valor: string) => valor.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaInput === 'refugio123') setAutenticado(true);
    else { alert('Senha incorreta! Tente novamente.'); setSenhaInput(''); }
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
      await axios.post('http://localhost:3333/api/produtos', { nome: prodNome, preco: Number(prodPreco), estoque: Number(prodEstoque) });
      alert('Item adicionado ao cardápio do Restaurante Dengo!');
      setProdNome(''); setProdPreco(''); setProdEstoque('');
      buscarProdutos();
    } catch (error) { alert('Erro ao cadastrar produto.'); }
  };

  const lancarConsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3333/api/consumos', { reservaId: reservaConsumoId, produtoId: produtoConsumoId, quantidade: Number(qtdConsumo) });
      alert('Consumo lançado na conta do hóspede com sucesso! 🍹');
      setReservaConsumoId(''); setProdutoConsumoId(''); setQtdConsumo('1');
    } catch (error) { alert('Erro ao lançar consumo.'); }
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

    // Converte os consumos do banco para o formato do recibo (CORRIGIDO)
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundImage: `linear-gradient(rgba(0, 50, 100, 0.4), rgba(0, 50, 100, 0.7)), url('/fundo-login.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', width: '100%', maxWidth: '400px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', borderRadius: '50%', background: 'linear-gradient(45deg, #f1c40f, #e67e22)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(241, 196, 15, 0.4)' }}><span style={{ fontSize: '40px' }}>🌅</span></div>
          <h1 style={{ color: '#1a365d', margin: '0 0 5px 0', fontSize: '1.8rem' }}>Refúgio Dourado</h1>
          <p style={{ color: '#0077b6', margin: '0 0 2rem 0', fontWeight: '500' }}>Acesso Restrito à Equipe</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ position: 'relative' }}><Lock size={20} color="#0077b6" style={{ position: 'absolute', top: '14px', left: '15px' }} /><input type="password" placeholder="Digite a senha de acesso" value={senhaInput} onChange={(e) => setSenhaInput(e.target.value)} required style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: '2px solid #bce0fd', outline: 'none', fontSize: '1rem', color: '#1a365d', boxSizing: 'border-box' }}/></div>
            <button type="submit" style={{ padding: '14px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', transition: '0.3s', boxShadow: '0 4px 12px rgba(243,156,18,0.3)' }}>Entrar no Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #e0fbfc 0%, #ffffff 50%, #fdfbf7 100%)' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '65px', height: '65px', borderRadius: '50%', background: 'linear-gradient(45deg, #f1c40f, #e67e22)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(241, 196, 15, 0.4)' }}><span style={{ fontSize: '32px' }}>🌅</span></div>
          <div><h1 style={{ margin: 0, color: '#1a365d', letterSpacing: '1px', fontSize: '2.2rem' }}>Pousada Refúgio Dourado</h1><p style={{ margin: 0, color: '#0077b6', fontWeight: '500', fontSize: '1.1rem', letterSpacing: '0.5px' }}>Painel de Gestão Integrada</p></div>
        </div>
        <button onClick={() => { setAutenticado(false); setSenhaInput(''); }} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Sair</button>
      </div>

      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '2px solid rgba(0, 119, 182, 0.15)', paddingBottom: '1.5rem', overflowX: 'auto' }}>
        <button onClick={() => setAbaAtiva('dashboard')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'dashboard' ? '#0077b6' : 'transparent', color: abaAtiva === 'dashboard' ? 'white' : '#1a365d', border: abaAtiva === 'dashboard' ? 'none' : '1px solid #0077b6', borderRadius: '30px', fontWeight: 'bold' }}>📊 Dashboard</button>
        <button onClick={() => setAbaAtiva('hospedes')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'hospedes' ? '#0077b6' : 'transparent', color: abaAtiva === 'hospedes' ? 'white' : '#1a365d', border: abaAtiva === 'hospedes' ? 'none' : '1px solid #0077b6', borderRadius: '30px', fontWeight: 'bold' }}>👥 Hóspedes</button>
        <button onClick={() => setAbaAtiva('quartos')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'quartos' ? '#0077b6' : 'transparent', color: abaAtiva === 'quartos' ? 'white' : '#1a365d', border: abaAtiva === 'quartos' ? 'none' : '1px solid #0077b6', borderRadius: '30px', fontWeight: 'bold' }}>🚪 Quartos / Chalés</button>
        <button onClick={() => setAbaAtiva('reservas')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'reservas' ? '#0077b6' : 'transparent', color: abaAtiva === 'reservas' ? 'white' : '#1a365d', border: abaAtiva === 'reservas' ? 'none' : '1px solid #0077b6', borderRadius: '30px', fontWeight: 'bold' }}>📅 Reservas</button>
        <button onClick={() => setAbaAtiva('restaurante')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'restaurante' ? '#e67e22' : 'transparent', color: abaAtiva === 'restaurante' ? 'white' : '#d35400', border: abaAtiva === 'restaurante' ? 'none' : '1px solid #e67e22', borderRadius: '30px', fontWeight: 'bold' }}>🍔 Restaurante Dengo</button>
        <button onClick={() => setAbaAtiva('caixa')} style={{ padding: '10px 22px', cursor: 'pointer', backgroundColor: abaAtiva === 'caixa' ? '#f39c12' : 'transparent', color: abaAtiva === 'caixa' ? 'white' : '#d35400', border: abaAtiva === 'caixa' ? 'none' : '1px solid #f39c12', borderRadius: '30px', fontWeight: 'bold' }}>💰 Caixa</button>
      </nav>

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
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {quartos.map(q => (
                <li key={q.id} style={{ border: '1px solid #edf2f7', padding: '1.2rem', borderRadius: '12px', backgroundColor: q.status === 'LIVRE' ? '#fff' : '#fdf3e7' }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#1a365d' }}>{q.numero}</h3>
                  <span style={{ display: 'inline-block', backgroundColor: '#e0fbfc', color: '#0077b6', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>{q.categoria}</span>
                  <p style={{ margin: '4px 0', color: '#0077b6' }}>Diária: R$ {q.valorDiaria} | Cap: {q.capacidade} pess.</p>
                  <p style={{ margin: '4px 0', fontWeight: 'bold', color: q.status === 'LIVRE' ? '#2ecc71' : '#e74c3c' }}>Status: {q.status}</p>
                </li>
              ))}
            </ul>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#e67e22' }}><Utensils size={24} color="#e67e22" /> Cadastrar no Cardápio</h2>
            <form onSubmit={cadastrarProduto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <input required placeholder="Nome do Prato/Bebida (Ex: Peixe Frito)" value={prodNome} onChange={e => setProdNome(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #f9d5a7', outline: 'none' }} />
              <input required type="number" step="0.01" placeholder="Preço (R$)" value={prodPreco} onChange={e => setProdPreco(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #f9d5a7', outline: 'none' }} />
              <input required type="number" placeholder="Estoque Inicial" value={prodEstoque} onChange={e => setProdEstoque(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #f9d5a7', outline: 'none' }} />
              <button type="submit" style={{ padding: '14px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Item</button>
            </form>

            <h3 style={{ marginTop: '2rem', color: '#1a365d' }}>Cardápio Atual</h3>
            <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
              {produtos.map(p => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', padding: '10px 0' }}>
                  <span><strong>{p.nome}</strong> (Estoque: {p.estoque})</span>
                  <span style={{ color: '#e67e22', fontWeight: 'bold' }}>{formatarMoeda(p.preco)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#e67e22' }}>🍹 Lançar na Conta do Quarto</h2>
            <form onSubmit={lancarConsumo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <label style={{ fontSize: '14px', color: '#d35400', fontWeight: 'bold' }}>Selecione o Hóspede / Quarto Ativo</label>
              <select required value={reservaConsumoId} onChange={e => setReservaConsumoId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #f9d5a7', outline: 'none' }}>
                <option value="">Escolha a reserva...</option>
                {reservas.filter(r => r.status === 'CONFIRMADA').map(r => (
                  <option key={r.id} value={r.id}>{r.hospede.nome} - Chalé {r.quarto.numero} ({r.quarto.categoria})</option>
                ))}
              </select>

              <label style={{ fontSize: '14px', color: '#d35400', fontWeight: 'bold' }}>Selecione o Item do Cardápio</label>
              <select required value={produtoConsumoId} onChange={e => setProdutoConsumoId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #f9d5a7', outline: 'none' }}>
                <option value="">Escolha o produto...</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} - {formatarMoeda(p.preco)}</option>
                ))}
              </select>

              <label style={{ fontSize: '14px', color: '#d35400', fontWeight: 'bold' }}>Quantidade</label>
              <input required type="number" min="1" value={qtdConsumo} onChange={e => setQtdConsumo(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #f9d5a7', outline: 'none' }} />

              <button type="submit" style={{ padding: '14px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Lançar Consumo</button>
            </form>
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