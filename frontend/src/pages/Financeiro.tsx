import React, { useState } from 'react';
import { api } from '../services/api';
import { Download, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast'; // <-- Importamos o toast aqui!

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
  
  // Guardamos apenas o valor em dinheiro vivo que o operador contou na gaveta
  const [valorGaveta, setValorGaveta] = useState<number>(0);

  const totalPix = transacoes.filter((t: any) => t.tipo === 'ENTRADA' && t.metodoPagamento === 'PIX').reduce((acc: number, t: any) => acc + t.valor, 0);
  const totalCartao = transacoes.filter((t: any) => t.tipo === 'ENTRADA' && t.metodoPagamento === 'CARTAO_CREDITO').reduce((acc: number, t: any) => acc + t.valor, 0);
  const totalDinheiroSistema = transacoes.filter((t: any) => t.tipo === 'ENTRADA' && t.metodoPagamento === 'DINHEIRO').reduce((acc: number, t: any) => acc + t.valor, 0);
  
  // A lógica agora é de SOMA: PIX do Sistema + Cartão do Sistema + Dinheiro físico contado
  const totalFinalArrecadado = totalPix + totalCartao + valorGaveta;

  const registrarTransacao = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      await api.post('/transacoes', { 
        tipo: tipoTransacao, valor: valorTransacao, metodoPagamento, descricao: descricaoTransacao 
      }); 
      toast.success('Transação registrada com sucesso!'); // <-- Toast de sucesso!
      setDescricaoTransacao(''); setValorTransacao(''); 
      buscarTransacoes(); 
    } catch (error) { 
      toast.error('Erro ao registrar transação.'); // <-- Toast de erro!
    } 
  };

  // --- Exportar PDF ---
  const exportarPdf = () => {
    if (!transacoes || transacoes.length === 0) {
      toast.error('Não há transações para exportar.'); // <-- Toast de erro!
      return;
    }

    const janelaPrint = window.open('', '', 'width=900,height=800');
    
    let html = `
      <html>
        <head>
          <title>Relatório Financeiro</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #c5a059; padding-bottom: 10px; }
            .resumo { display: flex; justify-content: space-between; background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: bold; font-size: 16px; }
            .entradas { color: green; } .saidas { color: red; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
            th { background-color: #f4f4f4; color: #555; text-transform: uppercase; }
            .conciliacao { margin-top: 30px; background: #eef1f6; padding: 20px; border-radius: 8px; border-left: 5px solid #c5a059; }
            .conciliacao h3 { margin-top: 0; color: #2c3e50; margin-bottom: 15px;}
            .conciliacao p { margin: 8px 0; font-size: 15px; }
            .destaque-final { font-size: 18px; color: #166534; font-weight: bold; background: #dcfce7; padding: 10px; border-radius: 5px; display: inline-block; margin-top: 10px;}
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="color: #c5a059; margin: 0;">Refúgio Dourado</h1>
            <h3>Relatório Financeiro do Turno</h3>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
          
          <div class="resumo">
            <span class="entradas">Total Entradas: ${formatarMoeda(totalEntradas)}</span>
            <span class="saidas">Total Saídas: ${formatarMoeda(totalSaidas)}</span>
            <span>Saldo Real (Sistema): ${formatarMoeda(saldoReal)}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Data e Hora</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Método</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${transacoes.map((t: any) => `
                <tr>
                  <td>${new Date(t.criadoEm).toLocaleDateString('pt-BR')} ${new Date(t.criadoEm).toLocaleTimeString('pt-BR')}</td>
                  <td><strong style="color: ${t.tipo === 'ENTRADA' ? 'green' : 'red'}">${t.tipo}</strong></td>
                  <td>${t.descricao}</td>
                  <td>${t.metodoPagamento}</td>
                  <td style="color: ${t.tipo === 'ENTRADA' ? 'green' : 'red'}; font-weight: bold;">
                    ${t.tipo === 'ENTRADA' ? '+' : '-'} ${formatarMoeda(t.valor)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="conciliacao">
            <h3>Fechamento de Turno (Soma Total)</h3>
            <p><strong>Total PIX (Sistema):</strong> ${formatarMoeda(totalPix)}</p>
            <p><strong>Total Cartão (Sistema):</strong> ${formatarMoeda(totalCartao)}</p>
            <p><strong>Total Dinheiro (Registrado no Sistema):</strong> ${formatarMoeda(totalDinheiroSistema)}</p>
            <hr style="border: 0; border-top: 1px solid #ccc; margin: 15px 0;" />
            <p><strong>Dinheiro Físico Informado na Gaveta:</strong> ${formatarMoeda(valorGaveta)}</p>
            <p class="destaque-final">
              TOTAL FINAL ARRECADADO (PIX + Cartão + Gaveta): ${formatarMoeda(totalFinalArrecadado)}
            </p>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    janelaPrint?.document.write(html);
    janelaPrint?.document.close();
  };

  // --- Exportar Excel ---
  const exportarExcel = () => {
    if (!transacoes || transacoes.length === 0) {
      toast.error('Não há transações para exportar.'); // <-- Toast de erro!
      return;
    }
    
    let csvContent = "\uFEFF"; 
    csvContent += "RELATORIO FINANCEIRO - REFUGIO DOURADO\r\n";
    csvContent += `Gerado em:;${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}\r\n\r\n`;
    
    csvContent += "HISTORICO DE TRANSACOES\r\n";
    csvContent += "Data;Hora;Tipo;Descrição;Método;Valor (R$)\r\n";
    
    transacoes.forEach((t: any) => {
      const data = new Date(t.criadoEm).toLocaleDateString('pt-BR');
      const hora = new Date(t.criadoEm).toLocaleTimeString('pt-BR');
      const descricaoLimpa = t.descricao.replace(/;/g, ',');
      const valorFormatado = t.valor.toFixed(2).replace('.', ','); 
      csvContent += `${data};${hora};${t.tipo};"${descricaoLimpa}";${t.metodoPagamento};${valorFormatado}\r\n`;
    });

    csvContent += `\r\n\r\nRESUMO E FECHAMENTO DO CAIXA\r\n`;
    csvContent += `Total PIX (Sistema);${totalPix.toFixed(2).replace('.', ',')}\r\n`;
    csvContent += `Total Cartao (Sistema);${totalCartao.toFixed(2).replace('.', ',')}\r\n`;
    csvContent += `Total Dinheiro (Sistema);${totalDinheiroSistema.toFixed(2).replace('.', ',')}\r\n`;
    csvContent += `--;--\r\n`;
    csvContent += `Dinheiro Fisico Informado (Gaveta);${valorGaveta.toFixed(2).replace('.', ',')}\r\n`;
    csvContent += `TOTAL FINAL ARRECADADO (PIX + Cartao + Gaveta);${totalFinalArrecadado.toFixed(2).replace('.', ',')}\r\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Relatorio_Financeiro_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="font-headline-lg text-3xl text-on-surface">Financeiro</h1>
        <div className="flex gap-3">
          <button onClick={exportarPdf} className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer shadow-sm">
            <Download size={16} className="text-primary"/> Exportar PDF
          </button>
          <button onClick={exportarExcel} className="flex items-center gap-2 px-4 py-2 bg-primary-container text-primary-fixed-variant text-xs font-bold rounded-lg hover:brightness-95 transition-colors cursor-pointer shadow-sm">
            <FileSpreadsheet size={16} /> Exportar Excel (CSV)
          </button>
        </div>
      </div>
      
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
          🔒 Fechamento de Turno e Valores
        </h3>
        <p className="text-sm text-secondary mb-6">
          Confira os valores acumulados no turno atual para o fechamento de caixa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Total PIX (Sistema)</span>
            <p className="font-headline-md text-2xl text-primary">
              {formatarMoeda(totalPix)}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Total Cartão (Sistema)</span>
            <p className="font-headline-md text-2xl text-primary">
              {formatarMoeda(totalCartao)}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Total Dinheiro (Sistema)</span>
            <p className="font-headline-md text-2xl text-primary">
              {formatarMoeda(totalDinheiroSistema)}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-primary-container/10 p-5 rounded-xl border border-primary/20">
          <div>
            <h4 className="font-bold text-base text-on-surface">Dinheiro Físico na Gaveta</h4>
            <p className="text-xs text-secondary mt-1">Informe apenas as notas e moedas contadas na gaveta. <br/>O sistema somará este valor ao PIX e Cartão automaticamente.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto items-center">
            <input 
              type="number" 
              step="0.01" 
              value={valorGaveta || ''}
              placeholder="R$ 0,00" 
              className="p-3.5 rounded-lg border border-outline-variant bg-white outline-none focus:border-primary text-base w-full md:w-40 font-bold"
              onChange={(e) => setValorGaveta(Number(e.target.value) || 0)}
            />
            <div className="flex flex-col justify-center px-5 py-2 bg-white border border-outline-variant/50 rounded-lg min-w-[160px] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-secondary">Total Arrecadado</span>
              <span className="font-headline-md text-xl font-bold text-primary">
                {formatarMoeda(totalFinalArrecadado)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={() => toast.success('Fechamento de turno registrado e totalizado com sucesso!')} className="px-6 py-3 bg-on-surface text-white font-label-md font-bold rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer">
            Encerrar e Consolidar Turno
          </button>
        </div>
      </div>
    </div>
  );
}