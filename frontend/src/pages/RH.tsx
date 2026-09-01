import React, { useState } from 'react';

export default function RH() {
  const [nomeFuncionario, setNomeFuncionario] = useState('');
  const [cargoFuncionario, setCargoFuncionario] = useState('');
  const [telefoneFuncionario, setTelefoneFuncionario] = useState('');
  const [turnoFuncionario, setTurnoFuncionario] = useState('Turno Manhã');

  const cadastrarFuncionario = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Colaborador ${nomeFuncionario} cadastrado com sucesso!`);
    setNomeFuncionario('');
    setCargoFuncionario('');
    setTelefoneFuncionario('');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="font-headline-lg text-3xl text-on-surface mb-1">Gestão de Equipe & RH</h1>
          <p className="text-secondary font-body-md">Diretório de colaboradores ativos e controle de escala semanal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border self-start">
          <h3 className="font-headline-md text-xl text-on-surface mb-4">Adicionar Funcionário</h3>
          <form onSubmit={cadastrarFuncionario} className="flex flex-col gap-4">
            <input 
              required 
              placeholder="Nome Completo" 
              value={nomeFuncionario}
              onChange={(e) => setNomeFuncionario(e.target.value)}
              className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm" 
            />
            <input 
              required 
              placeholder="Cargo (Ex: Camareira, Cozinheiro)" 
              value={cargoFuncionario}
              onChange={(e) => setCargoFuncionario(e.target.value)}
              className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm" 
            />
            <input 
              required 
              placeholder="Telefone / Contato" 
              value={telefoneFuncionario}
              onChange={(e) => setTelefoneFuncionario(e.target.value)}
              className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm" 
            />
            <select 
              value={turnoFuncionario}
              onChange={(e) => setTurnoFuncionario(e.target.value)}
              className="w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary text-sm"
            >
              <option value="Turno Manhã">Turno Manhã (06h - 14h)</option>
              <option value="Turno Tarde">Turno Tarde (14h - 22h)</option>
              <option value="Turno Noite">Turno Noite (22h - 06h)</option>
            </select>
            <button type="submit" className="w-full py-3 bg-primary text-white font-label-md font-bold rounded-lg hover:brightness-95 cursor-pointer shadow-sm">
              Cadastrar Colaborador
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 ghost-border">
          <h3 className="font-headline-md text-xl text-on-surface mb-6 border-b border-outline-variant/20 pb-2">Colaboradores Ativos & Escala</h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 rounded-xl border border-outline-variant/30 bg-surface">
              <div>
                <h4 className="font-bold text-base text-on-surface">Maria das Graças</h4>
                <p className="text-xs text-secondary">Camareira Chefe • Turno Manhã</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">Ativo (Escala OK)</span>
            </div>

            <div className="flex justify-between items-center p-4 rounded-xl border border-outline-variant/30 bg-surface">
              <div>
                <h4 className="font-bold text-base text-on-surface">Antônio Carlos</h4>
                <p className="text-xs text-secondary">Cozinheiro Principal • Turno Tarde</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">Ativo (Escala OK)</span>
            </div>

            <div className="flex justify-between items-center p-4 rounded-xl border border-outline-variant/30 bg-surface">
              <div>
                <h4 className="font-bold text-base text-on-surface">Juliana Souza</h4>
                <p className="text-xs text-secondary">Recepcionista • Turno Noite</p>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full uppercase tracking-wider">Folga Programada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}