import React, { useState } from 'react';
import { Lock, Key } from 'lucide-react';
import axios from 'axios';

interface LoginProps {
  onLoginSucesso: (usuario: any) => void;
}

export default function Login({ onLoginSucesso }: LoginProps) {
  const [emailInput, setEmailInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3333/api/login', { 
        email: emailInput, 
        senha: senhaInput 
      });
      // Se deu certo, avisa o App.tsx passando os dados do usuário
      onLoginSucesso(response.data);
    } catch (error) { 
      alert('E-mail ou senha incorretos! Verifique suas credenciais.'); 
      setSenhaInput(''); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-end px-12 md:px-24 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(26, 28, 27, 0.3), rgba(26, 28, 27, 0.6)), url('/fundo-login.jpeg')` }}>
      <div className="bg-surface-container-lowest/95 backdrop-blur-md p-10 rounded-2xl shadow-level-2 max-w-md w-full ghost-border text-center">
        <h1 className="font-display-lg text-primary text-4xl mb-2">Refúgio Dourado</h1>
        <p className="text-secondary font-body-md mb-8">Acesso Unificado ao Sistema</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
          <div>
            <label className="text-xs font-bold text-secondary uppercase tracking-wide block mb-1">E-mail</label>
            <div className="relative">
              <Lock size={18} className="absolute top-3.5 left-4 text-secondary" />
              <input type="email" placeholder="seu.email@pousada.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary transition-colors font-body-md" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-secondary uppercase tracking-wide block mb-1">Senha</label>
            <div className="relative">
              <Key size={18} className="absolute top-3.5 left-4 text-secondary" />
              <input type="password" placeholder="••••••••" value={senhaInput} onChange={(e) => setSenhaInput(e.target.value)} required className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary transition-colors font-body-md" />
            </div>
          </div>
          <button type="submit" className="w-full mt-4 py-3.5 px-4 rounded-lg bg-primary-container text-on-primary-container font-label-md hover:brightness-95 transition-all shadow-sm cursor-pointer text-center font-bold">
            Entrar no Sistema
          </button>
        </form>
        <p className="text-xs text-secondary mt-6">Painel restrito para colaboradores e hóspedes.</p>
      </div>
    </div>
  );
}