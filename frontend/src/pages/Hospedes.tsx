import React, { useState } from 'react';
import { api } from '../services/api';

interface HospedesProps {
  hospedes: any[];
  buscarHospedes: () => void;
}

export default function Hospedes({ hospedes, buscarHospedes }: HospedesProps) {
  // Variáveis do formulário agora vivem APENAS aqui dentro!
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const mascaraCPF = (valor: string) => valor.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const mascaraTelefone = (valor: string) => valor.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');

  const cadastrarHospede = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Usando a nossa nova api centralizada!
      await api.post('/hospedes', { nome, cpf, email, telefone });
      alert('Hóspede salvo com sucesso!');
      setNome(''); setCpf(''); setEmail(''); setTelefone('');
      buscarHospedes();
    } catch (error) {
      alert('Erro ao salvar hóspede.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline-lg text-3xl text-on-surface">Gestão de Hóspedes</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border self-start">
          <h2 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Novo Cadastro</h2>
          <form onSubmit={cadastrarHospede} className="flex flex-col gap-4">
            <input required placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
            <input required placeholder="CPF (Apenas números)" value={cpf} onChange={e => setCpf(mascaraCPF(e.target.value))} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
            <input required placeholder="Telefone" value={telefone} onChange={e => setTelefone(mascaraTelefone(e.target.value))} className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" />
            <button type="submit" className="mt-2 w-full py-3 px-4 rounded-lg bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all cursor-pointer">Salvar Hóspede</button>
          </form>
        </div>
        
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
          <h2 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Cadastrados</h2>
          <ul className="flex flex-col gap-3">
            {hospedes.map((h: any) => (
              <li key={h.id} className="flex justify-between items-center p-4 rounded-lg border border-surface-container hover:border-primary/30 transition-colors">
                <div>
                  <strong className="font-headline-md text-lg text-on-surface">{h.nome}</strong><br/>
                  <small className="font-body-md text-secondary">CPF: {h.cpf} | Tel: {h.telefone}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}