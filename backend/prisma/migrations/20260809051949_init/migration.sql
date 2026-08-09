-- CreateTable
CREATE TABLE "Quarto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "valorDiaria" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LIVRE'
);

-- CreateIndex
CREATE UNIQUE INDEX "Quarto_numero_key" ON "Quarto"("numero");
