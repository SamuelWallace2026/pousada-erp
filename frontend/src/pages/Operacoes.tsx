import { useState } from 'react';
import { Brush, Clock, CheckCircle2, AlertCircle, BedDouble, Users, Play, Check } from 'lucide-react';

interface OperacoesProps {
  tarefasLimpeza: any[];
  chamados: any[];
  atualizarStatusLimpeza: (id: string, status: string) => void;
  atualizarStatusReparo: (id: string, status: string) => void;
}

export default function Operacoes({ tarefasLimpeza, chamados, atualizarStatusLimpeza, atualizarStatusReparo }: OperacoesProps) {
  // Estes estados agora vivem só aqui! O App.tsx nem precisa saber deles.
  const [abaOperacoes, setAbaOperacoes] = useState<'limpeza' | 'reparos'>('limpeza');
  const [filtroLimpeza, setFiltroLimpeza] = useState<'todos' | 'urgentes'>('todos');
  const [filtroReparos, setFiltroReparos] = useState<'pendentes' | 'concluidos'>('pendentes');

  return (
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
  );
}