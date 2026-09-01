import React, { useState } from 'react';
import { RefreshCw, Activity, AlertCircle, Check, Utensils, Clock, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

interface RestauranteProps {
  produtos: any[];
  pedidosCozinha: any[];
  reservasMesas: any[];
  eventosAgenda: any[];
  buscarProdutos: () => void;
  buscarPedidosCozinha: () => void;
  buscarReservasMesas: () => void;
  atualizarStatusPedido: (id: string, status: string) => void;
}

export default function Restaurante({ 
  produtos, pedidosCozinha, reservasMesas, eventosAgenda, 
  buscarProdutos, buscarPedidosCozinha, buscarReservasMesas, atualizarStatusPedido 
}: RestauranteProps) {
  
  // Estados transferidos do App.tsx para cá
  const [abaRestaurante, setAbaRestaurante] = useState<'pedidos' | 'layout'>('pedidos');
  const [prodNome, setProdNome] = useState(''); 
  const [prodPreco, setProdPreco] = useState('');
  const [prodEstoque, setProdEstoque] = useState(''); 
  const [prodCategoria, setProdCategoria] = useState('Prato Principal');
  const [mesaSelecionada, setMesaSelecionada] = useState('');
  const [nomeReservaMesa, setNomeReservaMesa] = useState('');
  const [paxReservaMesa, setPaxReservaMesa] = useState('2');

  const cadastrarProduto = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      await api.post('/produtos', { nome: prodNome, preco: Number(prodPreco), estoque: Number(prodEstoque), categoria: prodCategoria }); 
      alert('Item salvo!'); 
      setProdNome(''); setProdPreco(''); setProdEstoque(''); setProdCategoria('Prato Principal'); 
      buscarProdutos(); 
    } catch (error) { alert('Erro ao cadastrar produto.'); } 
  };

  const reservarMesaRestaurante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaSelecionada) return alert("Por favor, selecione uma mesa clicando no mapa.");
    try {
      await api.post('/restaurante/reservas', { nome: nomeReservaMesa, data: '30/08/2026', hora: '20:30', qtdPessoas: Number(paxReservaMesa), mesa: mesaSelecionada });
      alert(`Mesa ${mesaSelecionada} reservada com sucesso para ${nomeReservaMesa}!`);
      setNomeReservaMesa(''); setMesaSelecionada(''); 
      buscarReservasMesas();
    } catch (err: any) { alert(err.response?.data?.error || 'Erro ao salvar reserva de mesa.'); }
  };

  return (
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

      {abaRestaurante === 'pedidos' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <div className="lg:col-span-1 flex flex-col gap-6 self-start">
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

              <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
                <h3 className="font-headline-md text-lg text-on-surface mb-4 border-b border-outline-variant/20 pb-2">📦 Controle de Estoque (Cozinha)</h3>
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
                </div>
              </div>
            </div>

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
              </div>
            </div>
         </div>
      )}

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
                     <button type="submit" className="mt-2 w-full py-2.5 bg-primary text-white font-label-md font-bold rounded-lg hover:brightness-95 shadow-sm cursor-pointer">Confirmar Reserva</button>
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
                               } else { setMesaSelecionada(num); }
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
  );
}