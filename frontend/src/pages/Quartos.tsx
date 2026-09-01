import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { api } from '../services/api';

interface QuartosProps {
  quartos: any[];
  buscarQuartos: () => void;
  formatarMoeda: (valor: number) => string;
}

export default function Quartos({ quartos, buscarQuartos, formatarMoeda }: QuartosProps) {
  const [numero, setNumero] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [valorDiaria, setValorDiaria] = useState('');
  const [categoria, setCategoria] = useState('Chalé Luxo Casal');

  const cadastrarQuarto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/quartos', { 
        numero, 
        capacidade: Number(capacidade), 
        valorDiaria: Number(valorDiaria), 
        categoria 
      });
      alert('Quarto salvo com sucesso!');
      setNumero(''); setCapacidade(''); setValorDiaria(''); setCategoria('Chalé Luxo Casal');
      buscarQuartos();
    } catch (error) {
      alert('Erro ao salvar quarto.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline-lg text-3xl text-on-surface">Gestão de Acomodações</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border self-start">
          <h2 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Adicionar Chalé</h2>
          <form onSubmit={cadastrarQuarto} className="flex flex-col gap-4">
            <input required placeholder="Identificação (Ex: Chalé 01)" value={numero} onChange={e => setNumero(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-secondary uppercase tracking-wide">Categoria</label>
              <select required value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary">
                <option value="Chalé Luxo Casal">Chalé Luxo Casal</option>
                <option value="Suíte Luxo Casal + Solteiro">Suíte Casal + Solteiro</option>
                <option value="Suíte Luxo Família">Suíte Luxo Família</option>
                <option value="Padrão">Padrão</option>
              </select>
            </div>
            <input required type="number" placeholder="Capacidade (Pessoas)" value={capacidade} onChange={e => setCapacidade(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
            <input required type="number" placeholder="Valor Diária (R$)" value={valorDiaria} onChange={e => setValorDiaria(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
            <button type="submit" className="mt-2 w-full py-3 px-4 rounded-lg bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all cursor-pointer">Salvar Acomodação</button>
          </form>
        </div>
        
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quartos.map((quarto: any) => (
              <div key={quarto.id} className="bg-surface-container-lowest rounded-xl shadow-level-1 ghost-border p-5 flex flex-col justify-between group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-headline-md text-lg text-on-surface">{quarto.categoria}</h3>
                    <span className="font-body-sm text-secondary">Chalé: {quarto.numero}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${quarto.status === 'LIVRE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {quarto.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-surface-container">
                  <span className="font-label-md text-secondary flex items-center gap-1"><Users size={16}/> Até {quarto.capacidade}</span>
                  <span className="font-headline-md text-primary font-bold">{formatarMoeda(quarto.valorDiaria)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}