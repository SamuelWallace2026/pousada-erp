/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Hospede` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Reserva` table. All the data in the column will be lost.
  - You are about to drop the column `reservaId` on the `Transacao` table. All the data in the column will be lost.
  - You are about to drop the column `perfil` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `categoria` to the `Quarto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cargo` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "FotoQuarto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "quartoId" TEXT NOT NULL,
    CONSTRAINT "FotoQuarto_quartoId_fkey" FOREIGN KEY ("quartoId") REFERENCES "Quarto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AreaLazer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "coordX" REAL NOT NULL,
    "coordY" REAL NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hospede" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT NOT NULL,
    "preferencias" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Hospede" ("cpf", "email", "id", "nome", "telefone") SELECT "cpf", "email", "id", "nome", "telefone" FROM "Hospede";
DROP TABLE "Hospede";
ALTER TABLE "new_Hospede" RENAME TO "Hospede";
CREATE UNIQUE INDEX "Hospede_cpf_key" ON "Hospede"("cpf");
CREATE TABLE "new_Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "preco" REAL NOT NULL,
    "estoque" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'RESTAURANTE'
);
INSERT INTO "new_Produto" ("estoque", "id", "nome", "preco") SELECT "estoque", "id", "nome", "preco" FROM "Produto";
DROP TABLE "Produto";
ALTER TABLE "new_Produto" RENAME TO "Produto";
CREATE TABLE "new_Quarto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "valorDiaria" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LIVRE',
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "itensInclusos" TEXT,
    "coordX" REAL,
    "coordY" REAL
);
INSERT INTO "new_Quarto" ("capacidade", "id", "numero", "status", "valorDiaria") SELECT "capacidade", "id", "numero", "status", "valorDiaria" FROM "Quarto";
DROP TABLE "Quarto";
ALTER TABLE "new_Quarto" RENAME TO "Quarto";
CREATE UNIQUE INDEX "Quarto_numero_key" ON "Quarto"("numero");
CREATE TABLE "new_Reserva" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hospedeId" TEXT NOT NULL,
    "quartoId" TEXT NOT NULL,
    "dataCheckIn" DATETIME NOT NULL,
    "dataCheckOut" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMADA',
    "origem" TEXT NOT NULL DEFAULT 'Direto',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reserva_hospedeId_fkey" FOREIGN KEY ("hospedeId") REFERENCES "Hospede" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_quartoId_fkey" FOREIGN KEY ("quartoId") REFERENCES "Quarto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reserva" ("dataCheckIn", "dataCheckOut", "hospedeId", "id", "quartoId", "status") SELECT "dataCheckIn", "dataCheckOut", "hospedeId", "id", "quartoId", "status" FROM "Reserva";
DROP TABLE "Reserva";
ALTER TABLE "new_Reserva" RENAME TO "Reserva";
CREATE TABLE "new_Transacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "metodoPagamento" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Transacao" ("criadoEm", "descricao", "id", "metodoPagamento", "tipo", "valor") SELECT "criadoEm", "descricao", "id", "metodoPagamento", "tipo", "valor" FROM "Transacao";
DROP TABLE "Transacao";
ALTER TABLE "new_Transacao" RENAME TO "Transacao";
CREATE TABLE "new_Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "reservaId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Usuario_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Usuario" ("criadoEm", "email", "id", "nome", "senha") SELECT "criadoEm", "email", "id", "nome", "senha" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
