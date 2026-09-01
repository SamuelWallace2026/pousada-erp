import { RefreshCw, Users, Clock } from 'lucide-react';

interface MensagensProps {
  mensagens: any[];
  buscarMensagens: () => void;
  marcarMensagemLida: (id: string) => void;
}

export default function Mensagens({ mensagens, buscarMensagens, marcarMensagemLida }: MensagensProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
         <div>
            <h1 className="font-headline-lg text-3xl text-on-surface mb-1">Caixa de Mensagens</h1>
            <p className="text-secondary font-body-md">Central de atendimento e solicitações dos hóspedes.</p>
         </div>
         <button onClick={buscarMensagens} className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg text-primary font-bold text-sm hover:bg-surface-container-high transition-colors cursor-pointer shadow-sm">
           <RefreshCw size={16} /> Atualizar
         </button>
      </div>

      <div className="flex flex-col gap-4 max-w-4xl">
         {mensagens.map((msg: any) => (
            <div key={msg.id} className={`p-5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${msg.lida ? 'bg-surface opacity-70 border-surface-container' : 'bg-white border-primary/40 shadow-sm'}`}>
               <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                     <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                       <Users size={14} className="text-secondary"/> {msg.remetente}
                     </h4>
                     {!msg.lida && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-container text-primary-fixed-variant uppercase tracking-wider">Nova</span>}
                     <span className="text-xs text-secondary ml-auto md:ml-2 flex items-center gap-1">
                       <Clock size={12}/> {new Date(msg.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
                  <p className={`text-sm ${msg.lida ? 'text-secondary' : 'text-on-surface font-medium'}`}>{msg.conteudo}</p>
               </div>
               {!msg.lida && (
                  <button onClick={() => marcarMensagemLida(msg.id)} className="w-full md:w-auto px-4 py-2 bg-on-surface text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer whitespace-nowrap shadow-sm">
                     Marcar como Lida
                  </button>
               )}
            </div>
         ))}
         {mensagens.length === 0 && (
            <p className="text-secondary text-center py-10">Nenhuma mensagem na caixa de entrada. Tudo tranquilo! ✨</p>
         )}
      </div>
    </div>
  );
}