-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "preco" REAL NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Consumo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantidade" INTEGER NOT NULL,
    "subtotal" REAL NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservaId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    CONSTRAINT "Consumo_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consumo_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "metodoPagamento" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservaId" TEXT,
    CONSTRAINT "Transacao_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
