# Pousada ERP

Sistema de gestão para pousadas que reúne reservas, hospedagem, restaurante, financeiro e manutenção em uma única plataforma web, com um portal para o hóspede.

Projeto Integrador de Extensão do curso de Engenharia de Software (UniJaguaribe, Aracati/CE), desenvolvido em equipe e pensado para uso real na operação de uma pousada.

> Status: em desenvolvimento.

## Funcionalidades

- **Reservas e hospedagem:** cadastro de hóspedes e quartos, reservas, check-in e check-out, fotos de cada acomodação
- **Restaurante:** mapa de mesas com reserva de mesa, cardápio e pedidos enviados à cozinha, eventos
- **Portal do hóspede:** cardápio com busca, pedidos e acompanhamento do status
- **Financeiro:** lançamento de receitas e despesas, controle de consumo por hospedagem
- **Operação:** chamados de manutenção e reparos, tarefas de limpeza e governança, áreas de lazer
- **Painel administrativo:** indicadores de ocupação e rotina da pousada
- **Relatórios:** exportação em PDF e Excel
- **Usuários:** login com senhas protegidas por hash (bcrypt)

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Front-end | React, TypeScript, Vite, Tailwind CSS, Axios, Lucide Icons |
| Back-end | Node.js, Express, TypeScript, Prisma ORM |
| Banco de dados | MySQL |
| Relatórios | jsPDF e jsPDF-AutoTable |

## Estrutura do repositório

```
pousada-erp/
├── backend/    # API REST (Express + Prisma)
└── frontend/   # Interface web (React + Vite)
```

## Como executar

### Pré-requisitos

- Node.js instalado
- MySQL em execução (por padrão, `localhost:3306`)

### 1. Back-end

```bash
cd backend
npm install
```

Crie um arquivo `.env` dentro de `backend/` com a conexão do seu banco:

```env
DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/pousada_db"
```

Gere o cliente do Prisma, crie as tabelas e inicie a API:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

A API sobe em `http://localhost:3333`. Para visualizar o banco no navegador, use `npx prisma studio`.

### 2. Front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A interface abre em `http://localhost:5173`.

## Segurança

O arquivo `.env` não é versionado. Nunca publique credenciais do banco no repositório.

## Autor

**Samuel Wallace Liberato Queiroz**
Estudante de Engenharia de Software, UniJaguaribe, Aracati/CE
[github.com/SamuelWallace2026](https://github.com/SamuelWallace2026)


