import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, BedDouble, UserPlus, List, DoorOpen, CalendarCheck, Activity, Key } from 'lucide-react';

interface Hospede { id: string; nome: string; cpf: string; email: string; telefone: string; }
interface Quarto { id: string; numero: string; capacidade: number; valorDiaria: number; status: string; }
interface Reserva { id: string; dataCheckIn: string; dataCheckOut: string; status: string; hospede: Hospede; quarto: Quarto; }

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'hospedes' | 'quartos' | 'reservas'>('dashboard');
  
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  
  const [nome, setNome] = useState(''); 
  const [cpf, setCpf] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [telefone, setTelefone] = useState('');
  
  const [numero, setNumero] = useState(''); 
  const [capacidade, setCapacidade] = useState(''); 
  const [valorDiaria, setValorDiaria] = useState('');
  
  const [hospedeId, setHospedeId] = useState(''); 
  const [quartoId, setQuartoId] = useState(''); 
  const [dataCheckIn, setDataCheckIn] = useState(''); 
  const [dataCheckOut, setDataCheckOut] = useState('');

  const buscarHospedes = () => axios.get('http://localhost:3333/api/hospedes').then(res => setHospedes(res.data));
  const buscarQuartos = () => axios.get('http://localhost:3333/api/quartos').then(res => setQuartos(res.data));
  const buscarReservas = () => axios.get('http://localhost:3333/api/reservas').then(res => setReservas(res.data));

  useEffect(() => {
    if (abaAtiva === 'hospedes') buscarHospedes();
    if (abaAtiva === 'quartos') buscarQuartos();
    if (abaAtiva === 'reservas') { buscarHospedes(); buscarQuartos(); buscarReservas(); }
    if (abaAtiva === 'dashboard') { buscarHospedes(); buscarQuartos(); buscarReservas(); }
  }, [abaAtiva]);

  // ==========================================
  // 🎭 FUNÇÕES DE MÁSCARA (Formatação)
  // ==========================================
  const mascaraCPF = (valor: string) => {
    return valor
      .replace(/\D/g, '') // Tira tudo que não é número
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1'); // Limita o tamanho
  };

  const mascaraTelefone = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  // ==========================================
  // FUNÇÕES DE CADASTRO
  // ==========================================
  const cadastrarHospede = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('http://localhost:3333/api/hospedes', { nome, cpf, email, telefone });
    alert('Hóspede salvo!'); setNome(''); setCpf(''); setEmail(''); setTelefone(''); buscarHospedes();
  };

  const cadastrarQuarto = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('http://localhost:3333/api/quartos', { numero, capacidade: Number(capacidade), valorDiaria: Number(valorDiaria) });
    alert('Quarto salvo!'); setNumero(''); setCapacidade(''); setValorDiaria(''); buscarQuartos();
  };

  const cadastrarReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3333/api/reservas', { hospedeId, quartoId, dataCheckIn, dataCheckOut });
      alert('Reserva confirmada!'); setHospedeId(''); setQuartoId(''); setDataCheckIn(''); setDataCheckOut('');
      buscarReservas(); buscarQuartos();
    } catch (error) { alert('Erro ao criar reserva.'); }
  };

  const fazerCheckout = async (reservaId: string) => {
    if (!window.confirm('Deseja realmente finalizar esta reserva e liberar o quarto?')) return;
    try {
      await axios.put(`http://localhost:3333/api/reservas/${reservaId}/checkout`);
      alert('Check-out realizado com sucesso! O quarto está livre novamente.');
      buscarReservas(); buscarQuartos();
    } catch (error) { alert('Erro ao fazer o check-out.'); }
  };

  const totalQuartos = quartos.length;
  const quartosOcupados = quartos.filter(q => q.status !== 'LIVRE').length;
  const taxaOcupacao = totalQuartos === 0 ? 0 : Math.round((quartosOcupados / totalQuartos) * 100);
  const reservasAtivas = reservas.filter(r => r.status !== 'CONCLUÍDA').length;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #ddd', paddingBottom: '1rem' }}>
        <button onClick={() => setAbaAtiva('dashboard')} style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: abaAtiva === 'dashboard' ? '#0066cc' : '#fff', color: abaAtiva === 'dashboard' ? 'white' : '#333', border: '1px solid #ccc', borderRadius: '4px', fontWeight: 'bold', transition: '0.2s' }}>📊 Dashboard</button>
        <button onClick={() => setAbaAtiva('hospedes')} style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: abaAtiva === 'hospedes' ? '#0066cc' : '#fff', color: abaAtiva === 'hospedes' ? 'white' : '#333', border: '1px solid #ccc', borderRadius: '4px', fontWeight: 'bold', transition: '0.2s' }}>👥 Hóspedes</button>
        <button onClick={() => setAbaAtiva('quartos')} style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: abaAtiva === 'quartos' ? '#0066cc' : '#fff', color: abaAtiva === 'quartos' ? 'white' : '#333', border: '1px solid #ccc', borderRadius: '4px', fontWeight: 'bold', transition: '0.2s' }}>🚪 Quartos</button>
        <button onClick={() => setAbaAtiva('reservas')} style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: abaAtiva === 'reservas' ? '#0066cc' : '#fff', color: abaAtiva === 'reservas' ? 'white' : '#333', border: '1px solid #ccc', borderRadius: '4px', fontWeight: 'bold', transition: '0.2s' }}>📅 Reservas</button>
      </nav>

      {abaAtiva === 'dashboard' && (
        <div>
          <h1 style={{ color: '#2c3e50', marginTop: 0 }}>Dashboard da Pousada</h1>
          <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>Resumo em tempo real da operação.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div style={{ border: '1px solid #e1e8ed', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff', borderLeft: '6px solid #3498db', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#7f8c8d', fontSize: '1rem', fontWeight: 'normal' }}><Activity size={20} /> Taxa de Ocupação</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0 0 0', color: '#2c3e50' }}>{taxaOcupacao}%</h2>
            </div>
            <div style={{ border: '1px solid #e1e8ed', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff', borderLeft: '6px solid #e74c3c', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#7f8c8d', fontSize: '1rem', fontWeight: 'normal' }}><Key size={20} /> Quartos Ocupados</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0 0 0', color: '#2c3e50' }}>{quartosOcupados} <span style={{ fontSize: '1.2rem', color: '#bdc3c7' }}>/ {totalQuartos}</span></h2>
            </div>
            <div style={{ border: '1px solid #e1e8ed', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff', borderLeft: '6px solid #9b59b6', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#7f8c8d', fontSize: '1rem', fontWeight: 'normal' }}><CalendarCheck size={20} /> Reservas Ativas</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0 0 0', color: '#2c3e50' }}>{reservasAtivas}</h2>
            </div>
            <div style={{ border: '1px solid #e1e8ed', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff', borderLeft: '6px solid #2ecc71', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#7f8c8d', fontSize: '1rem', fontWeight: 'normal' }}><Users size={20} /> Total de Hóspedes</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0 0 0', color: '#2c3e50' }}>{hospedes.length}</h2>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'hospedes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div style={{ border: '1px solid #e1e8ed', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#2c3e50' }}><UserPlus size={24} /> Novo Hóspede</h2>
            <form onSubmit={cadastrarHospede} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <input required placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none' }} />
              
              {/* O segredo da máscara está no onChange do CPF e Telefone! */}
              <input required placeholder="CPF (Apenas números)" value={cpf} onChange={e => setCpf(mascaraCPF(e.target.value))} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none' }} />
              
              <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none' }} />
              
              <input required placeholder="Telefone" value={telefone} onChange={e => setTelefone(mascaraTelefone(e.target.value))} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none' }} />
              
              <button type="submit" style={{ padding: '14px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>Salvar Hóspede</button>
            </form>
          </div>
          <div style={{ border: '1px solid #e1e8ed', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#2c3e50' }}><List size={24} /> Hóspedes Cadastrados</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {hospedes.map(h => (
                <li key={h.id} style={{ borderBottom: '1px solid #f1f2f6', padding: '16px 0' }}><strong style={{ fontSize: '1.1rem', color: '#2c3e50' }}>{h.nome}</strong><br/><small style={{ color: '#7f8c8d' }}>CPF: {h.cpf} | Tel: {h.telefone}</small></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {abaAtiva === 'quartos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div style={{ border: '1px solid #e1e8ed', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#2c3e50' }}><DoorOpen size={24} /> Novo Quarto</h2>
            <form onSubmit={cadastrarQuarto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <input required placeholder="Número do Quarto" value={numero} onChange={e => setNumero(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none' }} />
              <input required type="number" placeholder="Capacidade" value={capacidade} onChange={e => setCapacidade(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none' }} />
              <input required type="number" placeholder="Valor Diária (R$)" value={valorDiaria} onChange={e => setValorDiaria(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none' }} />
              <button type="submit" style={{ padding: '14px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>Salvar Quarto</button>
            </form>
          </div>
          <div style={{ border: '1px solid #e1e8ed', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#2c3e50' }}><BedDouble size={24} /> Quartos Cadastrados</h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {quartos.map(q => (
                <li key={q.id} style={{ border: '1px solid #f1f2f6', padding: '1.2rem', borderRadius: '8px', backgroundColor: q.status === 'LIVRE' ? '#fff' : '#fff9e6' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Quarto {q.numero}</h3>
                  <p style={{ margin: '4px 0', color: '#7f8c8d' }}>Diária: R$ {q.valorDiaria} | Cap: {q.capacidade} pess.</p>
                  <p style={{ margin: '4px 0', fontWeight: 'bold', color: q.status === 'LIVRE' ? '#27ae60' : '#e74c3c' }}>Status: {q.status}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {abaAtiva === 'reservas' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div style={{ border: '1px solid #e1e8ed', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#2c3e50' }}><CalendarCheck size={24} /> Nova Reserva</h2>
            <form onSubmit={cadastrarReserva} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <select required value={hospedeId} onChange={e => setHospedeId(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none' }}>
                <option value="">Selecione um Hóspede...</option>
                {hospedes.map(h => <option key={h.id} value={h.id}>{h.nome} ({h.cpf})</option>)}
              </select>
              <select required value={quartoId} onChange={e => setQuartoId(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', outline: 'none' }}>
                <option value="">Selecione um Quarto Livre...</option>
                {quartos.filter(q => q.status === 'LIVRE').map(q => <option key={q.id} value={q.id}>Quarto {q.numero} (Diária: R${q.valorDiaria})</option>)}
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px', display: 'block' }}>Check-in</label><input required type="date" value={dataCheckIn} onChange={e => setDataCheckIn(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', width: '100%', boxSizing: 'border-box', outline: 'none' }} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px', display: 'block' }}>Check-out</label><input required type="date" value={dataCheckOut} onChange={e => setDataCheckOut(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', width: '100%', boxSizing: 'border-box', outline: 'none' }} /></div>
              </div>
              <button type="submit" style={{ padding: '14px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>Confirmar Reserva</button>
            </form>
          </div>

          <div style={{ border: '1px solid #e1e8ed', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#2c3e50' }}><List size={24} /> Histórico de Reservas</h2>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1.5rem' }}>
              {reservas.map(r => (
                <li key={r.id} style={{ border: '1px solid #f1f2f6', padding: '1.2rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: r.status === 'CONCLUÍDA' ? '#f8f9fa' : '#fff' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Quarto {r.quarto.numero} - {r.hospede.nome}</h3>
                  <p style={{ margin: '4px 0', color: '#7f8c8d' }}>Entrada: {new Date(r.dataCheckIn).toLocaleDateString('pt-BR')} | Saída: {new Date(r.dataCheckOut).toLocaleDateString('pt-BR')}</p>
                  <p style={{ margin: '4px 0', fontWeight: 'bold', color: r.status === 'CONCLUÍDA' ? '#bdc3c7' : '#3498db' }}>Status: {r.status}</p>
                  {r.status !== 'CONCLUÍDA' && (
                    <button onClick={() => fazerCheckout(r.id)} style={{ marginTop: '15px', padding: '10px 14px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Fazer Check-out</button>
                  )}
                </li>
              ))}
              {reservas.length === 0 && <p style={{ color: '#7f8c8d' }}>Nenhuma reserva registrada.</p>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}