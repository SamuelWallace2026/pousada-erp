import React, { useState } from 'react';
import { api } from '../services/api';

interface ReservasProps {
  reservas: any[];
  hospedes: any[];
  quartos: any[];
  buscarReservas: () => void;
  buscarQuartos: () => void;
  fazerCheckout: (id: string) => void;
  emitirRecibo: (reserva: any) => void;
  enviarWhatsApp: (reserva: any) => void;
}

export default function Reservas({ 
  reservas, hospedes, quartos, buscarReservas, buscarQuartos, 
  fazerCheckout, emitirRecibo, enviarWhatsApp 
}: ReservasProps) {
  
  // Estados locais do formulário de reservas
  const [hospedeId, setHospedeId] = useState('');
  const [quartoId, setQuartoId] = useState('');
  const [dataCheckIn, setDataCheckIn] = useState('');
  const [dataCheckOut, setDataCheckOut] = useState('');
  const [origem, setOrigem] = useState('WhatsApp');

  const cadastrarReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reservas', { 
        hospedeId, quartoId, dataCheckIn, dataCheckOut, origem 
      });
      alert('Reserva confirmada com sucesso!');
      setHospedeId(''); setQuartoId(''); setDataCheckIn(''); setDataCheckOut(''); setOrigem('WhatsApp');
      buscarReservas();
      buscarQuartos(); // Atualiza o status do quarto para OCUPADO
    } catch (error) {
      alert('Erro ao criar reserva.');
    }
  };

  return (
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
  );
}