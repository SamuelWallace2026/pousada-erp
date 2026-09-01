import { Activity, BedDouble, CalendarCheck, Users } from 'lucide-react';

interface DashboardProps {
  taxaOcupacao: number;
  quartosOcupados: number;
  totalQuartos: number;
  reservasAtivas: number;
  hospedes: any[];
  reservas: any[];
  setAbaAtiva: (aba: any) => void;
  fazerCheckout: (id: string) => void;
}

export default function Dashboard({ 
  taxaOcupacao, quartosOcupados, totalQuartos, reservasAtivas, 
  hospedes, reservas, setAbaAtiva, fazerCheckout 
}: DashboardProps) {
  
  return (
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
  );
}