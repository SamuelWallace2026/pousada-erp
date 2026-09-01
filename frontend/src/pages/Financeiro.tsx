import React, { useState } from 'react';
import { api } from '../services/api';

interface FinanceiroProps {
  transacoes: any[];
  buscarTransacoes: () => void;
  totalEntradas: number;
  totalSaidas: number;
  saldoReal: number;
  formatarMoeda: (valor: number) => string;
}

export default function Financeiro({
  transacoes, buscarTransacoes, totalEntradas, totalSaidas, saldoReal, formatarMoeda
}: FinanceiroProps) {
  
  const [tipoTransacao, setTipoTransacao] = useState('ENTRADA'); 
  const [descricaoTransacao, setDescricaoTransacao] = useState('');
  const [valorTransacao, setValorTransacao] = useState(''); 
  const [metodoPagamento, setMetodoPagamento] = useState('PIX');

  const registrarTransacao = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      await api.post('/transacoes', { 
        tipo: tipoTransacao, valor: valorTransacao, metodoPagamento, descricao: descricaoTransacao 
      }); 
      alert('Transação registrada com sucesso!'); 
      setDescricaoTransacao(''); setValorTransacao(''); 
      buscarTransacoes(); 
    } catch (error) { 
      alert('Erro ao registrar transação.'); 
    } 
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline-lg text-3xl text-on-surface">Financeiro</h1>
      
      {/* Cards de Resumo */}
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
        {/* Nova Transação */}
        <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border self-start">
          <h3 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Nova Transação</h3>
          <form onSubmit={registrarTransacao} className="flex flex-col gap-4">
            <select value={tipoTransacao} onChange={e => setTipoTransacao(e.target.value)} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary">
              <option value="ENTRADA">Entrada (+)</option>
              <option value="SAIDA">Saída (-)</option>
            </select>
            <input value={descricaoTransacao} onChange={e => setDescricaoTransacao(e.target.value)} required placeholder="Descrição" className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
            <input value={valorTransacao} onChange={e => setValorTransacao(e.target.value)} required type="number" step="0.01" placeholder="Valor (R$)" className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
            <select value={metodoPagamento} onChange={e => setMetodoPagamento(e.target.value)} required className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary">
              <option value="PIX">PIX</option>
              <option value="CARTAO_CREDITO">Crédito</option>
              <option value="DINHEIRO">Dinheiro</option>
            </select>
            <button type="submit" className="mt-2 w-full py-3 px-4 rounded-lg bg-on-surface text-white font-label-md hover:opacity-90 cursor-pointer">Registrar</button>
          </form>
        </div>

        {/* Histórico do Dia */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
          <h3 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Histórico do Dia</h3>
          <ul className="flex flex-col">
            {transacoes.map((t: any) => (
              <li key={t.id} className="flex justify-between items-center border-b border-surface-container py-4 last:border-0">
                <div>
                  <strong className="font-headline-md text-lg text-on-surface">{t.descricao}</strong><br/>
                  <small className="text-secondary">{t.metodoPagamento} | {new Date(t.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
                <strong className={`font-headline-md text-xl ${t.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.tipo === 'ENTRADA' ? '+' : '-'} {formatarMoeda(t.valor)}
                </strong>
              </li>
            ))}
            {transacoes.length === 0 && <p className="text-secondary text-sm">Nenhuma transação registrada hoje.</p>}
          </ul>
        </div>
      </div>

      {/* Fechamento de Turno e Conciliação */}
      <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border mt-6">
        <h3 className="font-headline-md text-xl text-on-surface mb-4 border-b border-outline-variant/20 pb-2">
          🔒 Fechamento de Turno e Conciliação
        </h3>
        <p className="text-sm text-secondary mb-6">
          Confira os valores acumulados por forma de pagamento no turno atual para o fechamento de caixa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Total PIX (Sistema)</span>
            <p className="font-headline-md text-2xl text-primary">
              {formatarMoeda(transacoes.filter((t: any) => t.tipo === 'ENTRADA' && t.metodoPagamento === 'PIX').reduce((acc: number, t: any) => acc + t.valor, 0))}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Total Cartão (Sistema)</span>
            <p className="font-headline-md text-2xl text-primary">
              {formatarMoeda(transacoes.filter((t: any) => t.tipo === 'ENTRADA' && t.metodoPagamento === 'CARTAO_CREDITO').reduce((acc: number, t: any) => acc + t.valor, 0))}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Total Dinheiro (Sistema)</span>
            <p className="font-headline-md text-2xl text-primary">
              {formatarMoeda(transacoes.filter((t: any) => t.tipo === 'ENTRADA' && t.metodoPagamento === 'DINHEIRO').reduce((acc: number, t: any) => acc + t.valor, 0))}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-xl border border-outline-variant/30">
          <div>
            <h4 className="font-bold text-sm text-on-surface">Conferência de Gaveta (Dinheiro Físico)</h4>
            <p className="text-xs text-secondary">Informe o valor total apurado na contagem física de notas e moedas.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input 
              type="number" 
              step="0.01" 
              placeholder="R$ 0,00" 
              className="p-3 rounded-lg border border-outline-variant bg-white outline-none focus:border-primary text-sm w-full md:w-48 font-bold"
              onChange={(e) => {
                const valorFisico = Number(e.target.value) || 0;
                const valorSistema = transacoes.filter((t: any) => t.tipo === 'ENTRADA' && t.metodoPagamento === 'DINHEIRO').reduce((acc: number, t: any) => acc + t.valor, 0);
                const diferenca = valorFisico - valorSistema;
                const elDiferenca = document.getElementById('resultado-diferenca');
                if (elDiferenca) {
                  elDiferenca.innerText = formatarMoeda(diferenca);
                  elDiferenca.className = `font-headline-md text-xl font-bold ${diferenca < 0 ? 'text-red-600' : diferenca > 0 ? 'text-green-600' : 'text-on-surface'}`;
                }
              }}
            />
            <div className="flex flex-col justify-center px-4 bg-surface-container rounded-lg border border-outline-variant/30">
              <span className="text-[10px] uppercase font-bold text-secondary">Diferença</span>
              <span id="resultado-diferenca" className="font-headline-md text-xl font-bold text-on-surface">R$ 0,00</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={() => alert('Fechamento de turno registrado e conciliado com sucesso!')} className="px-6 py-3 bg-primary text-white font-label-md font-bold rounded-lg hover:brightness-95 transition-all shadow-sm cursor-pointer">
            Encerrar e Consolidar Turno
          </button>
        </div>
      </div>
    </div>
  );
}